import { api } from './api.js';

/**
 * Create Mercado Pago payment preference
 * @param {string} bookingId
 * @returns {Promise<{init_point: string}>}
 */
export async function createPreference(bookingId) {
  return await api.post('/payments/preference', { booking_id: bookingId });
}

/**
 * Get Mercado Pago public key
 * @returns {string}
 */
export function getPublicKey() {
  return import.meta.env.VITE_MP_PUBLIC_KEY;
}

/**
 * Initialize Mercado Pago SDK
 * This should be called when the checkout page loads
 */
export function initMercadoPago() {
  const mpKey = getPublicKey();
  if (!mpKey) {
    console.warn('Mercado Pago public key not configured');
    return null;
  }

  // In a real implementation, you would load the Mercado Pago SDK
  // and initialize it with the public key
  // For this project, we redirect to the checkout URL returned by the backend
  return mpKey;
}
