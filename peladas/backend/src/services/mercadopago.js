import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

const accessToken = process.env.MP_ACCESS_TOKEN;

if (!accessToken) {
  console.warn('Mercado Pago access token not configured');
}

const client = new MercadoPagoConfig({
  accessToken: accessToken || 'test-token',
  options: { timeout: 5000 }
});

export const preferenceClient = new Preference(client);
export const paymentClient = new Payment(client);

export default client;
