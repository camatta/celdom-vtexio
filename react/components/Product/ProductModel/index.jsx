import { useProduct } from 'vtex.product-context'
import styles from './product.model.css'

const ProductModel = () => {
  const ctx = useProduct()
  const product = ctx?.product

  // Garante array
  const properties = Array.isArray(product?.properties) ? product.properties : []
  if (properties.length === 0) return null

  // Procura a propriedade "Modelo" (case-insensitive)
  const modeloProp = properties.find(p => {
    const n = typeof p?.name === 'string' ? p.name.toLowerCase() : ''
    return n === 'modelo'
  })

  if (!modeloProp) return null

  // Garante array de values e pega o primeiro não vazio
  const values = Array.isArray(modeloProp.values) ? modeloProp.values : []
  const firstValue = values.find(v => typeof v === 'string' && v.trim() !== '')

  if (!firstValue) return null

  return (
    <p className={styles.productModel}>
      Modelo: {firstValue}
    </p>
  )
}

export default ProductModel
