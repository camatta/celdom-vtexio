import React from 'react'
import { FormattedCurrency } from 'vtex.format-currency'

import * as Styled from './styles'
import './cupom.css'

import {
  MinicartCouponContext,
  MinicartCouponProvider,
} from './components/MinicartCouponProvider'

const MinicartCoupon = () => {
  return (
    <MinicartCouponProvider>
      <MinicartCouponContext.Consumer>
        {(context) => {
          const marketingData = context.orderForm?.marketingData || {}
          const appliedCoupon = marketingData.coupon || ''
          const discountValue = Math.max(
            0,
            Math.abs(context.orderForm?.totalizers?.[1]?.value || 0) / 100
          )

          return (
            <Styled.Wrapper>
              <Styled.Container>
                {!appliedCoupon ? (
                  <>
                    <Styled.Input
                      type="text"
                      placeholder="Adicionar cupom de desconto"
                      value={context.state.coupon}
                      onChange={(e) =>
                        context.setState({
                          coupon: e.target.value,
                        })
                      }
                    />
                    <Styled.Button
                      onClick={() => {
                        context.setState({ loading: true })
                        context.postCoupon(context.state.coupon)
                      }}
                    >
                      {context.state.loading ? <Styled.Spinner /> : 'Adicionar'}
                    </Styled.Button>
                  </>
                ) : (
                  <>
                    <Styled.DiscountWrapper>
                      <Styled.Input
                        type="text"
                        placeholder="Codigo"
                        value={appliedCoupon}
                        disabled
                      />
                      <Styled.Button
                        onClick={() => {
                          context.setState({ loading: true })
                          context.removeCoupon()
                        }}
                        title="Remover cupom"
                      >
                        {context.state.loading ? <Styled.Spinner /> : 'x'}
                      </Styled.Button>

                      <Styled.Discount>
                        - <FormattedCurrency value={discountValue} />
                      </Styled.Discount>
                    </Styled.DiscountWrapper>
                  </>
                )}
              </Styled.Container>
              {context.state.codeReturn && (
                <Styled.Message error={context.state.codeReturn.error ? true : false}>
                  {context.state.codeReturn.message}
                </Styled.Message>
              )}
            </Styled.Wrapper>
          )
        }}
      </MinicartCouponContext.Consumer>
    </MinicartCouponProvider>
  )
}

export default MinicartCoupon
