import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useProduct } from 'vtex.product-context'
import styles from './infoTabs.css'


const InfoTabsView = ({ tabs }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSeeMore, setShowSeeMore] = useState(false)

  const contentRef = useRef(null)

  // ===== Helpers de medição (client-only) =====
  const measuringScheduled = useRef(false)
  const fallbackTimeout = useRef(null)

  const doMeasure = useCallback(() => {
    measuringScheduled.current = false
    const el = contentRef.current
    if (!el) return

    
    const hasOverflow = (el.scrollHeight - el.clientHeight) > 1 || el.scrollHeight > 306
    setShowSeeMore(prev => (prev !== hasOverflow ? hasOverflow : prev))
  }, [])

  const scheduleMeasure = useCallback(() => {
    if (measuringScheduled.current) return
    measuringScheduled.current = true

    requestAnimationFrame(() => {
      requestAnimationFrame(() => doMeasure())
    })

    if (fallbackTimeout.current) clearTimeout(fallbackTimeout.current)
    fallbackTimeout.current = setTimeout(doMeasure, 800)
  }, [doMeasure])

  useEffect(() => {
    return () => {
      if (fallbackTimeout.current) clearTimeout(fallbackTimeout.current)
    }
  }, [])

  
  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    let ro
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      ro = new ResizeObserver(() => scheduleMeasure())
      ro.observe(el)
    }

    const mo = new MutationObserver(() => scheduleMeasure())
    mo.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'sizes', 'srcset', 'class', 'style'],
    })

    const imgs = Array.from(el.querySelectorAll('img'))
    const onImg = () => scheduleMeasure()
    imgs.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', onImg, { once: true })
        img.addEventListener('error', onImg, { once: true })
      }
    })

    if (document.fonts?.ready) {
      document.fonts.ready.then(scheduleMeasure).catch(() => {})
    }

    const onResize = () => scheduleMeasure()
    window.addEventListener('resize', onResize)

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

  const activeTab = tabs[activeIndex]
  const activeHtml = activeTab?.values?.[0] || ''

  const handleTabClick = (index) => {
    if (index === activeIndex) return
    setActiveIndex(index)
    setIsExpanded(false)
    setShowSeeMore(false)
    scheduleMeasure()
  }

  return (
    <div className={styles.productInfoTabs}>
      <div className={styles.tabHeader}>
        {tabs.map((info, index) => (
          <button
            type="button"
            onClick={() => handleTabClick(index)}
            key={info.name || `tab-${index}`}
            className={`${styles.infoControl} ${activeIndex === index ? styles.active : ''}`}
          >
            {info.name}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab?.name === 'Gabarito' ? (
          <a
            href={activeHtml}
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
              dangerouslySetInnerHTML={{ __html: activeHtml }}
            />
            {showSeeMore && !isExpanded && (
              <button
                type="button"
                className={styles.seeMoreButton}
                onClick={() => setIsExpanded(true)}
              >
                Ver mais
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const InfoTabs = () => {
  const { product } = useProduct() || {}

  const productId = product?.cacheId
  const productDescription = product?.description || ''
  const skuSpecifications = product?.skuSpecifications || []


  const tabs = useMemo(() => {
    const nextTabs = [{ name: 'Descrição', values: [productDescription] }]

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
      nextTabs.push({ name: 'Especificações Técnicas', values: [combined] })
    }

    const gabarito = especificacoesGroup?.specifications?.find(s => s?.name === 'Gabarito')
    if (gabarito?.values?.[0]) {
      nextTabs.push({ name: 'Gabarito', values: [gabarito.values[0]] })
    }

    return nextTabs
  }, [product, productDescription, skuSpecifications])

  if (!tabs?.length) return null

  
  return <InfoTabsView key={productId || 'product'} tabs={tabs} />
}

export default InfoTabs
