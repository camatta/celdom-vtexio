import { useEffect } from 'react'

const HOME_ROUTE_SELECTOR = '.render-route-store-home'
const HOME_SLIDER_IMAGE_SELECTOR = [
  '.vtex-slider-layout-0-x-sliderTrackContainer--shelf-carousel img',
  '.vtex-slider-layout-0-x-sliderLayoutContainer--areaGourmetCarousel img',
  '.vtex-slider-layout-0-x-sliderTrackContainer--lancamentos-products img',
  '.vtex-slider-layout-0-x-sliderTrack--destaques-products img',
  '.vtex-slider-layout-0-x-sliderLayoutContainer--lojasCarousel img',
  '.vtex-flex-layout-0-x-flexColChild--content-bar-inspiration img',
  '.vtex-flex-layout-0-x-flexRowContent--services-flags-container img'
].join(', ')

const isHomePage = () => Boolean(document.querySelector(HOME_ROUTE_SELECTOR))

const applyHomeSliderLazyLoading = () => {
  if (!isHomePage()) return

  const images = Array.from(document.querySelectorAll(HOME_SLIDER_IMAGE_SELECTOR)).filter(
    (image) => image instanceof HTMLImageElement
  )

  if (!images.length) return

  images.forEach((image) => {
    image.loading = 'lazy'
    image.setAttribute('loading', 'lazy')
    image.fetchPriority = 'auto'
    image.removeAttribute('fetchpriority')
  })
}

const scheduleLazyLoadingUpdate = () => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(applyHomeSliderLazyLoading)
  })
}

const HomeSliderLazyImages = () => {
  useEffect(() => {
    scheduleLazyLoadingUpdate()

    const observer = new MutationObserver(() => {
      scheduleLazyLoadingUpdate()
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

export default HomeSliderLazyImages
