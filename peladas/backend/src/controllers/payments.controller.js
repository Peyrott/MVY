import { preferenceClient } from '../services/mercadopago.js';
import { supabase } from '../services/supabase.js';

/**
 * Create Mercado Pago payment preference
 */
export async function createPreference(req, res, next) {
  try {
    const { booking_id } = req.body;
    const userId = req.user.id;

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, court:courts(name, description)')
      .eq('id', booking_id)
      .eq('user_id', userId)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is not pending' });
    }

    // Create Mercado Pago preference
    const preference = {
      items: [
        {
          title: `Reserva - ${booking.court.name}`,
          description: booking.court.description,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: booking.total
        }
      ],
      payer: {
        email: req.user.email,
        name: req.user.user_metadata?.name || req.user.email
      },
      external_reference: booking_id,
      back_urls: {
        success: `${process.env.FRONTEND_URL}/booking/success`,
        failure: `${process.env.FRONTEND_URL}/booking/failure`,
        pending: `${process.env.FRONTEND_URL}/booking/pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.API_URL}/webhooks/mercadopago`
    };

    const response = await preferenceClient.create({ body: preference });

    res.json({
      init_point: response.init_point,
      preference_id: response.id
    });
  } catch (error) {
    console.error('Mercado Pago error:', error);
    next(error);
  }
}

/**
 * Handle Mercado Pago webhook
 */
export async function handleWebhook(req, res, next) {
  try {
    // In a real implementation, verify webhook signature
    const body = req.body;

    if (body.type === 'payment') {
      const paymentId = body.data.id;

      // Fetch payment details from Mercado Pago
      // Update booking status based on payment status
      // Send confirmation email

      res.status(200).json({ received: true });
    } else {
      res.status(200).json({ received: true });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to prevent Mercado Pago from retrying
    res.status(200).json({ received: true });
  }
}
