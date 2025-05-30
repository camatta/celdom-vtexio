import { useEffect, useRef, useState } from 'react'
import { useProduct } from 'vtex.product-context'
import styles from './ProductBannerSlider.css'

const ProductBannerSlider = () => {
  const productContext = useProduct()
  const selectedItem = productContext?.selectedItem

  const [banners, setBanners] = useState([])
  const [isMobile, setIsMobile] = useState(false)
  const sliderRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const observerRef = useRef(null)

  // Detecta se é mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Função para remover as thumbnails indesejadas
  const removeUnwantedThumbnails = (bannerLabel, filteredBanners) => {
    try {
      const thumbs = document.querySelectorAll('.vtex-store-components-3-x-productImagesThumb img')
      
      thumbs.forEach(img => {
        if (img.alt && img.alt.toLowerCase().includes(bannerLabel)) {
          const isInFiltered = filteredBanners.includes(img.src)
          if (!isInFiltered) {
            const thumbContainer = img.closest('.vtex-store-components-3-x-productImagesThumb')
            if (thumbContainer && thumbContainer.parentNode && thumbContainer.parentNode.contains(thumbContainer)) {
              thumbContainer.parentNode.removeChild(thumbContainer)
            }
          }
        }
      })
    } catch (err) {
      console.error('Error removing thumbnails:', err)
    }
  }

  // Configura o MutationObserver
  const setupObserver = (bannerLabel, filteredBanners) => {
    // Limpa o observer anterior se existir
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    const targetNode = document.querySelector('.vtex-store-components-3-x-productImagesContainer')
    if (!targetNode) return

    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Verifica se as thumbnails que queremos remover foram adicionadas
          const thumbs = document.querySelectorAll('.vtex-store-components-3-x-productImagesThumb img')
          if (thumbs.length > 0) {
            removeUnwantedThumbnails(bannerLabel, filteredBanners)
            // Podemos parar de observar depois de encontrar e processar as thumbnails
            observer.disconnect()
            observerRef.current = null
            break
          }
        }
      }
    })

    observer.observe(targetNode, {
      childList: true,
      subtree: true
    })

    observerRef.current = observer

    // Adiciona um timeout de fallback caso o observer não detecte as mudanças
    const timeout = setTimeout(() => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
      removeUnwantedThumbnails(bannerLabel, filteredBanners)
    }, 1000)

    return () => clearTimeout(timeout)
  }

  // Atualiza banners com base no SKU e tipo de tela
  useEffect(() => {
    if (!selectedItem || !selectedItem.images) {
      setBanners([])
      return
    }

    const bannerLabel = isMobile ? 'banner-pdp-mob' : 'banner-pdp'

    const filteredBanners = selectedItem.images
      .filter(img => img.imageLabel && img.imageLabel.toLowerCase() === bannerLabel)
      .map(img => img.imageUrl)

    setBanners(filteredBanners)
    setCurrentIndex(0)

    // Configura o observer para quando o DOM for atualizado
    const cleanupObserver = setupObserver(bannerLabel, filteredBanners)

    // Tenta remover imediatamente (caso os elementos já estejam no DOM)
    removeUnwantedThumbnails(bannerLabel, filteredBanners)

    return () => {
      if (cleanupObserver) cleanupObserver()
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [selectedItem, isMobile])

  // Rotação automática dos banners
  useEffect(() => {
    if (!sliderRef.current || banners.length <= 1) return

    const slider = sliderRef.current
    let animationFrameId
    let startTime
    const duration = 1500
    const startScroll = currentIndex * slider.offsetWidth
    const endScroll = ((currentIndex + 1) % banners.length) * slider.offsetWidth

    const animateScroll = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = easeInOutQuad(progress)
      const scrollPosition = startScroll + (endScroll - startScroll) * easeProgress
      slider.scrollLeft = scrollPosition

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateScroll)
      } else {
        setCurrentIndex((currentIndex + 1) % banners.length)
      }
    }

    const interval = setInterval(() => {
      startTime = null
      animationFrameId = requestAnimationFrame(animateScroll)
    }, 5000)

    return () => {
      clearInterval(interval)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [currentIndex, banners])

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }

  if (!banners || banners.length === 0) return null

  return (
    <div
      className="banner-slider-wrapper"
      style={{
        width: '100%',
        padding: '0 16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className={styles.bannerSliderContainer}
        style={{
          maxWidth: '1140px',
          margin: '0 auto',
        }}
      >
        <div
          ref={sliderRef}
          className="banner-slider"
          style={{
            display: 'flex',
            overflowX: 'auto',
            scrollBehavior: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {banners.map((url, index) => (
            <div
              key={index}
              style={{
                flex: '0 0 100%',
                scrollSnapAlign: 'start',
              }}
            >
              <img
                src={url}
                alt={`Banner PDP ${index + 1}`}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '4px',
                }}
              />
            </div>
          ))}
        </div>

        {banners.length > 1 && (
          <div
            className="slider-dots"
            style={{
              display: 'flex',
              justifyContent: 'start',
              gap: '8px',
              marginTop: '16px',
            }}
          >
            {banners.map((_, index) => (
              <div
                key={index}
                style={{
                  height: '4px',
                  borderRadius: '4px',
                  backgroundColor: index === currentIndex ? '#FE5000' : '#2D2926',
                  width: index === currentIndex ? '73px' : '39px',
                  transition: 'all 1s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductBannerSlider