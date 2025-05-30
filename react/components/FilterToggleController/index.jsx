import { useEffect, useCallback, useState } from 'react';

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
    removeFilterButton: '.vtex-search-result-3-x-filterItem__remove'
  };

  const IDS = {
    overlay: 'bg-transparent-filter',
    filterHeader: 'filter-custom-header',
    closeButton: 'close-filter-btn',
    clearButton: 'clear-filters-btn'
  };

  const [hasSelectedFilters, setHasSelectedFilters] = useState(false);

  const checkSelectedFilters = useCallback(() => {
    // Verifica checkboxes marcados
    const selectedCheckboxes = document.querySelectorAll(`${CLASS_NAMES.selectedCheckbox}:checked`);
    
    // Verifica itens na área de filtros selecionados
    const selectedFilterItems = document.querySelectorAll('.vtex-search-result-3-x-selectedFilterItem');
    
    // Verifica se há algum filtro ativo no container de filtros selecionados
    const selectedFiltersContainer = document.querySelector(CLASS_NAMES.selectedFilters);
    const hasSelectedFiltersInContainer = selectedFiltersContainer && 
      selectedFiltersContainer.querySelectorAll('.vtex-search-result-3-x-selectedFilterItem').length > 0;

    const hasFilters = selectedCheckboxes.length > 0 || 
                     selectedFilterItems.length > 0 || 
                     hasSelectedFiltersInContainer;
    
    setHasSelectedFilters(hasFilters);
    return hasFilters;
  }, []);

  const closeFilter = useCallback(() => {
    const filterContent = document.querySelector(CLASS_NAMES.filterContent);
    if (filterContent) {
      filterContent.classList.remove('active');
      filterContent.style.cssText = '';
    }

    const stickyHeader = document.querySelector(CLASS_NAMES.stickyHeader);
    if (stickyHeader) {
      stickyHeader.style.zIndex = '999';
    }

    const overlay = document.getElementById(IDS.overlay);
    if (overlay) {
      overlay.style.display = 'none';
    }
  }, []);

  const clearAllFilters = useCallback(() => {
    // Primeiro tenta usar o botão nativo de limpar filtros, se existir
    const nativeClearButton = document.querySelector(CLASS_NAMES.clearAllButton);
    if (nativeClearButton) {
      nativeClearButton.click();
      setTimeout(() => {
        setHasSelectedFilters(false);
        closeFilter();
      }, 500);
      return;
    }

    // Tenta encontrar e clicar nos botões de remoção individual de filtros
    const removeButtons = document.querySelectorAll(CLASS_NAMES.removeFilterButton);
    if (removeButtons.length > 0) {
      removeButtons.forEach(button => button.click());
    }

    // Desmarca todos os checkboxes selecionados
    const selectedCheckboxes = document.querySelectorAll(`${CLASS_NAMES.selectedCheckbox}:checked`);
    if (selectedCheckboxes.length > 0) {
      selectedCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
        // Dispara eventos para garantir que o sistema reaja
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        checkbox.dispatchEvent(new Event('click', { bubbles: true }));
        checkbox.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }

    // Clica no botão aplicar se existir
    setTimeout(() => {
      const applyButton = document.querySelector(CLASS_NAMES.applyButton);
      if (applyButton) {
        applyButton.click();
      }
      
      setHasSelectedFilters(false);
      closeFilter();
      
      // Força atualização da URL como fallback
      if (window.location.search.includes('map=')) {
        window.location.href = window.location.pathname;
      }
    }, 300);
  }, [closeFilter]);

  const addClearFiltersButton = useCallback(() => {
    const filtersWrapper = document.querySelector(CLASS_NAMES.filtersWrapper);
    if (filtersWrapper) {
      const existingClearBtn = document.getElementById(IDS.clearButton);
      
      // Remove o botão se não houver filtros selecionados
      if (existingClearBtn && !checkSelectedFilters()) {
        existingClearBtn.remove();
        return;
      }

      // Adiciona o botão se houver filtros selecionados
      if (checkSelectedFilters() && !existingClearBtn) {
        const filterContainers = filtersWrapper.querySelectorAll(CLASS_NAMES.filterContainer);
        const lastFilterContainer = filterContainers[filterContainers.length - 1];

        if (lastFilterContainer) {
          const clearBtn = document.createElement('div');
          clearBtn.id = IDS.clearButton;
          clearBtn.className = 'vtex-search-result-3-x-filter__container bb b--muted-4';
          clearBtn.innerHTML = `
            <div class="vtex-search-result-3-x-filter pv5" style="cursor: pointer;">
              <div class="vtex-search-result-3-x-filterTitle f5 flex items-center justify-between" style="border-bottom:unset;margin-bottom:0;padding-bottom:0">
                <span class="vtex-search-result-3-x-filterTitleSpan" style="color: #2D2926;border-bottom:1px solid #2D2926; padding-bottom:0px">Remover filtros</span>
              </div>
            </div>
          `;

          lastFilterContainer.parentNode.insertBefore(clearBtn, lastFilterContainer.nextSibling);

          clearBtn.addEventListener('click', () => {
            clearAllFilters();
            closeFilter();
          });
        }
      }
    }
  }, [clearAllFilters, closeFilter, checkSelectedFilters]);

  const addFilterHeader = useCallback(() => {
    const filtersWrapper = document.querySelector(CLASS_NAMES.filtersWrapper);
    if (filtersWrapper && !document.getElementById(IDS.filterHeader)) {
      const header = document.createElement('div');
      header.id = IDS.filterHeader;
      header.className = 'vtex-search-result-3-x-filter__container bb b--muted-4 flex justify-between items-center';
      header.innerHTML = `
        <h5 class="vtex-search-result-3-x-filterMessage t-heading-5 mv5">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9.16667 17.5V12.5H10.8333V14.1667H17.5V15.8333H10.8333V17.5H9.16667ZM2.5 15.8333V14.1667H7.5V15.8333H2.5ZM5.83333 12.5V10.8333H2.5V9.16667H5.83333V7.5H7.5V12.5H5.83333ZM9.16667 10.8333V9.16667H17.5V10.8333H9.16667ZM12.5 7.5V2.5H14.1667V4.16667H17.5V5.83333H14.1667V7.5H12.5ZM2.5 5.83333V4.16667H10.8333V5.83333H2.5Z" fill="#2D2926" />
          </svg> Filtrar
        </h5>
        <button id="${IDS.closeButton}" style="background: none;border:none; border-bottom: 1px solid #2D2926; cursor: pointer; padding: 0px;font-weight:700; font-size:14px">
          Fechar
        </button>
      `;
      filtersWrapper.insertBefore(header, filtersWrapper.firstChild);

      document.getElementById(IDS.closeButton).addEventListener('click', closeFilter);
    }
  }, [closeFilter]);

  const createOverlay = () => {
    let overlay = document.getElementById(IDS.overlay);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = IDS.overlay;
      overlay.style.cssText = `
        display: none;
        position: fixed;
        background: rgba(0, 0, 0, 0.5);
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 999;
        margin: 0;
        padding: 0;
      `;
      document.body.appendChild(overlay);
    }
    return overlay;
  };

  const handleFilterChange = useCallback((e) => {
    if (e.target.closest(CLASS_NAMES.filterItem)) {
      setTimeout(() => {
        checkSelectedFilters();
        addClearFiltersButton();
      }, 100);

      if (e.target.checked) {
        closeFilter();
      }
    }
  }, [closeFilter, checkSelectedFilters, addClearFiltersButton]);

  const handleFilterClick = useCallback(() => {
    const stickyHeader = document.querySelector(CLASS_NAMES.stickyHeader);
    if (stickyHeader) {
      stickyHeader.style.zIndex = '0';
    }

    const overlay = document.getElementById(IDS.overlay);
    const filterContent = document.querySelector(CLASS_NAMES.filterContent);

    if (filterContent && overlay) {
      filterContent.style.cssText = `
        left: 0;
        z-index: 1001 !important;
        position: fixed;
      `;
      filterContent.classList.add('active');
      overlay.style.display = 'block';

      setTimeout(() => {
        addFilterHeader();
        addClearFiltersButton();
      }, 300);
    }
  }, [addFilterHeader, addClearFiltersButton]);

  useEffect(() => {
    const overlay = createOverlay();
    overlay.addEventListener('click', closeFilter);

    const observer = new MutationObserver(() => {
      if (document.querySelector(CLASS_NAMES.filtersWrapper)) {
        addFilterHeader();
        checkSelectedFilters();
        addClearFiltersButton();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    document.addEventListener('change', handleFilterChange);
    document.addEventListener('click', (e) => {
      if (e.target.closest(CLASS_NAMES.removeFilterButton)) {
        setTimeout(() => {
          checkSelectedFilters();
          addClearFiltersButton();
        }, 300);
      }
    });

    checkSelectedFilters();

    return () => {
      overlay.removeEventListener('click', closeFilter);
      document.removeEventListener('change', handleFilterChange);
      observer.disconnect();

      const closeBtn = document.getElementById(IDS.closeButton);
      if (closeBtn) closeBtn.removeEventListener('click', closeFilter);

      const clearBtn = document.getElementById(IDS.clearButton);
      if (clearBtn) clearBtn.removeEventListener('click', clearAllFilters);
    };
  }, [closeFilter, addFilterHeader, addClearFiltersButton, handleFilterChange, checkSelectedFilters, clearAllFilters]);

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
        if (!hasSelectedFilters) {
          e.currentTarget.style.borderColor = '#2D2926';
        }
      }}
      onMouseLeave={(e) => {
        if (!hasSelectedFilters) {
          e.currentTarget.style.borderColor = '#ccc';
        }
      }}
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 20 20" 
        fill="none"
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      >
        <path 
          d="M9.16667 17.5V12.5H10.8333V14.1667H17.5V15.8333H10.8333V17.5H9.16667ZM2.5 15.8333V14.1667H7.5V15.8333H2.5ZM5.83333 12.5V10.8333H2.5V9.16667H5.83333V7.5H7.5V12.5H5.83333ZM9.16667 10.8333V9.16667H17.5V10.8333H9.16667ZM12.5 7.5V2.5H14.1667V4.16667H17.5V5.83333H14.1667V7.5H12.5ZM2.5 5.83333V4.16667H10.8333V5.83333H2.5Z" 
          fill="#2D2926" 
        />
      </svg>
      Filtrar
    </button>
  );
};

export default FilterToggleController;