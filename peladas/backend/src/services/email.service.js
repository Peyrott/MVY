import dotenv from 'dotenv';

dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * Send booking confirmation email
 * @param {Object} booking
 * @param {Object} court
 * @param {Object} user
 */
export async function sendBookingConfirmation(booking, court, user) {
  if (!RESEND_API_KEY) {
    console.log('Email would be sent (Resend not configured):', {
      to: user.email,
      subject: 'Reserva Confirmada',
      booking: booking.id
    });
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Peladas <reservas@peladas.com.br>',
        to: user.email,
        subject: 'Sua reserva foi confirmada!',
        html: `
          <h1>Reserva Confirmada!</h1>
          <p>Olá ${user.name},</p>
          <p>Sua reserva foi confirmada com sucesso!</p>
          <ul>
            <li>Quadra: ${court.name}</li>
            <li>Data: ${booking.booking_date}</li>
            <li>Horário: ${booking.time_slot}</li>
            <li>Valor: R$ ${booking.total}</li>
          </ul>
          <p>Endereço: ${court.address}, ${court.city} - ${court.state}</p>
        `
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

/**
 * Send booking cancellation email
 * @param {Object} booking
 * @param {Object} court
 * @param {Object} user
 */
export async function sendBookingCancellation(booking, court, user) {
  if (!RESEND_API_KEY) {
    console.log('Email would be sent (Resend not configured):', {
      to: user.email,
      subject: 'Reserva Cancelada',
      booking: booking.id
    });
    return;
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Peladas <reservas@peladas.com.br>',
        to: user.email,
        subject: 'Sua reserva foi cancelada',
        html: `
          <h1>Reserva Cancelada</h1>
          <p>Olá ${user.name},</p>
          <p>Sua reserva foi cancelada.</p>
          <ul>
            <li>Quadra: ${court.name}</li>
            <li>Data: ${booking.booking_date}</li>
            <li>Horário: ${booking.time_slot}</li>
          </ul>
        `
      })
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
