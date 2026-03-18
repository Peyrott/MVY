import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styles from './BookingSuccess.module.css';

/**
 * Booking Success Page Component
 * Shown after successful payment
 */
export function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  const isSuccess = status === 'approved' || !status;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={`${styles.icon} ${isSuccess ? styles.success : styles.pending}`}>
          {isSuccess ? '✓' : '⏳'}
        </div>

        <h1 className={styles.title}>
          {isSuccess ? 'Reserva Confirmada!' : 'Pagamento em Processamento'}
        </h1>

        <p className={styles.message}>
          {isSuccess
            ? 'Sua reserva foi confirmada com sucesso. Enviamos um e-mail com os detalhes.'
            : 'Seu pagamento está sendo processado. Você receberá uma confirmação por e-mail assim que for aprovado.'}
        </p>

        {paymentId && (
          <div className={styles.paymentInfo}>
            <span>ID do pagamento:</span>
            <code>{paymentId}</code>
          </div>
        )}

        <div className={styles.actions}>
          <Link to="/profile" className={styles.primaryButton}>
            Ver minhas reservas
          </Link>
          <Link to="/courts" className={styles.secondaryButton}>
            Explorar mais quadras
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BookingSuccess;
