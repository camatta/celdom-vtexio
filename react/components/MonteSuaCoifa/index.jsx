// /react/components/MonteSuaCoifa/index.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react'
import styles from './montesuacoifa.css'

import p1r1 from '../../../assets/MonteSuaCoifa/p1r1.png'
import p1r2 from '../../../assets/MonteSuaCoifa/p1r2.png'
import p1r3 from '../../../assets/MonteSuaCoifa/p1r3.png'
import p1r4 from '../../../assets/MonteSuaCoifa/p1r4.png'

import p2r1 from '../../../assets/MonteSuaCoifa/p2r1.png'
import p2r2 from '../../../assets/MonteSuaCoifa/p2r2.png'
import p2r3 from '../../../assets/MonteSuaCoifa/p2r3.png'

import p3r1 from '../../../assets/MonteSuaCoifa/p3r1.png'
import p3r2 from '../../../assets/MonteSuaCoifa/p3r2.png'
import p3r3 from '../../../assets/MonteSuaCoifa/p3r3.png'
import p3r4 from '../../../assets/MonteSuaCoifa/p3r4.png'
import p3r5 from '../../../assets/MonteSuaCoifa/p3r5.png'
import p3r6 from '../../../assets/MonteSuaCoifa/p3r6.png'
import p3r7 from '../../../assets/MonteSuaCoifa/p3r7.png'
import p3r8 from '../../../assets/MonteSuaCoifa/p3r8.png'

import p4r1 from '../../../assets/MonteSuaCoifa/p4r1.png'
import p4r2 from '../../../assets/MonteSuaCoifa/p4r2.png'
import p4r3 from '../../../assets/MonteSuaCoifa/p4r3.png'
import p4r4 from '../../../assets/MonteSuaCoifa/p4r4.png'
import p4r5 from '../../../assets/MonteSuaCoifa/p4r5.png'
import p4r6 from '../../../assets/MonteSuaCoifa/p4r6.png'

import p5r1 from '../../../assets/MonteSuaCoifa/p5r1.png'
import p5r2 from '../../../assets/MonteSuaCoifa/p5r2.png'
import p5r3 from '../../../assets/MonteSuaCoifa/p5r3.png'

import p6r1 from '../../../assets/MonteSuaCoifa/p6r1.png'
import p6r2 from '../../../assets/MonteSuaCoifa/p6r2.png'
import p6r3 from '../../../assets/MonteSuaCoifa/p6r3.png'

import p7r1 from '../../../assets/MonteSuaCoifa/p7r1.png'
import p7r2 from '../../../assets/MonteSuaCoifa/p7r2.png'
import p7r3 from '../../../assets/MonteSuaCoifa/p7r3.png'

import p8r1 from '../../../assets/MonteSuaCoifa/p8r1.png'
import p8r2 from '../../../assets/MonteSuaCoifa/p8r2.png'

import p9r1 from '../../../assets/MonteSuaCoifa/p9r1.png'
import p9r2 from '../../../assets/MonteSuaCoifa/p9r2.png'

import p10r1 from '../../../assets/MonteSuaCoifa/p10r1.png'
import p10r2 from '../../../assets/MonteSuaCoifa/p10r2.png'
import p10r3 from '../../../assets/MonteSuaCoifa/p10r3.png'
import p10r4 from '../../../assets/MonteSuaCoifa/p10r4.png'

// =========================
// HELPERS
// =========================
const formatPrice = (value) => {
  if (typeof value !== 'number') return null
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const DISCOUNT_PIX = 0.05
const applyPixDiscount = (price) => {
  if (typeof price !== 'number') return null
  return price - price * DISCOUNT_PIX
}

const buildSpecFilter = (fieldId, value) => {
  if (!fieldId || !value) return ''
  return `specificationFilter_${fieldId}:${value}`
}

const resolveImageSrc = (imageLike) => {
  if (!imageLike) return ''
  if (typeof imageLike === 'string') return imageLike
  if (typeof imageLike?.default === 'string') return imageLike.default
  if (typeof imageLike?.src === 'string') return imageLike.src
  if (typeof imageLike?.url === 'string') return imageLike.url
  if (imageLike?.default && imageLike.default !== imageLike) {
    return resolveImageSrc(imageLike.default)
  }
  return ''
}

// Normaliza option vinda do Site Editor (que pode vir com image / imageUrl)
const normalizeOption = (opt, questionFilterFieldId = '') => {
  const resolvedFilterFieldId = questionFilterFieldId || opt?.filterFieldId
  const resolvedLabel = opt?.label || opt?.name || ''
  const resolvedFilterValue =
    opt?.name != null && String(opt.name).trim() !== ''
      ? String(opt.name).trim()
      : opt?.filterValue || resolvedLabel
  const searchFilter = buildSpecFilter(resolvedFilterFieldId, resolvedFilterValue)

  return {
    id: opt?.id,
    label: resolvedLabel,
    // Editor usa "image", defaults usam "imageUrl"
    imageUrl: resolveImageSrc(opt?.imageUrl || opt?.image),
    searchFilter,
    filterFieldId: resolvedFilterFieldId,
    filterValue: resolvedFilterValue,
  }
}

const ensureQuestionId = (id, index) => id || `q${index + 1}`
const ensureOptionId = (id, questionIndex, optionIndex) =>
  id || `q${questionIndex + 1}_op${optionIndex + 1}`
const ensureColorId = (id, colorIndex) => id || `cor_${colorIndex + 1}`

const normalizeQuestion = (q, questionIndex = 0) => ({
  id: ensureQuestionId(q?.id, questionIndex),
  title: q?.title,
  description: q?.description,
  filterFieldId:
    q?.filterFieldId ||
    (Array.isArray(q?.options) ? q.options[0]?.filterFieldId || '' : ''),
  options: Array.isArray(q?.options)
    ? q.options.map((opt, optionIndex) => ({
        ...normalizeOption(
          opt,
          q?.filterFieldId ||
            (Array.isArray(q?.options) ? q.options[0]?.filterFieldId || '' : '')
        ),
        id: ensureOptionId(opt?.id, questionIndex, optionIndex),
      }))
    : [],
})

const normalizeColorOption = (
  c,
  colorIndex = 0
) => ({
  id: ensureColorId(c?.id, colorIndex),
  label: c?.label || c?.name,
  hex: c?.hex,
})

const addCacheBust = (src) => {
  if (!src) return src
  const sep = src.includes('?') ? '&' : '?'
  return `${src}${sep}retry=${Date.now()}`
}

const isNumericLike = (value) => /^\d+$/.test(String(value ?? '').trim())

const QUESTION_SPECIFICATION_NAMES = {
  ambiente: 'Ambiente',
  ondeInstalar: 'Instalação',
  formato: 'Formato',
  modelo: 'Modelo',
  mediaIdeal: 'Medida ideal',
  acabamento: 'Acabamento',
  instalacao: 'Tipo de Instalação',
  comando: 'Tipo de Comando',
  filtro: 'Filtro',
  iluminacao: 'Iluminação',
}

const COLOR_SPECIFICATION_NAME = 'Cor'
const PROGRESS_BAR_SCROLL_OFFSET = 180

const normalizeComparisonValue = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

const getProductSpecificationValues = (product, specificationName) => {
  const raw = product?.[specificationName]
  if (Array.isArray(raw)) return raw
  if (raw == null) return []
  return [raw]
}

const filterProductsByAnswer = ({
  products,
  questionId,
  answer,
  colorCfg,
}) => {
  const normalizedProducts = Array.isArray(products) ? products : []
  if (!answer) return normalizedProducts

  const specificationName =
    QUESTION_SPECIFICATION_NAMES[questionId] || ''

  if (!specificationName || !answer?.filterValue) return normalizedProducts

  const expectedValue = normalizeComparisonValue(answer.filterValue)

  return normalizedProducts.filter((product) =>
    getProductSpecificationValues(product, specificationName).some(
      (value) => normalizeComparisonValue(value) === expectedValue
    )
  )
}

const parseResponseSafely = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  const text = await response.text()
  return { __rawText: text }
}

const buildUniqueFiltersFromAnswers = (answers, questionIds) => {
  const filters = questionIds
    .map((questionId) => answers?.[questionId]?.searchFilter)
    .filter((filter) => filter && filter.trim() !== '')

  return [...new Set(filters)]
}

const buildSearchUrl = (filters, options = {}) => {
  const strictEncode = (value) =>
    encodeURIComponent(value).replace(
      /[!'()*]/g,
      (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`
    )

  const params = ['ft=']

  filters.forEach((fq) => {
    params.push(`fq=${strictEncode(fq)}`)
  })

  if (options.from != null)
    params.push(`_from=${strictEncode(String(options.from))}`)
  if (options.to != null)
    params.push(`_to=${strictEncode(String(options.to))}`)

  return `/api/catalog_system/pub/products/search?${params.join('&')}`
}

// =========================
// PARCELAMENTO (mantém seu comportamento atual)
// =========================
const getBestInstallment = (offer) => {
  if (!offer) return null

  // FORMATO A: Installments (número) + InstallmentValue
  if (
    typeof offer.Installments === 'number' &&
    typeof offer.InstallmentValue === 'number' &&
    offer.Installments > 0 &&
    offer.InstallmentValue > 0
  ) {
    return {
      count: offer.Installments,
      value: offer.InstallmentValue,
      hasInterest: false,
    }
  }

  // FORMATO B: Installments como ARRAY (mais comum)
  const arr = Array.isArray(offer.Installments) ? offer.Installments : null
  if (arr && arr.length) {
    const normalized = arr
      .map((i) => ({
        count: i.NumberOfInstallments ?? i.numberOfInstallments ?? i.count,
        value: i.Value ?? i.value,
        interestRate: i.InterestRate ?? i.interestRate ?? 0,
      }))
      .filter(
        (i) =>
          typeof i.count === 'number' &&
          typeof i.value === 'number' &&
          i.count > 0 &&
          i.value > 0
      )

    if (!normalized.length) return null

    const noInterest = normalized
      .filter((i) => (i.interestRate ?? 0) === 0)
      .sort((a, b) => b.count - a.count)[0]

    const best = noInterest || normalized.sort((a, b) => b.count - a.count)[0]

    return {
      count: best.count,
      value: best.value,
      hasInterest: (best.interestRate ?? 0) > 0,
    }
  }

  return null
}

const getInstallmentsText = (offer) => {
  const inst = getBestInstallment(offer)
  if (!inst) return null

  const total = inst.count * inst.value
  const suffix = inst.hasInterest ? 'com juros' : 'sem juros'
  return `ou ${formatPrice(total)} em ${inst.count}x de ${formatPrice(
    inst.value
  )} ${suffix}`
}

// =========================
// DEFAULTS OFICIAIS (PRODUÇÃO)
// =========================
const DEFAULT_QUESTIONS = [
  {
    id: 'ambiente',
    filterFieldId: '4147',
    title: 'Qual é o ambiente de instalação?',
    description:
      'O ambiente define o estilo e a necessidade de ventilação, garantindo o melhor desempenho e integração com o espaço.',
    options: [
      { id: 'cozinha', label: 'Cozinha', imageUrl: p1r1, filterValue: 'Cozinha' },
      { id: 'industrial', label: 'Cozinha Industrial', imageUrl: p1r2, filterValue: 'Cozinha Industrial' },
      { id: 'varanda', label: 'Varanda', imageUrl: p1r3, filterValue: 'Varanda' },
      { id: 'gourmet', label: 'Área Gourmet', imageUrl: p1r4, filterValue: 'Área Gourmet' },
    ],
  },
  {
    id: 'ondeInstalar',
    filterFieldId: '4148',
    title: 'Onde você pretende instalar?',
    description:
      'A escolha do modo de instalação garante o encaixe perfeito no seu espaço, seja em parede ou ilha.',
    options: [
      { id: 'ilha', label: 'Ilha', imageUrl: p2r1, filterValue: 'Ilha' },
      { id: 'parede', label: 'Parede', imageUrl: p2r2, filterValue: 'Parede' },
      { id: 'embutida', label: 'Embutida', imageUrl: p2r3, filterValue: 'Embutida' },
    ],
  },
  {
    id: 'formato',
    filterFieldId: '4149',
    title: 'Qual formato atende melhor sua cozinha?',
    description: 'Selecione a opção que combina com o espaço do seu ambiente.',
    options: [
      { id: 'fogao', label: 'Fogão', imageUrl: p3r1, filterValue: 'Fogão' },
      { id: 'cooktopeletrico', label: 'Cooktop Elétrico', imageUrl: p3r2, filterValue: 'Cooktop Elétrico' },
      { id: 'cooktop-gas', label: 'Cooktop Gás', imageUrl: p3r3, filterValue: 'Cooktop Gás' },
      { id: 'rangetop', label: 'RangeTop', imageUrl: p3r4, filterValue: 'RangeTop' },
      { id: 'churrasqueira-gas', label: 'Churrasqueira Gás', imageUrl: p3r5, filterValue: 'Churrasqueira Gás' },
      { id: 'churtrasqueira-eletrica', label: 'Churrasqueira Elétrica', imageUrl: p3r6, filterValue: 'Churrasqueira Elétrica' },
      { id: 'churrasqueira-carvao', label: 'Churrasqueira Carvão', imageUrl: p3r7, filterValue: 'Churrasqueira Carvão' },
      { id: 'churrasqueira-parrilla', label: 'Churrasqueira Parrilla', imageUrl: p3r8, filterValue: 'Churrasqueira Parrilla' },
    ],
  },
  {
    id: 'modelo',
    filterFieldId: '4150',
    title: 'Qual modelo você prefere?',
    description:
      'O modelo define o estilo e a linha do produto, alinhando design e funcionalidade à sua cozinha.',
    options: [
      { id: 'flat', label: 'Flat', imageUrl: p4r1, filterValue: 'Flat' },
      { id: 'profissional', label: 'Profissional', imageUrl: p4r2, filterValue: 'Profissional' },
      { id: 'piramidal', label: 'Piramidal', imageUrl: p4r3, filterValue: 'Piramidal' },
      { id: 'revestir', label: 'Revestir', imageUrl: p4r4, filterValue: 'Revestir' },
      { id: 'box', label: 'Box', imageUrl: p4r5, filterValue: 'Box' },
      { id: 'embutir', label: 'Embutir', imageUrl: p4r6, filterValue: 'Embutir' },
    ],
  },
  {
    id: 'mediaIdeal',
    filterFieldId: '4151',
    title: 'Qual a medida ideal para o seu espaço?',
    description:
      'A medida deve ser compatível com o tamanho do fogão ou área de cocção para garantir eficiência máxima.',
    options: [
      { id: '50-70', label: '50 a 70cm', imageUrl: p5r1, filterValue: '50 a 70cm' },
      { id: '71-100', label: '71 a 100cm', imageUrl: p5r2, filterValue: '71 a 100cm' },
      { id: '101-130', label: '101 a 130cm', imageUrl: p5r3, filterValue: '101 a 130cm' },
    ],
  },
  {
    id: 'acabamento',
    filterFieldId: '4152',
    title: 'Qual acabamento você prefere?',
    description:
      'O acabamento dá o toque final ao design, harmonizando com o estilo e a paleta da sua cozinha.',
    options: [
      { id: 'inox', label: 'Inox', imageUrl: p6r2, filterValue: 'Inox' },
      { id: 'colorido', label: 'Colorido', imageUrl: p6r3, filterValue: 'Colorido' }, // gatilho
    ],
  },
  {
    id: 'instalacao',
    filterFieldId: '4156',
    title: 'Como será feita a instalação da coifa?',
    description:
      'O tipo de instalação define onde o motor e os componentes da coifa ficarão posicionados, influenciando diretamente o nível de ruído e a eficiência do sistema.',
    options: [
      { id: 'interno-coifa', label: 'Interno Coifa', imageUrl: p7r1, filterValue: 'Interno Coifa' },
      { id: 'split-linha', label: 'Split Linha', imageUrl: p7r2, filterValue: 'Split Linha' },
      { id: 'split-externo', label: 'Split Externo', imageUrl: p7r3, filterValue: 'Split Externo' },
    ],
  },
  {
    id: 'comando',
    filterFieldId: '4153',
    title: 'Qual tipo de comando você prefere?',
    description:
      'O tipo de comando afeta a experiência de uso, permitindo ajustes de velocidade e iluminação com praticidade.',
    options: [
      { id: 'pulsante', label: 'Pulsante', imageUrl: p8r1, filterValue: 'Pulsante' },
      { id: 'touch', label: 'Touch', imageUrl: p8r2, filterValue: 'Touch' },
    ],
  },
  {
    id: 'filtro',
    filterFieldId: '4154',
    title: 'Qual tipo de filtro você prefere?',
    description:
      'O filtro é o responsável por reter gordura e impurezas, garantindo o bom funcionamento da coifa e a limpeza do ambiente. A escolha do tipo ideal influencia diretamente a durabilidade e a eficiência da sucção.',
    options: [
      { id: 'baffle', label: 'Baffle (Inox + Alumínio)', imageUrl: p9r1, filterValue: 'Baffle - Inox e Alumínio' },
      { id: 'inercial', label: 'Inercial (Inox)', imageUrl: p9r2, filterValue: 'Inercial - Inox' },
    ],
  },
  {
    id: 'iluminacao',
    filterFieldId: '4155',
    title: 'Qual tipo de iluminação deseja?',
    description:
      'A iluminação contribui tanto para a estética quanto para a funcionalidade, garantindo conforto visual no preparo.',
    options: [
      { id: 'fite-led', label: 'Fita de LED', imageUrl: p10r1, filterValue: 'Fita de LED' },
      { id: '1par-spot', label: '1 Par de Spot', imageUrl: p10r2, filterValue: '1 Par de Spot' },
      { id: '2pares-spot', label: '2 Pares de Spot', imageUrl: p10r3, filterValue: '2 Pares de Spot' },
      { id: '3pares-spot', label: '3 Pares de Spot', imageUrl: p10r4, filterValue: '3 Pares de Spot' },
    ],
  },
]

// Color picker default (produção)
const DEFAULT_COLOR_PICKER = {
  enabled: true,
  questionId: 'acabamento',
  triggerOptionId: 'colorido',
  text: 'Selecione a cor desejada para personalizar o acabamento da sua coifa.',
  hint: 'Escolha uma cor para continuar.',
options: [
  {
    id: 'preto-fosco',
    label: 'Preto Fosco',
    hex: '#1C1C1C',
  },
  {
    id: 'grafite',
    label: 'Grafite',
    hex: '#3A3A3A',
  },
  {
    id: 'aco-corten',
    label: 'Aço Cortén',
    hex: '#8B4A2F',
  },
  {
    id: 'cobre-semi-brilho',
    label: 'Cobre Semi Brilho',
    hex: '#B87333',
  },
  {
    id: 'dourado',
    label: 'Dourado',
    hex: '#D4AF37',
  },
  {
    id: 'verde-brilhante',
    label: 'Verde Brilhante',
    hex: '#00A859',
  },
  {
    id: 'azul-brilhante',
    label: 'Azul Brilhante',
    hex: '#007BFF',
  },
  {
    id: 'vermelho-brilhante',
    label: 'Vermelho Brilhante',
    hex: '#D32F2F',
  },
],
}

const MonteSuaCoifa = ({ questions, colorPicker }) => {
  // 1) resolve perguntas (Site Editor sobrescreve, senão usa defaults oficiais)
  const QUESTIONS = useMemo(() => {
    const sourceQuestions =
      Array.isArray(questions) && questions.length
        ? questions
        : DEFAULT_QUESTIONS

    return sourceQuestions.map((q, questionIndex) =>
      normalizeQuestion(q, questionIndex)
    )
  }, [questions])

  // 2) resolve config do seletor de cor (Site Editor sobrescreve, senão default)
  const colorCfg = useMemo(() => {
    const sourceColorPicker = colorPicker && typeof colorPicker === 'object'
      ? colorPicker
      : DEFAULT_COLOR_PICKER

    return {
      ...DEFAULT_COLOR_PICKER,
      ...sourceColorPicker,
      options:
        Array.isArray(sourceColorPicker?.options) && sourceColorPicker.options.length
          ? sourceColorPicker.options
          : DEFAULT_COLOR_PICKER.options,
    }
  }, [colorPicker])

  const normalizedColors = useMemo(() => {
    const opts = Array.isArray(colorCfg?.options) ? colorCfg.options : []
    return opts.map((c, colorIndex) =>
      normalizeColorOption(c, colorIndex)
    )
  }, [colorCfg])

  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [products, setProducts] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [hasFinished, setHasFinished] = useState(false)
  const [availableOptionIds, setAvailableOptionIds] = useState(null)
  const [isLoadingStepOptions, setIsLoadingStepOptions] = useState(false)
  const [stepContentMinHeight, setStepContentMinHeight] = useState(null)
  const [readyOptionImages, setReadyOptionImages] = useState({})
  const progressBarRef = useRef(null)
  const stepHeaderRef = useRef(null)
  const stepContentRef = useRef(null)
  const didMountStepRef = useRef(false)
  const stepNavDirectionRef = useRef(null)
  const optionAvailabilityCacheRef = useRef({})

  const [acabamentoColor, setAcabamentoColor] = useState(null)

  const totalSteps = QUESTIONS.length
  const totalStepsSafe = totalSteps || 1
  const questionIds = useMemo(() => QUESTIONS.map((question) => question.id), [QUESTIONS])
  const step = QUESTIONS[currentStep] || QUESTIONS[0] || { id: '', title: '', description: '', options: [] }
  const previousAnswerFiltersSignature = useMemo(() => {
    return questionIds
      .slice(0, currentStep)
      .map((questionId) => answers?.[questionId]?.searchFilter || '')
      .join('||')
  }, [answers, currentStep, questionIds])
  const selectedOption = step.id ? answers[step.id] : null
  const progressPercent = ((currentStep + 1) / totalStepsSafe) * 100
  const progressPercentLabel = `${Math.round(progressPercent)}%`

  // lógica do seletor de cor (configurável)
  const isColorStep = Boolean(colorCfg?.enabled) && step.id === colorCfg.questionId
  const isColorTriggerSelected =
    isColorStep && selectedOption?.id === colorCfg.triggerOptionId

  const visibleStepOptions = useMemo(() => {
    if (!Array.isArray(step?.options)) return []
    if (availableOptionIds == null) return currentStep === 0 ? step.options : []
    return step.options.filter((option) => availableOptionIds.includes(option.id))
  }, [step, availableOptionIds, currentStep])

  const handleSelectOption = (questionId, option) => {
    setAnswers((prev) => {
      const questionIndex = questionIds.indexOf(questionId)
      const nextAnswers = {}

      questionIds.slice(0, questionIndex).forEach((id) => {
        if (prev[id]) nextAnswers[id] = prev[id]
      })

      nextAnswers[questionId] = option
      return nextAnswers
    })

    // se trocar e sair do trigger, limpa cor
    if (isColorStep && questionId === colorCfg.questionId && option.id !== colorCfg.triggerOptionId) {
      setAcabamentoColor(null)
    }

    // se clicar no trigger, também reseta a cor (quem filtra é a cor)
    if (isColorStep && questionId === colorCfg.questionId && option.id === colorCfg.triggerOptionId) {
      setAcabamentoColor(null)
    }
  }

  const handleSelectColor = (color) => {
    setAcabamentoColor(color)

  // guarda a cor escolhida apenas para UX; o filtro continua sendo o acabamento selecionado
  setAnswers((prev) => {
      const base = prev[colorCfg.questionId]
      if (!base || base.id !== colorCfg.triggerOptionId) return prev

      return {
        ...prev,
        [colorCfg.questionId]: {
          ...base,
          chosenColor: color.id,
          chosenColorLabel: color.label,
        },
      }
    })
  }

  const canProceed = useMemo(() => {
    if (isLoadingStepOptions) return false
    if (!selectedOption) return false
    if (!visibleStepOptions.some((option) => option.id === selectedOption.id)) {
      return false
    }
    if (isColorTriggerSelected) return Boolean(acabamentoColor?.id)
    return true
  }, [
    selectedOption,
    isColorTriggerSelected,
    acabamentoColor,
    isLoadingStepOptions,
    visibleStepOptions,
  ])

  useEffect(() => {
    if (typeof window === 'undefined' || !step?.options?.length) return undefined

    let cancelled = false

    const preload = (src, attemptedRetry = false, renderSrc = src) => {
      if (!src || !renderSrc) return

      const img = new window.Image()
      img.decoding = 'async'

      img.onload = () => {
        if (cancelled) return
        setReadyOptionImages((prev) =>
          prev[renderSrc] ? prev : { ...prev, [renderSrc]: src }
        )
      }

      img.onerror = () => {
        if (cancelled || attemptedRetry) return
        preload(addCacheBust(src), true, renderSrc)
      }

      img.src = src
    }

    step.options.forEach((option) => {
      preload(resolveImageSrc(option.imageUrl))
    })

    return () => {
      cancelled = true
    }
  }, [step])

  useEffect(() => {
    if (hasFinished || !step?.id) return undefined

    const currentQuestionIndex = questionIds.indexOf(step.id)
    const previousQuestionIds = questionIds.slice(0, currentQuestionIndex)
    const baseFilters = buildUniqueFiltersFromAnswers(answers, previousQuestionIds)
    const isDebugMode =
      typeof window !== 'undefined' &&
      window.location?.search?.includes('mscDebug=1')

    optionAvailabilityCacheRef.current = {}

    // Primeira etapa sempre mostra tudo; não precisa consultar disponibilidade.
    if (currentQuestionIndex <= 0) {
      setAvailableOptionIds(step.options.map((option) => option.id))
      setIsLoadingStepOptions(false)
      return undefined
    }

    let cancelled = false
    setIsLoadingStepOptions(true)
    setAvailableOptionIds(null)

    const stepSpecificationName =
      step?.specificationName || QUESTION_SPECIFICATION_NAMES[step.id] || ''

    const getAvailableOptionIdsFromProducts = (baseProducts) => {
      const normalizedProducts = Array.isArray(baseProducts) ? baseProducts : []

      if (!stepSpecificationName && !(isColorStep && step.id === colorCfg.questionId)) {
        return step.options.map((option) => option.id)
      }

      const getProductValues = (product, specificationName) => {
        const raw = product?.[specificationName]
        if (Array.isArray(raw)) return raw
        if (raw == null) return []
        return [raw]
      }

      const availableValuesBySpec = new Set(
        normalizedProducts.flatMap((product) =>
          getProductValues(product, stepSpecificationName).map(normalizeComparisonValue)
        )
      )

      return step.options
        .map((option) => {
          if (isColorStep && option.id === colorCfg.triggerOptionId) {
            const hasAvailableColor = availableValuesBySpec.has(
              normalizeComparisonValue(option.filterValue || option.label)
            )

            if (isDebugMode) {
              console.log('derived color availability', {
                stepId: step.id,
                triggerOptionId: option.id,
                availableValues: [...availableValuesBySpec],
                hasAvailableColor,
              })
            }

            return hasAvailableColor ? option.id : null
          }

          if (!option.searchFilter) return option.id

          const isAvailable = availableValuesBySpec.has(
            normalizeComparisonValue(option.filterValue)
          )

          if (isDebugMode) {
            console.log('derived option availability', {
              stepId: step.id,
              optionId: option.id,
              optionLabel: option.label,
              filterFieldId: option.filterFieldId,
              filterValue: option.filterValue,
              stepSpecificationName,
              availableValues: [...availableValuesBySpec],
              isAvailable,
            })
          }

          return isAvailable ? option.id : null
        })
        .filter(Boolean)
    }

    const resolveAvailableOptions = async () => {
      if (isDebugMode) {
        console.groupCollapsed('[MonteSuaCoifa][Debug] Disponibilidade da etapa')
        console.log('step id', step.id)
        console.log('step title', step.title)
        console.log('currentQuestionIndex', currentQuestionIndex)
        console.log('previousQuestionIds', previousQuestionIds)
        console.log('baseFilters', baseFilters)
        console.log(
          'previousAnswers',
          previousQuestionIds.map((questionId) => ({
            questionId,
            answerId: answers?.[questionId]?.id,
            answerLabel: answers?.[questionId]?.label,
            filterFieldId: answers?.[questionId]?.filterFieldId,
            filterValue: answers?.[questionId]?.filterValue,
            searchFilter: answers?.[questionId]?.searchFilter,
          }))
        )
      }

      const requestUrl = buildSearchUrl(baseFilters, { from: 0, to: 49 })

      try {
        const response = await fetch(requestUrl, { cache: 'no-store' })

        if (!response.ok) {
          const errorPayload = await parseResponseSafely(response)
          if (isDebugMode) {
            console.warn('base response not ok', {
              stepId: step.id,
              requestUrl,
              status: response.status,
              payload: errorPayload,
            })
            console.groupEnd()
          }
          setAvailableOptionIds([])
          setIsLoadingStepOptions(false)
          return
        }

        const baseProducts = await response.json()
        const derivedOptionIds = getAvailableOptionIdsFromProducts(baseProducts)

        if (cancelled) return

        setAvailableOptionIds(derivedOptionIds)
        setIsLoadingStepOptions(false)

        if (isDebugMode) {
          console.log('base probe', {
            stepId: step.id,
            baseFilters,
            requestUrl,
            productsLength: Array.isArray(baseProducts) ? baseProducts.length : 0,
            sampleProducts: Array.isArray(baseProducts)
              ? baseProducts.slice(0, 5).map((product) => ({
                  productId: product.productId,
                  productName: product.productName,
                }))
              : [],
          })
          console.log('availableOptionIds', derivedOptionIds)
          console.groupEnd()
        }
      } catch (error) {
        if (cancelled) return
        setAvailableOptionIds([])
        setIsLoadingStepOptions(false)
        if (isDebugMode) {
          console.error('base request failed', {
            stepId: step.id,
            requestUrl,
            error,
          })
          console.groupEnd()
        }
      }
    }
    resolveAvailableOptions()

    return () => {
      cancelled = true
    }
  }, [colorCfg, currentStep, hasFinished, isColorStep, normalizedColors, previousAnswerFiltersSignature, questionIds, step])

  useEffect(() => {
    if (!isLoadingStepOptions) {
      window.requestAnimationFrame(() => {
        setStepContentMinHeight(null)
      })
    }
  }, [isLoadingStepOptions])

  // MANTER seu scrollTop
  const scrollTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const scrollToProgressBar = () => {
    if (typeof window === 'undefined') return

    const target = progressBarRef.current
    const top = target
      ? target.getBoundingClientRect().top + window.scrollY - PROGRESS_BAR_SCROLL_OFFSET
      : 0

    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }

  useEffect(() => {
    if (stepNavDirectionRef.current !== 'next') return
    if (isLoadingStepOptions) return
    if (typeof window === 'undefined') return

    const target = progressBarRef.current
    if (!target) {
      stepNavDirectionRef.current = null
      return
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollToProgressBar()
        stepNavDirectionRef.current = null
      })
    })
  }, [currentStep, isLoadingStepOptions])

  const handleImageError = (event) => {
    const img = event.currentTarget
    const originalSrc = img.dataset.originalSrc || img.getAttribute('src')
    const retried = img.dataset.retried === 'true'

    if (!originalSrc || retried) return

    img.dataset.retried = 'true'
    img.src = addCacheBust(originalSrc)
  }

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      if (stepContentRef.current) {
        setStepContentMinHeight(stepContentRef.current.offsetHeight)
      }
      stepNavDirectionRef.current = 'next'
      setCurrentStep((prev) => prev + 1)
      scrollToProgressBar()
      return
    }

    setIsLoadingProducts(true)
    try {
      const isDebugMode =
        typeof window !== 'undefined' &&
        window.location?.search?.includes('mscDebug=1')
      const previousQuestionIds = questionIds.slice(0, currentStep)
      const baseFilters = buildUniqueFiltersFromAnswers(answers, previousQuestionIds)
      const filters = buildUniqueFiltersFromAnswers(answers, questionIds)
      const requestUrl = buildSearchUrl(baseFilters)
      const finalAnswer = step.id ? answers?.[step.id] : null

      const response = await fetch(requestUrl, { cache: 'no-store' })

      if (isDebugMode) {
        console.groupCollapsed('[MonteSuaCoifa][Debug] Busca de produtos')
        console.log('answers', answers)
        console.log('base filters', baseFilters)
        console.log('filters (unique)', filters)
        console.log('request URL', requestUrl)
        console.log('response status', response.status)
        console.groupEnd()
      }

      if (!response.ok) throw new Error('Erro ao buscar produtos')

      const baseData = await response.json()
      const data = filterProductsByAnswer({
        products: baseData,
        questionId: step.id,
        answer: finalAnswer,
        colorCfg,
      })

      if (isDebugMode) {
        console.groupCollapsed('[MonteSuaCoifa][Debug] Resultado da busca')
        console.log('base products length', Array.isArray(baseData) ? baseData.length : 0)
        console.log('products length', Array.isArray(data) ? data.length : 0)
        console.log('products', data)
        console.groupEnd()
      }

      if (isDebugMode && Array.isArray(data) && data.length === 0) {
        console.groupCollapsed('[MonteSuaCoifa][Debug] Diagnóstico sem resultados')
        try {
          const baseResp = await fetch(buildSearchUrl([]))
          const baseData = await parseResponseSafely(baseResp)
          console.log(
            'sem filtro (controle) -> products length',
            Array.isArray(baseData) ? baseData.length : 0
          )

          for (const fq of filters) {
            const probeResp = await fetch(buildSearchUrl([fq]))
            const probeData = await parseResponseSafely(probeResp)
            if (!probeResp.ok) {
              console.warn(
                `probe filtro único (${fq}) -> status ${probeResp.status}`,
                probeData
              )
              continue
            }
            console.log(
              `probe filtro único (${fq}) -> products length`,
              Array.isArray(probeData) ? probeData.length : 0
            )
          }

          const labelBasedFilters = [
            ...new Set(
              questionIds
                .map((questionId) => answers[questionId])
                .map((answer) => {
                  if (!answer?.filterFieldId || !answer?.label) return null
                  if (!isNumericLike(answer?.filterValue)) return null
                  return `specificationFilter_${answer.filterFieldId}:${answer.label}`
                })
                .filter(Boolean)
            ),
          ]

          for (const fq of labelBasedFilters) {
            const probeResp = await fetch(buildSearchUrl([fq]))
            const probeData = await parseResponseSafely(probeResp)
            if (!probeResp.ok) {
              console.warn(
                `probe valor por label (${fq}) -> status ${probeResp.status}`,
                probeData
              )
              continue
            }
            console.log(
              `probe valor por label (${fq}) -> products length`,
              Array.isArray(probeData) ? probeData.length : 0
            )
          }

          if (!labelBasedFilters.length) {
            console.log(
              'nenhum probe por label foi gerado (filterValue não era numérico ou faltou label/fieldId)'
            )
          }
        } catch (diagnosticError) {
          console.error(
            '[MonteSuaCoifa][Debug] Erro no diagnóstico de filtros',
            diagnosticError
          )
        }
        console.groupEnd()
      }

      setProducts(data)
      setHasFinished(true)
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
    stepNavDirectionRef.current = 'prev'
    setCurrentStep((prev) => prev - 1)
  }

  const handleRestart = () => {
    setAnswers({})
    setProducts([])
    setHasFinished(false)
    setCurrentStep(0)
    setAcabamentoColor(null)
    stepNavDirectionRef.current = null
  }

  // ================
  // TELA FINAL
  // ================
  if (hasFinished) {
    scrollTop()
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
          <h2 className={styles.mscTitle}>Selecionamos o produto ideal para você</h2>
          <p className={styles.mscSubtitle}>
            Com base nas suas escolhas, encontramos a coifa que melhor atende
            ao seu projeto, com potencial de personalização sob medida para o
            seu ambiente.
          </p>
          <p className={styles.mscSubtitle}>
            Após a confirmação da compra do produto abaixo, entraremos em
            contato para validar as personalizações sob medida e alinhar os
            detalhes finais do seu projeto.
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
          <div
            className={`${styles.mscShelf} ${
              products.length === 1 ? styles.mscShelfSingle : ''
            }`}
          >
            {products.map((product) => {
              const firstItem = product.items?.[0]
              const firstImage = firstItem?.images?.[0]
              const offer = firstItem?.sellers?.[0]?.commertialOffer
              const addToCartLink = firstItem?.sellers?.[0]?.addToCartLink

              const listPrice = offer?.ListPrice
              const price = offer?.Price

              const hasDiscount = listPrice && price && listPrice > price
              const pixPrice = price != null ? applyPixDiscount(price) : null

              return (
                <article key={product.productId} className={styles.mscProductCard}>
                  <div className={styles.mscProductTags}>
                    <span className={styles.mscTag}>Mais vendidos</span>
                    <span className={styles.mscTagOutline}>Novidades</span>
                  </div>

                  <div className={styles.mscProductImageWrapper}>
                    {firstImage && (
                      <img
                        src={resolveImageSrc(firstImage.imageUrl)}
                        data-original-src={resolveImageSrc(firstImage.imageUrl)}
                        alt={firstImage.imageText || product.productName}
                        className={styles.mscProductImage}
                        loading="lazy"
                        decoding="async"
                        onError={handleImageError}
                      />
                    )}
                  </div>

                  <div className={styles.mscProductInfo}>
                    <h3 className={styles.mscProductName}>{product.productName}</h3>

                    {price != null && (
                      <div className={styles.mscProductPriceBlock}>
                        {hasDiscount && (
                          <div className={styles.mscProductListPrice}>
                            {formatPrice(listPrice)}
                          </div>
                        )}

                        {pixPrice != null && (
                          <div className={styles.mscProductBestPrice}>
                            {formatPrice(pixPrice)} no boleto ou pix
                          </div>
                        )}

                        {hasDiscount && (
                          <span className={styles.mscProductDiscount}>
                            -{Math.round(((listPrice - price) / listPrice) * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {offer && getInstallmentsText(offer) && (
                    <div className={styles.mscProductInstallments}>
                      {getInstallmentsText(offer)}
                    </div>
                  )}

                  {product.link && (
                    <a
                      href={product.link}
                      className={styles.mscProductButton}
                    >
                      Comprar Coifa Sob Medida
                    </a>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    )
  }

  // ================
  // TELA QUIZ
  // ================
  return (
    <section className={styles.mscContainer}>
      <header className={styles.mscHeader}>
        <h1 className={styles.mscTitle}>Monte sua coifa</h1>
        <p className={styles.mscSubtitle}>
          Responda a algumas perguntas rápidas sobre seu espaço e suas
          preferências. Com base nas suas escolhas, vamos indicar a coifa ideal
          para a sua cozinha, garantindo praticidade, eficiência e um design que
          combina com o seu estilo.
        </p>

        <div ref={progressBarRef} className={styles.mscProgressBarWrapper}>
          <div className={styles.mscProgressBarTrack}>
            <div
              className={styles.mscProgressBarFill}
              style={{ width: `${progressPercent}%` }}
            />
            <span className={styles.mscProgressBarPercent}>
              {progressPercentLabel}
            </span>
          </div>
          <span className={styles.mscProgressLabel}>
            Passo {currentStep + 1} de {totalSteps}
          </span>
        </div>
      </header>

      <button
        type="button"
        className={`${styles.mscNavButton} ${
          currentStep === 0 ? styles.mscNavButtonDisabled : ''
        }`}
        onClick={handlePrev}
        disabled={currentStep === 0}
      >
        <span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask
              id="mask0_21429_15058"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="18"
              height="18"
              mask-type="alpha"
            >
              <rect
                x="18"
                y="18"
                width="18"
                height="18"
                transform="rotate(-180 18 18)"
                fill="#D9D9D9"
              />
            </mask>

            <g mask="url(#mask0_21429_15058)">
              <path
                d="M5.86875 8.25H15V9.75H5.86875L10.0687 13.95L9 15L3 9L9 3L10.0687 4.05L5.86875 8.25Z"
                fill="#FE5000"
              />
            </g>
          </svg>
        </span>
        Voltar
      </button>

      <div ref={stepHeaderRef} className={styles.mscStepHeader}>
        <h3 className={styles.mscStepTitle}>{step.title}</h3>
        {step.description && (
          <p className={styles.mscStepDescription}>{step.description}</p>
        )}
      </div>

      <div
        ref={stepContentRef}
        style={stepContentMinHeight ? { minHeight: `${stepContentMinHeight}px` } : undefined}
      >
        {isLoadingStepOptions && currentStep > 0 && (
          <div className={styles.mscStepLoading}>
            Atualizando opções disponíveis...
          </div>
        )}

        {!isLoadingStepOptions && visibleStepOptions.length === 0 && (
          <div className={styles.mscStepEmpty}>
            Nenhuma opção ficou disponível para esta etapa com as respostas
            anteriores. Volte e ajuste uma resposta para continuar.
          </div>
        )}

        <div className={styles.mscOptionsGrid}>
          {visibleStepOptions.map((option) => {
            const isSelected = selectedOption?.id === option.id
            const optionImageSrc = resolveImageSrc(option.imageUrl)
            const optionImageLoadedSrc = readyOptionImages[optionImageSrc]
            const isOptionImageReady = Boolean(optionImageLoadedSrc)

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
                  {optionImageSrc && isOptionImageReady && (
                    <img
                      src={optionImageLoadedSrc}
                      data-original-src={optionImageSrc}
                      alt={option.label}
                      className={styles.mscOptionImage}
                      loading="eager"
                      decoding="async"
                      width="202"
                      height="220"
                      fetchPriority={currentStep === 0 ? 'high' : 'auto'}
                      onError={handleImageError}
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

        {/* Seletor de cor (configurável) */}
        {isColorTriggerSelected && (
          <div className={styles.mscColorPickerWrapper}>
            <p className={styles.mscColorPickerText}>
              {colorCfg?.text ||
                'Selecione a cor desejada para personalizar o acabamento da sua coifa.'}
            </p>

            <div className={styles.mscColorDotsRow}>
              {normalizedColors.map((color) => {
                const isSelected = acabamentoColor?.id === color.id

                return (
                  <div key={color.id} className={styles.mscColorItem}>
                    <button
                      type="button"
                      aria-label={color.label}
                      title={color.label}
                      className={`${styles.mscColorDot} ${
                        isSelected ? styles.mscColorDotSelected : ''
                      }`}
                      onClick={() => handleSelectColor(color)}
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className={styles.mscColorLabel}>{color.label}</span>
                  </div>
                )
              })}
            </div>

            {!acabamentoColor && (
              <p className={styles.mscColorPickerHint}>
                {colorCfg?.hint || 'Escolha uma cor para continuar.'}
              </p>
            )}
          </div>
        )}
      </div>

      <footer className={styles.mscFooter}>
        <button
          type="button"
          className={styles.mscPrimaryButton}
          onClick={handleNext}
          disabled={!canProceed || isLoadingProducts}
        >
          {currentStep === totalSteps - 1 ? 'Ver resultados' : 'Próximo passo'}
        </button>
      </footer>
    </section>
  )
}

// =========================
// SITE EDITOR SCHEMA
// =========================
MonteSuaCoifa.schema = {
  title: 'Monte Sua Coifa (Quiz)',
  description:
    'Edite perguntas, respostas, imagens e filtros de produtos via Site Editor.',
  type: 'object',
  properties: {
    questions: {
      title: 'Perguntas (10)',
      type: 'array',
      minItems: 10,
      maxItems: 10,
      items: {
        title: 'Pergunta',
        type: 'object',
        properties: {
          id: {
            title: 'ID interno',
            type: 'string',
            widget: { 'ui:widget': 'hidden' },
          },
          title: { title: 'Pergunta (título)', type: 'string' },
          description: { title: 'Texto de apoio', type: 'string' },
          filterFieldId: {
            title: 'ID do atributo no catálogo do produto pai para esta pergunta (ex: 3876)',
            type: 'string',
          },
          options: {
            title: 'Respostas (opções)',
            type: 'array',
            items: {
              title: 'Opção de resposta',
              type: 'object',
              properties: {
                id: {
                  title: 'ID da opção',
                  type: 'string',
                  widget: { 'ui:widget': 'hidden' },
                },
                name: { title: 'Nome da opção (texto exibido)', type: 'string' },
                image: {
                  title: 'Imagem da opção',
                  type: 'string',
                  widget: { 'ui:widget': 'image-uploader' },
                },
              },
            },
          },
        },
      },
      default: DEFAULT_QUESTIONS.map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        filterFieldId:
          q.filterFieldId ||
          (Array.isArray(q.options) ? q.options[0]?.filterFieldId || '' : ''),
        options: q.options.map((o) => ({
          id: o.id,
          name: o.label,
          image: '', // editor pode subir, default fica como fallback local
        })),
      })),
    },

    colorPicker: {
      title: 'Seletor de cores (opcional)',
      type: 'object',
      properties: {
        enabled: {
          title: 'Ativar seletor de cor',
          type: 'boolean',
          default: true,
        },
        questionId: {
          title: 'ID da pergunta que abre o seletor',
          type: 'string',
          default: 'acabamento',
          widget: { 'ui:widget': 'hidden' },
        },
        triggerOptionId: {
          title: 'ID da opção que abre o seletor',
          type: 'string',
          default: 'colorido',
          widget: { 'ui:widget': 'hidden' },
        },
        text: { title: 'Texto acima das cores', type: 'string' },
        hint: { title: 'Texto de ajuda (quando nenhuma cor foi escolhida)', type: 'string' },
        options: {
          title: 'Cores',
          type: 'array',
          items: {
            title: 'Cor',
            type: 'object',
            properties: {
              id: {
                title: 'ID da cor',
                type: 'string',
                widget: { 'ui:widget': 'hidden' },
              },
              name: { title: 'Nome da cor', type: 'string' },
              hex: { title: 'Cor (HEX)', type: 'string' },
            },
          },
        },
      },
      default: {
        ...DEFAULT_COLOR_PICKER,
        options: DEFAULT_COLOR_PICKER.options.map((c) => ({
          id: c.id,
          name: c.label,
          hex: c.hex,
        })),
      },
    },
  },
}

export default MonteSuaCoifa
