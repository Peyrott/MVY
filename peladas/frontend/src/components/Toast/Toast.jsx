import React from 'react';
import { useToast } from '../../hooks/useToast.js';
import styles from './Toast.module.css';

/**
 * Toast Container Component
 * Displays toast notifications
 */
export function Toast() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} role="region" aria-live="polite" aria-label="Notificações">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
          role="alert"
        >
          <span className={styles.icon}>
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'warning' && '!'}
          </span>
          <span className={styles.message}>{toast.message}</span>
          <button
            className={styles.close}
            onClick={() => dismissToast(toast.id)}
            aria-label="Fechar notificação"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;
