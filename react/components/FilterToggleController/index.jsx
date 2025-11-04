import React, { useEffect, useCallback, useState, useRef } from 'react'

const FilterToggleController = () => {
  const CLASS_NAMES = {
    filterContent: '.vtex-flex-layout-0-x-flexCol--result-filter-content',
    stickyHeader: '.vtex-sticky-layout-0-x-container.vtex-sticky-layout-0-x-container--sticky-header',
    filtersWrapper: '.vtex-search-result-3-x-filtersWrapper',
    filterContainer: '.vtex-search-result-3-x-filter__container',
    selectedFilters: '.vtex-search-result-3-x-filter__container--selectedFilters',
    filterItem: '.vtex-search-result-3-x-filterItem',
    selectedCheckbox: '.vtex-search-result-3-x-selectedFilterItem input[type="checkbox"]',
    clearAllButton: '.vtex-search-result-3-x-clearAllFilters',
    applyButton: '.vtex-search-result-3-x-filterApplyButton button',
    removeFilterButton: '.vtex-search-result-3-x-filterItem__remove',
    priceRangeContainer: '.vtex-search-result-3-x-filter__container--priceRange',
  }

  const IDS = {
    overlay: 'bg-transparent-filter',
    filterHeader: 'filter-custom-header',
    closeButton: 'close-filter-btn',
    clearButton: 'clear-filters-btn',
  }

  const [hasSelectedFilters, setHasSelectedFilters] = useState(false)
  const initialRangeValues = useRef({ min: 0, max: 0 })

  // ---------- 1) Normalização de labels (com debounce) ----------
  const observerRef = useRef(null)
  const debounceTimer = useRef(null)

  const formatFilterText = useCallback(() => {
    const nodes = document.querySelectorAll(
      `.vtex-search-result-3-x-filterItem .vtex-checkbox__label,
       .vtex-search-result-3-x-selectedFilterItem`
    )

    nodes.forEach(node => {
      if (!node || !node.textContent) return
      if (node.dataset && node.dataset.nrzNormalized === '1') return

      const txt = node.textContent.trim()
      if (txt && txt === txt.toUpperCase()) {
        node.textContent = txt.toLowerCase()
        node.style.textTransform = 'capitalize'
      }
      if (node.dataset) node.dataset.nrzNormalized = '1'
    })
  }, [])

  useEffect(() => {
    const runOnce = () => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => formatFilterText())
      } else {
        setTimeout(formatFilterText, 120)
      }
    }
    runOnce()

    const cb = () => {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current)
      debounceTimer.current = window.setTimeout(() => formatFilterText(), 80)
    }

    const mo = new MutationObserver(cb)
    mo.observe(document.body, { childList: true, subtree: true })
    observerRef.current = mo

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current)
    }
  }, [formatFilterText])

  // ---------- 2) Captura de faixa de preço inicial ----------
  const captureInitialRangeValues = useCallback(() => {
    const c = document.querySelector(CLASS_NAMES.priceRangeContainer)
    if (!c) return
    const l = c.querySelector('.vtex-slider__left-value')?.textContent?.replace(/[^\d,]/g, '').replace(',', '.')
    const r = c.querySelector('.vtex-slider__right-value')?.textContent?.replace(/[^\d,]/g, '').replace(',', '.')
    if (!l || !r) return
    const min = Number.parseFloat(l)
    const max = Number.parseFloat(r)
    if (Number.isFinite(min) && Number.isFinite(max)) initialRangeValues.current = { min, max }
  }, [])

  // ---------- 3) Detectar filtros ativos ----------
  const checkSelectedFilters = useCallback(() => {
    const selectedCheckboxes = document.querySelectorAll(`${CLASS_NAMES.selectedCheckbox}:checked`)
    const selectedFilterItems = document.querySelectorAll('.vtex-search-result-3-x-selectedFilterItem')

    const selectedFiltersContainer = document.querySelector(CLASS_NAMES.selectedFilters)
    const hasSelectedFiltersInContainer =
      !!selectedFiltersContainer &&
      selectedFiltersContainer.querySelectorAll('.vtex-search-result-3-x-selectedFilterItem').length > 0

    // inputs de preço (quando existirem)
    const priceMinInput = document.querySelector('input[name="priceMin"]')
    const priceMaxInput = document.querySelector('input[name="priceMax"]')
    let hasActivePriceRange = false
    if (priceMinInput && priceMaxInput) {
      const minValue = Number.parseFloat(priceMinInput.value)
      const maxValue = Number.parseFloat(priceMaxInput.value)
      const minPossibleRaw = Number.parseFloat(priceMinInput.min)
      const maxPossibleRaw = Number.parseFloat(priceMaxInput.max)
      const minPossible = Number.isFinite(minPossibleRaw) ? minPossibleRaw : 0
      const maxPossible = Number.isFinite(maxPossibleRaw) ? maxPossibleRaw : Number.MAX_SAFE_INTEGER
      if (Number.isFinite(minValue) && Number.isFinite(maxValue)) {
        hasActivePriceRange = minValue > minPossible || maxValue < maxPossible
      }
    }

    // slider VTEX
    const c = document.querySelector(CLASS_NAMES.priceRangeContainer)
    let hasActiveSliderRange = false
    if (c) {
      const l = c.querySelector('.vtex-slider__left-value')?.textContent?.replace(/[^\d,]/g, '').replace(',', '.')
      const r = c.querySelector('.vtex-slider__right-value')?.textContent?.replace(/[^\d,]/g, '').replace(',', '.')
      if (l && r) {
        const currentMin = Number.parseFloat(l)
        const currentMax = Number.parseFloat(r)
        if (Number.isFinite(currentMin) && Number.isFinite(currentMax)) {
          hasActiveSliderRange =
            currentMin !== initialRangeValues.current.min || currentMax !== initialRangeValues.current.max
        }
      }
    }

    const hasFilters =
      selectedCheckboxes.length > 0 ||
      selectedFilterItems.length > 0 ||
      hasSelectedFiltersInContainer ||
      hasActivePriceRange ||
      hasActiveSliderRange

    setHasSelectedFilters(hasFilters)
    return hasFilters
  }, [])

  // ---------- 4) Overlay e header ----------
  const closeFilter = useCallback(() => {
    const filterContent = document.querySelector(CLASS_NAMES.filterContent)
    if (filterContent) {
      filterContent.classList.remove('active')
      filterContent.style.cssText = ''
    }
    const stickyHeader = document.querySelector(CLASS_NAMES.stickyHeader)
    if (stickyHeader) stickyHeader.style.zIndex = '999'
    const overlay = document.getElementById(IDS.overlay)
    if (overlay) overlay.style.display = 'none'
  }, [])

  const createOverlay = () => {
    let overlay = document.getElementById(IDS.overlay)
    if (!overlay) {
      overlay = document.createElement('div')
      overlay.id = IDS.overlay
      overlay.style.cssText =
        'display:none;position:fixed;background:rgba(0,0,0,.5);top:0;left:0;width:100vw;height:100vh;z-index:999;margin:0;padding:0'
      document.body.appendChild(overlay)
    }
    return overlay
  }

  // ---------- 5) Limpar filtros ----------
  const clearAllFilters = useCallback(() => {
    const nativeClear = document.querySelector(CLASS_NAMES.clearAllButton)
    if (nativeClear) {
      nativeClear.click()
      setTimeout(() => {
        setHasSelectedFilters(false)
        closeFilter()
      }, 400)
      return
    }

    document.querySelectorAll(CLASS_NAMES.removeFilterButton).forEach(b => b.click())

    document.querySelectorAll(`${CLASS_NAMES.selectedCheckbox}:checked`).forEach(chk => {
      chk.checked = false
      chk.dispatchEvent(new Event('change', { bubbles: true }))
      chk.dispatchEvent(new Event('input', { bubbles: true }))
      chk.dispatchEvent(new Event('click', { bubbles: true }))
    })

    const priceMinInput = document.querySelector('input[name="priceMin"]')
    const priceMaxInput = document.querySelector('input[name="priceMax"]')
    if (priceMinInput && priceMaxInput) {
      const minReset = Number.isFinite(Number.parseFloat(priceMinInput.min)) ? priceMinInput.min : '0'
      const maxAttr = Number.parseFloat(priceMaxInput.max)
      const maxReset = Number.isFinite(maxAttr) ? String(maxAttr) : ''
      priceMinInput.value = minReset
      priceMaxInput.value = maxReset
      priceMinInput.dispatchEvent(new Event('change', { bubbles: true }))
      priceMaxInput.dispatchEvent(new Event('change', { bubbles: true }))
    }

    setTimeout(() => {
      const applyButton = document.querySelector(CLASS_NAMES.applyButton)
      if (applyButton) applyButton.click()
      setHasSelectedFilters(false)
      closeFilter()
    }, 250)
  }, [closeFilter])

  const addClearFiltersButton = useCallback(() => {
    const wrapper = document.querySelector(CLASS_NAMES.filtersWrapper)
    if (!wrapper) return

    const existing = document.getElementById(IDS.clearButton)

    if (existing && !checkSelectedFilters()) {
      existing.remove()
      return
    }

    if (checkSelectedFilters() && !existing) {
      const containers = wrapper.querySelectorAll(CLASS_NAMES.filterContainer)
      const last = containers[containers.length - 1]
      if (!last) return

      const clearBtn = document.createElement('div')
      clearBtn.id = IDS.clearButton
      clearBtn.className = 'vtex-search-result-3-x-filter__container bb b--muted-4'
      clearBtn.innerHTML = `
        <div class="vtex-search-result-3-x-filter pv5" style="cursor:pointer;">
          <div class="vtex-search-result-3-x-filterTitle f5 flex items-center justify-between" style="border-bottom:unset;margin-bottom:0;padding-bottom:0">
            <span class="vtex-search-result-3-x-filterTitleSpan" style="color:#2D2926;border-bottom:1px solid #2D2926;padding-bottom:0">Remover filtros</span>
          </div>
        </div>`
      last.parentNode && last.parentNode.insertBefore(clearBtn, last.nextSibling)
      clearBtn.addEventListener('click', () => {
        clearAllFilters()
        closeFilter()
      })
    }
  }, [checkSelectedFilters, clearAllFilters, closeFilter])

  const addFilterHeader = useCallback(() => {
    const wrapper = document.querySelector(CLASS_NAMES.filtersWrapper)
    if (wrapper && !document.getElementById(IDS.filterHeader)) {
      const header = document.createElement('div')
      header.id = IDS.filterHeader
      header.className = 'vtex-search-result-3-x-filter__container bb b--muted-4 flex justify-between items-center'
      header.innerHTML = `
        <h5 class="vtex-search-result-3-x-filterMessage t-heading-5 mv5">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9.16667 17.5V12.5H10.8333V14.1667H17.5V15.8333H10.8333V17.5H9.16667ZM2.5 15.8333V14.1667H7.5V15.8333H2.5ZM5.83333 12.5V10.8333H2.5V9.16667H5.83333V7.5H7.5V12.5H5.83333ZM9.16667 10.8333V9.16667H17.5V10.8333H9.16667ZM12.5 7.5V2.5H14.1667V4.16667H17.5V5.83333H14.1667V7.5H12.5ZM2.5 5.83333V4.16667H10.8333V5.83333H2.5Z" fill="#2D2926" />
          </svg> Filtrar
        </h5>
        <button id="${IDS.closeButton}" style="background:none;border:none;border-bottom:1px solid #2D2926;cursor:pointer;padding:0;font-weight:700;font-size:14px">
          Fechar
        </button>`
      wrapper.insertBefore(header, wrapper.firstChild)
      const btn = document.getElementById(IDS.closeButton)
      if (btn) btn.addEventListener('click', closeFilter)
    }
  }, [closeFilter])

  // ---------- 6) Abertura dos filtros ----------
  const handleFilterClick = useCallback(() => {
    const stickyHeader = document.querySelector(CLASS_NAMES.stickyHeader)
    if (stickyHeader) stickyHeader.style.zIndex = '0'

    const overlay = createOverlay()
    const filterContent = document.querySelector(CLASS_NAMES.filterContent)
    if (!filterContent || !overlay) return

    filterContent.style.cssText = 'left:60px;z-index:1001 !important;position:fixed;'
    filterContent.classList.add('active')
    overlay.style.display = 'block'

    setTimeout(() => {
      addFilterHeader()
      captureInitialRangeValues()
      addClearFiltersButton()
    }, 250)
  }, [addFilterHeader, captureInitialRangeValues, addClearFiltersButton])

  // ---------- 7) Efeito principal / listeners estáveis ----------
  const inputHandlerRef = useRef(null)
  const clickHandlerRef = useRef(null)

  useEffect(() => {
    const overlay = createOverlay()
    overlay.addEventListener('click', closeFilter)

    const mo = new MutationObserver(() => {
      if (document.querySelector(CLASS_NAMES.filtersWrapper)) {
        addFilterHeader()
        captureInitialRangeValues()
        checkSelectedFilters()
        addClearFiltersButton()
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })

    const onChange = e => {
      if (e.target && e.target.closest(CLASS_NAMES.filterItem)) {
        setTimeout(() => {
          checkSelectedFilters()
          addClearFiltersButton()
        }, 100)
        if (e.target.checked) closeFilter()
      }
    }

    inputHandlerRef.current = e => {
      const t = e.target
      if (
        t &&
        (t.matches('input[type="range"]') || t.matches('input[name="priceMin"]') || t.matches('input[name="priceMax"]'))
      ) {
        setTimeout(() => {
          checkSelectedFilters()
          addClearFiltersButton()
        }, 100)
      }
    }

    clickHandlerRef.current = e => {
      const t = e.target
      if (t && t.closest(CLASS_NAMES.removeFilterButton)) {
        setTimeout(() => {
          checkSelectedFilters()
          addClearFiltersButton()
        }, 300)
      }
    }

    document.addEventListener('change', onChange)
    document.addEventListener('input', inputHandlerRef.current)
    document.addEventListener('click', clickHandlerRef.current)

    checkSelectedFilters()

    return () => {
      overlay.removeEventListener('click', closeFilter)
      document.removeEventListener('change', onChange)
      if (inputHandlerRef.current) document.removeEventListener('input', inputHandlerRef.current)
      if (clickHandlerRef.current) document.removeEventListener('click', clickHandlerRef.current)
      mo.disconnect()
      const closeBtn = document.getElementById(IDS.closeButton)
      if (closeBtn) closeBtn.removeEventListener('click', closeFilter)
      const clearBtn = document.getElementById(IDS.clearButton)
      if (clearBtn) clearBtn.removeEventListener('click', clearAllFilters)
    }
  }, [closeFilter, addFilterHeader, addClearFiltersButton, checkSelectedFilters, clearAllFilters, captureInitialRangeValues])

  // ---------- 8) Botão ----------
  return (
    <button
      onClick={handleFilterClick}
      style={{
        border: `1px solid ${hasSelectedFilters ? '#FE5000' : '#ccc'}`,
        padding: '5.2px 16px',
        backgroundColor: '#fff',
        fontWeight: 400,
        cursor: 'pointer',
        zIndex: 10,
        borderRadius: '40px',
        fontSize: '14px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'border-color 0.3s ease',
      }}
      aria-label="Abrir filtros"
      onMouseEnter={e => !hasSelectedFilters && (e.currentTarget.style.borderColor = '#2D2926')}
      onMouseLeave={e => !hasSelectedFilters && (e.currentTarget.style.borderColor = '#ccc')}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
        <path d="M9.16667 17.5V12.5H10.8333V14.1667H17.5V15.8333H10.8333V17.5H9.16667ZM2.5 15.8333V14.1667H7.5V15.8333H2.5ZM5.83333 12.5V10.8333H2.5V9.16667H5.83333V7.5H7.5V12.5H5.83333ZM9.16667 10.8333V9.16667H17.5V10.8333H9.16667ZM12.5 7.5V2.5H14.1667V4.16667H17.5V5.83333H14.1667V7.5H12.5ZM2.5 5.83333V4.16667H10.8333V5.83333H2.5Z" fill="#2D2926" />
      </svg>
      Filtrar
    </button>
  )
}

export default FilterToggleController