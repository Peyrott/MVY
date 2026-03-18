import { useToast as useToastContext } from '../context/ToastContext.jsx';

/**
 * Hook to access toast notifications
 * @returns {import('../context/ToastContext.jsx').ToastContextValue}
 */
export function useToast() {
  return useToastContext();
}

export default useToast;
