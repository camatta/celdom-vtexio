import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'vtex.render-runtime'

import { LinkArrow, SliderArrowNext, SliderArrowPrev } from '../Icons'

import styles from './banner.slider.css'

function ImageComponent({ imageItems }) {
  const swiperContainerRef = useRef(null)
  const [swiperInstance, setSwiperInstance] = useState(null)
  const [imagesLoaded, setImagesLoaded] = useState(false) // Estado para controlar o carregamento das imagens
  const [isSwiperInitialized, setIsSwiperInitialized] = useState(false) // Verifica se o Swiper foi inicializado
  const [loading, setLoading] = useState(true) // Estado para controlar o carregamento do swiper

  // Função para verificar se todas as imagens foram carregadas
  const handleImageLoad = () => {
    const images = document.querySelectorAll('.swiper-slide img')
    const loadedImages = Array.from(images).filter(img => img.complete)

    // Verifica se todas as imagens foram carregadas
    if (loadedImages.length === images.length) {
      setImagesLoaded(true) // Todas as imagens foram carregadas
    }
  }

  // Memoriza a função `initializeSwiper` para evitar sua recriação a cada renderização
  const initializeSwiper = useCallback(() => {
    if (swiperContainerRef.current && !swiperInstance) {
      const swiper = new window.Swiper(swiperContainerRef.current, {
        spaceBetween: 0,
        slidesPerView: 1,
        loop: true,
        /* autoplay: {
          delay: 5000, // Tempo em ms entre as transições (5 segundos)
          disableOnInteraction: false, // Permite que o autoplay continue após interação do usuário
          pauseOnMouseEnter: true, // Pausa o autoplay ao passar o mouse sobre o carrossel
        }, */
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        keyboard: {
          enabled: true, // Habilita a navegação por teclado
          onlyInViewport: true, // A navegação por teclado só funcionará quando o swiper estiver visível
        }
      })

      setSwiperInstance(swiper) // Armazena a instância do Swiper
      setIsSwiperInitialized(true) // Marca o Swiper como inicializado
      setLoading(false) // Finaliza o carregamento
    }
  }, [swiperContainerRef, swiperInstance])

  useEffect(() => {
    // Verifica se estamos no ambiente do navegador antes de usar `window` e `document`
    if (typeof window === 'undefined') return

    if (!window.Swiper) {
      const script = document.createElement('script')

      script.src = 'https://unpkg.com/swiper/swiper-bundle.min.js'
      script.async = true
      script.onload = () => {
        initializeSwiper()
      }

      document.body.appendChild(script)
    } else {
      initializeSwiper()
    }

    // Adiciona o link para o CSS do Swiper
    const link = document.createElement('link')

    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/swiper/swiper-bundle.min.css'
    document.head.appendChild(link)

    // Cleanup: remove o link e o script quando o componente for desmontado
    return () => {
      document.head.removeChild(
        document.querySelector(
          'link[href="https://unpkg.com/swiper/swiper-bundle.min.css"]'
        )
      )
      const scripts = document.querySelectorAll(
        'script[src="https://unpkg.com/swiper/swiper-bundle.min.js"]'
      )

      scripts.forEach(script => script.remove())
    }
  }, [initializeSwiper])

  // Inicializa o Swiper somente após as imagens terem sido carregadas
  useEffect(() => {
    if (imagesLoaded) {
      initializeSwiper() // Inicializa o Swiper quando todas as imagens estiverem carregadas
    }

  }, [imagesLoaded, initializeSwiper])

  return (
    <article className={styles.bannerWrapper}>
      <style>{`
        .swiper-container {
          position: relative;
          width: 100%;
          height: auto;
          overflow: hidden;
          display: ${isSwiperInitialized ? 'block' : 'none'};
          transition: opacity 0.5s ease-in-out;
          opacity: ${loading ? '0' : '1'}; /* Transição suave de opacidade */
        }

        .single-banner {
          display: ${isSwiperInitialized ? 'none' : 'block'};
        }
      `}</style>

      {/* Exibe a primeira imagem antes do carrossel */}
      {!isSwiperInitialized && imageItems && imageItems.length > 0 && (
        <div className={`single-banner ${styles.singleBanner}`}>
          <Link
            to={imageItems[0]?.linkDesktop}
            rel="noopener noreferrer"
          >
            <picture className={styles.pictureBanner}>
              <source media="(min-width:992px)" srcSet={imageItems[0]?.imageDesktop} />
              <img
                src={imageItems[0]?.imageMobile || imageItems[0]?.imageDesktop}
                alt={`${imageItems[0]?.textoBotao}`}
                className={`single-banner ${styles.imageBanner}`} />
            </picture>
          </Link>
        </div>
      )}

      {/* Swiper Container */}
      <div ref={swiperContainerRef} className={`swiper-container ${styles.swiperContainer}`}>
        <div className={`swiper-wrapper ${styles.swiperWrapper}`}>
        {imageItems &&
            imageItems.length > 0 &&
            imageItems.map((item, index) => (
              <div className={`swiper-slide ${styles.swiperSlide}`} key={index}>
                {item.imageDesktop && (
                  <div className={styles.imageContainer}>
                    <>
                        { item?.linha1 && item?.textoBotao ? (
                          <>
                            <picture className={styles.pictureBanner}>
                              <source media="(min-width:992px)" srcSet={item?.imageDesktop} />
                              <img
                                src={item?.imageMobile || item?.imageDesktop}
                                alt={`${item.textoBotao}`}
                                className={`image-banner ${styles.imageBanner}`}
                                onLoad={handleImageLoad} />
                            </picture>

                            <div className={styles.textoBanner}>
                              <div className={styles.bannerCta}>
                                <p className={styles.textoBannerCta} dangerouslySetInnerHTML={{
                                  __html: item.linha1
                                }} />
                                
                                <Link
                                  to={item?.linkDesktop}
                                  rel="noopener noreferrer"
                                  className={styles.textoBannerCtaLink}
                                >
                                  <span>{item.textoBotao}</span>
                                  <LinkArrow />
                                </Link>
                              </div>
                            </div>
                          </>
                        ) : (
                          <Link to={item?.linkDesktop} rel="noopener noreferrer">
                            <picture className={styles.pictureBanner}>
                              <source media="(min-width:992px)" srcSet={item.imageDesktop} />
                              <img
                                src={item?.imageMobile || item?.imageDesktop}
                                alt={`${item?.textoBotao}`}
                                className={`image-banner ${styles.imageBanner}`}
                                onLoad={handleImageLoad} />
                            </picture>
                          </Link>
                        )}
                      </>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Paginação, Navegação */}
        <div className={`custom-container ${styles.customContainer}`}>
          <button className={`swiper-button-next ${styles.swiperButtonNext} ${styles.swiperButton}`}>
            <SliderArrowNext />
          </button>
          <button className={`swiper-button-prev ${styles.swiperButtonPrev} ${styles.swiperButton}`}>
            <SliderArrowPrev />
          </button>
        </div>
        <div className={`swiper-pagination ${styles.swiperPagination}`} />
      </div>
    </article>
  )
}

ImageComponent.schema = {
  title: 'Banner Carrossel',
  type: 'object',
  properties: {
    imageItems: {
      type: 'array',
      title: 'Image Items',
      description: 'Add images and links to the banner carousel.',
      items: {
        type: 'object',
        properties: {
          imageDesktop: {
            type: 'string',
            format: 'uri',
            title: 'Desktop Imagem URL',
            widget: {
              'ui:widget': 'image-uploader',
            },
          },
          imageMobile: {
            type: 'string',
            format: 'uri',
            title: 'Mobile Imagem URL',
            widget: {
              'ui:widget': 'image-uploader',
            },
          },
          linha1: {
            type: 'string',
            title: 'Linha 1 texto do banner',
          },
          textoBotao: {
            type: 'string',
            title: 'Texto do botão',
          },
          linkDesktop: {
            type: 'string',
            format: 'uri',
            title: 'URL',
          }
        },
        required: ['imageDesktop'],
      },
    },
  },
}

export default ImageComponent