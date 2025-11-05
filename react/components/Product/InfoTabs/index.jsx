import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useProduct } from 'vtex.product-context'
import styles from './infoTabs.css'

const InfoTabs = () => {
  const { product } = useProduct() || {}
  const productId = product?.cacheId
  const productDescription = product?.description || ''
  const skuSpecifications = product?.skuSpecifications || []

  const [productSpecifications, setProductSpecifications] = useState({
    activeSpecification: 0,
    specificationsTabs: [],
    specificationContent: '',
  })

  const [isExpanded, setIsExpanded] = useState(false)
  const [showSeeMore, setShowSeeMore] = useState(false)

  const contentRef = useRef(null)

  // ===== Helpers otimizados de medição =====
  const measuringScheduled = useRef(false)
  const fallbackTimeout = useRef(null)

  const doMeasure = useCallback(() => {
    measuringScheduled.current = false
    const el = contentRef.current
    if (!el) return

    // overflow real ou altura mínima (caso seu CSS use max-height: 306px)
    const hasOverflow = (el.scrollHeight - el.clientHeight) > 1 || el.scrollHeight > 306

    // só atualiza o estado se realmente mudou
    setShowSeeMore(prev => (prev !== hasOverflow ? hasOverflow : prev))
  }, [])

  const scheduleMeasure = useCallback(() => {
    if (measuringScheduled.current) return
    measuringScheduled.current = true

    // mede em ~2 frames (depois que CSS/imagens podem ter interferido)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        doMeasure()
      })
    })

    // fallback único (casos de late layout/lazy)
    if (fallbackTimeout.current) clearTimeout(fallbackTimeout.current)
    fallbackTimeout.current = setTimeout(doMeasure, 800)
  }, [doMeasure])

  useEffect(() => {
    return () => {
      if (fallbackTimeout.current) clearTimeout(fallbackTimeout.current)
    }
  }, [])

  // ===== Montagem de abas (memo + setState único) =====
  const tabsMemo = useMemo(() => {
    const tabs = [{ name: 'Descrição', values: [productDescription] }]

    const especificacoesGroup = product?.specificationGroups?.find(
      g => g?.name === 'Especificações' || g?.name === 'allSpecifications'
    )

    const especificacoesHTML =
      especificacoesGroup?.specifications
        ?.map(spec => `<strong>${spec?.name || ''}:<br></strong> ${spec?.values?.join(', ') || ''}`)
        .join('<br/>') || ''

    const skuSpecs =
      skuSpecifications
        ?.map(spec => {
          const fieldName = spec?.field?.name === 'Sku' ? 'Código' : spec?.field?.name
          return `<strong>${fieldName || ''}:</strong> ${spec?.values?.[0]?.name || ''}`
        })
        .join('<br/>') || ''

    const combined =
      `${especificacoesHTML}${especificacoesHTML && skuSpecs ? '<br/><br/>' : ''}${skuSpecs}`

    if (combined.trim()) {
      tabs.push({ name: 'Especificações Técnicas', values: [combined] })
    }

    const gabarito = especificacoesGroup?.specifications?.find(s => s?.name === 'Gabarito')
    if (gabarito?.values?.[0]) {
      tabs.push({ name: 'Gabarito', values: [gabarito.values[0]] })
    }

    return tabs
  }, [product, productDescription, skuSpecifications])

  useEffect(() => {
    const firstContent = tabsMemo[0]?.values?.[0] || ''
    setProductSpecifications({
      activeSpecification: 0,
      specificationsTabs: tabsMemo,
      specificationContent: firstContent,
    })
    setIsExpanded(false)
    setShowSeeMore(false)
    scheduleMeasure()
  }, [tabsMemo, scheduleMeasure])

  // ===== Observadores leves (throttle por RAF) =====
  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    // ResizeObserver: só agenda medição (não mede direto)
    let ro
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(() => {
        scheduleMeasure()
      })
      ro.observe(el)
    }

    // MutationObserver: restringe escopo (sem characterData)
    const mo = new MutationObserver(() => {
      scheduleMeasure()
    })
    mo.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'sizes', 'srcset', 'class', 'style']
    })

    // Imagens internas (lazy-load): mede quando carregar
    const imgs = Array.from(el.querySelectorAll('img'))
    const onImg = () => scheduleMeasure()
    imgs.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', onImg, { once: true })
        img.addEventListener('error', onImg, { once: true })
      }
    })

    // Fonts
    if (document.fonts?.ready) {
      document.fonts.ready.then(scheduleMeasure).catch(() => {})
    }

    // Resize janela
    const onResize = () => scheduleMeasure()
    window.addEventListener('resize', onResize)

    // primeira medição pós-mount
    scheduleMeasure()

    return () => {
      ro && ro.disconnect()
      mo.disconnect()
      window.removeEventListener('resize', onResize)
      imgs.forEach(img => {
        img.removeEventListener('load', onImg)
        img.removeEventListener('error', onImg)
      })
    }
  }, [scheduleMeasure])

  // Troca de aba
  const handleBtnControl = (tabIndex) => {
    setProductSpecifications(prev => {
      const nextContent = prev.specificationsTabs[tabIndex]?.values?.[0] || ''
      return prev.activeSpecification === tabIndex && prev.specificationContent === nextContent
        ? prev
        : {
            ...prev,
            activeSpecification: tabIndex,
            specificationContent: nextContent,
          }
    })
    setIsExpanded(false)
    setShowSeeMore(false)
    scheduleMeasure()
  }

  const activeTab = productSpecifications.specificationsTabs[productSpecifications.activeSpecification]

  return (
    <>
      {!!productSpecifications.specificationsTabs.length && (
        <div className={styles.productInfoTabs} key={productId}>
          <div className={styles.tabHeader}>
            {productSpecifications.specificationsTabs.map((info, index) => (
              <button
                type="button"
                onClick={() => handleBtnControl(index)}
                key={info.name || `tab-${index}`}
                className={`${styles.infoControl} ${
                  productSpecifications.activeSpecification === index ? styles.active : ''
                }`}
              >
                {info.name}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab?.name === 'Gabarito' ? (
              <a
                href={productSpecifications.specificationContent}
                download
                className={styles.downloadButton}
                target="_blank"
                rel="noopener"
              >
                Gabarito do Produto
              </a>
            ) : (
              <>
                <div
                  ref={contentRef}
                  className={`${styles.contentBox} ${isExpanded ? styles.expanded : ''}`}
                  dangerouslySetInnerHTML={{ __html: productSpecifications.specificationContent || '' }}
                />
                {showSeeMore && !isExpanded && (
                  <button className={styles.seeMoreButton} onClick={() => setIsExpanded(true)}>
                    Ver mais
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default InfoTabs