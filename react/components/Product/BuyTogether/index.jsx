// react/components/BuyTogether.jsx
import React, { useState, useMemo, useEffect } from 'react'
import { useProduct } from 'vtex.product-context'
import { useOrderForm } from 'vtex.order-manager/OrderForm'
import { useCssHandles } from 'vtex.css-handles'
import { Button } from 'vtex.styleguide'
import styles from './buytogether.css'

const CSS_HANDLES = [
  'buyTogetherContainer',
  'buyTogetherTitle',
  'buyTogetherWrapper',
  'buyTogetherProducts',
  'buyTogetherProduct',
  'buyTogetherProductImage',
  'buyTogetherProductContent',
  'buyTogetherProductName',
  'buyTogetherProductPrice',
  'buyTogetherPriceHighlight',
  'buyTogetherInstallments',
  'buyTogetherTotal',
  'buyTogetherTotalProducts',
  'buyTogetherTotalPrice',
  'buyTogetherButton',
  'buyTogetherPlus'
]

const BuyTogether = ({ title = 'Compre Junto' }) => {
  const handles = useCssHandles(CSS_HANDLES)
  const { product: mainProduct } = useProduct() || {}
  const { orderForm, setOrderForm } = useOrderForm()
  const [isAdding, setIsAdding] = useState(false)
  const [recommendedProduct, setRecommendedProduct] = useState(null)
  const [loading, setLoading] = useState(false)

  const formatPrice = price =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)

  const calculateInstallments = (price, installments = 10) => {
    const total = price * 1.053
    const installmentValue = total / installments
    return { total: formatPrice(total), installment: formatPrice(installmentValue) }
  }

  const getImageUrl = product =>
    product?.items?.[0]?.images?.[0]?.imageUrl || '/arquivos/no-image.png'

  const getProductPrice = product =>
    product?.priceRange?.sellingPrice?.highPrice ||
    product?.items?.[0]?.sellers?.[0]?.commertialOffer?.Price ||
    0

  const getProductSku = product =>
    product?.items?.[0]?.itemId || product?.productId

  const openMinicart = () => {
    window.dispatchEvent(new CustomEvent('openMinicart', { detail: { open: true } }))
    window.postMessage({ eventName: 'vtex:cartOpened' }, window.origin)
    const btn =
      document.querySelector('.vtex-minicart-2-x-minicartIconContainer') ||
      document.querySelector('[data-testid="minicart-button"]')
    if (btn) btn.click()
  }

  // NOVO: sempre pega o orderForm mais recente antes de adicionar (evita "só funciona uma vez")
  const refreshOrderForm = async () => {
    try {
      const res = await fetch('/api/checkout/pub/orderForm', {
        method: 'GET',
        credentials: 'include',
      })
      if (res.ok) {
        const latest = await res.json()
        setOrderForm(latest)
        return latest
      }
    } catch (e) {
      console.error('Erro ao atualizar orderForm:', e)
    }
    return orderForm
  }

  // Usa SEMPRE o orderFormId recebido (evita closure com id antigo)
  const addItem = async (orderFormId, product, sku, seller = '1') => {
    try {
      const imageUrl = getImageUrl(product)
      const skuName = product?.items?.[0]?.name || product?.productName
      const name = product?.productName || skuName
      const detailUrl = product?.linkText ? `/${product.linkText}/p` : '#'

      const payload = {
        items: [{ id: String(sku), quantity: 1, seller: String(seller) }],
        marketingData: { salesChannel: '1' },
        itemMetadata: {
          items: [
            {
              id: String(sku),
              seller: String(seller),
              name,
              skuName,
              imageUrl,
              detailUrl,
            },
          ],
        },
      }

      const response = await fetch(
        `/api/checkout/pub/orderForm/${orderFormId}/items?sc=1`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) throw new Error('Erro ao adicionar item')

      const newOrderForm = await response.json()
      setOrderForm(newOrderForm)

      // força re-render do minicart (mesmo comportamento do botão nativo)
      window.postMessage({ eventName: 'vtex:addToCart', items: payload.items }, window.origin)
      window.postMessage({ eventName: 'vtex:orderFormUpdated', orderForm: newOrderForm }, window.origin)
      window.dispatchEvent(new Event('orderFormUpdated.vtex'))
      openMinicart()
      return true
    } catch (err) {
      console.error('Erro em addItem:', err)
      return false
    }
  }

  const handleAddToCart = async () => {
    if (!mainProduct || !recommendedProduct || isAdding) return
    setIsAdding(true)
    try {
      // usa SEMPRE o id mais recente
      const current = await refreshOrderForm()
      const currentId = current?.id || orderForm?.id
      if (!currentId) throw new Error('orderForm.id indisponível')

      const mainSku = getProductSku(mainProduct)
      const recSku = getProductSku(recommendedProduct)

      const ok1 = await addItem(currentId, mainProduct, mainSku)
      const ok2 = await addItem(currentId, recommendedProduct, recSku)

      if (!ok1 || !ok2) {
        // fallback via redirect, mantendo sc=1
        await fetch(`/checkout/cart/add?sku=${mainSku}&qty=1&seller=1&sc=1`, { credentials: 'include' })
        await fetch(`/checkout/cart/add?sku=${recSku}&qty=1&seller=1&sc=1`, { credentials: 'include' })
        openMinicart()
        // pós-fallback, atualiza o orderForm também
        await refreshOrderForm()
      } else {
        // pós-sucesso, confirma estado mais recente
        await refreshOrderForm()
      }
    } catch (e) {
      console.error('Erro no handleAddToCart:', e)
    } finally {
      setIsAdding(false)
    }
  }

  // Buscar produtos recomendados
  useEffect(() => {
    if (!mainProduct?.productId) return
    const fetchSuggestions = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/catalog_system/pub/products/crossselling/suggestions/${mainProduct.productId}`
        )
        if (res.ok) {
          const products = await res.json()
          if (products.length) setRecommendedProduct(products[0])
        }
      } catch (e) {
        console.error('Erro ao buscar sugestões:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchSuggestions()
  }, [mainProduct?.productId])

  const totalPrice = useMemo(() => {
    if (!mainProduct || !recommendedProduct) return 0
    return getProductPrice(mainProduct) + getProductPrice(recommendedProduct)
  }, [mainProduct, recommendedProduct])

  const totalInstallments = useMemo(() => calculateInstallments(totalPrice), [totalPrice])

  if (!mainProduct || !recommendedProduct || loading) return null

  return (
    <div className={styles.buyTogetherContainer}>
      <div className={styles.buyTogetherWrapper}>
        <h2 className={styles.buyTogetherTitle}>{title}</h2>

        <div className={styles.buyTogetherProducts}>
          {/* Produto Principal */}
          <div className={styles.buyTogetherProduct}>
            <div className={styles.buyTogetherProductImage}>
              <img src={getImageUrl(mainProduct)} alt={mainProduct.productName} loading="lazy" />
            </div>
            <div className={styles.buyTogetherProductContent}>
              <h3 className={styles.buyTogetherProductName}>{mainProduct.productName}</h3>
              <div className={styles.buyTogetherProductPrice}>
                <strong className={styles.buyTogetherPriceHighlight}>
                  {formatPrice(getProductPrice(mainProduct))} no boleto ou pix
                </strong>
              </div>
            </div>
          </div>

          {/* Sinal de + */}
          <div className={styles.buyTogetherPlus}><span>+</span></div>

          {/* Produto Recomendado */}
          <div className={styles.buyTogetherProduct}>
            <div className={styles.buyTogetherProductImage}>
              <img src={getImageUrl(recommendedProduct)} alt={recommendedProduct.productName} loading="lazy" />
            </div>
            <div className={styles.buyTogetherProductContent}>
              <h3 className={styles.buyTogetherProductName}>{recommendedProduct.productName}</h3>
              <div className={styles.buyTogetherProductPrice}>
                <strong className={styles.buyTogetherPriceHighlight}>
                  {formatPrice(getProductPrice(recommendedProduct))} no boleto ou pix
                </strong>
              </div>
            </div>
          </div>

          {/* Total e Botão */}
          <div className={styles.buyTogetherTotal}>
            <div className={styles.buyTogetherTotalProducts}>2 produtos</div>
            <div className={styles.buyTogetherTotalPrice}>
              <strong className={styles.buyTogetherPriceHighlight}>
                {formatPrice(totalPrice)} no boleto ou pix
              </strong>
              <p className={styles.buyTogetherInstallments}>
                ou <strong>{totalInstallments.total}</strong> em 10x de {totalInstallments.installment} sem juros
              </p>
            </div>
            <div className={styles.buyTogetherButton}>
              <Button
                variation="primary"
                size="large"
                isLoading={isAdding}
                onClick={handleAddToCart}
              >
                {isAdding ? 'Adicionando...' : 'Compre Junto'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuyTogether
