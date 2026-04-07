import { useEffect } from 'react'

const PDP_THUMB_SELECTOR = 'img.vtex-store-components-3-x-thumbImg--pdp'

const applyThumbPriority = () => {
  const images = Array.from(document.querySelectorAll(PDP_THUMB_SELECTOR)).filter(
    (image) => image instanceof HTMLImageElement
  )

  images.forEach((image) => {
    image.setAttribute('fetchpriority', 'high')
  })
}

const scheduleApplyThumbPriority = () => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(applyThumbPriority)
  })
}

const ProductThumbImagePriority = () => {
  useEffect(() => {
    scheduleApplyThumbPriority()

    const observer = new MutationObserver(() => {
      scheduleApplyThumbPriority()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    window.addEventListener('popstate', scheduleApplyThumbPriority)

    return () => {
      observer.disconnect()
      window.removeEventListener('popstate', scheduleApplyThumbPriority)
    }
  }, [])

  return null
}

export default ProductThumbImagePriority
