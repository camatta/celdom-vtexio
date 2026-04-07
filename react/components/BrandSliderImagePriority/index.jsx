import { useEffect } from 'react'

const BRAND_SLIDER_IMAGE_SELECTOR =
  '.vtex-slider-layout-0-x-slideChildrenContainer--categories img'

const applyBrandSliderImagePriority = () => {
  const images = Array.from(document.querySelectorAll(BRAND_SLIDER_IMAGE_SELECTOR)).filter(
    (image) => image instanceof HTMLImageElement
  )

  images.forEach((image) => {
    image.setAttribute('fetchpriority', 'high')
  })
}

const scheduleBrandSliderImagePriority = () => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(applyBrandSliderImagePriority)
  })
}

const BrandSliderImagePriority = () => {
  useEffect(() => {
    scheduleBrandSliderImagePriority()

    const observer = new MutationObserver(() => {
      scheduleBrandSliderImagePriority()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}

export default BrandSliderImagePriority
