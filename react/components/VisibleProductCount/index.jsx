import React, { useState, useEffect, useRef } from 'react'

/**
 * Seletores do DOM renderizados pelo vtex.search-result
 */
const GALLERY_ITEM_SELECTOR = '.vtex-search-result-3-x-galleryItem'
const PRODUCT_SUMMARY_SELECTOR = [
  '.vtex-product-summary-2-x-container',
  '.vtex-product-summary-2-x-element',
].join(',')
const MAIN_CATEGORY_PATH = '/3/'
const HIDDEN_CATEGORY_PATH = '/3/29/'

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

/**
 * Verifica se a página atual é exatamente a PLP principal de Coifas
 * ou a PLP de Coifas Sob Medida. É nestas páginas que os produtos
 * da categoria 29 são carregados/ocultados e, portanto, a contagem deve ser ajustada.
 */
const isMainCoifasPage = () => {
  if (typeof window === 'undefined') return false

  const path = normalizeText(window.location.pathname).replace(/\/+$/, '')

  // Cobre exatamente "/coifas", "/coifas/d" ou "/coifas/coifas-sob-medida"
  return (
    path === '/coifas' ||
    path === '/coifas/d' ||
    path === '/coifas/coifas-sob-medida'
  )
}

/**
 * Componente que exibe a contagem total de produtos ajustada,
 * subtraindo os produtos da categoria "Coifas Sob Medida" (ID 29)
 * que são ocultados pelo CoifasSobMedidaProductGuard.
 */
const VisibleProductCount = () => {
  const [displayTotal, setDisplayTotal] = useState(null)

  const adjustedTotalRef = useRef(null)
  const hiddenCategoryCountRef = useRef(null)
  const categoryCountsRef = useRef({})
  const searchHiddenCountsRef = useRef({})
  const isFetchingRef = useRef(false)
  const lastFetchTimeRef = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    let cancelled = false
    let intervalId = null

    const fetchCategoryCount = async (categoryPath) => {
      if (categoryCountsRef.current[categoryPath] !== undefined) {
        return categoryCountsRef.current[categoryPath]
      }

      try {
        const searchParams = new URLSearchParams({
          fq: `C:${categoryPath}`,
          _from: '0',
          _to: '0',
        })

        const resp = await fetch(
          `/api/catalog_system/pub/products/search?${searchParams.toString()}`,
          { cache: 'no-store' }
        )
        
        if (resp.ok) {
          // Tentamos obter a contagem total real a partir do header 'resources'
          const resourcesHeader = resp.headers.get('resources')
          if (resourcesHeader) {
            const match = resourcesHeader.match(/\/(\d+)$/)
            if (match) {
              const total = parseInt(match[1], 10)
              if (!isNaN(total)) {
                categoryCountsRef.current[categoryPath] = total
                return total
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching category count:', err)
      }

      return null
    }

    const getSearchTerm = () => {
      const params = new URLSearchParams(window.location.search)
      const directTerm =
        params.get('ft') ||
        params.get('_q') ||
        params.get('q') ||
        params.get('query') ||
        params.get('term') ||
        params.get('text') ||
        params.get('keyword')

      if (directTerm) return directTerm

      const map = params.get('map') || ''
      if (!map.split(',').includes('ft')) return ''

      return safeDecodeURIComponent(window.location.pathname.replace(/^\/+|\/+$/g, ''))
    }

    const isTextSearchPage = () => {
      const path = normalizeText(window.location.pathname)
      const params = new URLSearchParams(window.location.search)
      const map = params.get('map') || ''

      if (path.endsWith('/p') || path.includes('/p/')) return false
      if (isMainCoifasPage()) return false

      return (
        path === '/busca' ||
        path === '/search' ||
        path === '/sistema/busca' ||
        map.split(',').includes('ft') ||
        Boolean(getSearchTerm())
      )
    }

    const fetchSearchHiddenCategoryCount = async (term) => {
      const normalizedTerm = normalizeText(term)
      if (!normalizedTerm) return 0
      if (searchHiddenCountsRef.current[normalizedTerm] !== undefined) {
        return searchHiddenCountsRef.current[normalizedTerm]
      }

      try {
        const searchParams = new URLSearchParams({
          ft: term,
          fq: `C:${HIDDEN_CATEGORY_PATH}`,
          _from: '0',
          _to: '0',
        })

        const resp = await fetch(
          `/api/catalog_system/pub/products/search?${searchParams.toString()}`,
          { cache: 'no-store' }
        )

        if (!resp.ok) return 0

        const resourcesHeader = resp.headers.get('resources')
        const match = resourcesHeader ? resourcesHeader.match(/\/(\d+)$/) : null
        const total = match ? parseInt(match[1], 10) : 0
        const safeTotal = isNaN(total) ? 0 : total

        searchHiddenCountsRef.current[normalizedTerm] = safeTotal
        return safeTotal
      } catch (err) {
        console.error('Error fetching hidden search category count:', err)
      }

      return 0
    }

    // ——————————————————————————————————————
    // 1. Busca a quantidade total de produtos ativos na categoria 29
    // ——————————————————————————————————————
    const fetchHiddenCategoryCount = async () => {
      // Retorna imediatamente se já temos o valor correto
      if (hiddenCategoryCountRef.current !== null && hiddenCategoryCountRef.current > 0) {
        return hiddenCategoryCountRef.current
      }

      const now = Date.now()
      // Se já está buscando ou tentou há menos de 5 segundos, retorna o valor atual ou 0
      if (isFetchingRef.current || (now - lastFetchTimeRef.current < 5000)) {
        return hiddenCategoryCountRef.current !== null ? hiddenCategoryCountRef.current : 0
      }

      isFetchingRef.current = true
      lastFetchTimeRef.current = now
      try {
        const total = await fetchCategoryCount(HIDDEN_CATEGORY_PATH)
        if (total !== null) {
          hiddenCategoryCountRef.current = total
          return total
        }
      } finally {
        isFetchingRef.current = false
      }

      return hiddenCategoryCountRef.current !== null ? hiddenCategoryCountRef.current : 0
    }

    const fetchMainCoifasAdjustedTotal = async () => {
      const hiddenCount = await fetchHiddenCategoryCount()
      const mainCount = await fetchCategoryCount(MAIN_CATEGORY_PATH)

      if (mainCount === null) return null

      return Math.max(0, mainCount - hiddenCount)
    }

    // ——————————————————————————————————————
    // 2. Lê o total nativo de qualquer elemento totalProducts
    // ——————————————————————————————————————
    const readNativeTotal = () => {
      const el = document.querySelector('[class*="totalProducts"]')
      if (!el) return null

      const num = parseInt((el.textContent || '').replace(/\D/g, ''), 10)
      return isNaN(num) ? null : num
    }

    // ——————————————————————————————————————
    // 3. Conta cards de produto visíveis no DOM
    // ——————————————————————————————————————
    const isVisibleElement = (el) => {
      if (!(el instanceof HTMLElement)) return false

      const style = window.getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false
      }

      const rect = el.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0
    }

    const countVisibleItems = () => {
      const all = document.querySelectorAll(GALLERY_ITEM_SELECTOR)
      let visible = 0

      all.forEach((item) => {
        if (!(item instanceof HTMLElement)) return
        if (item.dataset.nrzCoifasSobMedidaHidden === 'true') return
        if (!isVisibleElement(item)) return

        const summary = item.querySelector(PRODUCT_SUMMARY_SELECTOR)
        if (summary && isVisibleElement(summary)) {
          visible += 1
        }
      })

      return visible
    }

    const countHiddenItems = () => {
      const all = document.querySelectorAll(GALLERY_ITEM_SELECTOR)
      let hidden = 0

      all.forEach((item) => {
        if (!(item instanceof HTMLElement)) return

        if (item.dataset.nrzCoifasSobMedidaHidden === 'true') {
          hidden += 1
        }
      })

      return hidden
    }

    const hasVisibleFetchMoreButton = () => {
      const buttons = document.querySelectorAll('[class*="buttonShowMore"] button')

      return Array.from(buttons).some((button) => {
        if (!(button instanceof HTMLButtonElement)) return false
        if (button.disabled) return false

        return isVisibleElement(button)
      })
    }

    const updateShowingProductsText = (displayedCount, total) => {
      const countStr = String(displayedCount)
      const totalStr = String(total)
      const spans = Array.from(document.querySelectorAll('[class*="showingProductsCount"]'))
        .filter((span) => /^\d+$/.test((span.textContent || '').trim()))

      for (let index = 0; index < spans.length; index += 2) {
        const showingSpan = spans[index]
        const totalSpan = spans[index + 1]

        if (showingSpan && showingSpan.textContent !== countStr) {
          showingSpan.textContent = countStr
        }

        if (totalSpan && totalSpan.textContent !== totalStr) {
          totalSpan.textContent = totalStr
        }
      }

      const elements = document.querySelectorAll('[class*="showingProducts"]')
      elements.forEach((el) => {
        const text = el.textContent || ''
        const finalText = text.replace(/(\d+)\s+de\s+(\d+)/i, `${countStr} de ${totalStr}`)

        if (finalText !== text && el.children.length === 0) {
          el.textContent = finalText
        }
      })
    }

    // ——————————————————————————————————————
    // 4. Sincronização Periódica e Segura do DOM
    // ——————————————————————————————————————
    const syncProductCounts = async () => {
      if (cancelled) return

      const visibleCount = countVisibleItems()
      let adjusted = null

      if (isMainCoifasPage()) {
        adjusted = await fetchMainCoifasAdjustedTotal()
        if (cancelled) return
      } else if (isTextSearchPage()) {
        const nativeTotal = readNativeTotal()
        const searchTerm = getSearchTerm()
        const hiddenSearchCount = await fetchSearchHiddenCategoryCount(searchTerm)
        const hiddenRenderedCount = countHiddenItems()
        if (cancelled) return

        if (nativeTotal !== null) {
          adjusted = Math.max(0, nativeTotal - Math.max(hiddenSearchCount, hiddenRenderedCount))
        }
      }

      // Ler e atualizar o total principal
      if (adjusted === null) {
        const hiddenCount = isMainCoifasPage() ? await fetchHiddenCategoryCount() : 0
        if (cancelled) return

        const nativeTotal = readNativeTotal()
        if (nativeTotal !== null) {
          adjusted = Math.max(0, nativeTotal - hiddenCount)
        }
      }

      if (adjusted !== null) {
        const hasMoreProducts = hasVisibleFetchMoreButton()

        if (hasMoreProducts) {
          // Durante a paginação, o total não pode ser menor que o que já está visível na tela.
          adjusted = Math.max(adjusted, visibleCount)
        }
        
        adjustedTotalRef.current = adjusted
        setDisplayTotal((prev) => (prev !== adjusted ? adjusted : prev))
      }

      // Ajustar o rodapé apenas em listagens onde escondemos produtos Sob Medida.
      if ((isMainCoifasPage() || isTextSearchPage()) && adjustedTotalRef.current !== null) {
        const total = adjustedTotalRef.current
        const displayedCount = hasVisibleFetchMoreButton()
          ? Math.min(visibleCount, total)
          : total

        // 1. Ajustar os textos de paginação ("Mostrando X-Y de Z" ou "Mostrando Y de Z")
        updateShowingProductsText(displayedCount, total)

        // 2. Ajustar a barra de progresso (desacoplada para maior resiliência)
        const fillers = document.querySelectorAll('[class*="progressBarFiller"]')
        fillers.forEach((filler) => {
          const percentage = total > 0 ? (displayedCount / total) * 100 : 0
          const pctStr = `${Math.min(100, Math.max(0, percentage))}%`
          if (filler.style.width !== pctStr) {
            filler.style.width = pctStr
          }
        })
      }
    }

    // Executa imediatamente e inicia o loop periódico de sincronização
    syncProductCounts()
    intervalId = setInterval(syncProductCounts, 300)

    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  if (displayTotal === null) return null

  return (
    <span className="celdom-visible-product-count">
      {displayTotal} {displayTotal === 1 ? 'produto' : 'produtos'}
    </span>
  )
}

export default VisibleProductCount
