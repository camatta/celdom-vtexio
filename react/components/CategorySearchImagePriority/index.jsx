import { useEffect } from 'react'

const GALLERY_IMAGE_SELECTOR = [
  '.vtex-search-result-3-x-galleryItem img.vtex-product-summary-2-x-imageNormal',
  '.vtex-search-result-3-x-galleryItem img.vtex-product-summary-2-x-image',
  '.vtex-search-result-3-x-galleryItem img',
].join(', ')

const EAGER_IMAGES_COUNT = 3
const CATEGORY_LAYOUT_SELECTOR =
  '.vtex-search-result-3-x-loadingOverlay--search-result-layout'

const isCategoryPage = () => {
  if (document.querySelector(CATEGORY_LAYOUT_SELECTOR)) return true

  const searchParams = new URLSearchParams(window.location.search)
  const map = searchParams.get('map')

  if (!map) return false

  return map.split(',').some((segment) => segment.trim() === 'c')
}

const applyCategoryImageLoading = () => {
  if (!isCategoryPage()) return

  const images = Array.from(document.querySelectorAll(GALLERY_IMAGE_SELECTOR)).filter(
    (image) => image instanceof HTMLImageElement
  )

  if (!images.length) return

  images.forEach((image, index) => {
    const shouldLoadEagerly = index < EAGER_IMAGES_COUNT

    image.setAttribute('loading', shouldLoadEagerly ? 'eager' : 'lazy')
    image.setAttribute('fetchpriority', shouldLoadEagerly ? 'high' : 'auto')
  })
}

const scheduleLoadingUpdate = () => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(applyCategoryImageLoading)
  })
}

const CategorySearchImagePriority = () => {
  useEffect(() => {
    scheduleLoadingUpdate()

    const observer = new MutationObserver(() => {
      scheduleLoadingUpdate()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    window.addEventListener('popstate', scheduleLoadingUpdate)

    return () => {
      observer.disconnect()
      window.removeEventListener('popstate', scheduleLoadingUpdate)
    }
  }, [])

  return null
}

export default CategorySearchImagePriority
