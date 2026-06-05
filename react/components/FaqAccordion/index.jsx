import React, { useMemo, useState } from 'react'
import { useRuntime } from 'vtex.render-runtime'

import styles from './faqAccordion.css'

const normalizePath = (path = '') => {
  if (!path) return ''

  return path
    .split('?')[0]
    .split('#')[0]
    .replace(/\/$/, '')
    .toLowerCase()
}

const getCurrentPath = (runtime) => {
  const runtimeRoute = runtime?.route || {}
  const runtimePage = runtime?.page || {}
  const windowPath =
    typeof window !== 'undefined' && window?.location?.pathname
      ? window.location.pathname
      : ''

  return (
    windowPath ||
    runtimeRoute.canonicalPath ||
    runtimeRoute.path ||
    runtimePage.canonicalPath ||
    runtimePage.path ||
    ''
  )
}

const shouldRenderForPath = (currentPath, allowedPaths) => {
  if (!allowedPaths?.length) return true

  const normalizedCurrentPath = normalizePath(currentPath)

  if (!normalizedCurrentPath) return false

  return allowedPaths.some((path) => normalizePath(path) === normalizedCurrentPath)
}

const FaqAccordion = ({
  isVisible = true,
  title = 'Perguntas frequentes',
  items = [],
  blockClass = '',
  allowedPaths = [],
  initiallyOpen = 0,
}) => {
  const runtime = useRuntime()
  const [openItems, setOpenItems] = useState(() =>
    Number.isInteger(initiallyOpen) && initiallyOpen >= 0 ? [initiallyOpen] : []
  )

  const currentPath = getCurrentPath(runtime)
  const visibleItems = useMemo(
    () => items.filter((item) => item?.question && item?.answer),
    [items]
  )
  const structuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: visibleItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    }),
    [visibleItems]
  )

  if (
    !isVisible ||
    !visibleItems.length ||
    !shouldRenderForPath(currentPath, allowedPaths)
  ) {
    return null
  }

  const toggleItem = (index) => {
    setOpenItems((currentOpenItems) =>
      currentOpenItems.includes(index)
        ? currentOpenItems.filter((itemIndex) => itemIndex !== index)
        : [...currentOpenItems, index]
    )
  }

  const blockClassName = blockClass ? styles[blockClass] || '' : ''

  return (
    <section className={`${styles.faqAccordion} ${blockClassName}`} aria-label={title}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>

        <div className={styles.items}>
          {visibleItems.map((item, index) => {
            const isOpen = openItems.includes(index)
            const contentId = `faq-content-${blockClass || 'default'}-${index}`

            return (
              <div className={styles.item} key={`${item.question}-${index}`}>
                <h2 className={styles.question}>
                  <button
                    aria-controls={contentId}
                    aria-expanded={isOpen}
                    className={styles.trigger}
                    onClick={() => toggleItem(index)}
                    type="button"
                  >
                    <span>{item.question}</span>
                  </button>
                </h2>

                <div
                  className={`${styles.content} ${isOpen ? styles.contentOpen : ''}`}
                  hidden={!isOpen}
                  id={contentId}
                >
                  <p className={styles.answer}>{item.answer}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

FaqAccordion.schema = {
  title: 'FAQ em acordeon',
  description: 'Controle a exibicao da secao de perguntas frequentes.',
  type: 'object',
  properties: {
    isVisible: {
      title: 'Exibir FAQ',
      description: 'Ative para mostrar esta secao na pagina.',
      type: 'boolean',
      default: true,
    },
    title: {
      title: 'Titulo da secao',
      type: 'string',
      default: 'Perguntas frequentes',
    },
    items: {
      title: 'Perguntas e respostas',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: {
            title: 'Pergunta',
            type: 'string',
          },
          answer: {
            title: 'Resposta',
            type: 'string',
            widget: {
              'ui:widget': 'textarea',
            },
          },
        },
      },
    },
  },
}

export default FaqAccordion
