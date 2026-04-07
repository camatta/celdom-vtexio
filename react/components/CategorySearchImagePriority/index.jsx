import { useEffect } from 'react'

const GALLERY_IMAGE_SELECTOR = [
  '.vtex-search-result-3-x-galleryItem img.vtex-product-summary-2-x-imageNormal',
  '.vtex-search-result-3-x-galleryItem img.vtex-product-summary-2-x-image',
  '.vtex-search-result-3-x-galleryItem img',
].join(', ')

const FIRST_ROW_TOLERANCE = 8

const isCategoryPage = () => {
  const searchParams = new URLSearchParams(window.location.search)
  const map = searchParams.get('map')

  if (!map) return false

  return map.split(',').some((segment) => segment.trim() === 'c')
}

const promoteFirstRowImages = () => {
  if (!isCategoryPage()) return

  const images = Array.from(document.querySelectorAll(GALLERY_IMAGE_SELECTOR)).filter(
    (image) => image instanceof HTMLImageElement
  )

  if (!images.length) return

  images.forEach((image) => {
    if (image.dataset.categoryPriorityManaged !== '1') return

    image.setAttribute('fetchpriority', 'auto')

    if (image.getAttribute('loading') === 'eager') {
      image.setAttribute('loading', 'lazy')
    }

    delete image.dataset.categoryPriorityManaged
  })

  const firstImageTop = images[0].getBoundingClientRect().top

  images.forEach((image) => {
    const imageTop = image.getBoundingClientRect().top
    const isFirstRow = Math.abs(imageTop - firstImageTop) <= FIRST_ROW_TOLERANCE

    if (!isFirstRow) return

    image.setAttribute('fetchpriority', 'high')
    image.setAttribute('loading', 'eager')
    image.dataset.categoryPriorityManaged = '1'
  })
}

const schedulePromotion = () => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(promoteFirstRowImages)
  })
}

const CategorySearchImagePriority = () => {
  useEffect(() => {
    schedulePromotion()

    const observer = new MutationObserver(() => {
      schedulePromotion()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    window.addEventListener('popstate', schedulePromotion)

    return () => {
      observer.disconnect()
      window.removeEventListener('popstate', schedulePromotion)
    }
  }, [])

  return null
}

export default CategorySearchImagePriority
