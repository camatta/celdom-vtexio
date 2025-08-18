import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { useProduct } from 'vtex.product-context'
import styles from './infoTabs.css'

const InfoTabs = () => {
  const productContext = useProduct()
  const product = productContext && productContext.product
  const productId = product && product.cacheId
  const productDescription = (product && product.description) || ''
  const skuSpecifications = (product && product.skuSpecifications) || []

  const [productSpecifications, setProductSpecifications] = useState({
    activeSpecification: 0,
    specificationsTabs: [],
    specificationContent: productDescription,
  })

  const [isExpanded, setIsExpanded] = useState(false)
  const [showSeeMore, setShowSeeMore] = useState(false)
  const contentRef = useRef(null)
  const pollRef = useRef(null)

  const checkContentHeight = useCallback(() => {
    const el = contentRef.current
    if (!el) return
    // Detecta overflow real e também aplica um mínimo de 306px se você usa esse limite no CSS
    const hasOverflow = el.scrollHeight - el.clientHeight > 1
    const overMin = el.scrollHeight > 306
    setShowSeeMore(hasOverflow || overMin)
  }, [])

  // Agenda medições em várias fases para garantir que pegue HTML, imagens e estilos
  const measureSoon = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)

    // imediato
    checkContentHeight()

    // dois frames
    requestAnimationFrame(() => {
      checkContentHeight()
      requestAnimationFrame(checkContentHeight)
    })

    // timers em cascata
    setTimeout(checkContentHeight, 0)
    setTimeout(checkContentHeight, 200)
    setTimeout(checkContentHeight, 600)
    setTimeout(checkContentHeight, 1200)

    // polling curto para casos extremos de hidratação
    let tries = 0
    pollRef.current = setInterval(() => {
      tries += 1
      checkContentHeight()
      if (tries > 10) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }, 250)
  }, [checkContentHeight])

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  // Monta as abas quando o produto muda
  useEffect(() => {
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

    const combined = `${especificacoesHTML}${especificacoesHTML && skuSpecs ? '<br/><br/>' : ''}${skuSpecs}`

    if (combined.trim()) {
      tabs.push({ name: 'Especificações Técnicas', values: [combined] })
    }

    const gabarito = especificacoesGroup?.specifications?.find(s => s?.name === 'Gabarito')
    if (gabarito?.values?.[0]) {
      tabs.push({ name: 'Gabarito', values: [gabarito.values[0]] })
    }

    setProductSpecifications({
      activeSpecification: 0,
      specificationsTabs: tabs,
      specificationContent: tabs[0]?.values?.[0] || '',
    })

    setIsExpanded(false)
    setShowSeeMore(false)
    // mede depois que o novo conteúdo for renderizado
    setTimeout(measureSoon, 0)
  }, [productId, productDescription, skuSpecifications, product, measureSoon])

  // Medir após render do HTML no DOM
  useLayoutEffect(() => {
    measureSoon()
  }, [productSpecifications.specificationContent, measureSoon])

  // Observadores de tamanho, mutação, imagens, fontes e resize
  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    // ResizeObserver detecta mudanças de tamanho
    let ro
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(() => checkContentHeight())
      ro.observe(el)
    }

    // MutationObserver pega alterações no innerHTML
    const mo = new MutationObserver(() => measureSoon())
    mo.observe(el, { childList: true, subtree: true, characterData: true })

    // Recalcula quando imagens internas carregarem
    const imgs = Array.from(el.querySelectorAll('img'))
    const onLoad = () => measureSoon()
    imgs.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', onLoad, { once: true })
        img.addEventListener('error', onLoad, { once: true })
      }
    })

    // Web fonts podem alterar quebras de linha
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measureSoon).catch(() => {})
    }

    // Resize da janela
    const onResize = () => measureSoon()
    window.addEventListener('resize', onResize)

    return () => {
      ro && ro.disconnect()
      mo.disconnect()
      window.removeEventListener('resize', onResize)
      imgs.forEach(img => {
        img.removeEventListener('load', onLoad)
        img.removeEventListener('error', onLoad)
      })
    }
  }, [measureSoon, checkContentHeight])

  const handleBtnControl = (tabIndex) => {
    setProductSpecifications(prev => ({
      ...prev,
      activeSpecification: tabIndex,
      specificationContent: prev.specificationsTabs[tabIndex]?.values?.[0] || '',
    }))
    setIsExpanded(false)
    setShowSeeMore(false)
    setTimeout(measureSoon, 0)
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
