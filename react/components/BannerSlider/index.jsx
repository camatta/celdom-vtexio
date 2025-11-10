import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/swiper-react.mjs'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { LinkArrow } from '../Icons'
import styles from './banner.slider.css'
import './swiper.css'
import './swiper-bundle.css'
import './bannerslider.css'

function ImageComponent({ imageItems, mobile }) {
  return (
    <>
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
          imageItems.map((item, index) =>
            !mobile ? (
              item.imageDesktop && (
                <SwiperSlide className="desktop" key={index}>
                  <img
                    className="image-banner"
                    src={item.imageDesktop}
                    alt={`Desktop Banner ${index}`}
                    loading="lazy"
                  />

                  {/* Texto e CTA adaptados do código antigo */}
                {item.linha1 && item.textoBotao && (
                  <div className={styles.textoBanner}>
                    <div className={styles.bannerCta}>
                      <p
                        className={styles.textoBannerCta}
                        dangerouslySetInnerHTML={{ __html: item.linha1 }}
                      />
                      <a
                        href={item.linkDesktop}
                        rel="noopener noreferrer"
                        className={styles.textoBannerCtaLink}
                      >
                        <span>{item.textoBotao}</span>
                        <LinkArrow />
                      </a>
                    </div>
                  </div>
                  )}
                </SwiperSlide>
              )
            ) : (
              item.imageMobile && (
                <SwiperSlide className="mobile" key={index}>
                  <img
                    className="image-banner"
                    src={item.imageMobile}
                    alt={`Mobile Banner ${index}`}
                    loading="lazy"
                  />

                  {/* Versão mobile da mesma seção */}
                  {item.linha1 && item.textoBotao && (
                    <div className="containerCentral-textoBanner">
                      <div className="bannerCta">
                        <p
                          className="linha1-textoBanner"
                          dangerouslySetInnerHTML={{ __html: item.linha1 }}
                        />
                        {item.linha2 && (
                          <p className="linha2-textoBanner">{item.linha2}</p>
                        )}
                        {item.badgeDesconto && (
                          <span className="badgeDesconto-textoBanner">
                            {item.badgeDesconto}
                          </span>
                        )}
                        <a
                          href={item.linkMobile}
                          rel="noopener noreferrer"
                          className="botao-textoBanner"
                        >
                          <span>{item.textoBotao}</span>
                          <LinkArrow />
                        </a>
                      </div>
                    </div>
                  )}
                </SwiperSlide>
              )
            )
          )}
      </Swiper>
    </>
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
            title: 'Linha 1 texto do banner (HTML permitido)',
          },
          linha2: {
            type: 'string',
            title: 'Linha 2 texto do banner (opcional)',
          },
          badgeDesconto: {
            type: 'string',
            title: 'Texto da tag de desconto (opcional)',
          },
          textoBotao: {
            type: 'string',
            title: 'Texto do botão (ex: "Saiba mais")',
          },
        },
        required: ['imageDesktop'],
      },
    },
  },
}

export default ImageComponent
