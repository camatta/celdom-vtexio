import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/swiper-react.mjs'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { LinkArrow } from '../Icons'
import styles from './banner.slider.css'
import './swiper.css'
import './swiper-bundle.css'
import './bannerslider.css'

function ImageComponent({ imageItems }) {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      slidesPerView={1}
      loop
      navigation
      autoplay={{ delay: 5000, pauseOnMouseEnter: true }}
      scrollbar={{ draggable: true }}
    >
      {imageItems &&
        imageItems.length > 0 &&
        imageItems.map((item, index) => {
          const descricao = item.descricao || item.description || item.badgeDesconto

          return (
            item.imageDesktop && (
              <SwiperSlide key={index}>
                <picture>
                  {item.imageMobile && (
                    <source media="(max-width: 768px)" srcSet={item.imageMobile} />
                  )}
                  <source media="(min-width: 769px)" srcSet={item.imageDesktop} />
                  <img
                    className="image-banner"
                    src={item.imageDesktop}
                    alt={item.alt || `Banner principal ${index + 1}`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'low'}
                  />
                </picture>

                {(item.linha1 || item.linha2 || descricao) && (
                  <div className={styles.textoBanner}>
                    <div className={styles.bannerCta}>
                      {item.linha1 && (
                        <p
                          className={styles.textoBannerEyebrow}
                          dangerouslySetInnerHTML={{ __html: item.linha1 }}
                        />
                      )}
                      {item.linha2 && (
                        <p className={styles.textoBannerTitulo}>{item.linha2}</p>
                      )}
                      {descricao && (
                        <p className={styles.textoBannerDescricao}>{descricao}</p>
                      )}
                      {item.textoBotao && (
                        <a
                          href={item.linkDesktop || item.linkMobile}
                          rel="noopener noreferrer"
                          className={styles.textoBannerCtaLink}
                        >
                          <span>{item.textoBotao}</span>
                          <LinkArrow />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </SwiperSlide>
            )
          )
        })}
    </Swiper>
  )
}

ImageComponent.schema = {
  title: 'Celdom Banner Carrossel',
  type: 'object',
  properties: {
    imageItems: {
      type: 'array',
      title: 'Image Items',
      description: 'Adicione imagens, links e textos do carrossel.',
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
          linkDesktop: {
            type: 'string',
            format: 'uri',
            title: 'Desktop Imagem Link',
          },
          imageMobile: {
            type: 'string',
            format: 'uri',
            title: 'Mobile Imagem URL',
            widget: {
              'ui:widget': 'image-uploader',
            },
          },
          linkMobile: {
            type: 'string',
            format: 'uri',
            title: 'Mobile Imagem Link',
          },
          linha1: {
            type: 'string',
            title: 'Chamada superior do banner (HTML permitido)',
          },
          linha2: {
            type: 'string',
            title: 'Titulo principal do banner',
          },
          descricao: {
            type: 'string',
            title: 'Descricao do banner',
          },
          badgeDesconto: {
            type: 'string',
            title: 'Descricao do banner (legado)',
          },
          textoBotao: {
            type: 'string',
            title: 'Texto do botao (ex: "Conheca")',
          },
          alt: {
            type: 'string',
            title: 'Texto alternativo da imagem',
          },
        },
        required: ['imageDesktop'],
      },
    },
  },
}

export default ImageComponent
