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
  };

  const [hasSelectedFilters, setHasSelectedFilters] = useState(false);
  const initialRangeValues = useRef({ min: 0, max: 0 });
  const clearingLock = useRef(false);

  /** ---------- Utilitários ---------- */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const getCanonical = () => {
    const link = document.querySelector('link[rel="canonical"]');
    return link?.href || null;
  };

  const getCleanURL = () => {
    // Remove parâmetros facetas comuns se canonical não existir
    const url = new URL(window.location.href);
    const paramsToDrop = [
      'map',
      'fq',
      'ft',
      'query',
      'priceRange',
      'page',
      'order',
      'O',
      'specificationFilter_',
      'brand',
      'category-1',
      'category-2',
      'category-3',
    ];

    // remove conhecidos e qualquer specificationFilter_* dinâmico
    [...url.searchParams.keys()].forEach((k) => {
      if (paramsToDrop.includes(k) || k.startsWith('specificationFilter_')) {
        url.searchParams.delete(k);
      }
    });

    // Mantém apenas pathname + params restantes (ex: sort, se quiser)
    url.hash = '';
    return url.toString();
  };

  const navigateBase = () => {
    const canonical = getCanonical();
    const to = canonical || getCleanURL();
    if (window.__RUNTIME__ && typeof window.__RUNTIME__.navigate === 'function') {
      window.__RUNTIME__.navigate({ to, replace: true });
    } else {
      window.location.assign(to);
    }
  };

  /** ---------- Formatação de labels (segura) ---------- */
  useEffect(() => {
    let scheduled = false;
    const formatFilterText = () => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        const nodes = document.querySelectorAll(`
          .vtex-search-result-3-x-filterItem .vtex-checkbox__label,
          .vtex-search-result-3-x-selectedFilterItem
        `);
        nodes.forEach((n) => {
          if (n.dataset.nrzFormatted === '1') return;
          const t = n.textContent || '';
          if (t === t.toUpperCase()) {
            n.textContent = t.toLowerCase();
            n.style.textTransform = 'capitalize';
          }
          n.dataset.nrzFormatted = '1';
        });
      }, 60);
    };

    const obs = new MutationObserver(formatFilterText);
    obs.observe(document.body, { childList: true, subtree: true });
    formatFilterText();
    return () => obs.disconnect();
  }, []);

  /** ---------- Captura range inicial ---------- */
  const captureInitialRangeValues = useCallback(() => {
    const box = document.querySelector(CLASS_NAMES.priceRangeContainer);
    if (!box) return;
    const l = box.querySelector('.vtex-slider__left-value')?.textContent?.replace(/[^\d,]/g, '')?.replace(',', '.');
    const r = box.querySelector('.vtex-slider__right-value')?.textContent?.replace(/[^\d,]/g, '')?.replace(',', '.');
    if (l && r) initialRangeValues.current = { min: parseFloat(l), max: parseFloat(r) };
  }, []);

  /** ---------- Há filtros ativos? ---------- */
  const checkSelectedFilters = useCallback(() => {
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

    const has = selectedCheckboxes.length > 0 || selectedChips.length > 0 || hasInContainer || hasActiveInputs || hasActiveSlider;
    setHasSelectedFilters(has);
    return has;
  }, []);

  /** ---------- Fechar painel ---------- */
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

  /** ---------- Limpar tudo (definitivo) ---------- */
  const clearAllFilters = useCallback(async () => {
    if (clearingLock.current) return;
    clearingLock.current = true;

    try {
      // 1) Tenta clears nativos (diversos temas)
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
          el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          clickedNative = true;
        });
      });

      if (clickedNative) {
        await sleep(200);
      }

      // 2) Fallback agressivo: remover chips e desmarcar checkboxes em várias passadas
      const maxPasses = 12;
      for (let pass = 0; pass < maxPasses; pass++) {
        let acted = false;

        // 2a) remover chips selecionados
        const chipRemovers = document.querySelectorAll(
          '.vtex-search-result-3-x-filterItem__remove,' +
            '.vtex-search-result-3-x-selectedFilterItem .vtex-tag__close,' +
            '.vtex-search-result-3-x-selectedFilterItem .vtex-tag__close-icon'
        );
        chipRemovers.forEach((b) => {
          b.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          acted = true;
        });

        // 2b) desmarcar checkboxes via label para acionar React
        const checkedInputs = document.querySelectorAll(
          '.vtex-search-result-3-x-filterItem input[type="checkbox"]:checked, .vtex-checkbox__input:checked'
        );
        checkedInputs.forEach((inp) => {
          const label = inp.closest('label');
          (label || inp).dispatchEvent(new MouseEvent('click', { bubbles: true }));
          acted = true;
        });

        // 2c) limpar faixa de preço (slider e inputs)
        const pr = document.querySelector(CLASS_NAMES.priceRangeContainer);
        if (pr) {
          const innerClear = Array.from(pr.querySelectorAll('button,a,[role="button"]')).find((el) =>
            /limpar|clear|reset/i.test(el.textContent || '')
          );
          if (innerClear) {
            innerClear.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            acted = true;
          } else {
            const priceMinInput = document.querySelector('input[name="priceMin"]');
            const priceMaxInput = document.querySelector('input[name="priceMax"]');
            if (priceMinInput && priceMaxInput) {
              const minPossible = priceMinInput.min || '0';
              const maxPossible = priceMaxInput.max || priceMaxInput.value || '0';
              if (priceMinInput.value !== minPossible || priceMaxInput.value !== maxPossible) {
                priceMinInput.value = minPossible;
                priceMaxInput.value = maxPossible;
                priceMinInput.dispatchEvent(new Event('input', { bubbles: true }));
                priceMinInput.dispatchEvent(new Event('change', { bubbles: true }));
                priceMaxInput.dispatchEvent(new Event('input', { bubbles: true }));
                priceMaxInput.dispatchEvent(new Event('change', { bubbles: true }));
                acted = true;
              }
            }
          }
        }

        if (!acted) break;
        await sleep(250);
      }

      // 3) Se ainda houver filtros, último recurso: navegar para base
      const stillHas = checkSelectedFilters();
      if (stillHas) {
        navigateBase();
        return;
      }

      // 4) Se existir botão aplicar, clica; se não, navega base para garantir
      const applyButton = document.querySelector(CLASS_NAMES.applyButton);
      if (applyButton) {
        applyButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      } else {
        navigateBase();
      }

      setHasSelectedFilters(false);
      closeFilter();
    } finally {
      // solta o lock com pequena folga
      setTimeout(() => (clearingLock.current = false), 300);
    }
  }, [checkSelectedFilters, closeFilter]);

  /** ---------- Botão “Remover filtros” ---------- */
  const addClearFiltersButton = useCallback(() => {
    const wrapper = document.querySelector(CLASS_NAMES.filtersWrapper);
    if (!wrapper) return;

    const anySelected = checkSelectedFilters();
    const exists = document.getElementById(IDS.clearButton);

    if (!anySelected && exists) {
      exists.closest('.vtex-search-result-3-x-filter__container')?.remove();
      return;
    }
    if (anySelected && exists) return;

    const containers = wrapper.querySelectorAll(CLASS_NAMES.filterContainer);
    const last = containers[containers.length - 1];
    if (!last) return;

    const block = document.createElement('div');
    block.className = 'vtex-search-result-3-x-filter__container bb b--muted-4';
    block.innerHTML = `
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
    last.parentNode.insertBefore(block, last.nextSibling);
  }, [checkSelectedFilters]);

  /** ---------- Header e Overlay ---------- */
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
  }, [closeFilter]);

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
  }, []);

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
        addClearFiltersButton();
      }, 300);
    }
  }, [addFilterHeader, addClearFiltersButton, captureInitialRangeValues, createOverlay]);

  /** ---------- Lifecycle / Delegations ---------- */
  useEffect(() => {
    const overlay = createOverlay();
    const onOverlayClick = () => closeFilter();
    overlay.addEventListener('click', onOverlayClick);

    // Observer com throttling
    let scheduled = false;
    const tick = () => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        if (document.querySelector(CLASS_NAMES.filtersWrapper)) {
          addFilterHeader();
          captureInitialRangeValues();
          checkSelectedFilters();
          addClearFiltersButton();
        }
      }, 100);
    };
    const obs = new MutationObserver(tick);
    obs.observe(document.body, { childList: true, subtree: true });

    // Delegations
    const onChange = (e) => {
      if (e.target.closest(CLASS_NAMES.filterItem)) {
        setTimeout(() => {
          checkSelectedFilters();
          addClearFiltersButton();
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
          checkSelectedFilters();
          addClearFiltersButton();
        }, 100);
      }
    };
    const onClickRemoveChip = (e) => {
      if (e.target.closest(CLASS_NAMES.removeFilterButton)) {
        setTimeout(() => {
          checkSelectedFilters();
          addClearFiltersButton();
        }, 250);
      }
    };
    const onDelegatedClear = (e) => {
      const btn = e.target.closest('#' + IDS.clearButton);
      if (!btn) return;
      e.preventDefault();
      clearAllFilters();
    };

    document.addEventListener('change', onChange);
    document.addEventListener('input', onInput);
    document.addEventListener('click', onClickRemoveChip);
    document.addEventListener('click', onDelegatedClear);

    checkSelectedFilters();

    return () => {
      overlay.removeEventListener('click', onOverlayClick);
      obs.disconnect();
      document.removeEventListener('change', onChange);
      document.removeEventListener('input', onInput);
      document.removeEventListener('click', onClickRemoveChip);
      document.removeEventListener('click', onDelegatedClear);
      const closeBtn = document.getElementById(IDS.closeButton);
      if (closeBtn) closeBtn.removeEventListener('click', closeFilter);
    };
  }, [
    addClearFiltersButton,
    addFilterHeader,
    captureInitialRangeValues,
    checkSelectedFilters,
    clearAllFilters,
    closeFilter,
    createOverlay,
  ]);

  /** ---------- Botão principal ---------- */
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