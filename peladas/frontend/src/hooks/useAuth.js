import { useAuth as useAuthContext } from '../context/AuthContext.jsx';

/**
 * Hook to access authentication state and methods
 * @returns {import('../context/AuthContext.jsx').AuthContextValue}
 */
export function useAuth() {
  return useAuthContext();
}

export default useAuth;
