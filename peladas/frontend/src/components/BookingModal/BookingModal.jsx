import React, { useState } from 'react';
import { useBookings } from '../../hooks/useBookings.js';
import { useToast } from '../../hooks/useToast.js';
import { createPreference } from '../../services/payments.service.js';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters.js';
import styles from './BookingModal.module.css';

/**
 * Booking Modal Component
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Object} props.court
 * @param {string} props.selectedDate
 * @param {Object} props.selectedSlot
 */
export function BookingModal({ isOpen, onClose, court, selectedDate, selectedSlot }) {
  const [isLoading, setIsLoading] = useState(false);
  const { createBooking } = useBookings();
  const { showError, showSuccess } = useToast();

  if (!isOpen || !court || !selectedDate || !selectedSlot) return null;

  const price = selectedSlot.price_override || court.price_per_hour;
  const platformFee = price * 0.20;
  const total = price;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      // Create booking
      const { booking } = await createBooking(court.id, selectedDate, selectedSlot.start_time);

      // Create Mercado Pago preference
      const { init_point } = await createPreference(booking.id);

      showSuccess('Redirecionando para o pagamento...');

      // Redirect to Mercado Pago
      window.location.href = init_point;
    } catch (error) {
      showError(error.message || 'Erro ao criar reserva');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose} disabled={isLoading}>
          ×
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>Confirmar Reserva</h2>
          <p className={styles.subtitle}>Revise os detalhes antes de prosseguir</p>
        </div>

        <div className={styles.content}>
          <div className={styles.courtInfo}>
            <img
              src={court.photos?.[0] || '/placeholder-court.jpg'}
              alt={court.name}
              className={styles.courtImage}
            />
            <div className={styles.courtDetails}>
              <h3 className={styles.courtName}>{court.name}</h3>
              <p className={styles.courtAddress}>{court.address}, {court.city}</p>
            </div>
          </div>

          <div className={styles.bookingDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Data</span>
              <span className={styles.detailValue}>{formatDate(selectedDate)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Horário</span>
              <span className={styles.detailValue}>{formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</span>
            </div>
          </div>

          <div className={styles.pricing}>
            <div className={styles.priceRow}>
              <span>Valor da quadra</span>
              <span>{formatCurrency(price)}</span>
            </div>
            <div className={styles.priceRow}>
              <span>Taxa de serviço</span>
              <span className={styles.fee}>Incluso</span>
            </div>
            <div className={`${styles.priceRow} ${styles.total}`}>
              <span>Total</span>
              <span className={styles.totalValue}>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className={styles.notice}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p>Você será redirecionado para o Mercado Pago para completar o pagamento.</p>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancelButton}
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : 'Pagar com Mercado Pago'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;
