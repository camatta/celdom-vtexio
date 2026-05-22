import React, { useContext, useEffect, useRef } from 'react'
import ProductSummaryContext from 'vtex.product-summary/ProductSummaryContext'

const GALLERY_ITEM_SELECTOR = '.vtex-search-result-3-x-galleryItem'
const HIDDEN_CATEGORY_NAME = 'coifas sob medida'

const normalizeText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

const isCoifasCategoryPage = () => {
  const params = new URLSearchParams(window.location.search)
  const map = (params.get('map') || '')
    .split(',')
    .map((segment) => segment.trim())

  if (!map.includes('c')) return false

  return normalizeText(window.location.pathname).includes('/coifas')
}

const collectCategoryValues = (product) => {
  if (!product) return []

  const values = []
  const append = (input) => {
    if (!input) return

    if (Array.isArray(input)) {
      input.forEach(append)
      return
    }

    if (typeof input === 'object') {
      append(input.name)
      append(input.label)
      append(input.href)
      append(input.categoryName)
      return
    }

    values.push(String(input))
  }

  append(product.categories)
  append(product.categoryTree)
  append(product.categoriesIds)
  append(product.categoryId)
  append(product.category)

  return values
}

const belongsToSobMedida = (product) =>
  collectCategoryValues(product).some((value) => normalizeText(value).includes(HIDDEN_CATEGORY_NAME))

const CoifasSobMedidaProductGuard = () => {
  const hostRef = useRef(null)
  const summaryContext = ProductSummaryContext ? useContext(ProductSummaryContext) : null
  const product = summaryContext?.product

  useEffect(() => {
    const host = hostRef.current
    const galleryItem = host?.closest(GALLERY_ITEM_SELECTOR)

    if (!(galleryItem instanceof HTMLElement)) return undefined

    const shouldHide = isCoifasCategoryPage() && belongsToSobMedida(product)

    galleryItem.style.display = shouldHide ? 'none' : ''
    galleryItem.dataset.nrzCoifasSobMedidaHidden = shouldHide ? 'true' : 'false'

    return () => {
      galleryItem.style.display = ''
      delete galleryItem.dataset.nrzCoifasSobMedidaHidden
    }
  }, [product])

  return <span ref={hostRef} style={{ display: 'none' }} aria-hidden="true" />
}

export default CoifasSobMedidaProductGuard
