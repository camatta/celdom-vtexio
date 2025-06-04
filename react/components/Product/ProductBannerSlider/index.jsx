import React, { useEffect, useRef, useState } from 'react'
import { useProduct } from 'vtex.product-context'
import styles from './ProductBannerSlider.css'

const ProductBannerSlider = () => {
  const productContext = useProduct()
  const selectedItem = productContext?.selectedItem

  const [banners, setBanners] = useState([])
  const [isMobile, setIsMobile] = useState(false)
  const sliderRef = useRef(null)
  const slidesContainerRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [isAnimating, setIsAnimating] = useState(false)

  // Detecta mudanças no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      setIsMobile(window.innerWidth < 640)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Atualiza banners quando o item selecionado ou tamanho da tela muda
  useEffect(() => {
    if (!selectedItem?.images) {
      setBanners([])
      return
    }

    const bannerLabel = isMobile ? 'banner-pdp-mob' : 'banner-pdp'
    const filteredBanners = selectedItem.images
      .filter(img => img.imageLabel?.toLowerCase() === bannerLabel)
      .map(img => img.imageUrl)

    setBanners(filteredBanners)
    setCurrentIndex(0)
  }, [selectedItem, isMobile])

  // Rotação automática dos banners
  useEffect(() => {
    if (banners.length <= 1 || isAnimating) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [banners.length, isAnimating])

  // Efeito para transição suave
  useEffect(() => {
    if (!slidesContainerRef.current || banners.length <= 1) return

    setIsAnimating(true)
    
    const slideWidth = sliderRef.current.offsetWidth
    slidesContainerRef.current.style.transform = `translateX(-${currentIndex * slideWidth}px)`

    const timer = setTimeout(() => {
      setIsAnimating(false)
    }, 700) // Tempo deve corresponder à duração da transição no CSS

    return () => clearTimeout(timer)
  }, [currentIndex, banners.length, windowWidth])

  if (!banners.length) return null

  return (
    <div className="banner-slider-wrapper" style={wrapperStyle}>
      <div className={styles.bannerSliderContainer} style={containerStyle}>
        <div
          ref={sliderRef}
          className={styles.bannerSlider}
          style={sliderStyle}
        >
          <div 
            ref={slidesContainerRef}
            className={styles.slidesContainer}
            style={{
              display: 'flex',
              width: `${banners.length * 100}%`,
            }}
          >
            {banners.map((url, index) => (
              <div 
                key={`${url}-${index}`} 
                style={{
                  ...slideStyle,
                  width: `${100 / banners.length}%`,
                }}
              >
                <img
                  src={url}
                  alt={`Banner ${index + 1}`}
                  style={imageStyle}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {banners.length > 1 && (
          <div className="slider-dots" style={dotsContainerStyle}>
            {banners.map((_, index) => (
              <button
                key={index}
                style={{
                  ...dotStyle,
                  backgroundColor: index === currentIndex ? '#FE5000' : '#2D2926',
                  width: index === currentIndex ? '73px' : '39px',
                }}
                onClick={() => !isAnimating && setCurrentIndex(index)}
                aria-label={`Ir para banner ${index + 1}`}
                disabled={isAnimating}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Estilos atualizados
const wrapperStyle = {
  width: '100%',
  padding: '0 16px',
  boxSizing: 'border-box',
}

const containerStyle = {
  maxWidth: '1140px',
  margin: '0 auto',
}

const sliderStyle = {
  overflow: 'hidden',
  position: 'relative',
}

const slideStyle = {
  flexShrink: 0,
}

const imageStyle = {
  width: '100%',
  height: 'auto',
  display: 'block',
  borderRadius: '4px',
}

const dotsContainerStyle = {
  display: 'flex',
  justifyContent: 'start',
  gap: '8px',
  marginTop: '16px',
}

const dotStyle = {
  height: '4px',
  borderRadius: '4px',
  transition: 'all 0.3s ease',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
}

export default ProductBannerSlider