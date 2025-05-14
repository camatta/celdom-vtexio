import { useState, useEffect } from 'react'

import { useOrderForm } from 'vtex.order-manager/OrderForm'
import { FormattedCurrency } from 'vtex.format-currency'

import styles from './MinicartSubtotal'

const MinicartSubtotal = () => {
  const [subtotalValue, setSubtotalValue] = useState(0)
  const {
    orderForm: { totalizers }
  } = useOrderForm()

  useEffect(() => {
    const value = totalizers[0]?.value ? totalizers[0]?.value / 100 : 0
    setSubtotalValue(value)
  }, [totalizers])

  return (
    <>
      {!!subtotalValue && (
      <div className={styles.subtotalContainer}>
        <span>Subtotal</span>
        <span><FormattedCurrency value={Math.max(0, subtotalValue)} /></span>
      </div>
      )}
    </>
  )
}

export default MinicartSubtotal