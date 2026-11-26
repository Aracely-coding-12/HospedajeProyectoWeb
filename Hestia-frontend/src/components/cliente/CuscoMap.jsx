import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function numberedIcon(number) {
  return L.divIcon({
    className: '',
    html: `<span style="
      display:flex;align-items:center;justify-content:center;
      width:26px;height:26px;border-radius:9999px;
      background:#f59e0b;color:#1c1203;font:700 12px/1 sans-serif;
      box-shadow:0 0 0 2px rgba(0,0,0,0.55);
    ">${number}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })
}

function CuscoMap({ days, activeIndex }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [-13.5164, -71.9785],
      zoom: 13,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; colaboradores de OpenStreetMap',
      maxZoom: 18,
    }).addTo(map)

    mapRef.current = map
    layerRef.current = L.layerGroup().addTo(map)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return

    const day = days[activeIndex]
    layer.clearLayers()
    if (!day || day.pois.length === 0) return

    const path = day.pois.map((poi) => [poi.lat, poi.lng])

    if (path.length > 1) {
      L.polyline(path, {
        color: '#f59e0b',
        weight: 2.5,
        opacity: 0.75,
        dashArray: '1,8',
        lineCap: 'round',
      }).addTo(layer)
    }

    day.pois.forEach((poi, index) => {
      L.marker([poi.lat, poi.lng], { icon: numberedIcon(index + 1) })
        .addTo(layer)
        .bindPopup(`<strong>${poi.name}</strong><br/>${poi.category}`)
    })

    const flyOptions = { duration: 1.1, easeLinearity: 0.25 }
    if (path.length === 1) {
      map.flyTo(path[0], 15, flyOptions)
    } else {
      map.flyToBounds(path, { padding: [36, 36], ...flyOptions })
    }
  }, [days, activeIndex])

  return (
    <div
      ref={containerRef}
      className="h-72 w-full overflow-hidden rounded-xl border border-amber-400/30"
    />
  )
}

export default CuscoMap
