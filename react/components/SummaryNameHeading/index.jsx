import React from 'react'
import { useProduct } from 'vtex.product-context'

function normalizeBlockClass(blockClass) {
  if (Array.isArray(blockClass)) {
    return blockClass.find(Boolean) || ''
  }

  return blockClass || ''
}

function getProductName(product) {
  return product?.productName || product?.productNameComplete || ''
}

function getHeadingClassName(blockClass) {
  const normalizedBlockClass = normalizeBlockClass(blockClass)
  const blockSuffix = normalizedBlockClass ? ` vtex-product-summary-2-x-productNameContainer--${normalizedBlockClass} vtex-product-summary-2-x-nameWrapper--${normalizedBlockClass}` : ''

  return `vtex-product-summary-2-x-productNameContainer vtex-product-summary-2-x-nameWrapper mv0 overflow-hidden c-on-base f5${blockSuffix}`
}

function getTextClassName(blockClass) {
  const normalizedBlockClass = normalizeBlockClass(blockClass)
  const blockSuffix = normalizedBlockClass ? ` vtex-product-summary-2-x-productBrand--${normalizedBlockClass} vtex-product-summary-2-x-brandName--${normalizedBlockClass}` : ''

  return `vtex-product-summary-2-x-productBrand vtex-product-summary-2-x-brandName t-body${blockSuffix}`
}

function SummaryNameHeading({ blockClass }) {
  const productContext = useProduct()
  const productName = getProductName(productContext?.product)

  if (!productName) return null

  return (
    <h2 className={getHeadingClassName(blockClass)}>
      <span className={getTextClassName(blockClass)}>{productName}</span>
    </h2>
  )
}

export default SummaryNameHeading
