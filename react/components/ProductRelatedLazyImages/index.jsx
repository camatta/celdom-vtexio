import { useEffect } from 'react'

const PRODUCT_ROUTE_SELECTOR = '.render-route-store-product'
const PRODUCT_RELATED_IMAGE_SELECTOR = [
  '.vtex-flex-layout-0-x-flexColChild--related-products-content img',
].join(', ')

const isProductPage = () => Boolean(document.querySelector(PRODUCT_ROUTE_SELECTOR))

const applyProductRelatedLazyLoading = () => {
  if (!isProductPage()) return

  const images = Array.from(document.querySelectorAll(PRODUCT_RELATED_IMAGE_SELECTOR)).filter(
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
    window.requestAnimationFrame(applyProductRelatedLazyLoading)
  })
}

const ProductRelatedLazyImages = () => {
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

export default ProductRelatedLazyImages
