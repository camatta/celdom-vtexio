import React, { useEffect, useRef } from 'react'

const ReclameAqui = ({
  dataId = 'MjIzOTA6Y2VsZG9t',
  model = 'horizontal_1',
  targetId = 'ra-verified-seal',
  className,
}) => {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Limpa qualquer conteúdo injetado anteriormente
    container.innerHTML = ''

    // Remove script anterior com o mesmo id, se existir
    const prev = document.getElementById('ra-embed-verified-seal')
    if (prev && prev.parentNode) {
      prev.parentNode.removeChild(prev)
    }

    // Cria o script com os atributos exigidos
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.id = 'ra-embed-verified-seal'
    script.src = 'https://s3.amazonaws.com/raichu-beta/ra-verified/bundle.js'
    script.async = true
    script.setAttribute('data-id', dataId)
    script.setAttribute('data-target', targetId)
    script.setAttribute('data-model', model)

    // Anexa dentro do container, igual ao snippet original
    container.appendChild(script)

    // Cleanup ao desmontar
    return () => {
      try {
        container.innerHTML = ''
      } catch {}
      const s = document.getElementById('ra-embed-verified-seal')
      if (s) s.remove()
    }
  }, [dataId, model, targetId])

  return <div id={targetId} ref={containerRef} className={className} />
}

export default ReclameAqui;
