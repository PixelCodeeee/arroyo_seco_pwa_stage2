import React, { useState } from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { paypalAPI } from '../services/api';
import { getCart, clearCart } from '../utils/cartUtils';

function PayPalCheckout({ amount, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  const createOrder = async (data, actions) => {
    try {
      setLoading(true);
      const cart = getCart();
      
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new Error('Carrito vacío');
      }

      const orderData = {
        items: cart.items,
        total: amount
      };

      console.log('Creating PayPal order with data:', orderData);

      const response = await paypalAPI.createOrder(orderData);
      
      console.log('Order created:', response.orderID);

      return response.orderID;
    } catch (error) {
      console.error('Error creating order:', error);
      setLoading(false);
      onError?.(error);
      throw error;
    }
  };

  const onApprove = async (data, actions) => {
    try {
      setLoading(true);
      const cart = getCart();

      console.log('Capturing order:', data.orderID);

      // Get current user (optional for testing)
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

      const captureData = {
        orderID: data.orderID,
        cartData: cart,
        id_usuario: currentUser?.id_usuario || null // Optional for testing
      };

      const response = await paypalAPI.captureOrder(captureData);

      console.log('Payment captured:', response);

      if (response.success) {
        // Clear cart
        clearCart();
        
        // Call success callback
        onSuccess?.(response);
      } else {
        throw new Error('Error al capturar el pago');
      }

    } catch (error) {
      console.error('Error capturing order:', error);
      setLoading(false);
      onError?.(error);
    }
  };

  const onCancel = (data) => {
    console.log('Payment cancelled', data);
    setLoading(false);
    onError?.(new Error('Pago cancelado por el usuario'));
  };

  const onErrorHandler = (err) => {
    console.error('PayPal error:', err);
    setLoading(false);
    onError?.(err);
  };

  return (
    <div className="paypal-checkout-container">
      {loading && (
        <div className="paypal-loading">
          <div className="spinner"></div>
          <p>Procesando pago...</p>
        </div>
      )}
      
      <PayPalButtons
        style={{ 
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay',
          height: 45
        }}
        createOrder={createOrder}
        onApprove={onApprove}
        onCancel={onCancel}
        onError={onErrorHandler}
        disabled={loading}
      />
    </div>
  );
}

export default PayPalCheckout;