import { useEffect } from 'react'

const GALLERY_IMAGE_SELECTOR = [
  '.vtex-search-result-3-x-galleryItem img.vtex-product-summary-2-x-imageNormal',
  '.vtex-search-result-3-x-galleryItem img.vtex-product-summary-2-x-image',
  '.vtex-search-result-3-x-galleryItem img',
].join(', ')

const EAGER_IMAGES_COUNT = 3
const CATEGORY_LAYOUT_SELECTOR =
  '.vtex-search-result-3-x-loadingOverlay--search-result-layout'
const CATEGORY_FILTER_ITEM_SELECTOR =
  '.vtex-search-result-3-x-filter__container[class*="--category"] .vtex-search-result-3-x-filterItem'
const HIDDEN_CATEGORY_SLUG = 'coifas-sob-medida'

const normalizeText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

const isCoifasCategoryPage = () => {
  if (!isCategoryPage()) return false

  return normalizeText(window.location.pathname).includes('/coifas')
}

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

const hideSobMedidaCategoryFacet = () => {
  if (!isCoifasCategoryPage()) return

  const items = Array.from(document.querySelectorAll(CATEGORY_FILTER_ITEM_SELECTOR))

  items.forEach((item) => {
    const element = item

    if (!(element instanceof HTMLElement)) return

    const label = element.querySelector('.vtex-checkbox__label')?.textContent || ''
    const normalizedLabel = normalizeText(label)
    const hasTargetClass = element.className.includes(HIDDEN_CATEGORY_SLUG)

    if (!hasTargetClass && !normalizedLabel.includes('coifas sob medida')) return

    element.style.display = 'none'
    element.setAttribute('aria-hidden', 'true')
  })
}

const scheduleLoadingUpdate = () => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      applyCategoryImageLoading()
      hideSobMedidaCategoryFacet()
    })
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
