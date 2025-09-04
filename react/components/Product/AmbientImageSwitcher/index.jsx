import { useEffect, useState, useRef } from 'react'
import { useProduct } from 'vtex.product-context'
import { createPortal } from 'react-dom'



const AmbientImageButton = () => {
  const { selectedItem } = useProduct()
  const [ambientIndex, setAmbientIndex] = useState(null)
  const [isAmbientActive, setIsAmbientActive] = useState(false)
  const [filteredImages, setFilteredImages] = useState([])
  const [isHovering, setIsHovering] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [buttonReady, setButtonReady] = useState(false)
  const swiperInstance = useRef(null)
  const activeThumbRef = useRef(null)
  const updateInterval = useRef(null)
  const buttonContainerRef = useRef(null)
  const initRetryCount = useRef(0)

  // 1. Aguardar carregamento das imagens (mais tolerante)
  const waitForImagesLoad = (images) => {
    return new Promise((resolve) => {
      if (!images || images.length === 0) {
        resolve()
        return
      }

      // Timeout para não travar indefinidamente
      const timeout = setTimeout(() => {
        console.log('Timeout no carregamento das imagens, continuando...')
        resolve()
      }, 5000)

      const imagePromises = images.slice(0, 3).map(img => { // Só aguarda as 3 primeiras
        return new Promise((resolveImg) => {
          const image = new Image()
          const timer = setTimeout(resolveImg, 2000) // 2s timeout por imagem
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
      })
    })
  }

  // 2. Filtra imagens e encontra o índice relativo
  useEffect(() => {
    if (!selectedItem?.images) return

    const filtered = selectedItem.images.filter(img =>
      !img.imageLabel?.toLowerCase().includes('banner-pdp')
    )
    setFilteredImages(filtered)

    const relativeIndex = filtered.findIndex(img =>
      img.imageLabel?.toLowerCase() === 'img-ambientada'
    )

    setAmbientIndex(relativeIndex >= 0 ? relativeIndex : null)
    setIsAmbientActive(false)
    setIsInitialized(false)
    setButtonReady(false)
    initRetryCount.current = 0

    if (relativeIndex >= 0) { // Só continua se tem imagem ambientada
      // Setup do container do botão ANTES de aguardar imagens
      setupButtonContainer()
      
      // Aguardar carregamento das imagens
      waitForImagesLoad(filtered).then(() => {
        setIsInitialized(true)
        // Delay menor para inicialização
        setTimeout(() => {
          console.log('Sistema inicializado')
        }, 200)
      })
    }
  }, [selectedItem])

  // 3. Setup do container do botão (função separada para reutilizar)
  const setupButtonContainer = () => {
    const findAndSetupContainer = () => {
      const parentElement = document.querySelector('.vtex-store-components-3-x-carouselGaleryCursor')
      if (!parentElement) {
        setTimeout(findAndSetupContainer, 200)
        return
      }

      // Remove container anterior se existir
      if (buttonContainerRef.current && buttonContainerRef.current.parentNode) {
        buttonContainerRef.current.parentNode.removeChild(buttonContainerRef.current)
      }

      // Cria um container para o botão
      const buttonContainer = document.createElement('div')
      buttonContainer.className = 'ambient-button-container'
      buttonContainer.style.width = '100%'
      buttonContainer.style.display = 'flex'
      buttonContainer.style.justifyContent = 'start'
      
      // Insere antes do elemento de thumbs
      const thumbsElement = parentElement.querySelector('.vtex-store-components-3-x-carouselGaleryThumbs')
      if (thumbsElement) {
        parentElement.insertBefore(buttonContainer, thumbsElement)
        buttonContainerRef.current = buttonContainer
        setButtonReady(true)
        console.log('Container do botão criado')
      } else {
        setTimeout(findAndSetupContainer, 200)
      }
    }

    findAndSetupContainer()
  }

  // 4. Controle das classes active (menos agressivo)
  const enforceActiveThumb = () => {
    if (!isInitialized) return

    const allThumbs = [...document.querySelectorAll('.vtex-store-components-3-x-productImagesThumb')]
    const nonBannerThumbs = allThumbs.filter(thumb => 
      !thumb.querySelector('img')?.alt?.toLowerCase().includes('banner-pdp')
    )

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
    }
  }

  // 5. Configuração do controle do Swiper com retry (só se necessário)
  useEffect(() => {
    if (!isInitialized) return

    const initSwiperControl = () => {
      const container = document.querySelector('.vtex-store-components-3-x-productImagesGallerySwiperContainer')
      
      if (!container || !container.swiper) {
        initRetryCount.current++
        
        if (initRetryCount.current < 5) { // Menos tentativas
          setTimeout(initSwiperControl, 300)
        }
        return
      }

      swiperInstance.current = container.swiper
      swiperInstance.current.on('slideChange', enforceActiveThumb)
      
      // Intervalo apenas se necessário
      if (updateInterval.current) {
        clearInterval(updateInterval.current)
      }
      updateInterval.current = setInterval(enforceActiveThumb, 3000)
      
      console.log('Swiper controlado')
    }

    // Delay para dar tempo do Swiper inicializar
    setTimeout(initSwiperControl, 1000)

    return () => {
      if (swiperInstance.current) {
        swiperInstance.current.off('slideChange', enforceActiveThumb)
      }
      if (updateInterval.current) {
        clearInterval(updateInterval.current)
      }
    }
  }, [isInitialized])

  // 6. Navegação com controle absoluto
  const navigateToImage = (relativeIndex) => {
    if (relativeIndex === null) return

    activeThumbRef.current = relativeIndex

    const allThumbs = [...document.querySelectorAll('.vtex-store-components-3-x-productImagesThumb')]
    const nonBannerThumbs = allThumbs.filter(thumb => 
      !thumb.querySelector('img')?.alt?.toLowerCase().includes('banner-pdp')
    )

    if (nonBannerThumbs[relativeIndex] && swiperInstance.current) {
      swiperInstance.current.slideTo(relativeIndex)
      setTimeout(enforceActiveThumb, 100)
    }

    setIsAmbientActive(relativeIndex === ambientIndex)
  }

  // 7. Manipulador de clique
  const handleThumbClick = (e) => {
    const thumb = e.target.closest('.vtex-store-components-3-x-productImagesThumb')
    if (!thumb) return
    
    const allThumbs = [...document.querySelectorAll('.vtex-store-components-3-x-productImagesThumb')]
    const nonBannerThumbs = allThumbs.filter(thumb => 
      !thumb.querySelector('img')?.alt?.toLowerCase().includes('banner-pdp')
    )
    const relativeIndex = nonBannerThumbs.indexOf(thumb)

    if (relativeIndex === -1) {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
      return
    }

    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    
    navigateToImage(relativeIndex)
  }

  // 8. Event listener (só se inicializado)
  useEffect(() => {
    if (!isInitialized) return

    const setupEventListener = () => {
      const thumbsContainer = document.querySelector('.vtex-store-components-3-x-carouselGaleryThumbs')
      
      if (thumbsContainer) {
        thumbsContainer.addEventListener('click', handleThumbClick, true)
        return () => thumbsContainer.removeEventListener('click', handleThumbClick, true)
      } else {
        document.addEventListener('click', handleThumbClick, true)
        return () => document.removeEventListener('click', handleThumbClick, true)
      }
    }

    const cleanup = setupEventListener()
    return cleanup
  }, [isInitialized])

  // Cleanup geral
  useEffect(() => {
    return () => {
      if (buttonContainerRef.current && buttonContainerRef.current.parentNode) {
        buttonContainerRef.current.parentNode.removeChild(buttonContainerRef.current)
      }
    }
  }, [])

  // Renderiza o botão se tem índice ambientado E container pronto
  if (ambientIndex === null || !buttonReady || !buttonContainerRef.current) {
    return null
  }

  return createPortal(
    <button
      onClick={() => navigateToImage(ambientIndex)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        display: isAmbientActive ? 'none' : 'block',
        border: `1px solid ${isHovering ? '#FE5000' : '#CCCCCC'}`,
        borderRadius: '40px',
        color: '#2D2926',
        fontWeight: 700,
        fontSize: '12px',
        backgroundColor: 'transparent',
        width: '192px',
        height: '32px',
        cursor: 'pointer',
        marginTop: '16px',
        transition: 'border 0.3s ease, opacity 0.3s ease'
      }}
      aria-hidden={isAmbientActive}
    >
      Ver imagem ambientada
    </button>,
    buttonContainerRef.current
  )
}


export default AmbientImageButton