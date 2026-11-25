import { useEffect, useState } from 'react'

let modelViewerReady = null

function loadModelViewer() {
  if (!modelViewerReady) {
    modelViewerReady = import('@google/model-viewer')
  }
  return modelViewerReady
}

function Room3DViewer({ room, modelSrc }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadModelViewer().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!modelSrc) return null

  return (
    <div className="overflow-hidden rounded-xl border border-amber-400/30 bg-black/40">
      {ready ? (
        <model-viewer
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
        <span className="shrink-0 text-[10px] font-medium text-amber-300">
          📱 Toca el ícono AR para verla en tu espacio
        </span>
      </div>
    </div>
  )
}

export default Room3DViewer
