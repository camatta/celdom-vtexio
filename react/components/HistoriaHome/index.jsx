import React, { useState } from 'react'
import styles from './historia-home.css'

const HistoriaHome = ({
  title = 'Nossa história',
  subtitle = 'Nosso principal objetivo é viabilizar a compra para que você e seus projetos alcancem o alto grau de inspiração!',
  linkText = 'Saiba mais sobre nossa história',
  linkUrl = '/nossa-historia',
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
  // Estatísticas fixas (não mais configuráveis via props)
  const stats = [
    { number: '+45', label: 'anos de história' },
    { number: '+2000', label: 'produtos em catálogo' },
    { number: '+10', label: 'marcas parceiras' },
    { number: '+500', label: 'projetos com arquitetos' },
    { number: '+15', label: 'design weeks' },
  ];

  const [activeTab, setActiveTab] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const handleTab = (tabIndex) => {
    setActiveTab(tabIndex);
    setIsOpen(prev => !prev);
  };

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

      {/* Estatísticas FIXAS */}
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
  );
};

// (Os componentes auxiliares permanecem os mesmos)
const LogoCeldom = () => (
 <svg
                width="121"
                height="30"
                viewBox="0 0 121 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_12060_7623)">
                  <path
                    d="M21.5649 24.0083V28.5847C19.8345 29.125 17.5003 29.3743 14.4406 29.5V28.9596C17.3381 27.837 19.6724 25.8808 21.5649 24.0083Z"
                    fill="#FE5000"
                  />
                  <path
                    d="M22.5557 19.5136C22.5557 14.1874 26.6203 10.3608 31.4509 9.9021V10.3189C29.68 10.7755 28.914 12.6501 28.914 17.4339C28.914 22.2176 31.0476 24.7142 34.6301 24.7142C36.7637 24.7142 38.6157 24.0481 39.7829 23.0909V23.7151C39.019 25.8368 36.8853 29.456 31.7325 29.456C25.5748 29.456 22.5557 24.8377 22.5557 19.5114V19.5136ZM34.1884 16.8935C34.1884 12.8994 33.544 10.6123 32.458 10.3189V9.9021C37.6108 10.2351 39.6228 14.1036 39.6228 17.7669H30.1238V17.3081L34.1884 16.8913V16.8935Z"
                    fill="#FE5000"
                  />
                  <path
                    d="M47.6937 0.5V29.1251H41.3738V1.16606L47.6937 0.5Z"
                    fill="#FE5000"
                  />
                  <path
                    d="M49.2559 20.0142C49.2559 13.4815 54.287 10.1115 59.3993 9.90421V10.3211C57.1846 10.6541 55.7763 13.3999 55.7763 19.3922C55.7763 24.5509 57.6283 26.6726 59.7215 26.6726C60.5259 26.6726 61.2918 26.2557 61.6546 25.9227V26.3395C61.0507 27.879 59.6425 29.4603 56.6234 29.4603C51.9955 29.4603 49.258 25.6735 49.258 20.0164L49.2559 20.0142ZM60.6069 10.3188V9.90201C61.0891 9.90201 62.1368 10.0277 62.459 10.0674V1.16606L68.7789 0.5V28.792L62.459 29.3743V11.2341C61.9362 10.7754 61.4519 10.5262 60.6069 10.3188Z"
                    fill="#FE5000"
                  />
                  <path
                    d="M70.2598 19.6812C70.2598 14.1477 74.4865 10.3608 79.7994 9.9043V10.3211C79.2766 10.4469 78.7923 10.738 78.4317 11.071C77.143 12.4031 76.8208 14.8997 76.8208 19.6835C76.8208 24.4672 77.143 26.9638 78.4317 28.254C78.7944 28.6708 79.2766 28.92 79.7994 29.0436V29.4604C74.4865 29.0016 70.2598 25.217 70.2598 19.6835V19.6812ZM82.3342 28.2518C83.6229 26.9616 83.9451 24.465 83.9451 19.6812C83.9451 14.8975 83.6229 12.4009 82.3342 11.0688C82.012 10.7358 81.4892 10.4447 81.0049 10.3189V9.9021C86.2772 10.3586 90.504 14.1455 90.504 19.679C90.504 25.2126 86.2772 28.9994 81.0049 29.456V29.0391C81.4871 28.9134 82.012 28.6223 82.3342 28.2496V28.2518Z"
                    fill="#FE5000"
                  />
                  <path
                    d="M98.2169 9.82031V29.125H91.9376V10.4864L98.2169 9.82031ZM100.833 12.983C100.069 12.983 99.6251 13.2322 98.9808 13.6071V13.2741C100.148 11.4855 102 9.90412 104.616 9.90412C108.198 9.90412 109.606 11.9839 109.606 15.3142V29.1272H103.327V15.731C103.327 13.7748 102.642 12.9852 100.831 12.9852L100.833 12.983ZM112.224 12.983C111.461 12.983 111.017 13.2322 110.372 13.6071V13.2741C111.54 11.4855 113.351 9.90412 116.048 9.90412C119.59 9.90412 120.998 11.9839 120.998 15.3142V29.1272H114.719V15.731C114.719 13.7748 114.034 12.9852 112.222 12.9852L112.224 12.983Z"
                    fill="#FE5000"
                  />
                  <path
                    d="M0 16.02C0 8.19713 6.72104 2.87087 13.7664 2.53784V3.07819C9.70176 3.95156 7.48702 8.32064 7.48702 16.0178C7.48702 23.715 9.45853 28.084 13.5253 28.9574V29.4978C5.11226 29.1669 0 24.0083 0 16.02Z"
                    fill="#FE5000"
                  />
                  <path
                    d="M18.9281 2.86207C18.9281 2.86207 18.9281 2.85765 18.9281 2.85545C17.746 2.68563 16.4061 2.57976 14.9019 2.53345V3.07379C15.3307 3.22156 15.7361 3.38697 16.1245 3.56782C15.207 4.26917 14.6074 5.39397 14.6074 6.66433C14.6074 8.79263 16.2759 10.5747 18.3349 10.5747C20.5049 10.5747 22.1179 8.90732 22.1179 6.66433C22.1179 4.73673 20.7908 3.14437 18.9281 2.86207Z"
                    fill="#FE5000"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_12060_7623">
                    <rect
                      width="121"
                      height="29"
                      fill="white"
                      transform="translate(0 0.5)"
                    />
                  </clipPath>
                </defs>
              </svg>
);

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M4.8 13.5L3.75 12.45L10.95 5.25H4.5V3.75H13.5V12.75H12V6.3L4.8 13.5Z" fill="#2D2926"/>
  </svg>
);

const DropdownIcon = () => (
  <i className={styles.tabIcon}>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 12.6L16.6 8 18 9.4l-6 6-6-6L7.4 8z"/>
    </svg>
  </i>
);

const StatCard = ({ number, label }) => (
  <div className={styles.cardNumero}>
    <div className={styles.bigNumero}>
      <p>{number}</p>
    </div>
    <div className={styles.textNumero}>
      <p>{label}</p>
    </div>
  </div>
);

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
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
    <path fill="currentColor" d="M9 12L5.25 8.25 6.3 7.162l1.95 1.95V3h1.5v6.113l1.95-1.95 1.05 1.087zm-4.5 3q-.618 0-1.06-.44A1.45 1.45 0 0 1 3 13.5v-2.25h1.5v2.25h9v-2.25H15v2.25q0 .619-.44 1.06-.442.44-1.06.44z"/>
  </svg>
);

HistoriaHome.schema = {
  title: 'Bloco História Home',
  description: 'Bloco com estatísticas fixas e abas customizáveis',
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
};

export default HistoriaHome;