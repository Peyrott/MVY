import React from 'react';
import { formatDate, formatRelativeTime, getInitials } from '../../utils/formatters.js';
import styles from './ReviewCard.module.css';

/**
 * Review Card Component
 * @param {Object} props
 * @param {Object} props.review
 */
export function ReviewCard({ review }) {
  const rating = review.rating || 0;
  const userName = review.user?.name || 'Usuário';
  const comment = review.comment || '';
  const createdAt = review.created_at;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.user}>
          <div className={styles.avatar}>
            {getInitials(userName)}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <time className={styles.date} dateTime={createdAt}>
              {formatRelativeTime(createdAt)}
            </time>
          </div>
        </div>

        <div className={styles.rating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`${styles.star} ${star <= rating ? styles.filled : ''}`}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {comment && (
        <p className={styles.comment}>{comment}</p>
      )}
    </div>
  );
}

export default ReviewCard;
