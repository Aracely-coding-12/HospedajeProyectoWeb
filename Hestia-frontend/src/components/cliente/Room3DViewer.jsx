import { useEffect, useRef, useState } from 'react'
import { CrosshairIcon, SmartphoneIcon } from './icons.jsx'

let modelViewerReady = null

function loadModelViewer() {
  if (!modelViewerReady) {
    modelViewerReady = import('@google/model-viewer')
  }
  return modelViewerReady
}

function Room3DViewer({ room, modelSrc }) {
  const [ready, setReady] = useState(false)
  const viewerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    loadModelViewer().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  function recenterView() {
    const viewer = viewerRef.current
    if (!viewer) return
    // Vuelve al encuadre "ideal" que model-viewer calcula para este modelo,
    // por si arrastraste o hiciste zoom hasta perderlo de vista.
    viewer.cameraOrbit = 'auto auto auto'
    viewer.cameraTarget = 'auto auto auto'
    viewer.fieldOfView = 'auto'
    viewer.jumpCameraToGoal()
  }

  if (!modelSrc) return null

  return (
    <div className="overflow-hidden rounded-xl border border-amber-400/30 bg-black/40">
      {ready ? (
        <div className="relative">
          <model-viewer
            ref={viewerRef}
            key={modelSrc}
            src={modelSrc}
            alt={`Vista 3D de la habitación ${room.number}`}
            camera-controls
            auto-rotate
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-placement="floor"
            ar-scale="auto"
            environment-image="neutral"
            tone-mapping="neutral"
            shadow-intensity="1.2"
            shadow-softness="0.8"
            exposure="1.1"
            style={{
              '--poster-color': '#0b0a07',
              '--ar-button-background-color': '#fbbf24',
              '--ar-button-text-color': '#0b0a07',
              width: '100%',
              height: '18rem',
              backgroundColor: '#0b0a07',
            }}
          />
          <button
            type="button"
            onClick={recenterView}
            aria-label="Centrar vista"
            title="Centrar vista"
            className="absolute right-2.5 top-2.5 rounded-full border border-amber-400/40 bg-black/60 p-2 text-amber-200 backdrop-blur transition hover:bg-black/80"
          >
            <CrosshairIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex h-72 items-center justify-center text-xs text-stone-500">
          Cargando vista 3D…
        </div>
      )}
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <p className="text-[10px] leading-4 text-stone-500">
          Modelo referencial para mostrar la distribución del espacio · "Bedroom" por Poly by
          Google (CC BY 3.0)
        </p>
        <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-amber-300">
          <SmartphoneIcon className="h-3 w-3" /> Toca el ícono AR para verla en tu espacio
        </span>
      </div>
    </div>
  )
}

export default Room3DViewer
