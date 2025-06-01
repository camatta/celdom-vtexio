import React from 'react';
import { FormattedCurrency } from 'vtex.format-currency'

import * as Styled from './styles';
import "./cupom.css";

import {
    MinicartCouponContext,
    MinicartCouponProvider,
} from './components/MinicartCouponProvider';

const MinicartCoupon = () => {
    return (
        <MinicartCouponProvider>
            <MinicartCouponContext.Consumer>
                {(context) => (
                    <Styled.Wrapper>
                        <Styled.Container>
                            {!context.orderForm.marketingData.coupon ? (
                                <>
                                    <Styled.Input
                                        type={`text`}
                                        placeholder={`Adicionar cupom de desconto`}
                                        value={context.state.coupon}
                                        onChange={(e) =>
                                            context.setState({
                                                coupon: e.target.value,
                                            })
                                        }
                                    />
                                    <Styled.Button
                                        onClick={() => {
                                            context.setState({ loading: true });
                                            context.postCoupon(
                                                context.state.coupon
                                            );
                                        }}
                                    >
                                        {context.state.loading ? (
                                            <Styled.Spinner />
                                        ) : (
                                            'Adicionar'
                                        )}
                                    </Styled.Button>
                                </>
                            ) : (
                                <>
                                    <Styled.DiscountWrapper>
                                        <Styled.Input
                                            type={`text`}
                                            placeholder={`Código`}
                                            value={
                                                context.orderForm.marketingData.coupon
                                            }
                                            disabled
                                        />
                                        <Styled.Button
                                            onClick={() => {
                                                context.setState({ loading: true });
                                                context.removeCoupon();
                                            }}
                                            title={`Remover cupom`}
                                        >
                                            {context.state.loading ? (
                                                <Styled.Spinner />
                                            ) : (
                                                'x'
                                            )}
                                        </Styled.Button>

                                        <Styled.Discount>
                                            - <FormattedCurrency value={Math.max(0, Math.abs(context.orderForm.totalizers[1]?.value) / 100)} />
                                        </Styled.Discount>                    
                                    </Styled.DiscountWrapper>
                                </>
                            )}
                        </Styled.Container>
                        {context.state.codeReturn && (
                            <Styled.Message
                                error={
                                    context.state.codeReturn.error
                                        ? true
                                        : false
                                }
                            >
                                {context.state.codeReturn.message}
                            </Styled.Message>
                        )}
                    </Styled.Wrapper>
                )}
            </MinicartCouponContext.Consumer>
        </MinicartCouponProvider>
    );
};

export default MinicartCoupon;