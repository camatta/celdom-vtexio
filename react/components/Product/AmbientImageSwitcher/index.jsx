import { useEffect, useState, useRef, useCallback } from 'react'
import { useProduct } from 'vtex.product-context'
import { createPortal } from 'react-dom'

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

  // Função segura para selecionar elementos DOM
  const safeQuerySelector = useCallback((selector) => {
    try {
      return document.querySelector(selector)
    } catch (error) {
      console.warn('Erro ao buscar elemento DOM:', selector, error)
      return null
    }
  }, [])

  // Função segura para selecionar múltiplos elementos DOM
  const safeQuerySelectorAll = useCallback((selector) => {
    try {
      return [...document.querySelectorAll(selector)]
    } catch (error) {
      console.warn('Erro ao buscar elementos DOM:', selector, error)
      return []
    }
  }, [])

  // Aguardar carregamento das imagens com tratamento de erro
  const waitForImagesLoad = useCallback((images) => {
    return new Promise((resolve) => {
      if (!images || images.length === 0) {
        resolve()
        return
      }

      const timeout = setTimeout(() => {
        resolve()
      }, 3000)

      try {
        const imagePromises = images.slice(0, 3).map(img => {
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

        Promise.all(imagePromises).then(() => {
          clearTimeout(timeout)
          resolve()
        }).catch(() => {
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

  // Encontrar os índices da imagem ambientada e do vídeo com tratamento seguro
  const findMediaIndexes = useCallback(() => {
    try {
      const allThumbs = safeQuerySelectorAll('.vtex-store-components-3-x-productImagesThumb')
      if (!allThumbs.length) {
        return { ambientIndex: null, videoIndex: null }
      }

      const nonBannerThumbs = allThumbs.filter(thumb => {
        const img = thumb.querySelector('img')
        return img && !img.alt?.toLowerCase().includes('banner-pdp')
      })

      // Encontrar imagem ambientada
      const ambientThumbIndex = nonBannerThumbs.findIndex(thumb => {
        const img = thumb.querySelector('img')
        return img?.alt?.toLowerCase() === 'img-ambientada'
      })

      // Encontrar vídeo
      const videoThumbIndex = nonBannerThumbs.findIndex(thumb => {
        try {
          const hasVideoClass = thumb.querySelector('.vtex-store-components-3-x-figure--video') ||
                               thumb.querySelector('.vtex-store-components-3-x-thumbImg--video')
          
          const img = thumb.querySelector('img')
          const imgSrc = img?.src || ''
          const isYouTubeThumb = imgSrc.includes('youtube.com') || imgSrc.includes('img.youtube.com')
          
          return hasVideoClass || isYouTubeThumb
        } catch (e) {
          return false
        }
      })

      return {
        ambientIndex: ambientThumbIndex >= 0 ? ambientThumbIndex : null,
        videoIndex: videoThumbIndex >= 0 ? videoThumbIndex : null
      }
    } catch (error) {
      console.warn('Erro ao buscar índices de mídia:', error)
      return { ambientIndex: null, videoIndex: null }
    }
  }, [safeQuerySelectorAll])

  // Verificar se os slides atuais são as mídias correspondentes
  const checkMediaActiveStates = useCallback(() => {
    try {
      const isAmbientActive = ambientIndex !== null && currentSlideRef.current === ambientIndex
      const isVideoActive = videoIndex !== null && currentSlideRef.current === videoIndex
      
      return { isAmbientActive, isVideoActive }
    } catch (error) {
      console.warn('Erro ao verificar estados ativos:', error)
      return { isAmbientActive: false, isVideoActive: false }
    }
  }, [ambientIndex, videoIndex])

  // Scroll para a miniatura com tratamento de erro
  const scrollToThumb = useCallback((index) => {
    if (index === null) return

    try {
      // Tenta usar o Swiper das thumbnails se disponível
      if (thumbsSwiperInstance.current) {
        thumbsSwiperInstance.current.slideTo(index)
      }
      
      // Fallback: scroll manual
      const allThumbs = safeQuerySelectorAll('.vtex-store-components-3-x-productImagesThumb')
      const nonBannerThumbs = allThumbs.filter(thumb => {
        const img = thumb.querySelector('img')
        return img && !img.alt?.toLowerCase().includes('banner-pdp')
      })
      
      if (nonBannerThumbs[index]) {
        nonBannerThumbs[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    } catch (error) {
      console.warn('Erro ao scrollar para miniatura:', error)
    }
  }, [safeQuerySelectorAll])

  // Setup do container dos botões com tratamento robusto
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

        // Remove container anterior se existir
        const existingContainer = parentElement.querySelector('.media-buttons-container')
        if (existingContainer) {
          existingContainer.remove()
        }

        // Cria um container para os botões
        const buttonContainer = document.createElement('div')
        buttonContainer.className = 'media-buttons-container'
        buttonContainer.style.width = 'fit-content'
        buttonContainer.style.display = 'flex'
        buttonContainer.style.justifyContent = 'start'
        buttonContainer.style.gap = '12px'
        buttonContainer.style.flexWrap = 'wrap'
        
        // Insere antes do elemento de thumbs
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

  // Controle das classes active com tratamento de erro
  const enforceActiveThumb = useCallback(() => {
    if (!isInitialized) return

    try {
      const allThumbs = safeQuerySelectorAll('.vtex-store-components-3-x-productImagesThumb')
      const nonBannerThumbs = allThumbs.filter(thumb => {
        const img = thumb.querySelector('img')
        return img && !img.alt?.toLowerCase().includes('banner-pdp')
      })

      if (activeThumbRef.current !== null && nonBannerThumbs[activeThumbRef.current]) {
        // Remove todas as classes ativas primeiro
        allThumbs.forEach(thumb => {
          thumb.classList.remove(
            'vtex-store-components-3-x-productImagesThumbActive',
            'vtex-store-components-3-x-productImagesThumbActive--pdp',
            'swiper-slide-active'
          )
        })

        // Aplica nossas classes no thumb correto
        nonBannerThumbs[activeThumbRef.current].classList.add(
          'vtex-store-components-3-x-productImagesThumbActive',
          'vtex-store-components-3-x-productImagesThumbActive--pdp',
          'swiper-slide-active'
        )

        // Atualiza os estados dos botões baseado no slide atual
        const { isAmbientActive, isVideoActive } = checkMediaActiveStates()
        setIsAmbientActive(isAmbientActive)
        setIsVideoActive(isVideoActive)
      }
    } catch (error) {
      console.warn('Erro ao aplicar classes ativas:', error)
    }
  }, [isInitialized, checkMediaActiveStates, safeQuerySelectorAll])

  // Navegação para uma mídia específica com tratamento seguro
  const navigateToMedia = useCallback((index) => {
    if (index === null) return

    try {
      activeThumbRef.current = index
      currentSlideRef.current = index

      // Navega para o slide usando o Swiper se disponível
      if (swiperInstance.current) {
        swiperInstance.current.slideTo(index)
      }
      
      // Scroll para a miniatura
      setTimeout(() => {
        scrollToThumb(index)
      }, 300)

      // Força a atualização das classes
      setTimeout(() => {
        enforceActiveThumb()
      }, 100)

      // Atualiza os estados dos botões
      const { isAmbientActive, isVideoActive } = checkMediaActiveStates()
      setIsAmbientActive(isAmbientActive)
      setIsVideoActive(isVideoActive)
    } catch (error) {
      console.warn('Erro na navegação de mídia:', error)
    }
  }, [enforceActiveThumb, checkMediaActiveStates, scrollToThumb])

  // Manipulador de clique nas thumbs com tratamento seguro
  const handleThumbClick = useCallback((e) => {
    try {
      const thumb = e.target.closest('.vtex-store-components-3-x-productImagesThumb')
      if (!thumb) return
      
      const allThumbs = safeQuerySelectorAll('.vtex-store-components-3-x-productImagesThumb')
      const nonBannerThumbs = allThumbs.filter(thumb => {
        const img = thumb.querySelector('img')
        return img && !img.alt?.toLowerCase().includes('banner-pdp')
      })
      const relativeIndex = nonBannerThumbs.indexOf(thumb)

      if (relativeIndex === -1) {
        e.preventDefault()
        e.stopPropagation()
        return
      }

      e.preventDefault()
      e.stopPropagation()
      
      // Atualiza o slide atual
      currentSlideRef.current = relativeIndex
      activeThumbRef.current = relativeIndex
      
      // Verifica os estados ativos e atualiza
      const { isAmbientActive, isVideoActive } = checkMediaActiveStates()
      setIsAmbientActive(isAmbientActive)
      setIsVideoActive(isVideoActive)
    } catch (error) {
      console.warn('Erro no clique da thumb:', error)
    }
  }, [checkMediaActiveStates, safeQuerySelectorAll])

  // Configuração do controle do Swiper principal e das thumbs
  useEffect(() => {
    if (!isInitialized) return

    const initSwiperControl = () => {
      try {
        const container = safeQuerySelector('.vtex-store-components-3-x-productImagesGallerySwiperContainer')
        const thumbsContainer = safeQuerySelector('.vtex-store-components-3-x-carouselGaleryThumbs .swiper-container')
        
        if (!container || !container.swiper) {
          initRetryCount.current++
          
          if (initRetryCount.current < 8) {
            setTimeout(initSwiperControl, 300)
          }
          return
        }

        swiperInstance.current = container.swiper
        
        // Configura o Swiper das thumbnails se disponível
        if (thumbsContainer && thumbsContainer.swiper) {
          thumbsSwiperInstance.current = thumbsContainer.swiper
        }
        
        // Configura o event listener para mudanças de slide
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
        
        // Inicializa o estado atual
        currentSlideRef.current = swiperInstance.current.realIndex
        activeThumbRef.current = swiperInstance.current.realIndex
        
        const { isAmbientActive, isVideoActive } = checkMediaActiveStates()
        setIsAmbientActive(isAmbientActive)
        setIsVideoActive(isVideoActive)

        // Intervalo de segurança para manter as classes sincronizadas
        if (updateInterval.current) {
          clearInterval(updateInterval.current)
        }
        updateInterval.current = setInterval(enforceActiveThumb, 2000)
      } catch (error) {
        console.warn('Erro na configuração do Swiper:', error)
      }
    }

    setTimeout(initSwiperControl, 1000)

    return () => {
      try {
        if (swiperInstance.current) {
          swiperInstance.current.off('slideChange')
        }
        if (updateInterval.current) {
          clearInterval(updateInterval.current)
        }
      } catch (error) {
        console.warn('Erro no cleanup do Swiper:', error)
      }
    }
  }, [isInitialized, enforceActiveThumb, checkMediaActiveStates, safeQuerySelector])

  // Event listener para clicks nas thumbs
  useEffect(() => {
    if (!isInitialized) return

    const setupEventListener = () => {
      try {
        const thumbsContainer = safeQuerySelector('.vtex-store-components-3-x-carouselGaleryThumbs')
        
        if (thumbsContainer) {
          thumbsContainer.addEventListener('click', handleThumbClick, true)
          return () => {
            try {
              thumbsContainer.removeEventListener('click', handleThumbClick, true)
            } catch (error) {
              console.warn('Erro ao remover event listener:', error)
            }
          }
        } else {
          document.addEventListener('click', handleThumbClick, true)
          return () => {
            try {
              document.removeEventListener('click', handleThumbClick, true)
            } catch (error) {
              console.warn('Erro ao remover event listener:', error)
            }
          }
        }
      } catch (error) {
        console.warn('Erro ao configurar event listener:', error)
        return () => {}
      }
    }

    const cleanup = setupEventListener()
    return cleanup
  }, [isInitialized, handleThumbClick, safeQuerySelector])

  // Efeito principal de inicialização
  useEffect(() => {
    if (!selectedItem?.images) return

    try {
      const filtered = selectedItem.images.filter(img =>
        !img.imageLabel?.toLowerCase().includes('banner-pdp')
      )
      setFilteredImages(filtered)

      // Busca os índices após um delay para garantir que o DOM esteja renderizado
      const initializeMediaIndexes = () => {
        try {
          const { ambientIndex, videoIndex } = findMediaIndexes()
          setAmbientIndex(ambientIndex)
          setVideoIndex(videoIndex)
          setIsAmbientActive(false)
          setIsVideoActive(false)
          setIsInitialized(false)
          setButtonReady(false)
          setHasError(false)
          initRetryCount.current = 0

          // Só continua se tiver pelo menos uma mídia
          if (ambientIndex !== null || videoIndex !== null) {
            setupButtonContainer()
            
            waitForImagesLoad(filtered).then(() => {
              setIsInitialized(true)
            })
          }
        } catch (error) {
          console.warn('Erro na inicialização de índices de mídia:', error)
          setHasError(true)
        }
      }

      // Delay para garantir que o DOM das thumbs esteja renderizado
      setTimeout(initializeMediaIndexes, 800)
    } catch (error) {
      console.warn('Erro no efeito principal:', error)
      setHasError(true)
    }
  }, [selectedItem, findMediaIndexes, setupButtonContainer, waitForImagesLoad])

  // Cleanup seguro
  useEffect(() => {
    return () => {
      try {
        if (buttonContainerRef.current && buttonContainerRef.current.parentNode) {
          buttonContainerRef.current.parentNode.removeChild(buttonContainerRef.current)
        }
        if (updateInterval.current) {
          clearInterval(updateInterval.current)
        }
      } catch (error) {
        console.warn('Erro no cleanup:', error)
      }
    }
  }, [])

  // Não renderiza em caso de erro ou se não tem condições
  if (hasError) {
    return null
  }

  // Não renderiza se não tem nenhuma mídia ou container não está pronto
  if ((ambientIndex === null && videoIndex === null) || !buttonReady || !buttonContainerRef.current) {
    return null
  }

  // Renderização segura com portal
  try {
    return createPortal(
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {/* Botão da Imagem Ambientada */}
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
              opacity: isAmbientActive ? 0 : 1
            }}
            aria-hidden={isAmbientActive}
          >
            Ver imagem ambientada
          </button>
        )}

        {/* Botão do Vídeo */}
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
              opacity: isVideoActive ? 0 : 1
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