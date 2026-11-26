import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LngLatBounds, Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { routeLegs } from '../../lib/routingClient.js'
import {
  bearingDeg,
  buildLegs,
  followZoom,
  legDurationMs,
  lerpAngle,
  lineLengthKm,
  pointAlong,
  toCoord,
} from '../../lib/tripRoute.js'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HotelIcon,
  LightbulbIcon,
  MapPinIcon,
  PauseIcon,
  PlayIcon,
} from './icons.jsx'

setWorkerUrl(maplibreWorkerUrl)

// Estilo vectorial gratuito y sin clave (incluye edificios 3D por OSM).
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'
// Relieve: AWS Terrain Tiles (SRTM, GMTED, ETOPO1), formato terrarium.
const TERRAIN_TILES = ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png']
const CUSCO_CENTER = [-71.9785, -13.5164]

// Tiempos de la "parada" al llegar a un lugar: primero se ve la foto sola,
// luego se alternan los datos curiosos (si el lugar tiene) con la foto limpia.
const PHOTO_INTRO_MS = 2600
// Cuánto se queda el globo tras terminar de leerse (o de respaldo si no hay
// voz disponible).
const FACT_SHOW_MS = 3600
const FACT_READ_PAUSE_MS = 1100
const FACT_EXIT_MS = 320
const FACT_GAP_MS = 1500
// Respaldo si el navegador nunca dispara "onend" (pasa a veces): un máximo
// generoso según el largo del texto, para no cortar la voz a mitad de frase
// pero tampoco trabar el recorrido si el evento nunca llega.
const READ_CHARS_PER_SEC = 8
const MAX_FACT_READ_MS = 15000

const MODE_LABEL = { pie: 'a pie', auto: 'en auto', tren: 'en tren' }
const MODE_SPEED_KMH = { pie: 4.5, auto: 30, tren: 35 }
const MODE_COLOR = { pie: '#f59e0b', auto: '#fb923c', tren: '#38bdf8' }

const EMPTY_LINE = { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} }

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

// Nombres que suelen sonar menos robóticos entre las voces del navegador/SO
// (voces "online"/neuronales de Google y Microsoft, o voces conocidas de
// buena calidad). El navegador no ofrece nada mejor que esto sin pagar un
// servicio de voz en la nube.
const SOFT_VOICE_HINTS = [
  'google',
  'natural',
  'neural',
  'online',
  'microsoft',
  'paulina',
  'helena',
  'sabina',
  'elena',
  'lucia',
  'lucía',
  'monica',
  'mónica',
  'esperanza',
  'marisol',
  'laura',
]

function pickSpanishVoice() {
  const voices = window.speechSynthesis?.getVoices?.() ?? []
  const spanish = voices.filter((voice) => voice.lang?.toLowerCase().startsWith('es'))
  if (spanish.length === 0) return null

  function score(voice) {
    const lang = voice.lang.toLowerCase()
    const name = voice.name.toLowerCase()
    let value = 0
    if (lang === 'es-pe' || lang === 'es-419' || lang === 'es-us') value += 3
    else if (lang.startsWith('es')) value += 1
    if (SOFT_VOICE_HINTS.some((hint) => name.includes(hint))) value += 4
    if (voice.localService === false) value += 1
    return value
  }

  return [...spanish].sort((a, b) => score(b) - score(a))[0]
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

function formatKm(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`
}

function formatMinutes(km, mode) {
  const minutes = Math.max(Math.round((km / MODE_SPEED_KMH[mode]) * 60), 1)
  if (minutes < 60) return `~${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `~${hours} h${rest ? ` ${rest} min` : ''}`
}

function stopMarkerElement(label, isHotel) {
  const element = document.createElement('div')
  element.className = isHotel ? 'hestia-stop hestia-stop--hotel' : 'hestia-stop'
  element.textContent = label
  element.setAttribute('aria-hidden', 'true')
  return element
}

// Figura de persona vista desde arriba: cabeza + cuerpo apuntando "al norte"
// (rotación 0). MapLibre rota el marcador completo según setRotation().
function travelerElement() {
  const element = document.createElement('div')
  element.className = 'hestia-traveler'
  element.setAttribute('aria-hidden', 'true')
  element.innerHTML =
    '<span class="hestia-traveler__glow"></span>' +
    '<svg class="hestia-traveler__figure" viewBox="0 0 28 34" width="26" height="31">' +
    '<defs>' +
    '<linearGradient id="hestia-traveler-body" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#fde68a"/>' +
    '<stop offset="55%" stop-color="#f59e0b"/>' +
    '<stop offset="100%" stop-color="#c2690a"/>' +
    '</linearGradient>' +
    '<radialGradient id="hestia-traveler-head" cx="35%" cy="30%" r="75%">' +
    '<stop offset="0%" stop-color="#fffdf5"/>' +
    '<stop offset="100%" stop-color="#fcd9a0"/>' +
    '</radialGradient>' +
    '</defs>' +
    '<ellipse class="hestia-traveler__shadow" cx="14" cy="31.5" rx="7.5" ry="2.2"/>' +
    '<path class="hestia-traveler__body" d="M14 14c-5.2 0-9 3.9-9 11 0 4.4 3.3 6.6 9 6.6s9-2.2 9-6.6c0-7.1-3.8-11-9-11Z"/>' +
    '<circle class="hestia-traveler__head" cx="14" cy="7" r="6.2"/>' +
    '</svg>'
  return element
}

function addTerrainAndRouteLayers(map) {
  map.addSource('terrain-dem', {
    type: 'raster-dem',
    tiles: TERRAIN_TILES,
    encoding: 'terrarium',
    tileSize: 256,
    maxzoom: 15,
  })
  // Fuente aparte para el sombreado (recomendado por MapLibre para no
  // competir con el terreno por la misma caché de teselas).
  map.addSource('hillshade-dem', {
    type: 'raster-dem',
    tiles: TERRAIN_TILES,
    encoding: 'terrarium',
    tileSize: 256,
    maxzoom: 15,
  })
  map.setTerrain({ source: 'terrain-dem', exaggeration: 1.25 })

  const firstSymbol = map.getStyle().layers.find((layer) => layer.type === 'symbol')?.id
  map.addLayer(
    {
      id: 'hillshade',
      type: 'hillshade',
      source: 'hillshade-dem',
      paint: { 'hillshade-shadow-color': '#3b2a14', 'hillshade-exaggeration': 0.35 },
    },
    firstSymbol,
  )

  map.setSky({
    'sky-color': '#7fb4e6',
    'horizon-color': '#f3e3c3',
    'fog-color': '#f3e3c3',
    'sky-horizon-blend': 0.6,
    'horizon-fog-blend': 0.5,
    'fog-ground-blend': 0.6,
  })

  map.addSource('route-full', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
  map.addSource('route-progress', { type: 'geojson', data: EMPTY_LINE })

  map.addLayer({
    id: 'route-full-casing',
    type: 'line',
    source: 'route-full',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#1c1203', 'line-width': 7, 'line-opacity': 0.35 },
  })
  map.addLayer({
    id: 'route-full',
    type: 'line',
    source: 'route-full',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': ['match', ['get', 'mode'], 'tren', MODE_COLOR.tren, 'auto', MODE_COLOR.auto, MODE_COLOR.pie],
      'line-width': 3.5,
      'line-opacity': 0.55,
      'line-dasharray': [1.5, 1.5],
    },
  })
  map.addLayer({
    id: 'route-progress',
    type: 'line',
    source: 'route-progress',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#fbbf24', 'line-width': 6 },
  })
}

function CuscoMap3D({ stops, onStopChange, fallback = null }) {
  const supported = useMemo(() => hasWebGL(), [])
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const travelerRef = useRef(null)
  const legsRef = useRef([])
  const playbackRef = useRef({ leg: 0, raw: 0, bearing: null, frame: null, timeout: null, startedAt: 0 })
  const onStopChangeRef = useRef(onStopChange)

  const runLegRef = useRef(null)

  const [mapReady, setMapReady] = useState(false)
  // Los tramos ruteados se guardan junto a las paradas que los generaron: si
  // `stops` cambió y aún no llegan los nuevos, la ruta está "cargando".
  const [routed, setRouted] = useState({ stops: null, legs: [] })
  const [status, setStatus] = useState('idle') // idle | playing | paused | done
  const [currentLeg, setCurrentLeg] = useState(0)
  const [activeStopIndex, setActiveStopIndex] = useState(0)
  // Espejo sin retraso de activeStopIndex: los botones Anterior/Siguiente lo
  // usan para calcular el próximo salto sin depender del valor de React state
  // capturado en el render anterior (evita que un clic rápido calcule sobre
  // un valor viejo y "se pase" de parada).
  const activeStopIndexRef = useRef(0)
  const setActiveStop = useCallback((index) => {
    activeStopIndexRef.current = index
    setActiveStopIndex(index)
  }, [])
  // true mientras el viajero está "parado" en una foto a pantalla completa;
  // false en cuanto arranca a moverse por un tramo (se ve el mapa 3D).
  const [showStopPhoto, setShowStopPhoto] = useState(true)
  // true solo cuando se pausó a mitad de una caminata real (hay algo que
  // "continuar"); false si se está quieto en una parada (recién llegado,
  // navegado con los botones, o pausado justo al llegar) — ahí el botón debe
  // decir "Reproducir mi día", no "Continuar".
  const [midLegPause, setMidLegPause] = useState(false)
  // Dato curioso mostrado sobre la foto: { text, leaving } o null.
  const [activeFact, setActiveFact] = useState(null)
  // Qué foto de stop.images se muestra: cambia con cada dato curioso nuevo.
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [mapError, setMapError] = useState('')
  const [prevStops, setPrevStops] = useState(stops)

  // La lista de voces del navegador carga async (sobre todo en Chrome): este
  // "calentón" adelanta esa carga para que ya esté lista cuando se reproduzca
  // el primer dato curioso.
  useEffect(() => {
    window.speechSynthesis?.getVoices()
  }, [])

  // Cambió el día o la ruta: se reinicia la reproducción durante el render
  // (patrón de React para ajustar estado cuando cambia una prop).
  if (prevStops !== stops) {
    setPrevStops(stops)
    setStatus('idle')
    setCurrentLeg(0)
    setActiveStopIndex(0)
    setShowStopPhoto(true)
    setActiveFact(null)
    setActivePhotoIndex(0)
  }

  // Mantiene el espejo en sync cuando `stops` cambia (no se puede tocar el
  // ref durante el render, así que se hace en un efecto aparte).
  useEffect(() => {
    activeStopIndexRef.current = 0
  }, [stops])

  const legs = routed.stops === stops ? routed.legs : []
  const loadingRoute = mapReady && stops.length >= 2 && routed.stops !== stops

  useEffect(() => {
    onStopChangeRef.current = onStopChange
  }, [onStopChange])

  // 1) Crear el mapa una sola vez.
  useEffect(() => {
    if (!supported || !containerRef.current) return undefined

    const map = new MapLibreMap({
      container: containerRef.current,
      style: STYLE_URL,
      center: CUSCO_CENTER,
      zoom: 13.5,
      pitch: 55,
      bearing: -20,
      maxPitch: 80,
      attributionControl: { compact: true },
    })
    map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right')
    map.scrollZoom.disable()
    map.on('load', () => {
      addTerrainAndRouteLayers(map)
      setMapReady(true)
    })
    map.on('error', (event) => {
      console.warn('[CuscoMap3D]', event?.error?.message ?? event)
      // Una tesela caída no debe romper la vista; solo se avisa si el estilo no carga.
      if (!map.isStyleLoaded()) setMapError(event?.error?.message ?? 'No se pudo cargar el mapa.')
    })
    mapRef.current = map

    return () => {
      const playback = playbackRef.current
      cancelAnimationFrame(playback.frame)
      clearTimeout(playback.timeout)
      window.speechSynthesis?.cancel()
      map.remove()
      mapRef.current = null
    }
  }, [supported])

  const stopPlayback = useCallback(() => {
    const playback = playbackRef.current
    cancelAnimationFrame(playback.frame)
    clearTimeout(playback.timeout)
    playback.frame = null
    playback.timeout = null
    window.speechSynthesis?.cancel()
  }, [])

  const setProgressLine = useCallback((legIndex, traveled) => {
    const map = mapRef.current
    if (!map?.getSource('route-progress')) return
    const done = legsRef.current.slice(0, legIndex).flatMap((leg) => leg.coords)
    map.getSource('route-progress').setData({
      ...EMPTY_LINE,
      geometry: { type: 'LineString', coordinates: [...done, ...traveled] },
    })
  }, [])

  const overview = useCallback((duration = 1400) => {
    const map = mapRef.current
    const coords = legsRef.current.flatMap((leg) => leg.coords)
    if (!map || coords.length === 0) return
    const bounds = coords.reduce((acc, coord) => acc.extend(coord), new LngLatBounds(coords[0], coords[0]))
    map.fitBounds(bounds, {
      // Abajo queda el panel de controles: más margen para que no tape la ruta.
      padding: { top: 60, right: 70, bottom: 150, left: 60 },
      pitch: 50,
      bearing: -15,
      duration,
      maxZoom: 15.5,
    })
  }, [])

  // 2) Cada vez que cambian las paradas: rutear, dibujar y encuadrar.
  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map) return undefined

    const controller = new AbortController()
    stopPlayback()
    playbackRef.current = { ...playbackRef.current, leg: 0, raw: 0, bearing: null }

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []
    travelerRef.current?.remove()
    travelerRef.current = null

    if (stops.length < 2) {
      legsRef.current = []
      map.getSource('route-full')?.setData({ type: 'FeatureCollection', features: [] })
      setProgressLine(0, [])
      return undefined
    }

    let number = 0
    markersRef.current = stops
      .map((stop, index) => {
        const isHotel = stop.category === 'Tu hospedaje'
        // El hospedaje aparece al inicio y (casi siempre) al final: un solo marcador.
        if (isHotel && index > 0) return null
        if (!isHotel) number += 1
        return new Marker({ element: stopMarkerElement(isHotel ? 'H' : String(number), isHotel) })
          .setLngLat(toCoord(stop))
          .addTo(map)
      })
      .filter(Boolean)

    routeLegs(buildLegs(stops), { signal: controller.signal })
      .then((result) => {
        const withLength = result.map((leg) => ({ ...leg, lengthKm: lineLengthKm(leg.coords) }))
        legsRef.current = withLength
        setRouted({ stops, legs: withLength })
        map.getSource('route-full')?.setData({
          type: 'FeatureCollection',
          features: withLength.map((leg) => ({
            type: 'Feature',
            properties: { mode: leg.mode },
            geometry: { type: 'LineString', coordinates: leg.coords },
          })),
        })
        setProgressLine(0, [])
        travelerRef.current = new Marker({
          element: travelerElement(),
          rotationAlignment: 'map',
          pitchAlignment: 'map',
        })
          .setLngLat(withLength[0].coords[0])
          .setRotation(withLength[0].coords.length > 1 ? bearingDeg(withLength[0].coords[0], withLength[0].coords[1]) : 0)
          .addTo(map)
        overview()
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        setMapError('No se pudo calcular la ruta.')
        setRouted({ stops, legs: [] })
      })

    return () => controller.abort()
  }, [stops, mapReady, overview, setProgressLine, stopPlayback])

  // Secuencia al llegar a una parada: foto sola, luego cada dato curioso entra
  // como un globo de diálogo que tapa parte de la foto y se lee en voz alta,
  // se va, se ve la foto limpia otra vez —con una foto distinta si el lugar
  // tiene más de una— y recién entonces se sigue con el siguiente tramo.
  const scheduleStopDwell = useCallback((stop, onDone) => {
    const playback = playbackRef.current
    const facts = stop?.facts ?? []
    const images = stop?.images?.length ? stop.images : stop?.image ? [stop.image] : []

    // Avisa cuando termina de leerse (o un respaldo si no hay voz o el
    // navegador nunca dispara "onend"), para no cortar la voz a mitad de
    // frase con un tiempo fijo que no sabe cuánto dura el texto.
    function speak(text, onFinish) {
      let finished = false
      function finish() {
        if (finished) return
        finished = true
        onFinish()
      }

      if (!window.speechSynthesis) {
        playback.timeout = setTimeout(finish, FACT_SHOW_MS)
        return
      }

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-PE'
      utterance.rate = 0.96
      utterance.pitch = 1.0
      const voice = pickSpanishVoice()
      if (voice) {
        utterance.voice = voice
        utterance.lang = voice.lang
      }
      utterance.onend = finish
      utterance.onerror = finish
      window.speechSynthesis.speak(utterance)

      const estimate = Math.min(
        Math.max((text.length / READ_CHARS_PER_SEC) * 1000, FACT_SHOW_MS),
        MAX_FACT_READ_MS,
      )
      playback.timeout = setTimeout(finish, estimate)
    }

    function showFact(index) {
      if (index >= facts.length) {
        playback.timeout = setTimeout(onDone, FACT_GAP_MS)
        return
      }

      // La foto N acompaña al dato curioso N: primero se ve la foto 1 y se lee
      // su nota, luego la foto 2 con la suya, etc. (si hay menos fotos que
      // datos, se queda en la última foto disponible).
      if (images.length > 0) setActivePhotoIndex(Math.min(index, images.length - 1))
      setActiveFact({ text: facts[index], leaving: false })
      speak(facts[index], () => {
        playback.timeout = setTimeout(() => {
          setActiveFact((current) => (current ? { ...current, leaving: true } : current))
          window.speechSynthesis?.cancel()
          playback.timeout = setTimeout(() => {
            setActiveFact(null)
            playback.timeout = setTimeout(() => showFact(index + 1), FACT_GAP_MS)
          }, FACT_EXIT_MS)
        }, FACT_READ_PAUSE_MS)
      })
    }

    setActiveFact(null)
    setActivePhotoIndex(0)
    playback.timeout = setTimeout(() => showFact(0), PHOTO_INTRO_MS)
  }, [])

  const runLeg = useCallback(
    (legIndex) => {
      const map = mapRef.current
      const leg = legsRef.current[legIndex]
      if (!map || !leg) {
        setStatus('done')
        // Termina el recorrido: se cierra la foto de la última parada y se
        // encuadra la ruta completa (antes se quedaba tapada por la foto).
        setShowStopPhoto(false)
        setActiveFact(null)
        overview()
        return
      }

      const playback = playbackRef.current
      const reduced = prefersReducedMotion()
      const duration = reduced ? 600 : legDurationMs(leg.lengthKm, leg.mode)
      playback.leg = legIndex
      setCurrentLeg(legIndex)
      setActiveStop(legIndex)
      setShowStopPhoto(false)
      setActiveFact(null)
      setActivePhotoIndex(0)
      onStopChangeRef.current?.(legIndex)

      // Si se reanuda a mitad de tramo, el tiempo arranca desde lo ya recorrido.
      playback.startedAt = performance.now() - playback.raw * duration

      const frame = (now) => {
        const raw = Math.min((now - playback.startedAt) / duration, 1)
        const km = easeInOut(raw) * leg.lengthKm
        playback.raw = raw
        const position = pointAlong(leg.coords, km)
        if (position) {
          travelerRef.current?.setLngLat(position.point)
          travelerRef.current?.setRotation(position.bearing)
          setProgressLine(legIndex, position.traveled)
          playback.bearing =
            playback.bearing === null ? position.bearing : lerpAngle(playback.bearing, position.bearing, 0.05)
          map.jumpTo({
            center: position.point,
            zoom: followZoom(leg.mode),
            pitch: reduced ? 45 : 62,
            bearing: reduced ? map.getBearing() : playback.bearing,
          })
        }

        if (raw < 1) {
          playback.frame = requestAnimationFrame(frame)
          return
        }

        // Llegó a la parada: foto + datos curiosos, y recién después el siguiente tramo.
        playback.raw = 0
        setActiveStop(legIndex + 1)
        setShowStopPhoto(true)
        onStopChangeRef.current?.(legIndex + 1)
        scheduleStopDwell(leg.to, () => runLegRef.current?.(legIndex + 1))
      }

      // Acercamiento suave al inicio del tramo antes de seguir al viajero.
      if (playback.raw === 0 && !reduced) {
        map.easeTo({ center: leg.coords[0], zoom: followZoom(leg.mode), pitch: 62, duration: 900 })
        playback.timeout = setTimeout(() => {
          playback.startedAt = performance.now()
          playback.frame = requestAnimationFrame(frame)
        }, 900)
      } else {
        playback.frame = requestAnimationFrame(frame)
      }
    },
    [overview, setProgressLine, scheduleStopDwell, setActiveStop],
  )

  useEffect(() => {
    runLegRef.current = runLeg
  }, [runLeg])

  function play() {
    if (legsRef.current.length === 0) return
    stopPlayback()

    if (status === 'done' || status === 'idle' || activeStopIndexRef.current === 0) {
      // Desde el principio (hospedaje) no hay nada que mostrar ahí: se anima
      // derecho el primer tramo.
      playbackRef.current = { ...playbackRef.current, leg: 0, raw: 0, bearing: null }
      setProgressLine(0, [])
      travelerRef.current?.setLngLat(legsRef.current[0].coords[0])
      setMidLegPause(false)
      setStatus('playing')
      runLeg(playbackRef.current.leg)
      return
    }

    if (playbackRef.current.raw === 0) {
      // Estás parado en una parada real (navegaste con los botones, o la
      // pausa cayó justo al llegar): "reproducir desde aquí" primero muestra
      // y lee el dato de ESTA parada, y recién cuando termina sigue
      // caminando hacia la próxima — no se salta directo a animar el tramo.
      setStatus('playing')
      setShowStopPhoto(true)
      scheduleStopDwell(stops[activeStopIndexRef.current], () => runLeg(playbackRef.current.leg))
      return
    }

    // Pausado a mitad de una caminata real: sigue desde ese punto exacto.
    setStatus('playing')
    runLeg(playbackRef.current.leg)
  }

  function pause() {
    // Solo hay algo que "continuar" si esto interrumpe una caminata real
    // (status 'playing' con el tramo ya empezado). Si cae justo al llegar a
    // una parada (raw=0, p. ej. durante la lectura de un dato), no hay nada
    // a mitad de camino.
    const wasMidLeg = status === 'playing' && playbackRef.current.raw > 0
    stopPlayback()
    setActiveFact(null)
    setMidLegPause(wasMidLeg)
    setStatus('paused')
  }

  // Saltar directo a una parada (Anterior / Siguiente), como en un recorrido guiado.
  function goToStop(stopIndex) {
    const map = mapRef.current
    const total = legsRef.current.length
    if (!map || total === 0) return
    stopPlayback()
    const clamped = Math.min(Math.max(stopIndex, 0), total)
    const legIndex = Math.min(clamped, total - 1)
    const arrived = clamped === total
    const point = arrived ? legsRef.current[total - 1].coords.at(-1) : legsRef.current[clamped].coords[0]
    const stop = stops[clamped]

    playbackRef.current = { ...playbackRef.current, leg: arrived ? total : legIndex, raw: 0, bearing: null }
    setProgressLine(clamped, [])
    travelerRef.current?.setLngLat(point)
    setCurrentLeg(legIndex)
    setActiveStop(clamped)
    setShowStopPhoto(true)
    setMidLegPause(false)
    setStatus(arrived ? 'done' : 'paused')
    onStopChangeRef.current?.(clamped)
    map.flyTo({ center: point, zoom: 16, pitch: 60, duration: 1200 })
    // Saltar a una parada también muestra su foto + datos curiosos, igual que
    // si se llegara caminando: antes se veía solo la foto limpia, y había que
    // pararse en la parada anterior para verla.
    scheduleStopDwell(stop, () => {})
  }

  if (!supported) return fallback

  const leg = legs[currentLeg]
  const totalKm = legs.reduce((sum, item) => sum + item.lengthKm, 0)
  const approximate = legs.some((item) => item.approximate && item.mode !== 'tren')
  const photoStop = stops[activeStopIndex] ?? null
  const photoImages = photoStop?.images?.length ? photoStop.images : photoStop?.image ? [photoStop.image] : []
  const photoSrc = photoImages[activePhotoIndex % Math.max(photoImages.length, 1)] ?? null
  const reduced = prefersReducedMotion()

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-400/30 bg-black/40">
      <div ref={containerRef} className="h-[26rem] w-full" />

      {legs.length > 0 && showStopPhoto && photoSrc && (
        <figure
          key={`${photoStop.id}-${activeStopIndex}`}
          className={`absolute inset-0 ${reduced ? '' : 'animate-[hestia-fade_0.6s_ease]'}`}
        >
          <img
            key={photoSrc}
            src={photoSrc}
            alt=""
            className={`h-full w-full object-cover ${reduced ? '' : 'animate-[hestia-fade_0.5s_ease]'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-black/35" />
          <figcaption className="absolute inset-x-0 top-0 p-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-amber-100 backdrop-blur">
              {photoStop.category === 'Tu hospedaje' ? (
                <HotelIcon className="h-3.5 w-3.5" />
              ) : (
                <MapPinIcon className="h-3.5 w-3.5" />
              )}
              {photoStop.name}
            </span>
            {photoStop.category && photoStop.category !== 'Tu hospedaje' && (
              <span className="ml-2 inline-block rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-stone-300 backdrop-blur">
                {photoStop.category}
              </span>
            )}
          </figcaption>

          {activeFact && (
            <div
              key={activeFact.text}
              className={`absolute inset-x-4 bottom-28 max-w-sm rounded-2xl border border-amber-400/40 bg-[#0b0a07]/95 p-3.5 shadow-[0_14px_40px_-10px_rgba(0,0,0,0.8)] sm:left-4 sm:right-auto ${
                reduced
                  ? ''
                  : activeFact.leaving
                    ? 'animate-[hestia-bubble-out_0.3s_ease_forwards]'
                    : 'animate-[hestia-bubble-in_0.4s_ease]'
              }`}
            >
              <p className="flex items-start gap-2 text-[11px] leading-5 text-amber-50 sm:text-xs">
                <LightbulbIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                {activeFact.text}
              </p>
              <span
                className="absolute -bottom-2 left-8 h-4 w-4 rotate-45 border-b border-r border-amber-400/40 bg-[#0b0a07]"
                aria-hidden="true"
              />
            </div>
          )}
        </figure>
      )}

      {(!mapReady || loadingRoute) && !mapError && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[11px] text-amber-200">
          {mapReady ? 'Calculando tu ruta por las calles…' : 'Cargando mapa 3D…'}
        </div>
      )}
      {mapError && (
        <div className="absolute left-3 top-3 rounded-md bg-rose-500/20 px-3 py-1.5 text-[11px] text-rose-100">
          {mapError}
        </div>
      )}

      {legs.length > 0 && (
        <div className="absolute inset-x-3 bottom-3 rounded-xl border border-amber-400/30 bg-[#0b0a07]/90 p-3 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-stone-300">
              {status === 'done' ? (
                <>Recorrido completo · {formatKm(totalKm)}</>
              ) : (
                <>
                  Tramo {currentLeg + 1} de {legs.length} ·{' '}
                  <span className="font-semibold text-amber-200">
                    {leg.from.name} → {leg.to.name}
                  </span>{' '}
                  · {MODE_LABEL[leg.mode]} {formatKm(leg.lengthKm)} {formatMinutes(leg.lengthKm, leg.mode)}
                </>
              )}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => goToStop(activeStopIndexRef.current - 1)}
                disabled={activeStopIndex === 0}
                className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 px-2.5 py-1 text-[11px] text-stone-200 disabled:opacity-40"
              >
                <ChevronLeftIcon className="h-3 w-3" /> Anterior
              </button>
              {status === 'playing' ? (
                <button
                  type="button"
                  onClick={pause}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-bold text-black"
                >
                  <PauseIcon className="h-3 w-3" /> Pausar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={play}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-bold text-black"
                >
                  <PlayIcon className="h-3 w-3" />{' '}
                  {status === 'paused' && midLegPause
                    ? 'Continuar'
                    : status !== 'done' && activeStopIndex > 0
                      ? 'Reproducir desde aquí'
                      : 'Reproducir mi día'}
                </button>
              )}
              <button
                type="button"
                onClick={() => goToStop(activeStopIndexRef.current + 1)}
                disabled={status === 'done'}
                className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 px-2.5 py-1 text-[11px] text-stone-200 disabled:opacity-40"
              >
                Siguiente <ChevronRightIcon className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  pause()
                  // La foto a pantalla completa tapaba el mapa: sin esto, la
                  // cámara se reencuadraba "detrás" de la foto y parecía que
                  // el botón no hacía nada.
                  setShowStopPhoto(false)
                  overview()
                }}
                className="rounded-full border border-amber-400/30 px-2.5 py-1 text-[11px] text-stone-200"
              >
                Vista general
              </button>
            </div>
          </div>
          {approximate && (
            <p className="mt-1 text-[10px] text-stone-500">
              Algún tramo se muestra en línea recta: el servicio de rutas no respondió.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default CuscoMap3D
