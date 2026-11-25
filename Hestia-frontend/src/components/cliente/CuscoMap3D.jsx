import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LngLatBounds, Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { routeLegs } from '../../lib/routingClient.js'
import {
  buildLegs,
  followZoom,
  legDurationMs,
  lerpAngle,
  lineLengthKm,
  pointAlong,
  toCoord,
} from '../../lib/tripRoute.js'

setWorkerUrl(maplibreWorkerUrl)

// Estilo vectorial gratuito y sin clave (incluye edificios 3D por OSM).
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'
// Relieve: AWS Terrain Tiles (SRTM, GMTED, ETOPO1), formato terrarium.
const TERRAIN_TILES = ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png']
const CUSCO_CENTER = [-71.9785, -13.5164]
const STOP_PAUSE_MS = 1400

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

function travelerElement() {
  const element = document.createElement('div')
  element.className = 'hestia-traveler'
  element.setAttribute('aria-hidden', 'true')
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
  const [mapError, setMapError] = useState('')
  const [prevStops, setPrevStops] = useState(stops)

  // Cambió el día o la ruta: se reinicia la reproducción durante el render
  // (patrón de React para ajustar estado cuando cambia una prop).
  if (prevStops !== stops) {
    setPrevStops(stops)
    setStatus('idle')
    setCurrentLeg(0)
  }

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
        travelerRef.current = new Marker({ element: travelerElement() })
          .setLngLat(withLength[0].coords[0])
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

  const runLeg = useCallback(
    (legIndex) => {
      const map = mapRef.current
      const leg = legsRef.current[legIndex]
      if (!map || !leg) {
        setStatus('done')
        overview()
        return
      }

      const playback = playbackRef.current
      const reduced = prefersReducedMotion()
      const duration = reduced ? 600 : legDurationMs(leg.lengthKm, leg.mode)
      playback.leg = legIndex
      setCurrentLeg(legIndex)
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

        // Llegó a la parada: pausa breve y sigue con el siguiente tramo.
        playback.raw = 0
        onStopChangeRef.current?.(legIndex + 1)
        playback.timeout = setTimeout(() => runLegRef.current?.(legIndex + 1), STOP_PAUSE_MS)
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
    [overview, setProgressLine],
  )

  useEffect(() => {
    runLegRef.current = runLeg
  }, [runLeg])

  function play() {
    if (legsRef.current.length === 0) return
    stopPlayback()
    if (status === 'done' || status === 'idle') {
      playbackRef.current = { ...playbackRef.current, leg: 0, raw: 0, bearing: null }
      setProgressLine(0, [])
      travelerRef.current?.setLngLat(legsRef.current[0].coords[0])
    }
    setStatus('playing')
    runLeg(playbackRef.current.leg)
  }

  function pause() {
    stopPlayback()
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

    playbackRef.current = { ...playbackRef.current, leg: arrived ? total : legIndex, raw: 0, bearing: null }
    setProgressLine(clamped, [])
    travelerRef.current?.setLngLat(point)
    setCurrentLeg(legIndex)
    setStatus(arrived ? 'done' : 'paused')
    onStopChangeRef.current?.(clamped)
    map.flyTo({ center: point, zoom: 16, pitch: 60, duration: 1200 })
  }

  if (!supported) return fallback

  const leg = legs[currentLeg]
  const totalKm = legs.reduce((sum, item) => sum + item.lengthKm, 0)
  const approximate = legs.some((item) => item.approximate && item.mode !== 'tren')

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-400/30 bg-black/40">
      <div ref={containerRef} className="h-[26rem] w-full" />

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
                onClick={() => goToStop(currentLeg - (status === 'done' ? 0 : 1))}
                disabled={currentLeg === 0 && status !== 'done'}
                className="rounded-full border border-amber-400/30 px-2.5 py-1 text-[11px] text-stone-200 disabled:opacity-40"
              >
                ‹ Anterior
              </button>
              {status === 'playing' ? (
                <button
                  type="button"
                  onClick={pause}
                  className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-bold text-black"
                >
                  ❚❚ Pausar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={play}
                  className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-bold text-black"
                >
                  ▶ {status === 'paused' ? 'Continuar' : 'Reproducir mi día'}
                </button>
              )}
              <button
                type="button"
                onClick={() => goToStop(currentLeg + 1)}
                disabled={status === 'done'}
                className="rounded-full border border-amber-400/30 px-2.5 py-1 text-[11px] text-stone-200 disabled:opacity-40"
              >
                Siguiente ›
              </button>
              <button
                type="button"
                onClick={() => {
                  pause()
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
