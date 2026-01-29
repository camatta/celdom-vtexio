import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useProduct } from 'vtex.product-context'
import styles from './product-current-image-text.css'

const ProductCurrentImageTextOverlay = () => {
  const { selectedItem } = useProduct()
  const [portalTarget, setPortalTarget] = useState(null)
  const [activeText, setActiveText] = useState(null)

  const swiperRef = useRef(null)
  const observerRef = useRef(null)
  const pollRef = useRef(null)
  const rafRef = useRef(null)
  const retryRef = useRef(0)

  const images = selectedItem?.images || []

  const safeQuerySelector = useCallback((selector) => {
    try {
      return document.querySelector(selector)
    } catch {
      return null
    }
  }, [])

  // Lê a imagem do slide ativo e extrai o ID (/ids/<id>)
  const getActiveImageIdFromDOM = useCallback(() => {
    const imgEl = safeQuerySelector(
      '.vtex-store-components-3-x-productImagesGallerySlide.swiper-slide-active ' +
        '.vtex-store-components-3-x-productImageTag--pdp--main'
    )
    const src = imgEl?.getAttribute('src') || ''
    if (!src) return null

    const clean = src.split('&')[0]
    const match = clean.match(/\/ids\/(\d+)/)
    return match?.[1] ?? null
  }, [safeQuerySelector])

  // Acha o slide ativo (elemento) para anexar o portal
  const getActiveSlideEl = useCallback(() => {
    return safeQuerySelector('.vtex-store-components-3-x-productImagesGallerySlide.swiper-slide-active')
  }, [safeQuerySelector])

  // Cria/reusa um container nosso dentro do slide (sem apagar nada)
  const ensureOverlayContainer = useCallback((slideEl) => {
    if (!slideEl) return null

    // garante contexto pra absolute
    const computed = window.getComputedStyle(slideEl)
    if (computed.position === 'static') {
      slideEl.style.position = 'relative'
    }

    let container = slideEl.querySelector('.product-image-text-overlay')
    if (!container) {
      container = document.createElement('div')
      container.className = 'product-image-text-overlay'
      slideEl.appendChild(container)
    }
    return container
  }, [])

  // Resolve texto pelo imageId/cacheId
  const getTextByImageId = useCallback(
    (imageId) => {
      if (!imageId) return null
      const imgObj = images.find(
        (img) => img?.imageId === imageId || img?.cacheId === imageId
      )
      return imgObj?.imageLabel?.trim() || null
    },
    [images]
  )

  // Sincroniza target + texto baseado no slide ativo atual
  const syncFromActiveSlide = useCallback(() => {
    const slideEl = getActiveSlideEl()
    const imageId = getActiveImageIdFromDOM()

    if (!slideEl || !imageId) {
      setPortalTarget(null)
      setActiveText(null)
      return
    }

    const container = ensureOverlayContainer(slideEl)
    const text = getTextByImageId(imageId)
    // const textNormalized = text.includes("-") ? text.replaceAll("-", " ") : text;

    setPortalTarget(container)
    setActiveText(text)
  }, [getActiveSlideEl, getActiveImageIdFromDOM, ensureOverlayContainer, getTextByImageId])

  // 1) Preferencial: hook no Swiper (slideChange)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!images.length) return

    const tryInitSwiper = () => {
      const container = safeQuerySelector(
        '.vtex-store-components-3-x-productImagesGallerySwiperContainer'
      )
      const swiper = container?.swiper

      if (!swiper) {
        retryRef.current += 1
        if (retryRef.current < 12) setTimeout(tryInitSwiper, 250)
        return
      }

      swiperRef.current = swiper

      const onChange = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => {
          syncFromActiveSlide()
        })
      }

      // sync inicial
      syncFromActiveSlide()

      swiper.on('slideChange', onChange)

      return () => {
        try {
          swiper.off('slideChange', onChange)
        } catch {}
      }
    }

    const cleanup = tryInitSwiper()
    return () => {
      if (typeof cleanup === 'function') cleanup()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [images.length, safeQuerySelector, syncFromActiveSlide])

  // 2) Fallback: observer + polling (pra garantir em lazyload/render tardio)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!images.length) return

    // polling leve (até estabilizar)
    pollRef.current = setInterval(() => {
      syncFromActiveSlide()
    }, 350)

    const root =
      safeQuerySelector('.vtex-store-components-3-x-productImagesGallery') ||
      safeQuerySelector('.vtex-store-components-3-x-productImagesGallerySwiperContainer')

    if (root) {
      observerRef.current = new MutationObserver(() => {
        syncFromActiveSlide()
      })

      try {
        observerRef.current.observe(root, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ['class', 'src'],
        })
      } catch {}
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = null

      if (observerRef.current) observerRef.current.disconnect()
      observerRef.current = null
    }
  }, [images.length, safeQuerySelector, syncFromActiveSlide])

  // Se não tem texto pra imagem ativa, não renderiza nada (mas continua syncando)
  if (!portalTarget || !activeText) return null

  return createPortal(
    <div className={styles.boxTextOverlay} role="note">
      <span className={styles.textAttributeOverlay}>{activeText}</span>
    </div>,
    portalTarget
  )
}

export default ProductCurrentImageTextOverlay
