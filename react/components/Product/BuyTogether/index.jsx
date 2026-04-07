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
  'buyTogetherPlus',
]

const BuyTogether = ({ title = 'Compre Junto' }) => {
  useCssHandles(CSS_HANDLES)
  const { product: mainProduct } = useProduct() || {}
  const { orderForm, setOrderForm } = useOrderForm()

  const [isAdding, setIsAdding] = useState(false)
  const [recommendedProducts, setRecommendedProducts] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchProductById = async (productId) => {
    if (!productId) return null

    try {
      const response = await fetch(
        `/api/catalog_system/pub/products/search/?fq=productId:${productId}`
      )

      if (!response.ok) return null

      const products = await response.json()
      return products?.[0] || null
    } catch (error) {
      console.error('Erro ao buscar produto completo:', error)
      return null
    }
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price || 0)

  const getCommercialOffer = (product) => product?.items?.[0]?.sellers?.[0]?.commertialOffer

  const getSpotDiscountPercent = (product) => {
    const teasers = getCommercialOffer(product)?.teasers || []

    return teasers.reduce((highestDiscount, teaser) => {
      const teaserName = teaser?.name?.toLowerCase?.() || ''
      const isSpotPaymentPromotion =
        teaserName.includes('pix') || teaserName.includes('boleto')

      if (!isSpotPaymentPromotion) return highestDiscount

      const teaserDiscount = (teaser?.effects?.parameters || []).reduce(
        (currentDiscount, parameter) => {
          if (parameter?.name !== 'PercentualDiscount') return currentDiscount

          const parsedDiscount = parseFloat(parameter?.value)

          return Number.isFinite(parsedDiscount)
            ? Math.max(currentDiscount, parsedDiscount)
            : currentDiscount
        },
        0
      )

      return Math.max(highestDiscount, teaserDiscount)
    }, 0)
  }

  const getCashPriceData = (product) => {
    const offer = getCommercialOffer(product)
    const basePrice = offer?.Price || product?.priceRange?.sellingPrice?.highPrice || 0
    const discountPercent = getSpotDiscountPercent(product)
    const finalPrice =
      discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice

    return {
      basePrice,
      discountPercent,
      finalPrice,
    }
  }

  const getInstallmentData = (product, preferredInstallments = 10) => {
    const offer = getCommercialOffer(product)
    const cashPrice = getCashPriceData(product).finalPrice
    const installmentOptions = offer?.Installments || []

    const preferredOption = installmentOptions.find(
      (option) => option?.NumberOfInstallments === preferredInstallments
    )

    const fallbackOption = [...installmentOptions].sort(
      (a, b) => (b?.NumberOfInstallments || 0) - (a?.NumberOfInstallments || 0)
    )[0]

    const selectedOption = preferredOption || fallbackOption

    if (selectedOption) {
      const installments = selectedOption?.NumberOfInstallments || preferredInstallments
      const total =
        selectedOption?.TotalValuePlusInterestRate ||
        (selectedOption?.Value || 0) * installments

      return {
        total,
        installment: selectedOption?.Value || total / installments,
        installments,
      }
    }

    const listPrice = offer?.ListPrice
    const total = listPrice && listPrice >= cashPrice ? listPrice : cashPrice

    return {
      total,
      installment: preferredInstallments > 0 ? total / preferredInstallments : total,
      installments: preferredInstallments,
    }
  }

  const getImageUrl = (product) => {
    const images = product?.items?.[0]?.images || []
    const rasterImage = images.find(
      (image) => image?.imageUrl && !/\.svg(?:\?|$)/i.test(image.imageUrl)
    )

    return rasterImage?.imageUrl || images?.[0]?.imageUrl || '/arquivos/no-image.png'
  }

  const getCartImageUrl = (product) => {
    const imageUrl = getImageUrl(product)

    if (!imageUrl) return '/arquivos/no-image.png'

    if (/ids\/\d+-\d+-\d+/i.test(imageUrl)) {
      return imageUrl.replace(/ids\/(\d+)-\d+-\d+/i, 'ids/$1-512-512')
    }

    if (/ids\/\d+/i.test(imageUrl)) {
      return imageUrl.replace(/ids\/(\d+)/i, 'ids/$1-512-512')
    }

    return imageUrl
  }

  const getProductSku = (product) => product?.items?.[0]?.itemId || product?.productId
  const getSellerId = (product) => product?.items?.[0]?.sellers?.[0]?.sellerId || '1'

  const openMinicart = () => {
    window.dispatchEvent(new CustomEvent('openMinicart', { detail: { open: true } }))
    window.postMessage({ eventName: 'vtex:cartOpened' }, window.origin)

    const btn =
      document.querySelector('.vtex-minicart-2-x-minicartIconContainer') ||
      document.querySelector('[data-testid="minicart-button"]')

    if (btn) btn.click()
  }

  const syncMinicart = (latestOrderForm) => {
    if (!latestOrderForm) return

    const productImageMap = [mainProduct, ...recommendedProducts].reduce((acc, product) => {
      const sku = String(getProductSku(product) || '')

      if (sku) acc[sku] = getCartImageUrl(product)

      return acc
    }, {})

    const syncedOrderForm = {
      ...latestOrderForm,
      items: (latestOrderForm.items || []).map((item) => {
        const imageUrl = productImageMap[String(item.id)]

        if (!imageUrl) return item

        return {
          ...item,
          imageUrl,
          imageUrls: {
            at1x: imageUrl,
            at2x: imageUrl,
            at3x: imageUrl,
          },
        }
      }),
    }

    window.postMessage(
      { eventName: 'vtex:orderFormUpdated', orderForm: syncedOrderForm },
      window.origin
    )
    window.dispatchEvent(new Event('orderFormUpdated.vtex'))
    window.postMessage(
      { eventName: 'vtex:addToCart', items: syncedOrderForm.items || [] },
      window.origin
    )
    setOrderForm(syncedOrderForm)
  }

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
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) throw new Error('Erro ao adicionar item')

      const newOrderForm = await response.json()
      setOrderForm(newOrderForm)
      return newOrderForm
    } catch (err) {
      console.error('Erro em addItem:', err)
      return null
    }
  }

  const handleAddToCart = async () => {
    if (!mainProduct || !recommendedProducts.length || isAdding) return

    setIsAdding(true)

    try {
      const current = await refreshOrderForm()
      const currentId = current?.id || orderForm?.id

      if (!currentId) throw new Error('orderForm.id indisponivel')

      for (const product of [mainProduct, ...recommendedProducts]) {
        const sku = getProductSku(product)
        const seller = getSellerId(product)
        const updatedOrderForm = await addItem(currentId, product, sku, seller)

        if (!updatedOrderForm) {
          await fetch(`/checkout/cart/add?sku=${sku}&qty=1&seller=${seller}&sc=1`, {
            credentials: 'include',
          })
        }
      }

      const latestOrderForm = await refreshOrderForm()
      syncMinicart(latestOrderForm)
      openMinicart()
    } catch (e) {
      console.error('Erro no handleAddToCart:', e)
    } finally {
      setIsAdding(false)
    }
  }

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
          const uniqueSuggestedProducts = products.filter(
            (product, index, currentProducts) =>
              product?.productId &&
              String(product.productId) !== String(mainProduct.productId) &&
              currentProducts.findIndex(
                (currentProduct) =>
                  String(currentProduct?.productId) === String(product.productId)
              ) === index
          )

          if (!uniqueSuggestedProducts.length) {
            setRecommendedProducts([])
            return
          }

          const completeSuggestedProducts = await Promise.all(
            uniqueSuggestedProducts.map(async (suggestedProduct) => {
              const completeSuggestedProduct = await fetchProductById(
                suggestedProduct?.productId
              )

              return completeSuggestedProduct || suggestedProduct
            })
          )

          setRecommendedProducts(completeSuggestedProducts.filter(Boolean))
        }
      } catch (e) {
        console.error('Erro ao buscar sugestoes:', e)
        setRecommendedProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [mainProduct?.productId])

  const allProducts = useMemo(
    () => (mainProduct ? [mainProduct, ...recommendedProducts] : []),
    [mainProduct, recommendedProducts]
  )

  const pricingData = useMemo(() => {
    const productCards = allProducts.map((product) => {
      const cashPrice = getCashPriceData(product)
      const installments = getInstallmentData(product)

      return {
        product,
        cashPrice,
        installments,
      }
    })

    const totalSpotDiscountPercent = productCards.reduce(
      (highestDiscount, productData) =>
        Math.max(highestDiscount, productData.cashPrice.discountPercent || 0),
      0
    )

    const productsWithDisplayPrice = productCards.map((productData) => {
      const displayedCashPrice = productData.installments.total
        ? totalSpotDiscountPercent > 0
          ? productData.installments.total * (1 - totalSpotDiscountPercent / 100)
          : productData.cashPrice.finalPrice
        : productData.cashPrice.finalPrice

      return {
        ...productData,
        displayedCashPrice,
      }
    })

    const totalInstallmentValue = productsWithDisplayPrice.reduce(
      (total, productData) => total + (productData.installments.total || 0),
      0
    )

    const totalCashValue = productsWithDisplayPrice.reduce(
      (total, productData) => total + (productData.cashPrice.finalPrice || 0),
      0
    )

    const validInstallmentCounts = productsWithDisplayPrice
      .map((productData) => productData.installments.installments || 10)
      .filter(Boolean)

    const totalInstallmentsCount = validInstallmentCounts.length
      ? Math.min(...validInstallmentCounts)
      : 10

    return {
      productCards: productsWithDisplayPrice,
      totalPrice:
        totalSpotDiscountPercent > 0
          ? totalInstallmentValue * (1 - totalSpotDiscountPercent / 100)
          : totalCashValue,
      totalInstallments: {
        total: totalInstallmentValue,
        installment:
          totalInstallmentsCount > 0
            ? totalInstallmentValue / totalInstallmentsCount
            : totalInstallmentValue,
        installments: totalInstallmentsCount,
      },
    }
  }, [allProducts])

  if (!mainProduct || !recommendedProducts.length || loading) return null

  return (
    <div className={styles.buyTogetherContainer}>
      <div className={styles.buyTogetherWrapper}>
        <h2 className={styles.buyTogetherTitle}>{title}</h2>

        <div className={styles.buyTogetherProducts}>
          {pricingData.productCards.map(({ product, displayedCashPrice, installments }, index) => (
            <React.Fragment key={getProductSku(product)}>
              <div className={styles.buyTogetherProduct}>
                <div className={styles.buyTogetherProductImage}>
                  <img src={getImageUrl(product)} alt={product?.productName} loading="lazy" />
                </div>

                <div className={styles.buyTogetherProductContent}>
                  <h3 className={styles.buyTogetherProductName}>{product?.productName}</h3>

                  <div className={styles.buyTogetherProductPrice}>
                    <strong className={styles.buyTogetherPriceHighlight}>
                      {formatPrice(displayedCashPrice)} no boleto ou pix
                    </strong>
                    <p className={styles.buyTogetherInstallments}>
                      ou <strong>{formatPrice(installments.total)}</strong> em{' '}
                      {installments.installments}x de {formatPrice(installments.installment)} sem
                      juros
                    </p>
                  </div>
                </div>
              </div>

              {index < pricingData.productCards.length - 1 ? (
                <div className={styles.buyTogetherPlus}>
                  <span>+</span>
                </div>
              ) : null}
            </React.Fragment>
          ))}

          <div className={styles.buyTogetherTotal}>
            <div className={styles.buyTogetherTotalProducts}>
              {pricingData.productCards.length} produtos
            </div>

            <div className={styles.buyTogetherTotalPrice}>
              <strong className={styles.buyTogetherPriceHighlight}>
                {formatPrice(pricingData.totalPrice)} no boleto ou pix
              </strong>
              <p className={styles.buyTogetherInstallments}>
                ou <strong>{formatPrice(pricingData.totalInstallments.total)}</strong> em até{' '}
                {pricingData.totalInstallments.installments}x de{' '}
                {formatPrice(pricingData.totalInstallments.installment)} sem juros
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
