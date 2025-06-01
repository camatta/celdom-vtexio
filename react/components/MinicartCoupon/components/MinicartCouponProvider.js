import React, { useState, createContext, useEffect } from 'react';
import axios from 'axios';
import { useOrderForm } from 'vtex.order-manager/OrderForm';
import { useOrderItems } from 'vtex.order-items/OrderItems';

const MinicartCouponContext = createContext();

const MinicartCouponProvider = ({ children }) => {
    const [state, setState] = useState({
        coupon: '',
        loading: false,
        codeReturn: {
            success: false,
            error: false,
            message: '',
        },
    });
    const { orderForm } = useOrderForm();
    const { updateQuantity } = useOrderItems();

    const updateOrderForm = async () => {
        if (orderForm.items && orderForm.items.length) {
            const item = orderForm.items[0];
            await updateQuantity({
                uniqueId: item.uniqueId,
                quantity: item.quantity,
            });
        }
    };

    const postCoupon = async (coupon) => {
        if (!coupon) {
            return setState({
                loading: false,
                coupon: '',
                codeReturn: {
                    success: false,
                    error: true,
                    message: `Por favor, preencha o campo em branco.`,
                },
            });
        }
        await axios
            .post(
                `/api/checkout/pub/orderForm/${orderForm.id}/attachments/marketingData`,
                { coupon }
            )
            .then(({ data }) => {
                const { messages, marketingData } = data;
                const error = messages.filter(
                    ({ status }) => status === 'warning'
                );

                if (error && error.length && error[0].text.includes(coupon)) {
                    setState({
                        loading: false,
                        coupon: '',
                        codeReturn: {
                            success: false,
                            error: true,
                            message: error[0].text,
                        },
                    });
                }
                if (marketingData.coupon === coupon) {
                    setState({
                        loading: false,
                        codeReturn: {
                            success: true,
                            error: false,
                            message: `Cupom ${coupon} aplicado`,
                        },
                    });
                }
                updateOrderForm();
            });
    };

    const removeCoupon = async () => {
        await axios.post(
            `/api/checkout/pub/orderForm/${orderForm.id}/coupons`,
            {
                text: '',
            }
        );
        setState({ loading: false, coupon: '' });
        updateOrderForm();
    };

    return (
        <MinicartCouponContext.Provider
            value={{
                state: state,
                orderForm: orderForm,
                setState: setState,
                postCoupon: postCoupon,
                removeCoupon: removeCoupon,
            }}
        >
            {children}
        </MinicartCouponContext.Provider>
    );
};

export { MinicartCouponContext, MinicartCouponProvider };