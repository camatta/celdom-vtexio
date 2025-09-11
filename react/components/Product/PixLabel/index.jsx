{/*

  //Código abaixo é o original

import { useProduct } from 'vtex.product-context'
import { useState, useEffect } from 'react'

import { Pix } from '../../Icons'

import styles from './pix.label.css'

const PixLabel = () => {
  const [discountValue, setDiscountValue] = useState(0)
  const { product } = useProduct()
  const sellers = product?.items[0]?.sellers

  if (!sellers.length) return null

  useEffect(() => {
    const teasers = sellers[0]?.commertialOffer?.teasers

    teasers.map(teaser => {
      if (teaser.name.toLowerCase().includes('pix')) {
        teaser.effects.parameters.map(param => {
          if (param.name === 'PercentualDiscount' && discountValue === 0) {
            setDiscountValue(parseFloat(param.value))
          }
        })
      }
    })
  }, [product.cacheId])

  if (!discountValue) return null

  return (
    <p className={styles.pixLabel}>
      <Pix />
      {discountValue}% OFF
    </p>
  )
}

export default PixLabel
*/}

import { useProduct } from 'vtex.product-context'
import { useState, useEffect } from 'react'
import { Pix } from '../../Icons'
import styles from './pix.label.css'

const PixLabel = () => {
  // 🔌 Plugin desativado: não renderiza nada
  return null

  /*
  // versão original
  const [discountValue, setDiscountValue] = useState(0)
  const { product } = useProduct()
  const sellers = product?.items[0]?.sellers ?? []

  if (sellers.length === 0) return null

  useEffect(() => {
    const teasers = sellers[0]?.commertialOffer?.teasers ?? []

    teasers.forEach(teaser => {
      if (teaser?.name?.toLowerCase().includes('pix')) {
        teaser?.effects?.parameters?.forEach(param => {
          if (param?.name === 'PercentualDiscount' && discountValue === 0) {
            setDiscountValue(parseFloat(param.value))
          }
        })
      }
    })
  }, [product?.cacheId])

  if (!discountValue) return null

  return (
    <p className={styles.pixLabel}>
      <Pix />
      {discountValue}% OFF
    </p>
  )
  */
}

export default PixLabel
