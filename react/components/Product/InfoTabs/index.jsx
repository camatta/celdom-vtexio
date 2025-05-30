import { useState, useEffect, useRef } from 'react'
import { useProduct } from 'vtex.product-context'
import styles from './infoTabs.css'

const InfoTabs = () => {
  const productContext = useProduct()
  const productId = productContext?.product?.cacheId
  const productDescription = productContext?.product?.description
  const productSpecificationGroups = productContext?.product?.specificationGroups

  if (!productSpecificationGroups?.length) return null

  const [productSpecifications, setProductSpecifications] = useState({
    activeSpecification: 0,
    specificationsTabs: [],
    specificationContent: productDescription || '',
  })

  const [openTabHeader, setOpenTabHeader] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSeeMore, setShowSeeMore] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    const tabs = [{ name: 'Descrição', values: [productDescription] }]

    const specificationsGroup = productSpecificationGroups?.find(
      ({ name }) => name === 'Especificações' || name === 'allSpecifications'
    )?.specifications

    if (specificationsGroup?.length) {
      tabs.push(...specificationsGroup)
    }

    setProductSpecifications(prev => ({
      ...prev,
      specificationsTabs: tabs,
      specificationContent: tabs[0]?.values?.[0] || ''
    }))
  }, [productId, productDescription, productSpecificationGroups])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (contentRef.current && contentRef.current.scrollHeight > 306) {
        setShowSeeMore(true)
      } else {
        setShowSeeMore(false)
      }
    }, 50) // aguarda o DOM renderizar

    return () => clearTimeout(timeout)
  }, [productSpecifications.activeSpecification, productSpecifications.specificationContent])

  const handleBtnControl = tabIndex => {
    setProductSpecifications(prevState => ({
      ...prevState,
      activeSpecification: tabIndex,
      specificationContent: prevState.specificationsTabs[tabIndex]?.values[0] || '',
    }))
    setOpenTabHeader(!openTabHeader)
    setIsExpanded(false)
  }

  const activeTab = productSpecifications.specificationsTabs[productSpecifications.activeSpecification]

  return (
    <>
      {productSpecifications.specificationsTabs?.length > 0 && (
        <div className={styles.productInfoTabs}>
          <div className={styles.tabHeader}>
            {productSpecifications.specificationsTabs.map((info, index) => (
              <button
                type="button"
                onClick={() => handleBtnControl(index)}
                key={info.name || `tab-${index}`}
                className={`${styles.infoControl} ${
                  productSpecifications.activeSpecification === index ? styles.active : ''
                }`}
              >
                {info.name}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab?.name === 'Gabarito' ? (
              <a
                href={productSpecifications.specificationContent}
                download
                className={styles.downloadButton}
                target="_blank"
              >
                Gabarito do Produto
              </a>
            ) : (
              <>
                <div
                  ref={contentRef}
                  className={`${styles.contentBox} ${isExpanded ? styles.expanded : ''}`}
                  dangerouslySetInnerHTML={{
                    __html: productSpecifications.specificationContent || '',
                  }}
                />
                {showSeeMore && !isExpanded && (
                  <button
                    className={styles.seeMoreButton}
                    onClick={() => setIsExpanded(true)}
                  >
                    Ver mais
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default InfoTabs
