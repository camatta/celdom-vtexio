import { useEffect, useCallback, useState, useRef } from 'react';

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
  };

  const IDS = {
    overlay: 'bg-transparent-filter',
    filterHeader: 'filter-custom-header',
    closeButton: 'close-filter-btn',
    clearButton: 'clear-filters-btn',
    clearContainer: 'clear-filters-container',
  };

  const [hasSelectedFilters, setHasSelectedFilters] = useState(false);
  const prevHasSelectedRef = useRef(false);
  const initialRangeValues = useRef({ min: 0, max: 0 });
  const clearingLock = useRef(false);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Normaliza labels de filtros sem loop
  useEffect(() => {
    let scheduled = false;
    const format = () => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        document
          .querySelectorAll(`
            .vtex-search-result-3-x-filterItem .vtex-checkbox__label,
            .vtex-search-result-3-x-selectedFilterItem
          `)
          .forEach((n) => {
            if (n.dataset.nrzFormatted === '1') return;
            const t = n.textContent || '';
            if (t === t.toUpperCase()) {
              n.textContent = t.toLowerCase();
              n.style.textTransform = 'capitalize';
            }
            n.dataset.nrzFormatted = '1';
          });
      }, 80);
    };

    const obs = new MutationObserver(format);
    obs.observe(document.body, { childList: true, subtree: true });
    format();
    return () => obs.disconnect();
  }, []);

  const captureInitialRangeValues = useCallback(() => {
    const box = document.querySelector(CLASS_NAMES.priceRangeContainer);
    if (!box) return;
    const l = box.querySelector('.vtex-slider__left-value')?.textContent?.replace(/[^\d,]/g, '')?.replace(',', '.');
    const r = box.querySelector('.vtex-slider__right-value')?.textContent?.replace(/[^\d,]/g, '')?.replace(',', '.');
    if (l && r) initialRangeValues.current = { min: parseFloat(l), max: parseFloat(r) };
  }, []);

  const computeHasSelectedFilters = useCallback(() => {
    const selectedCheckboxes = document.querySelectorAll(`${CLASS_NAMES.selectedCheckbox}:checked`);
    const selectedChips = document.querySelectorAll('.vtex-search-result-3-x-selectedFilterItem');

    const container = document.querySelector(CLASS_NAMES.selectedFilters);
    const hasInContainer = !!container && container.querySelectorAll('.vtex-search-result-3-x-selectedFilterItem').length > 0;

    // inputs livres
    const priceMinInput = document.querySelector('input[name="priceMin"]');
    const priceMaxInput = document.querySelector('input[name="priceMax"]');
    let hasActiveInputs = false;
    if (priceMinInput && priceMaxInput) {
      const min = parseFloat(priceMinInput.value || '0');
      const max = parseFloat(priceMaxInput.value || '0');
      const minPossible = parseFloat(priceMinInput.min || '0');
      const maxPossible = parseFloat(priceMaxInput.max || String(max));
      hasActiveInputs = min !== minPossible || max !== maxPossible;
    }

    // slider VTEX
    const pr = document.querySelector(CLASS_NAMES.priceRangeContainer);
    let hasActiveSlider = false;
    if (pr) {
      const l = pr.querySelector('.vtex-slider__left-value')?.textContent?.replace(/[^\d,]/g, '')?.replace(',', '.');
      const r = pr.querySelector('.vtex-slider__right-value')?.textContent?.replace(/[^\d,]/g, '')?.replace(',', '.');
      if (l && r) {
        hasActiveSlider =
          parseFloat(l) !== initialRangeValues.current.min || parseFloat(r) !== initialRangeValues.current.max;
      }
    }

    return selectedCheckboxes.length > 0 || selectedChips.length > 0 || hasInContainer || hasActiveInputs || hasActiveSlider;
  }, []);

  const setHasSelectedIfChanged = useCallback(() => {
    const has = computeHasSelectedFilters();
    if (prevHasSelectedRef.current !== has) {
      prevHasSelectedRef.current = has;
      setHasSelectedFilters(has);
    }
    return has;
  }, [computeHasSelectedFilters]);

  const closeFilter = useCallback(() => {
    const filterContent = document.querySelector(CLASS_NAMES.filterContent);
    if (filterContent) {
      filterContent.classList.remove('active');
      filterContent.style.cssText = '';
    }
    const sticky = document.querySelector(CLASS_NAMES.stickyHeader);
    if (sticky) sticky.style.zIndex = '999';
    const overlay = document.getElementById(IDS.overlay);
    if (overlay) overlay.style.display = 'none';
  }, []);

  // Fallback final: navega para mesma rota com only map (+ mantém sort O se tiver)
  const hardResetByNavigation = useCallback(() => {
    const url = new URL(window.location.href);
    const pathname = url.pathname || '/';
    const map = url.searchParams.get('map');
    const order = url.searchParams.get('O') || url.searchParams.get('order');
    const next = new URL(pathname, window.location.origin);
    if (map) next.searchParams.set('map', map);
    if (order) next.searchParams.set('O', order);

    const to = next.pathname + (next.search ? next.search : '');
    const nav = window.__RUNTIME__ && window.__RUNTIME__.navigate;
    if (typeof nav === 'function') {
      window.__RUNTIME__.navigate({ to, replace: true, fetchRouteData: true });
    } else {
      window.location.assign(to);
    }
  }, []);

  const clearAllFilters = useCallback(async () => {
    if (clearingLock.current) return;
    clearingLock.current = true;

    try {
      // 1) Controles nativos (varia por tema)
      const nativeSelectors = [
        '.vtex-search-result-3-x-clearAllFilters',
        '.vtex-search-result-3-x-totalProductsMessage--clearFilters',
        '.vtex-search-result-3-x-controlClearLink',
        '.vtex-search-result-3-x-filter__container--selectedFilters .vtex-search-result-3-x-clearLink',
        '[data-testid="clearAllFilters"]',
        '[class*="clearAllFilters"] button',
      ];
      let clickedNative = false;
      nativeSelectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          try {
            el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            clickedNative = true;
          } catch {}
        });
      });
      if (clickedNative) await sleep(240);

      // 2) Remoção agressiva: chips, checkboxes, e preço
      const maxPasses = 8;
      for (let i = 0; i < maxPasses; i++) {
        let acted = false;

        // chips
        document
          .querySelectorAll(
            '.vtex-search-result-3-x-filterItem__remove,' +
              '.vtex-search-result-3-x-selectedFilterItem .vtex-tag__close,' +
              '.vtex-search-result-3-x-selectedFilterItem .vtex-tag__close-icon'
          )
          .forEach((btn) => {
            try {
              btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
              acted = true;
            } catch {}
          });

        // checkboxes
        document
          .querySelectorAll(
            '.vtex-search-result-3-x-filterItem input[type="checkbox"]:checked, .vtex-checkbox__input:checked'
          )
          .forEach((inp) => {
            try {
              const label = inp.closest('label');
              (label || inp).dispatchEvent(new MouseEvent('click', { bubbles: true }));
              acted = true;
            } catch {}
          });

        // preço
        const box = document.querySelector(CLASS_NAMES.priceRangeContainer);
        if (box) {
          const innerClear = Array.from(box.querySelectorAll('button,a,[role="button"]')).find((el) =>
            /limpar|clear|reset/i.test(el.textContent || '')
          );
          if (innerClear) {
            try {
              innerClear.dispatchEvent(new MouseEvent('click', { bubbles: true }));
              acted = true;
            } catch {}
          } else {
            const minI = document.querySelector('input[name="priceMin"]');
            const maxI = document.querySelector('input[name="priceMax"]');
            if (minI && maxI) {
              const minPossible = minI.min || '0';
              const maxPossible = maxI.max || maxI.value || '0';
              if (minI.value !== minPossible || maxI.value !== maxPossible) {
                minI.value = minPossible;
                maxI.value = maxPossible;
                minI.dispatchEvent(new Event('input', { bubbles: true }));
                minI.dispatchEvent(new Event('change', { bubbles: true }));
                maxI.dispatchEvent(new Event('input', { bubbles: true }));
                maxI.dispatchEvent(new Event('change', { bubbles: true }));
                acted = true;
              }
            }
          }
        }

        if (!acted) break;
        await sleep(220);
      }

      // 3) Aplica se existir botão Apply
      const applyButton = document.querySelector(CLASS_NAMES.applyButton);
      if (applyButton) {
        try {
          applyButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          await sleep(260);
        } catch {}
      }

      // 4) Confirma se limpou. Se não, faz fallback navegando.
      const stillHas = setHasSelectedIfChanged();
      if (stillHas) {
        hardResetByNavigation();
      } else {
        // garante esconder botão e fechar painel
        setHasSelectedFilters(false);
        const has = computeHasSelectedFilters();
        const wrapper = document.querySelector(CLASS_NAMES.filtersWrapper);
        const host = document.getElementById(IDS.clearContainer);
        if (wrapper && host) host.style.display = has ? '' : 'none';
        closeFilter();
      }
    } finally {
      setTimeout(() => (clearingLock.current = false), 300);
    }
  }, [
    CLASS_NAMES.applyButton,
    CLASS_NAMES.filtersWrapper,
    CLASS_NAMES.priceRangeContainer,
    computeHasSelectedFilters,
    hardResetByNavigation,
    setHasSelectedIfChanged,
    closeFilter,
  ]);

  const ensureClearButton = useCallback(
    (visible) => {
      const wrapper = document.querySelector(CLASS_NAMES.filtersWrapper);
      if (!wrapper) return;

      let host = document.getElementById(IDS.clearContainer);
      if (!host) {
        host = document.createElement('div');
        host.id = IDS.clearContainer;
        host.className = 'vtex-search-result-3-x-filter__container bb b--muted-4';
        host.innerHTML = `
          <div class="vtex-search-result-3-x-filter pv5" style="margin:0">
            <div class="vtex-search-result-3-x-filterTitle f5 flex items-center justify-between" style="border-bottom:unset;margin-bottom:0;padding-bottom:0">
              <button id="${IDS.clearButton}" type="button"
                class="vtex-button bw0 bg-transparent pointer"
                style="color:#2D2926;border-bottom:1px solid #2D2926;padding:0;font-weight:700;font-size:14px">
                Remover filtros
              </button>
            </div>
          </div>
        `;
        wrapper.appendChild(host);

        const btn = host.querySelector('#' + IDS.clearButton);
        btn?.addEventListener('click', async (e) => {
          e.preventDefault();
          await clearAllFilters();
        });
      }
      host.style.display = visible ? '' : 'none';
    },
    [clearAllFilters, CLASS_NAMES.filtersWrapper, IDS.clearButton, IDS.clearContainer]
  );

  const addFilterHeader = useCallback(() => {
    const wrapper = document.querySelector(CLASS_NAMES.filtersWrapper);
    if (!wrapper || document.getElementById(IDS.filterHeader)) return;

    const header = document.createElement('div');
    header.id = IDS.filterHeader;
    header.className = 'vtex-search-result-3-x-filter__container bb b--muted-4 flex justify-between items-center';
    header.innerHTML = `
      <h5 class="vtex-search-result-3-x-filterMessage t-heading-5 mv5">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M9.16667 17.5V12.5H10.8333V14.1667H17.5V15.8333H10.8333V17.5H9.16667ZM2.5 15.8333V14.1667H7.5V15.8333H2.5ZM5.83333 12.5V10.8333H2.5V9.16667H5.83333V7.5H7.5V12.5H5.83333ZM9.16667 10.8333V9.16667H17.5V10.8333H9.16667ZM12.5 7.5V2.5H14.1667V4.16667H17.5V5.83333H14.1667V7.5H12.5ZM2.5 5.83333V4.16667H10.8333V5.83333H2.5Z" fill="#2D2926" />
        </svg> Filtrar
      </h5>
      <button id="${IDS.closeButton}" style="background:none;border:none;border-bottom:1px solid #2D2926;cursor:pointer;padding:0;font-weight:700;font-size:14px">
        Fechar
      </button>
    `;
    wrapper.insertBefore(header, wrapper.firstChild);

    const closeBtn = document.getElementById(IDS.closeButton);
    if (closeBtn) closeBtn.addEventListener('click', closeFilter);
  }, [CLASS_NAMES.filtersWrapper, closeFilter, IDS.closeButton, IDS.filterHeader]);

  const createOverlay = useCallback(() => {
    let overlay = document.getElementById(IDS.overlay);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = IDS.overlay;
      overlay.style.cssText = `
        display:none;position:fixed;background:rgba(0,0,0,.5);
        top:0;left:0;width:100vw;height:100vh;z-index:999;margin:0;padding:0;
      `;
      document.body.appendChild(overlay);
    }
    return overlay;
  }, [IDS.overlay]);

  const handleFilterClick = useCallback(() => {
    const sticky = document.querySelector(CLASS_NAMES.stickyHeader);
    if (sticky) sticky.style.zIndex = '0';

    const overlay = document.getElementById(IDS.overlay) || createOverlay();
    const content = document.querySelector(CLASS_NAMES.filterContent);
    if (content && overlay) {
      content.style.cssText = `left:60px;z-index:1001 !important;position:fixed;`;
      content.classList.add('active');
      overlay.style.display = 'block';

      setTimeout(() => {
        addFilterHeader();
        captureInitialRangeValues();
        const has = setHasSelectedIfChanged();
        ensureClearButton(has);
      }, 280);
    }
  }, [
    CLASS_NAMES.filterContent,
    CLASS_NAMES.stickyHeader,
    IDS.overlay,
    addFilterHeader,
    captureInitialRangeValues,
    createOverlay,
    ensureClearButton,
    setHasSelectedIfChanged,
  ]);

  // Lifecycle
  useEffect(() => {
    const overlay = createOverlay();
    const onOverlayClick = () => closeFilter();
    overlay.addEventListener('click', onOverlayClick);

    // Observer com throttle
    let scheduled = false;
    const pump = () => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        if (!document.querySelector(CLASS_NAMES.filtersWrapper)) return;
        addFilterHeader();
        captureInitialRangeValues();
        const has = setHasSelectedIfChanged();
        ensureClearButton(has);
      }, 120);
    };
    const obs = new MutationObserver(pump);
    obs.observe(document.body, { childList: true, subtree: true });

    const onChange = (e) => {
      if (e.target.closest(CLASS_NAMES.filterItem)) {
        setTimeout(() => {
          const has = setHasSelectedIfChanged();
          ensureClearButton(has);
        }, 100);
        if (e.target.type === 'checkbox' && e.target.checked) closeFilter();
      }
    };
    const onInput = (e) => {
      const t = e.target;
      if (
        t.matches('input[type="range"], input[name="priceMin"], input[name="priceMax"]') ||
        t.closest(CLASS_NAMES.priceRangeContainer)
      ) {
        setTimeout(() => {
          const has = setHasSelectedIfChanged();
          ensureClearButton(has);
        }, 100);
      }
    };
    const onClickRemoveChip = (e) => {
      if (e.target.closest(CLASS_NAMES.removeFilterButton)) {
        setTimeout(() => {
          const has = setHasSelectedIfChanged();
          ensureClearButton(has);
        }, 220);
      }
    };

    document.addEventListener('change', onChange);
    document.addEventListener('input', onInput);
    document.addEventListener('click', onClickRemoveChip);

    // Estado inicial
    const initialHas = setHasSelectedIfChanged();
    ensureClearButton(initialHas);

    return () => {
      overlay.removeEventListener('click', onOverlayClick);
      obs.disconnect();
      document.removeEventListener('change', onChange);
      document.removeEventListener('input', onInput);
      document.removeEventListener('click', onClickRemoveChip);
      const closeBtn = document.getElementById(IDS.closeButton);
      if (closeBtn) closeBtn.removeEventListener('click', closeFilter);
    };
  }, [
    addFilterHeader,
    captureInitialRangeValues,
    CLASS_NAMES.filterItem,
    CLASS_NAMES.filtersWrapper,
    CLASS_NAMES.priceRangeContainer,
    CLASS_NAMES.removeFilterButton,
    closeFilter,
    createOverlay,
    ensureClearButton,
    setHasSelectedIfChanged,
  ]);

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
      onMouseEnter={(e) => {
        if (!hasSelectedFilters) e.currentTarget.style.borderColor = '#2D2926';
      }}
      onMouseLeave={(e) => {
        if (!hasSelectedFilters) e.currentTarget.style.borderColor = '#ccc';
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
        <path d="M9.16667 17.5V12.5H10.8333V14.1667H17.5V15.8333H10.8333V17.5H9.16667ZM2.5 15.8333V14.1667H7.5V15.8333H2.5ZM5.83333 12.5V10.8333H2.5V9.16667H5.83333V7.5H7.5V12.5H5.83333ZM9.16667 10.8333V9.16667H17.5V10.8333H9.16667ZM12.5 7.5V2.5H14.1667V4.16667H17.5V5.83333H14.1667V7.5H12.5ZM2.5 5.83333V4.16667H10.8333V5.83333H2.5Z" fill="#2D2926" />
      </svg>
      Filtrar
    </button>
  );
};

export default FilterToggleController;