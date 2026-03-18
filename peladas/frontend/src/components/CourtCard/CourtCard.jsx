import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useCourts } from '../../hooks/useCourts.js';
import { formatCurrency, formatRating, formatSport } from '../../utils/formatters.js';
import styles from './CourtCard.module.css';

/**
 * Court Card Component
 * @param {Object} props
 * @param {Object} props.court
 * @param {boolean} [props.showFavorite]
 * @param {Function} [props.onFavoriteToggle]
 */
export function CourtCard({ court, showFavorite = true, onFavoriteToggle }) {
  const { isLoggedIn } = useAuth();
  const { checkIsFavorited, toggleFavorite } = useCourts();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check initial favorite status
  React.useEffect(() => {
    if (isLoggedIn && showFavorite) {
      checkIsFavorited(court.id).then(setIsFavorited);
    }
  }, [isLoggedIn, court.id, showFavorite, checkIsFavorited]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) return;

    setIsLoading(true);
    try {
      const result = await toggleFavorite(court.id);
      setIsFavorited(result.isFavorited);
      if (onFavoriteToggle) {
        onFavoriteToggle(court.id, result.isFavorited);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const imageUrl = court.photos?.[0] || '/placeholder-court.jpg';

  return (
    <Link to={`/courts/${court.id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        <img
          src={imageUrl}
          alt={court.name}
          className={styles.image}
          loading="lazy"
        />
        {showFavorite && isLoggedIn && (
          <button
            className={`${styles.favoriteButton} ${isFavorited ? styles.favorited : ''}`}
            onClick={handleFavoriteClick}
            disabled={isLoading}
            aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isFavorited ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
        <div className={styles.sportBadge}>
          {formatSport(court.sport)}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{court.name}</h3>
          <div className={styles.rating}>
            <span className={styles.ratingStar}>★</span>
            <span className={styles.ratingValue}>{formatRating(court.rating)}</span>
            <span className={styles.reviewCount}>({court.review_count})</span>
          </div>
        </div>

        <p className={styles.address}>{court.address}, {court.city}</p>

        {court.amenities?.length > 0 && (
          <div className={styles.amenities}>
            {court.amenities.slice(0, 3).map((amenity) => (
              <span key={amenity} className={styles.amenity}>
                {amenity}
              </span>
            ))}
            {court.amenities.length > 3 && (
              <span className={styles.amenity}>+{court.amenities.length - 3}</span>
            )}
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.price}>
            <span className={styles.priceValue}>{formatCurrency(court.price_per_hour)}</span>
            <span className={styles.priceUnit}>/hora</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default CourtCard;
