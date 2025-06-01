import { useEffect, useState } from 'react'
import { useProduct } from 'vtex.product-context'

const AmbientImageButton = () => {
  const { selectedItem } = useProduct()
  const [ambientIndex, setAmbientIndex] = useState(null)
  const [isAmbientActive, setIsAmbientActive] = useState(false)
  const [filteredImages, setFilteredImages] = useState([])
  const [isHovering, setIsHovering] = useState(false)

  // 1. Filtra imagens e encontra o índice relativo (sem banners)
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

  // 2. Navegação usando o índice relativo
  const navigateToAmbientImage = () => {
    if (ambientIndex === null) return

    const swiper = document.querySelector('.vtex-store-components-3-x-productImagesGallerySwiperContainer')?.swiper
    if (swiper) {
      swiper.slideTo(ambientIndex)
      return
    }

    const allThumbs = [...document.querySelectorAll('.vtex-store-components-3-x-productImagesThumb')]
      .filter(thumb => !thumb.querySelector('img')?.alt?.toLowerCase().includes('banner-pdp'))

    if (allThumbs[ambientIndex]) {
      allThumbs[ambientIndex].click()
    }
  }

  // 3. Monitoramento de imagem ativa
  useEffect(() => {
    const swiperContainer = document.querySelector('.vtex-store-components-3-x-productImagesGallerySwiperContainer')
    const swiper = swiperContainer?.swiper

    const checkActiveImage = () => {
      if (swiper) {
        const currentImage = swiper.slides[swiper.activeIndex]?.querySelector('img')
        const isActive = currentImage?.alt?.toLowerCase() === 'img-ambientada' ||
          swiper.activeIndex === ambientIndex
        setIsAmbientActive(isActive)
      } else {
        const mainImage = document.querySelector('.vtex-store-components-3-x-productImageTag--main')
        setIsAmbientActive(mainImage?.alt?.toLowerCase() === 'img-ambientada')
      }
    }

    if (swiper) {
      swiper.on('slideChange', checkActiveImage)
    }

    const interval = setInterval(checkActiveImage, 1000)

    checkActiveImage()

    return () => {
      swiper?.off('slideChange', checkActiveImage)
      clearInterval(interval)
    }
  }, [ambientIndex])

  if (ambientIndex === null) return null

  return (
    <button
      onClick={navigateToAmbientImage}
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
    </button>
  )
}

export default AmbientImageButton
