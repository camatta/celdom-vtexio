import React, { useEffect, useRef } from 'react'

const HIDDEN_CATEGORY_PATH = '/3/29/'
const HIDDEN_CATEGORY_SLUGS = ['coifas/coifas-sob-medida']
const HIDDEN_CATEGORY_NAMES = ['coifas sob medida']
const AUTOCOMPLETE_ITEM_SELECTOR = '[class*="resultsItem"]'
const AUTOCOMPLETE_LINK_SELECTOR = 'a[href]'

const normalizeText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

const safeDecodeURIComponent = (value = '') => {
  try {
    return decodeURIComponent(String(value))
  } catch (err) {
    return String(value)
  }
}

const normalizeSlug = (value = '') =>
  normalizeText(safeDecodeURIComponent(value))
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/^\/+/, '')
    .replace(/\/p\/?$/i, '')
    .replace(/\/+$/, '')

const collectProductIdentifiers = (product) => {
  const identifiers = []

  if (product?.productId) identifiers.push(String(product.productId))
  if (product?.linkText) identifiers.push(normalizeSlug(product.linkText))
  if (product?.link) identifiers.push(normalizeSlug(product.link))
  if (product?.productName) identifiers.push(normalizeText(product.productName))

  return identifiers.filter(Boolean)
}

const findAutocompleteItem = (element) => {
  const item = element.closest(AUTOCOMPLETE_ITEM_SELECTOR)
  return item instanceof HTMLElement ? item : null
}

const SearchHiddenProductsGuard = () => {
  const hiddenProductsRef = useRef({
    ids: new Set(),
    slugs: new Set(),
    names: new Set(),
  })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    let cancelled = false
    let observer = null

    const fetchHiddenProducts = async () => {
      try {
        const resp = await fetch(
          `/api/catalog_system/pub/products/search?fq=C:${HIDDEN_CATEGORY_PATH}&_from=0&_to=49`,
          { cache: 'no-store' }
        )

        if (!resp.ok) return

        const products = await resp.json()
        if (!Array.isArray(products)) return

        const ids = new Set()
        const slugs = new Set()
        const names = new Set()

        products.forEach((product) => {
          collectProductIdentifiers(product).forEach((identifier) => {
            if (/^\d+$/.test(identifier)) {
              ids.add(identifier)
            } else if (identifier.includes(' ')) {
              names.add(identifier)
            } else {
              slugs.add(identifier)
            }
          })
        })

        hiddenProductsRef.current = { ids, slugs, names }
      } catch (err) {
        console.error('Error fetching hidden search products:', err)
      }
    }

    const shouldHideLink = (link) => {
      const href = link.getAttribute('href') || ''
      const slug = normalizeSlug(href)
      const text = normalizeText(link.textContent || '')
      const productId = link.getAttribute('data-product-id') || link.dataset?.productId
      const { ids, slugs, names } = hiddenProductsRef.current

      if (productId && ids.has(String(productId))) return true
      if (slug && slugs.has(slug)) return true
      if (slug && HIDDEN_CATEGORY_SLUGS.includes(slug)) return true
      if (text && HIDDEN_CATEGORY_NAMES.includes(text)) return true

      return text && names.has(text)
    }

    const syncAutocompleteItems = () => {
      document.querySelectorAll(AUTOCOMPLETE_LINK_SELECTOR).forEach((link) => {
        const item = findAutocompleteItem(link)
        if (!item) return

        const shouldHide = shouldHideLink(link)
        item.style.display = shouldHide ? 'none' : ''
        item.dataset.nrzCoifasSobMedidaHidden = shouldHide ? 'true' : 'false'
      })
    }

    fetchHiddenProducts().then(() => {
      if (cancelled) return

      syncAutocompleteItems()
      observer = new MutationObserver(syncAutocompleteItems)
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })
    })

    return () => {
      cancelled = true
      if (observer) observer.disconnect()
    }
  }, [])

  return null
}

export default SearchHiddenProductsGuard
