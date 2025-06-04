import { useEffect, useState, useRef } from 'react'
import { useProduct } from 'vtex.product-context'
import { createPortal } from 'react-dom'

const AmbientImageButton = () => {
  const { selectedItem } = useProduct()
  const [ambientIndex, setAmbientIndex] = useState(null)
  const [isAmbientActive, setIsAmbientActive] = useState(false)
  const [filteredImages, setFilteredImages] = useState([])
  const [isHovering, setIsHovering] = useState(false)
  const swiperInstance = useRef(null)
  const activeThumbRef = useRef(null)
  const updateInterval = useRef(null)
  const buttonContainerRef = useRef(null)

  // 1. Filtra imagens e encontra o índice relativo
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
  }, [selectedItem])

  // 2. Controle total das classes active
  const enforceActiveThumb = () => {
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

  // 3. Configuração do controle do Swiper
  useEffect(() => {
    const initSwiperControl = () => {
      const container = document.querySelector('.vtex-store-components-3-x-productImagesGallerySwiperContainer')
      if (!container || !container.swiper) return

      swiperInstance.current = container.swiper

      // Sobrescreve a função de update do Swiper
      const originalUpdate = swiperInstance.current.update
      swiperInstance.current.update = function() {
        originalUpdate.apply(this)
        enforceActiveThumb()
      }

      // Monitora mudanças para manter nosso controle
      swiperInstance.current.on('slideChange', enforceActiveThumb)
      
      // Força verificação a cada 300ms para garantir domínio
      updateInterval.current = setInterval(enforceActiveThumb, 300)
    }

    initSwiperControl()

    return () => {
      if (swiperInstance.current) {
        swiperInstance.current.off('slideChange', enforceActiveThumb)
      }
      if (updateInterval.current) {
        clearInterval(updateInterval.current)
      }
    }
  }, [filteredImages])

  // 4. Navegação com controle absoluto
  const navigateToImage = (relativeIndex) => {
    if (relativeIndex === null) return

    activeThumbRef.current = relativeIndex
    enforceActiveThumb() // Aplica imediatamente

    const allThumbs = [...document.querySelectorAll('.vtex-store-components-3-x-productImagesThumb')]
    const nonBannerThumbs = allThumbs.filter(thumb => 
      !thumb.querySelector('img')?.alt?.toLowerCase().includes('banner-pdp')
    )

    if (nonBannerThumbs[relativeIndex] && swiperInstance.current) {
      // Navega no Swiper usando o índice relativo
      swiperInstance.current.slideTo(relativeIndex)
    }

    setIsAmbientActive(relativeIndex === ambientIndex)
  }

  // 5. Manipulador de clique que previne o comportamento padrão
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

  // 6. Configuração inicial
  useEffect(() => {
    document.addEventListener('click', handleThumbClick, true)
    
    return () => {
      document.removeEventListener('click', handleThumbClick, true)
    }
  }, [])

  // 7. Encontrar o container pai e criar elemento para o botão
  useEffect(() => {
    const parentElement = document.querySelector('.vtex-store-components-3-x-carouselGaleryCursor')
    if (!parentElement) return

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
    }

    return () => {
      if (buttonContainerRef.current && buttonContainerRef.current.parentNode) {
        buttonContainerRef.current.parentNode.removeChild(buttonContainerRef.current)
      }
    }
  }, [])

  if (ambientIndex === null || !buttonContainerRef.current) return null

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