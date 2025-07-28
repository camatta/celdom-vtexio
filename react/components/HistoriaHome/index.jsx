import React, { useState } from 'react'
import styles from './historia-home.css'

const HistoriaHome = ({
  title = 'Nossa história',
  subtitle = 'Nosso principal objetivo é viabilizar a compra para que você e seus projetos alcancem o alto grau de inspiração!',
  linkText = 'Saiba mais sobre nossa história',
  linkUrl = '/nossa-historia',
  stats = [
    { number: '+45', label: 'anos de história' },
    { number: '+2000', label: 'produtos em catálogo' },
    { number: '+10', label: 'marcas parceiras' },
    { number: '+500', label: 'projetos com arquitetos' },
    { number: '+15', label: 'design weeks' },
  ],
  tabs = [
    {
      title: 'Celdom Profissional',
      text: 'Desde 2021, assinamos a nossa própria linha de equipamentos gourmet para residências, reunindo qualidade, design e tecnologia de um jeito bem brasileiro.',
      primaryButton: { label: 'Conheça', link: '/nossa-historia' },
      secondaryButton: { label: 'Baixar Catálogo', link: '/nossa-historia', icon: true },
      backgroundImage: '/arquivos/bg01-historia.png'
    },
    {
      title: 'KBIS 2025',
      text: 'Estar no KBIS 2025 é sempre uma oportunidade única para explorar as maiores inovações do design de cozinhas e banheiros.',
      primaryButton: { label: 'Tendências 2025', link: '/pagina' }
    }
  ]
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const handleTab = (tabIndex) => {
    setActiveTab(tabIndex)
    setIsOpen(prev => !prev)
  }

  const getTabBackgroundStyle = () => {
  const activeTabData = tabs[activeTab] || {};
  
  // Verificação robusta da URL
  const bgImage = activeTabData?.backgroundImage?.toString().trim() || '';
  
  if (!bgImage || !bgImage.startsWith('http')) {
    return {
      background: 'transparent',
      transition: 'all .3s ease-in-out'
    };
  }

  return {
    background: `url('${bgImage.replace(/'/g, '')}') center/cover no-repeat`,
    transition: 'all .3s ease-in-out'
  };
};

  return (
    <div className={styles.HistoriaHome}>
      {/* Topo com logo e subtítulo */}
      <div className={styles.topoHistoria}>
        <div className={styles.wrapperLogoHistoria}>
          <div className={styles.logoHistoria}>
            <LogoCeldom />
          </div>
          <div className={styles.fraseHistoria}>
            <p>{subtitle}</p>
          </div>
        </div>
        <div className={styles.saibaMaisHistoria}>
          <a href={linkUrl}>
            {linkText}
            <ArrowIcon />
          </a>
        </div>
      </div>

      {/* Estatísticas */}
      <div className={styles.numerosHistoria}>
        {stats.map((item, idx) => (
          <StatCard key={idx} number={item.number} label={item.label} />
        ))}
      </div>

      {/* Abas */}
      <div className={styles.historiaAbas}>
        <div 
          className={styles.wrapperHistoriaAbas}
          style={getTabBackgroundStyle()}
        >
          <div className={`${styles.abaNavegacao} ${isOpen ? styles.tabOpened : ''}`}>
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => handleTab(idx)}
                className={activeTab === idx ? styles.activeTab : ''}
              >
                {tab.title}
              </button>
            ))}
            <DropdownIcon />
          </div>
          
          <div className={styles.tabContent}>
            {tabs.map((tab, idx) => (
              activeTab === idx && (
                <TabPanel 
                  key={idx}
                  text={tab.text}
                  primaryButton={tab.primaryButton}
                  secondaryButton={tab.secondaryButton}
                />
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componentes auxiliares (mantidos os mesmos)
const LogoCeldom = () => (
  <svg width="121" height="30" viewBox="0 0 121 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* ... conteúdo do SVG ... */}
  </svg>
)

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M4.8 13.5L3.75 12.45L10.95 5.25H4.5V3.75H13.5V12.75H12V6.3L4.8 13.5Z" fill="#2D2926"/>
  </svg>
)

const DropdownIcon = () => (
  <i className={styles.tabIcon}>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 12.6L16.6 8 18 9.4l-6 6-6-6L7.4 8z"/>
    </svg>
  </i>
)

const StatCard = ({ number, label }) => (
  <div className={styles.cardNumero}>
    <div className={styles.bigNumero}>
      <p>{number}</p>
    </div>
    <div className={styles.textNumero}>
      <p>{label}</p>
    </div>
  </div>
)

const TabPanel = ({ text, primaryButton, secondaryButton }) => (
  <div className={styles.tabPanel}>
    <div className={styles.tabText}>
      <p>{text}</p>
    </div>
    <div className={styles.tabButtons}>
      {primaryButton && (
        <a className={styles.buttonMain} href={primaryButton.link}>
          {primaryButton.label}
        </a>
      )}
      {secondaryButton && (
        <a className={styles.buttonSecond} href={secondaryButton.link}>
          {secondaryButton.icon && (
            <DownloadIcon />
          )}
          {secondaryButton.label}
        </a>
      )}
    </div>
  </div>
)

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
    <path fill="currentColor" d="M9 12L5.25 8.25 6.3 7.162l1.95 1.95V3h1.5v6.113l1.95-1.95 1.05 1.087zm-4.5 3q-.618 0-1.06-.44A1.45 1.45 0 0 1 3 13.5v-2.25h1.5v2.25h9v-2.25H15v2.25q0 .619-.44 1.06-.442.44-1.06.44z"/>
  </svg>
)

HistoriaHome.schema = {
  title: 'Bloco História Home',
  description: 'Bloco com estatísticas e abas customizáveis',
  type: 'object',
  properties: {
    title: {
      title: 'Título',
      type: 'string',
      default: 'Nossa história',
    },
    subtitle: {
      title: 'Subtítulo',
      type: 'string',
      default: 'Nosso principal objetivo é viabilizar a compra para que você e seus projetos alcancem o alto grau de inspiração!',
    },
    linkText: {
      title: 'Texto do Link',
      type: 'string',
      default: 'Saiba mais sobre nossa história',
    },
    linkUrl: {
      title: 'URL do Link',
      type: 'string',
      default: '/nossa-historia',
    },
    stats: {
      title: 'Estatísticas',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          number: { title: 'Número', type: 'string' },
          label: { title: 'Texto', type: 'string' },
        },
      },
      default: [
        { number: '+45', label: 'anos de história' },
        { number: '+2000', label: 'produtos em catálogo' },
        { number: '+10', label: 'marcas parceiras' },
        { number: '+500', label: 'projetos com arquitetos' },
        { number: '+15', label: 'design weeks' },
      ],
    },
    tabs: {
      title: 'Abas',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { 
            title: 'Título da Aba', 
            type: 'string' 
          },
          text: { 
            title: 'Texto', 
            type: 'string' 
          },
          backgroundImage: {
            title: 'Imagem de Background (opcional)',
            type: 'string',
            widget: {
              'ui:widget': 'image-uploader'
            }
          },
          primaryButton: {
            title: 'Botão Principal',
            type: 'object',
            properties: {
              label: { title: 'Texto', type: 'string' },
              link: { title: 'Link', type: 'string' },
            },
          },
          secondaryButton: {
            title: 'Botão Secundário',
            type: 'object',
            properties: {
              label: { title: 'Texto', type: 'string' },
              link: { title: 'Link', type: 'string' },
              icon: { 
                title: 'Mostrar Ícone', 
                type: 'boolean',
                default: true 
              },
            },
          },
        },
      },
    },
  },
}

export default HistoriaHome