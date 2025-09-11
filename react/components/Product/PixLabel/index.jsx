import { useProduct } from 'vtex.product-context'
import { Pix } from '../../Icons'
import styles from './pix.label.css'

const PixLabel = () => {
  const { product } = useProduct()

  // sellers e teasers sempre como arrays
  const sellers = product?.items?.[0]?.sellers ?? []
  const teasers = sellers?.[0]?.commertialOffer?.teasers ?? []

  let discountValue = 0

  if (Array.isArray(teasers)) {
    for (const teaser of teasers) {
      const name = typeof teaser?.name === 'string' ? teaser.name.toLowerCase() : ''
      if (!name.includes('pix')) continue

      const params = teaser?.effects?.parameters ?? []
      if (!Array.isArray(params)) continue

      const percentParam = params.find(p => p?.name === 'PercentualDiscount')
      if (percentParam?.value != null) {
        const n = Number(String(percentParam.value).replace(',', '.'))
        if (Number.isFinite(n)) {
          discountValue = n
          break
        }
      }
    }
  }

  if (discountValue <= 0) return null

  return (
    <p className={styles.pixLabel}>
      <Pix />
      {discountValue}% OFF
    </p>
  )
}

export default PixLabel
