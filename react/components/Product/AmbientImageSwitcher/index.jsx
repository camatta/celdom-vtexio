import { useEffect, useState, useRef, useCallback } from 'react'
import { useProduct } from 'vtex.product-context'
import { createPortal } from 'react-dom'

const AMBIENT_IMAGE_TEXT = 'img-ambientada'

const normalize = (v) => (v ?? '').toLowerCase().trim()

const AmbientImageSwitcher = () => {
  const { selectedItem } = useProduct()

  const [ambientIndex, setAmbientIndex] = useState(null)
  const [videoIndex, setVideoIndex] = useState(null)
  const [isAmbientActive, setIsAmbientActive] = useState(false)
  const [isVideoActive, setIsVideoActive] = useState(false)
  const [filteredImages, setFilteredImages] = useState([])
  const [isHoveringAmbient, setIsHoveringAmbient] = useState(false)
  const [isHoveringVideo, setIsHoveringVideo] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [buttonReady, setButtonReady] = useState(false)
  const [hasError, setHasError] = useState(false)

  const swiperInstance = useRef(null)
  const thumbsSwiperInstance = useRef(null)
  const activeThumbRef = useRef(0)
  const updateInterval = useRef(null)
  const buttonContainerRef = useRef(null)
  const initRetryCount = useRef(0)
  const currentSlideRef = useRef(0)

  const safeQuerySelector = useCallback((selector) => {
    try {
      if (typeof document === 'undefined') return null
      return document.querySelector(selector)
    } catch (error) {
      console.warn('Erro ao buscar elemento DOM:', selector, error)
      return null
    }
  }, [])

  const safeQuerySelectorAll = useCallback((selector) => {
    try {
      if (typeof document === 'undefined') return []
      return [...document.querySelectorAll(selector)]
    } catch (error) {
      console.warn('Erro ao buscar elementos DOM:', selector, error)
      return []
    }
  }, [])

  const getNonBannerImagesFromProduct = useCallback(() => {
    const imgs = selectedItem?.images ?? []
    return imgs.filter((img) => !normalize(img?.imageLabel).includes('banner-pdp'))
  }, [selectedItem])

  const getThumbsWithoutBanners = useCallback(() => {
    const allThumbs = safeQuerySelectorAll('.vtex-store-components-3-x-productImagesThumb')
    if (!allThumbs.length) return []

    const images = selectedItem?.images ?? []

    // pega IDs de banners pelo produto (sem alt)
    const bannerIds = images
      .filter((img) => normalize(img?.imageLabel).includes('banner-pdp'))
      .map((img) => String(img?.imageId ?? '').trim())
      .filter(Boolean)

    if (!bannerIds.length) return allThumbs

    const isBannerThumb = (thumb) => {
      const img = thumb.querySelector('img')
      const src = img?.currentSrc || img?.src || ''
      return bannerIds.some((id) => src.includes(`/ids/${id}`) || src.includes(`ids/${id}-`) || src.includes(`ids/${id}?`))
    }

    // remove somente thumbs que são banners; mantém vídeo e imagens normais
    return allThumbs.filter((t) => !isBannerThumb(t))
  }, [safeQuerySelectorAll, selectedItem])


  const waitForImagesLoad = useCallback((images) => {
    return new Promise((resolve) => {
      if (!images || images.length === 0) {
        resolve()
        return
      }

      const timeout = setTimeout(() => resolve(), 3000)

      try {
        const imagePromises = images.slice(0, 3).map((img) => {
          return new Promise((resolveImg) => {
            const image = new Image()
            const timer = setTimeout(resolveImg, 1500)

            image.onload = () => {
              clearTimeout(timer)
              resolveImg()
            }
            image.onerror = () => {
              clearTimeout(timer)
              resolveImg()
            }
            image.src = img.imageUrl
          })
        })

        Promise.all(imagePromises)
          .then(() => {
            clearTimeout(timeout)
            resolve()
          })
          .catch(() => {
            clearTimeout(timeout)
            resolve()
          })
      } catch (error) {
        console.warn('Erro no carregamento de imagens:', error)
        clearTimeout(timeout)
        resolve()
      }
    })
  }, [])

  const findMediaIndexes = useCallback(() => {
    try {
      const nonBannerImages = getNonBannerImagesFromProduct()
      const nonBannerThumbs = getThumbsWithoutBanners()

      // ambient pelo imageText (produto)
      const ambientFromProduct = nonBannerImages.findIndex((img) => {
        const t = normalize(img?.imageText)
        return t === normalize(AMBIENT_IMAGE_TEXT)
      })

      const ambientIndexFinal =
        ambientFromProduct >= 0 &&
        (nonBannerThumbs.length === 0 || ambientFromProduct < nonBannerThumbs.length)
          ? ambientFromProduct
          : null

      // vídeo pelo DOM (dentro dos thumbs não-banner)
      const videoThumbIndex = nonBannerThumbs.findIndex((thumb) => {
        try {
          const hasVideoClass =
            thumb.querySelector('.vtex-store-components-3-x-figure--video') ||
            thumb.querySelector('.vtex-store-components-3-x-thumbImg--video')

          const img = thumb.querySelector('img')
          const imgSrc = img?.src || ''
          const isYouTubeThumb = imgSrc.includes('youtube.com') || imgSrc.includes('img.youtube.com')

          return Boolean(hasVideoClass || isYouTubeThumb)
        } catch (e) {
          return false
        }
      })

      return {
        ambientIndex: ambientIndexFinal,
        videoIndex: videoThumbIndex >= 0 ? videoThumbIndex : null,
      }
    } catch (error) {
      console.warn('Erro ao buscar índices de mídia:', error)
      return { ambientIndex: null, videoIndex: null }
    }
  }, [getNonBannerImagesFromProduct, getThumbsWithoutBanners])

  const checkMediaActiveStates = useCallback(() => {
    try {
      const a = ambientIndex !== null && currentSlideRef.current === ambientIndex
      const v = videoIndex !== null && currentSlideRef.current === videoIndex
      return { isAmbientActive: a, isVideoActive: v }
    } catch (error) {
      console.warn('Erro ao verificar estados ativos:', error)
      return { isAmbientActive: false, isVideoActive: false }
    }
  }, [ambientIndex, videoIndex])

  const scrollToThumb = useCallback(
    (index) => {
      if (index === null) return

      try {
        if (thumbsSwiperInstance.current) {
          thumbsSwiperInstance.current.slideTo(index)
        }

        const nonBannerThumbs = getThumbsWithoutBanners()
        if (nonBannerThumbs[index]) {
          nonBannerThumbs[index].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
          })
        }
      } catch (error) {
        console.warn('Erro ao scrollar para miniatura:', error)
      }
    },
    [getThumbsWithoutBanners]
  )

  const setupButtonContainer = useCallback(() => {
    const findAndSetupContainer = () => {
      try {
        const parentElement = safeQuerySelector('.vtex-store-components-3-x-carouselGaleryCursor')
        if (!parentElement) {
          if (initRetryCount.current < 10) {
            initRetryCount.current++
            setTimeout(findAndSetupContainer, 200)
          } else {
            setHasError(true)
          }
          return
        }

        const existingContainer = parentElement.querySelector('.media-buttons-container')
        if (existingContainer) existingContainer.remove()

        const buttonContainer = document.createElement('div')
        buttonContainer.className = 'media-buttons-container'
        buttonContainer.style.width = 'fit-content'
        buttonContainer.style.display = 'flex'
        buttonContainer.style.justifyContent = 'start'
        buttonContainer.style.gap = '12px'
        buttonContainer.style.flexWrap = 'wrap'

        const thumbsElement = parentElement.querySelector('.vtex-store-components-3-x-carouselGaleryThumbs')
        if (thumbsElement && parentElement.contains(thumbsElement)) {
          parentElement.insertBefore(buttonContainer, thumbsElement)
          buttonContainerRef.current = buttonContainer
          setButtonReady(true)
        } else {
          if (initRetryCount.current < 10) {
            initRetryCount.current++
            setTimeout(findAndSetupContainer, 200)
          } else {
            setHasError(true)
          }
        }
      } catch (error) {
        console.warn('Erro ao configurar container de botões:', error)
        setHasError(true)
      }
    }

    findAndSetupContainer()
  }, [safeQuerySelector])

  const enforceActiveThumb = useCallback(() => {
    if (!isInitialized) return

    try {
      const allThumbs = safeQuerySelectorAll('.vtex-store-components-3-x-productImagesThumb')
      const nonBannerThumbs = getThumbsWithoutBanners()

      if (activeThumbRef.current !== null && nonBannerThumbs[activeThumbRef.current]) {
        allThumbs.forEach((thumb) => {
          thumb.classList.remove(
            'vtex-store-components-3-x-productImagesThumbActive',
            'vtex-store-components-3-x-productImagesThumbActive--pdp',
            'swiper-slide-active'
          )
        })

        nonBannerThumbs[activeThumbRef.current].classList.add(
          'vtex-store-components-3-x-productImagesThumbActive',
          'vtex-store-components-3-x-productImagesThumbActive--pdp',
          'swiper-slide-active'
        )

        const { isAmbientActive, isVideoActive } = checkMediaActiveStates()
        setIsAmbientActive(isAmbientActive)
        setIsVideoActive(isVideoActive)
      }
    } catch (error) {
      console.warn('Erro ao aplicar classes ativas:', error)
    }
  }, [isInitialized, checkMediaActiveStates, safeQuerySelectorAll, getThumbsWithoutBanners])

  const navigateToMedia = useCallback(
    (index) => {
      if (index === null) return

      try {
        activeThumbRef.current = index
        currentSlideRef.current = index

        if (swiperInstance.current) {
          swiperInstance.current.slideTo(index)
        }

        setTimeout(() => scrollToThumb(index), 300)
        setTimeout(() => enforceActiveThumb(), 100)

        const { isAmbientActive, isVideoActive } = checkMediaActiveStates()
        setIsAmbientActive(isAmbientActive)
        setIsVideoActive(isVideoActive)
      } catch (error) {
        console.warn('Erro na navegação de mídia:', error)
      }
    },
    [enforceActiveThumb, checkMediaActiveStates, scrollToThumb]
  )

  const handleThumbClick = useCallback(
    (e) => {
      try {
        const thumb = e?.target?.closest?.('.vtex-store-components-3-x-productImagesThumb')
        if (!thumb) return

        const nonBannerThumbs = getThumbsWithoutBanners()
        const relativeIndex = nonBannerThumbs.indexOf(thumb)

        if (relativeIndex === -1) {
          e.preventDefault()
          e.stopPropagation()
          return
        }

        e.preventDefault()
        e.stopPropagation()

        currentSlideRef.current = relativeIndex
        activeThumbRef.current = relativeIndex

        const { isAmbientActive, isVideoActive } = checkMediaActiveStates()
        setIsAmbientActive(isAmbientActive)
        setIsVideoActive(isVideoActive)
      } catch (error) {
        console.warn('Erro no clique da thumb:', error)
      }
    },
    [checkMediaActiveStates, getThumbsWithoutBanners]
  )

  useEffect(() => {
    if (!isInitialized) return

    const initSwiperControl = () => {
      try {
        const container = safeQuerySelector('.vtex-store-components-3-x-productImagesGallerySwiperContainer')
        const thumbsContainer = safeQuerySelector('.vtex-store-components-3-x-carouselGaleryThumbs .swiper-container')

        if (!container || !container.swiper) {
          initRetryCount.current++
          if (initRetryCount.current < 8) setTimeout(initSwiperControl, 300)
          return
        }

        swiperInstance.current = container.swiper

        if (thumbsContainer && thumbsContainer.swiper) {
          thumbsSwiperInstance.current = thumbsContainer.swiper
        }

        const handleSlideChange = () => {
          if (swiperInstance.current) {
            currentSlideRef.current = swiperInstance.current.realIndex
            activeThumbRef.current = swiperInstance.current.realIndex

            const { isAmbientActive, isVideoActive } = checkMediaActiveStates()
            setIsAmbientActive(isAmbientActive)
            setIsVideoActive(isVideoActive)

            enforceActiveThumb()
          }
        }

        swiperInstance.current.on('slideChange', handleSlideChange)

        currentSlideRef.current = swiperInstance.current.realIndex
        activeThumbRef.current = swiperInstance.current.realIndex

        const { isAmbientActive, isVideoActive } = checkMediaActiveStates()
        setIsAmbientActive(isAmbientActive)
        setIsVideoActive(isVideoActive)

        if (updateInterval.current) clearInterval(updateInterval.current)
        updateInterval.current = setInterval(enforceActiveThumb, 2000)
      } catch (error) {
        console.warn('Erro na configuração do Swiper:', error)
      }
    }

    setTimeout(initSwiperControl, 1000)

    return () => {
      try {
        if (swiperInstance.current) swiperInstance.current.off('slideChange')
        if (updateInterval.current) clearInterval(updateInterval.current)
      } catch (error) {
        console.warn('Erro no cleanup do Swiper:', error)
      }
    }
  }, [isInitialized, enforceActiveThumb, checkMediaActiveStates, safeQuerySelector])

  useEffect(() => {
    if (!isInitialized) return

    const thumbsContainer = safeQuerySelector('.vtex-store-components-3-x-carouselGaleryThumbs')

    try {
      if (thumbsContainer) {
        thumbsContainer.addEventListener('click', handleThumbClick, true)
        return () => thumbsContainer.removeEventListener('click', handleThumbClick, true)
      }

      document.addEventListener('click', handleThumbClick, true)
      return () => document.removeEventListener('click', handleThumbClick, true)
    } catch (error) {
      console.warn('Erro ao configurar event listener:', error)
      return () => {}
    }
  }, [isInitialized, handleThumbClick, safeQuerySelector])

  useEffect(() => {
    if (!selectedItem?.images) return

    try {
      const nonBanner = (selectedItem.images ?? []).filter(
        (img) => !normalize(img?.imageLabel).includes('banner-pdp')
      )
      setFilteredImages(nonBanner)

      const initializeMediaIndexes = () => {
        try {
          const { ambientIndex: a, videoIndex: v } = findMediaIndexes()

          setAmbientIndex(a)
          setVideoIndex(v)
          setIsAmbientActive(false)
          setIsVideoActive(false)
          setIsInitialized(false)
          setButtonReady(false)
          setHasError(false)
          initRetryCount.current = 0

          if (a !== null || v !== null) {
            setupButtonContainer()
            waitForImagesLoad(nonBanner).then(() => setIsInitialized(true))
          }
        } catch (error) {
          console.warn('Erro na inicialização de índices de mídia:', error)
          setHasError(true)
        }
      }

      setTimeout(initializeMediaIndexes, 800)
    } catch (error) {
      console.warn('Erro no efeito principal:', error)
      setHasError(true)
    }
  }, [selectedItem, findMediaIndexes, setupButtonContainer, waitForImagesLoad])

  useEffect(() => {
    return () => {
      try {
        if (buttonContainerRef.current && buttonContainerRef.current.parentNode) {
          buttonContainerRef.current.parentNode.removeChild(buttonContainerRef.current)
        }
        if (updateInterval.current) clearInterval(updateInterval.current)
      } catch (error) {
        console.warn('Erro no cleanup:', error)
      }
    }
  }, [])

  if (hasError) return null

  if ((ambientIndex === null && videoIndex === null) || !buttonReady || !buttonContainerRef.current) {
    return null
  }

  try {
    return createPortal(
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {ambientIndex !== null && (
          <button
            onClick={() => navigateToMedia(ambientIndex)}
            onMouseEnter={() => setIsHoveringAmbient(true)}
            onMouseLeave={() => setIsHoveringAmbient(false)}
            style={{
              display: isAmbientActive ? 'none' : 'block',
              border: `1px solid ${isHoveringAmbient ? '#FE5000' : '#CCCCCC'}`,
              borderRadius: '40px',
              color: '#2D2926',
              fontWeight: 700,
              fontSize: '12px',
              backgroundColor: 'transparent',
              width: '192px',
              height: '32px',
              cursor: 'pointer',
              marginTop: '16px',
              transition: 'border 0.3s ease, opacity 0.3s ease',
              opacity: isAmbientActive ? 0 : 1,
            }}
            aria-hidden={isAmbientActive}
          >
            Ver imagem ambientada
          </button>
        )}

        {videoIndex !== null && (
          <button
            onClick={() => navigateToMedia(videoIndex)}
            onMouseEnter={() => setIsHoveringVideo(true)}
            onMouseLeave={() => setIsHoveringVideo(false)}
            style={{
              display: isVideoActive ? 'none' : 'block',
              border: `1px solid ${isHoveringVideo ? '#FE5000' : '#CCCCCC'}`,
              borderRadius: '40px',
              color: '#2D2926',
              fontWeight: 700,
              fontSize: '12px',
              backgroundColor: 'transparent',
              width: '192px',
              height: '32px',
              cursor: 'pointer',
              marginTop: '16px',
              transition: 'border 0.3s ease, opacity 0.3s ease',
              opacity: isVideoActive ? 0 : 1,
            }}
            aria-hidden={isVideoActive}
          >
            ▶ Vídeo
          </button>
        )}
      </div>,
      buttonContainerRef.current
    )
  } catch (error) {
    console.warn('Erro no render do portal:', error)
    return null
  }
}

export default AmbientImageSwitcher