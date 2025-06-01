import { useProduct } from 'vtex.product-context'

const ProductBrandInfo = () => {
  const productContext = useProduct()
  const brand = productContext?.product?.brand

  if (!brand) return null

  return (
    <div>
      <p>{brand}</p>
    </div>
  )
}

export default ProductBrandInfo
