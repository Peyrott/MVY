import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReviewCard } from '../../components/ReviewCard/ReviewCard.jsx';
import { BookingModal } from '../../components/BookingModal/BookingModal.jsx';
import { AuthModal } from '../../components/AuthModal/AuthModal.jsx';
import { useCourts } from '../../hooks/useCourts.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { fetchReviewsByCourt, createReview } from '../../services/reviews.service.js';
import { fetchMyBookings } from '../../services/bookings.service.js';
import { formatCurrency, formatDate, formatSport, formatRating } from '../../utils/formatters.js';
import styles from './CourtDetail.module.css';

const SPORT_ICONS = {
  futebol: '⚽',
  futsal: '⚽',
  volei: '🏐',
  basquete: '🏀',
  tenis: '🎾',
  beach_tennis: '🎾',
  padel: '🎾',
  handebol: '🤾'
};

/**
 * Court Detail Page Component
 */
export function CourtDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { court, loading, error, fetchCourtById, fetchTimeSlots, timeSlots } = useCourts();
  const { isLoggedIn } = useAuth();
  const { showError, showSuccess } = useToast();

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchCourtById(id);
  }, [id, fetchCourtById]);

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(id, selectedDate);
    }
  }, [selectedDate, id, fetchTimeSlots]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const { reviews: data } = await fetchReviewsByCourt(id, 10);
        setReviews(data);
      } catch (err) {
        console.error('Error loading reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, [id]);

  useEffect(() => {
    const checkCanReview = async () => {
      if (!isLoggedIn) return;
      try {
        const bookings = await fetchMyBookings();
        const hasCompletedBooking = bookings.some(
          b => b.court_id === id && b.status === 'completed'
        );
        setCanReview(hasCompletedBooking);
      } catch (err) {
        console.error('Error checking review eligibility:', err);
      }
    };

    checkCanReview();
  }, [id, isLoggedIn]);

  const handleSlotSelect = (slot) => {
    if (slot.is_booked) return;
    setSelectedSlot(slot);
  };

  const handleBook = () => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!selectedSlot) {
      showError('Selecione um horário');
      return;
    }
    setIsBookingModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await createReview({
        court_id: id,
        booking_id: '', // This would need to be passed from the booking
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      showSuccess('Avaliação enviada com sucesso!');
      setReviewForm({ rating: 5, comment: '' });
      // Refresh reviews
      const { reviews: data } = await fetchReviewsByCourt(id, 10);
      setReviews(data);
    } catch (err) {
      showError(err.message || 'Erro ao enviar avaliação');
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Carregando...</p>
      </div>
    );
  }

  if (error || !court) {
    return (
      <div className={styles.error}>
        <h2>Quadra não encontrada</h2>
        <button onClick={() => navigate('/courts')} className={styles.backButton}>
          Voltar para quadras
        </button>
      </div>
    );
  }

  const imageUrl = court.photos?.[0] || '/placeholder-court.jpg';
  const sportIcon = SPORT_ICONS[court.sport] || '🏟️';

  return (
    <div className={styles.courtDetail}>
      {/* Hero Image */}
      <div className={styles.hero}>
        <img src={imageUrl} alt={court.name} className={styles.heroImage} />
        <div className={styles.heroOverlay} />
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          ← Voltar
        </button>
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          {/* Main Info */}
          <div className={styles.main}>
            <div className={styles.header}>
              <div className={styles.sportBadge}>
                <span className={styles.sportIcon}>{sportIcon}</span>
                {formatSport(court.sport)}
              </div>
              <div className={styles.rating}>
                <span className={styles.ratingStar}>★</span>
                <span className={styles.ratingValue}>{formatRating(court.rating)}</span>
                <span className={styles.reviewCount}>({court.review_count} avaliações)</span>
              </div>
            </div>

            <h1 className={styles.name}>{court.name}</h1>
            <p className={styles.address}>{court.address}, {court.city} - {court.state}</p>

            {court.description && (
              <p className={styles.description}>{court.description}</p>
            )}

            {court.amenities?.length > 0 && (
              <div className={styles.amenities}>
                <h3>Comodidades</h3>
                <div className={styles.amenitiesList}>
                  {court.amenities.map((amenity) => (
                    <span key={amenity} className={styles.amenity}>
                      ✓ {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className={styles.reviewsSection}>
              <h3>Avaliações</h3>
              {reviewsLoading ? (
                <div className={styles.reviewsLoading}>Carregando avaliações...</div>
              ) : reviews.length > 0 ? (
                <div className={styles.reviewsList}>
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <p className={styles.noReviews}>Nenhuma avaliação ainda.</p>
              )}

              {canReview && (
                <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                  <h4>Deixe sua avaliação</h4>
                  <div className={styles.ratingInput}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`${styles.starButton} ${star <= reviewForm.rating ? styles.active : ''}`}
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Conte sua experiência..."
                    rows={4}
                    required
                  />
                  <button type="submit" className={styles.submitReview}>
                    Enviar avaliação
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.bookingCard}>
              <div className={styles.price}>
                <span className={styles.priceValue}>{formatCurrency(court.price_per_hour)}</span>
                <span className={styles.priceUnit}>/hora</span>
              </div>

              <div className={styles.datePicker}>
                <label htmlFor="booking-date">Selecione a data</label>
                <input
                  id="booking-date"
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                />
              </div>

              {selectedDate && (
                <div className={styles.timeSlots}>
                  <label>Selecione o horário</label>
                  <div className={styles.slotsGrid}>
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        className={`${styles.slot} ${
                          slot.is_booked ? styles.booked : ''
                        } ${selectedSlot?.id === slot.id ? styles.selected : ''}`}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={slot.is_booked}
                      >
                        {slot.start_time.substring(0, 5)}
                        {slot.price_override && (
                          <span className={styles.slotPrice}>
                            {formatCurrency(slot.price_override)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                className={styles.bookButton}
                onClick={handleBook}
                disabled={!selectedSlot}
              >
                {selectedSlot ? 'Reservar agora' : 'Selecione um horário'}
              </button>

              {selectedSlot && (
                <div className={styles.bookingSummary}>
                  <div className={styles.summaryRow}>
                    <span>Data:</span>
                    <span>{formatDate(selectedDate)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Horário:</span>
                    <span>{formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                    <span>Total:</span>
                    <span>{formatCurrency(selectedSlot.price_override || court.price_per_hour)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        court={court}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          if (selectedSlot) {
            setIsBookingModalOpen(true);
          }
        }}
      />
    </div>
  );
}

export default CourtDetail;
