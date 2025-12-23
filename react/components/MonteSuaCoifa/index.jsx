// /react/components/MonteSuaCoifa/index.jsx
import React, { useState } from 'react'
import styles from './montesuacoifa.css'

import p1r1 from '../../../assets/MonteSuaCoifa/p1r1.png'
import p1r2 from '../../../assets/MonteSuaCoifa/p1r2.png'
import p1r3 from '../../../assets/MonteSuaCoifa/p1r3.png'
import p1r4 from '../../../assets/MonteSuaCoifa/p1r4.png'

/**
 * Cada opção possui:
 * - id: identificador único interno
 * - label: texto mostrado ao usuário
 * - imageUrl: imagem exibida no card
 * - searchFilter: string de filtro que será enviada à API VTEX
 *   Exemplo: "specificationFilter_10:Cozinha"
 *
 * Ajuste os searchFilter conforme seus atributos reais.
 */

const QUESTIONS = [
  {
    id: 'ambiente',
    title: 'Qual é o ambiente de instalação?',
    description:
      'O ambiente define o estilo e a necessidade de ventilação, garantindo o melhor desempenho e integração com o espaço.',
    options: [
      {
        id: 'cozinha',
        label: 'Cozinha',
        imageUrl: p1r1,
        searchFilter: 'specificationFilter_10:Cozinha',
      },
      {
        id: 'industrial',
        label: 'Cozinha de Industrial',
        imageUrl: p1r2,
        searchFilter: 'specificationFilter_10:Cozinha Industrial',
      },
      {
        id: 'varanda',
        label: 'Varanda',
        imageUrl: p1r3,
        searchFilter: 'specificationFilter_10:Varanda',
      },
      {
        id: 'gourmet',
        label: 'Área Gourmet',
        imageUrl: p1r4,
        searchFilter: 'specificationFilter_10:Área Gourmet',
      },
    ],
  },
  {
    id: 'ondeInstalar',
    title: 'Onde você pretende instalar?',
    description:
      'A escolha do modo de instalação garante o encaixe perfeito no seu espaço, seja em parede ou ilha.',
    options: [
      {
        id: 'parede',
        label: 'Parede',
        imageUrl: '/arquivos/msc-tipo-parede.jpg',
        searchFilter: 'specificationFilter_11:Parede',
      },
      {
        id: 'ilha',
        label: 'Ilha',
        imageUrl: '/arquivos/msc-tipo-ilha.jpg',
        searchFilter: 'specificationFilter_11:Ilha',
      },
      {
        id: 'embutida',
        label: 'Embutida',
        imageUrl: '/arquivos/msc-tipo-embutida.jpg',
        searchFilter: 'specificationFilter_11:Embutida',
      },
    ],
  },
  {
    id: 'formato',
    title: 'Qual formato atende melhor sua cozinha?',
    description:
      'Selecione a opção que combina com o espaço do seu ambiente.',
    options: [
      {
        id: '60cm',
        label: 'Até 60cm',
        imageUrl: '/arquivos/msc-fogao-60.jpg',
        searchFilter: 'specificationFilter_12:60 cm',
      },
      {
        id: '75cm',
        label: 'De 70 a 75cm',
        imageUrl: '/arquivos/msc-fogao-75.jpg',
        searchFilter: 'specificationFilter_12:75 cm',
      },
      {
        id: '90cm',
        label: 'A partir de 90cm',
        imageUrl: '/arquivos/msc-fogao-90.jpg',
        searchFilter: 'specificationFilter_12:90 cm',
      },
    ],
  },
  {
    id: 'modelo',
    title: 'Qual modelo você prefere?',
    description:
      'O modelo define o estilo e a linha do produto, alinhando design e funcionalidade à sua cozinha.',
    options: [
      {
        id: 'ocasional',
        label: 'Ocasional',
        imageUrl: '/arquivos/msc-frequencia-ocasional.jpg',
        searchFilter: 'specificationFilter_13:Ocasional',
      },
      {
        id: 'diaria',
        label: 'Diariamente',
        imageUrl: '/arquivos/msc-frequencia-diaria.jpg',
        searchFilter: 'specificationFilter_13:Diária',
      },
      {
        id: 'intensa',
        label: 'Uso intenso',
        imageUrl: '/arquivos/msc-frequencia-intensa.jpg',
        searchFilter: 'specificationFilter_13:Intenso',
      },
    ],
  },
  {
    id: 'mediaIdeal',
    title: 'Qual a medida ideal para o seu espaço?',
    description:
      'A medida deve ser compatível com o tamanho do fogão ou área de cocção para garantir eficiência máxima.',
    options: [
      {
        id: 'exaustao',
        label: 'Exaustão (saída externa)',
        imageUrl: '/arquivos/msc-tipo-ev-exaustao.jpg',
        searchFilter: 'specificationFilter_14:Exaustão',
      },
      {
        id: 'depuracao',
        label: 'Depuração (sem saída externa)',
        imageUrl: '/arquivos/msc-tipo-ev-depuracao.jpg',
        searchFilter: 'specificationFilter_14:Depuração',
      },
    ],
  },
  {
    id: 'acabamento',
    title: 'Qual acabamento você prefere?',
    description:
      'O acabamento dá o toque final ao design, harmonizando com o estilo e a paleta da sua cozinha.',
    options: [
      {
        id: 'flat',
        label: 'Flat / Minimalista',
        imageUrl: '/arquivos/msc-estilo-flat.jpg',
        searchFilter: 'specificationFilter_15:Flat',
      },
      {
        id: 'clássica',
        label: 'Clássica',
        imageUrl: '/arquivos/msc-estilo-classica.jpg',
        searchFilter: 'specificationFilter_15:Clássica',
      },
      {
        id: 'industrial',
        label: 'Industrial',
        imageUrl: '/arquivos/msc-estilo-industrial.jpg',
        searchFilter: 'specificationFilter_15:Industrial',
      },
    ],
  },
  {
    id: 'instalacao',
    title: 'Como será feita a instalação da coifa?',
    description:
      'O tipo de instalação define onde o motor e os componentes da coifa ficarão posicionados, influenciando diretamente o nível de ruído e a eficiência do sistema.',
    options: [
      {
        id: 'inox',
        label: 'Inox',
        imageUrl: '/arquivos/msc-acabamento-inox.jpg',
        searchFilter: 'specificationFilter_16:Inox',
      },
      {
        id: 'preto',
        label: 'Preto',
        imageUrl: '/arquivos/msc-acabamento-preto.jpg',
        searchFilter: 'specificationFilter_16:Preto',
      },
      {
        id: 'branco',
        label: 'Branco',
        imageUrl: '/arquivos/msc-acabamento-branco.jpg',
        searchFilter: 'specificationFilter_16:Branco',
      },
    ],
  },
  {
    id: 'instalacaoCoifa',
    title: 'Como será feita a instalação da coifa?',
    description:
      'O tipo de instalação define onde o motor e os componentes da coifa ficarão posicionados, influenciando diretamente o nível de ruído e a eficiência do sistema.',
    options: [
      {
        id: 'baixoRuido',
        label: 'Sim, priorizo baixo ruído',
        imageUrl: '/arquivos/msc-ruido-baixo.jpg',
        searchFilter: 'specificationFilter_17:Baixo ruído',
      },
      {
        id: 'media',
        label: 'Tanto faz',
        imageUrl: '/arquivos/msc-ruido-normal.jpg',
        searchFilter: 'specificationFilter_17:Indiferente',
      },
    ],
  },
  {
    id: 'tipoComando',
    title: 'Qual tipo de comando você prefere?',
    description:
      'O tipo de comando afeta a experiência de uso, permitindo ajustes de velocidade e iluminação com praticidade.',
    options: [
      {
        id: 'entrada',
        label: 'Até R$ 2.000',
        imageUrl: '/arquivos/msc-orcamento-entrada.jpg',
        searchFilter: 'specificationFilter_18:Até 2000',
      },
      {
        id: 'medio',
        label: 'De R$ 2.000 a R$ 4.000',
        imageUrl: '/arquivos/msc-orcamento-medio.jpg',
        searchFilter: 'specificationFilter_18:2000 a 4000',
      },
      {
        id: 'premium',
        label: 'Acima de R$ 4.000',
        imageUrl: '/arquivos/msc-orcamento-premium.jpg',
        searchFilter: 'specificationFilter_18:Acima de 4000',
      },
    ],
  },
  {
    id: 'filtro',
    title: 'Qual tipo de filtro você prefere?',
    description:
      'O filtro é o responsável por reter gordura e impurezas, garantindo o bom funcionamento da coifa e a limpeza do ambiente. A escolha do tipo ideal influencia diretamente a durabilidade e a eficiência da sucção.',
    options: [
      {
        id: 'linhaA',
        label: 'Linha A',
        imageUrl: '/arquivos/msc-linha-a.jpg',
        searchFilter: 'specificationFilter_19:Linha A',
      },
      {
        id: 'linhaB',
        label: 'Linha B',
        imageUrl: '/arquivos/msc-linha-b.jpg',
        searchFilter: 'specificationFilter_19:Linha B',
      },
      {
        id: 'semPreferencia',
        label: 'Sem preferência',
        imageUrl: '/arquivos/msc-linha-qualquer.jpg',
        searchFilter: '', // sem filtro
      },
    ],
  },
]

const formatPrice = (value) => {
  if (typeof value !== 'number') return null
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

const MonteSuaCoifa = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [products, setProducts] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [hasFinished, setHasFinished] = useState(false)

  const totalSteps = QUESTIONS.length
  const step = QUESTIONS[currentStep]
  const selectedOption = answers[step.id]
  const progressPercent = ((currentStep + 1) / totalSteps) * 100

  const handleSelectOption = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }))
  }

  const scrollTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNext = async () => {
    // ainda tem perguntas
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
      scrollTop()
      return
    }

    // última pergunta -> buscar produtos
    setIsLoadingProducts(true)
    try {
      const filters = Object.values(answers)
        .map((answer) => answer && answer.searchFilter)
        .filter((f) => f && f.trim() !== '')

      const params = new URLSearchParams()
      params.append('ft', '') // sem termo livre, só filtros

      filters.forEach((fq) => {
        params.append('fq', fq)
      })

      const response = await fetch(
        `/api/catalog_system/pub/products/search?${params.toString()}`
      )

      if (!response.ok) {
        throw new Error('Erro ao buscar produtos')
      }

      const data = await response.json()
      setProducts(data)
      setHasFinished(true)
      scrollTop()
    } catch (error) {
      console.error('[MonteSuaCoifa] Erro ao buscar produtos', error)
      setProducts([])
      setHasFinished(true)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const handlePrev = () => {
    if (currentStep === 0) return
    setCurrentStep((prev) => prev - 1)
    scrollTop()
  }

  const handleRestart = () => {
    setAnswers({})
    setProducts([])
    setHasFinished(false)
    setCurrentStep(0)
    scrollTop()
  }

  // Tela final de resultado
  if (hasFinished) {
    return (
      <section className={styles.mscContainer}>
        <button
          type="button"
          className={styles.mscBackButton}
          onClick={handleRestart}
        >
          ← Refazer quiz
        </button>

        <header className={styles.mscHeader}>
          <h2 className={styles.mscTitle}>
            Separamos alguns produtos para você
          </h2>
          <p className={styles.mscSubtitle}>
            Com base nas suas escolhas, filtramos as melhores opções que se
            encaixam perfeitamente no seu ambiente. Compare os detalhes e
            selecione o produto que mais combina com o seu estilo e necessidade.
          </p>
        </header>

        {isLoadingProducts && (
          <div className={styles.mscLoading}>Carregando produtos…</div>
        )}

        {!isLoadingProducts && products.length === 0 && (
          <p className={styles.mscEmpty}>
            Não encontramos produtos que atendam exatamente a todas as
            respostas. Tente ajustar algumas preferências ou refazer o quiz.
          </p>
        )}

        {!isLoadingProducts && products.length > 0 && (
          <div className={styles.mscShelf}>
            {products.map((product) => {
              const firstItem = product.items?.[0]
              const firstImage = firstItem?.images?.[0]
              const offer = firstItem?.sellers?.[0]?.commertialOffer
              const listPrice = offer?.ListPrice
              const price = offer?.Price
              const hasDiscount = listPrice && price && listPrice > price

              return (
                <article
                  key={product.productId}
                  className={styles.mscProductCard}
                >
                  <div className={styles.mscProductTags}>
                    <span className={styles.mscTag}>Mais vendidos</span>
                    <span className={styles.mscTagOutline}>Novidades</span>
                  </div>

                  <a
                    href={product.link}
                    className={styles.mscProductImageWrapper}
                  >
                    {firstImage && (
                      <img
                        src={firstImage.imageUrl}
                        alt={firstImage.imageText || product.productName}
                        className={styles.mscProductImage}
                      />
                    )}
                  </a>

                  <div className={styles.mscProductInfo}>
                    <h3 className={styles.mscProductName}>
                      {product.productName}
                    </h3>

                    {price != null && (
                      <div className={styles.mscProductPriceBlock}>
                        {hasDiscount && (
                          <div className={styles.mscProductListPrice}>
                            {formatPrice(listPrice)}
                          </div>
                        )}

                        <div className={styles.mscProductBestPrice}>
                          {formatPrice(price)} no boleto ou pix
                        </div>

                        {hasDiscount && (
                          <span className={styles.mscProductDiscount}>
                            -
                            {Math.round(
                              ((listPrice - price) / listPrice) * 100
                            )}
                            %
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <a
                    href={product.link}
                    className={styles.mscProductButton}
                  >
                    Ver detalhes
                  </a>
                </article>
              )
            })}
          </div>
        )}
      </section>
    )
  }

  // Tela de perguntas (quiz)
  return (
    <section className={styles.mscContainer}>
      <header className={styles.mscHeader}>
        <h2 className={styles.mscTitle}>Monte sua coifa</h2>
        <p className={styles.mscSubtitle}>
          Responda a algumas perguntas rápidas sobre seu espaço e suas
          preferências. Com base nas suas escolhas, vamos indicar a coifa ideal
          para a sua cozinha, garantindo praticidade, eficiência e um design que
          combina com o seu estilo.
        </p>

        <div className={styles.mscProgressBarWrapper}>
          <div className={styles.mscProgressBarTrack}>
            <div
              className={styles.mscProgressBarFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className={styles.mscProgressLabel}>
            Passo {currentStep + 1} de {totalSteps}
          </span>
        </div>
      </header>

      <div className={styles.mscStepHeader}>
        <h3 className={styles.mscStepTitle}>{step.title}</h3>
        {step.description && (
          <p className={styles.mscStepDescription}>{step.description}</p>
        )}
      </div>

      <div className={styles.mscOptionsGrid}>
        {step.options.map((option) => {
          const isSelected = selectedOption?.id === option.id

          return (
            <button
              key={option.id}
              type="button"
              className={`${styles.mscOptionCard} ${
                isSelected ? styles.mscOptionCardSelected : ''
              }`}
              onClick={() => handleSelectOption(step.id, option)}
            >
              <div className={styles.mscOptionImageWrapper}>
                {option.imageUrl && (
                  <img
                    src={option.imageUrl}
                    alt={option.label}
                    className={styles.mscOptionImage}
                  />
                )}
              </div>

              <div className={styles.mscOptionFooter}>
                <span className={styles.mscOptionRadio}>
                  <span className={styles.mscOptionRadioInner} />
                </span>
                <span className={styles.mscOptionLabel}>{option.label}</span>
              </div>
            </button>
          )
        })}
      </div>

      <footer className={styles.mscFooter}>
        <button
          type="button"
          className={`${styles.mscNavButton} ${
            currentStep === 0 ? styles.mscNavButtonDisabled : ''
          }`}
          onClick={handlePrev}
          disabled={currentStep === 0}
        >
          Voltar
        </button>

        <button
          type="button"
          className={styles.mscPrimaryButton}
          onClick={handleNext}
          disabled={!selectedOption || isLoadingProducts}
        >
          {currentStep === totalSteps - 1 ? 'Ver resultados' : 'Próximo passo'}
        </button>
      </footer>
    </section>
  )
}

export default MonteSuaCoifa
