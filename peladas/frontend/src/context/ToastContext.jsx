import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * @typedef {Object} Toast
 * @property {string} id
 * @property {'success' | 'error' | 'warning'} type
 * @property {string} message
 */

/**
 * @typedef {Object} ToastContextValue
 * @property {Toast[]} toasts
 * @property {Function} showSuccess
 * @property {Function} showError
 * @property {Function} showWarning
 * @property {Function} dismissToast
 */

const ToastContext = createContext(/** @type {ToastContextValue} */({}));

/**
 * Hook to access toast context
 * @returns {ToastContextValue}
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * Generate unique ID
 * @returns {string}
 */
function generateId() {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Toast Provider Component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState(/** @type {Toast[]} */([]));

  /**
   * Dismiss toast by ID
   * @param {string} id
   */
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Add toast to queue
   * @param {Toast} toast
   * @param {number} duration
   */
  const addToast = useCallback((toast, duration = 3000) => {
    const id = generateId();
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss
    setTimeout(() => {
      dismissToast(id);
    }, duration);

    return id;
  }, [dismissToast]);

  /**
   * Show success toast
   * @param {string} message
   * @returns {string} toast ID
   */
  const showSuccess = useCallback((message) => {
    return addToast({ type: 'success', message }, 3000);
  }, [addToast]);

  /**
   * Show error toast
   * @param {string} message
   * @returns {string} toast ID
   */
  const showError = useCallback((message) => {
    return addToast({ type: 'error', message }, 5000);
  }, [addToast]);

  /**
   * Show warning toast
   * @param {string} message
   * @returns {string} toast ID
   */
  const showWarning = useCallback((message) => {
    return addToast({ type: 'warning', message }, 4000);
  }, [addToast]);

  const value = {
    toasts,
    showSuccess,
    showError,
    showWarning,
    dismissToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export default ToastContext;
