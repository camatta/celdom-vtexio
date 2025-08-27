// react/components/NomeComSku/index.jsx
import React from 'react'
import { useProduct } from 'vtex.product-context'
import styles from './nomecomsku.css'

const SEPARATOR = ' — ' 

// Normaliza acentos, caixa e espaços para comparação
function normalizeForCompare(str) {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

function getSkuName(product, context) {
  // Tenta pegar o SKU selecionado
  if (context?.selectedItem?.name) return context.selectedItem.name
  if (product?.selectedItem?.name) return product.selectedItem.name

  // Fallbacks comuns na VTEX
  return product?.sku?.name || product?.items?.[0]?.name || ''
}

function buildCombinedName(productNameRaw, skuNameRaw) {
  const productName = productNameRaw?.trim() || ''
  const skuName = skuNameRaw?.trim() || ''

  if (!productName && !skuName) return ''
  if (!skuName) return productName
  if (!productName) return skuName

  const nProd = normalizeForCompare(productName)
  const nSku = normalizeForCompare(skuName)

  // 1) Iguais → mostra só o pai
  if (nProd === nSku) {
    return productName
  }

  // 2) SKU é complemento do pai
  if (nSku.startsWith(nProd)) {
    const remainder = skuName.slice(productName.length)
    const cleanedRemainder = remainder.replace(/^(\s*[-–—:|]\s*|\s+)/, '').trim()

    if (!cleanedRemainder) return productName
    return `${productName}${SEPARATOR}${cleanedRemainder}`
  }

  // 3) Diferentes sem relação → concatena os dois
  return `${productName}${SEPARATOR}${skuName}`
}

const NomeComSku = () => {
  const context = useProduct()
  const product = context?.product

  if (!product) return null

  const productName = product?.productName || product?.productNameComplete || ''
  const skuName = getSkuName(product, context)

  const combined = buildCombinedName(productName, skuName)

  if (!combined) return null

  return <span className={styles.nomeComSku}>{combined}</span>
}

export default NomeComSku
