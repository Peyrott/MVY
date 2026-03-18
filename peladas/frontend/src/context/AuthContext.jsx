import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase.js';

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} name
 * @property {string|null} phone
 * @property {string|null} avatar_url
 * @property {boolean} is_owner
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {Object|null} user
 * @property {Profile|null} profile
 * @property {boolean} loading
 * @property {boolean} isLoggedIn
 * @property {boolean} isOwner
 * @property {Function} signIn
 * @property {Function} signUp
 * @property {Function} signOut
 * @property {Function} signInWithGoogle
 * @property {Function} updateProfile
 */

const AuthContext = createContext(/** @type {AuthContextValue} */({}));

/**
 * Hook to access auth context
 * @returns {AuthContextValue}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Auth Provider Component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!user;
  const isOwner = profile?.is_owner ?? false;

  /**
   * Fetch user profile from Supabase
   * @param {string} userId
   */
  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      setProfile(null);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  /**
   * Sign in with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{error: Error|null}>}
   */
  const signIn = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  /**
   * Sign up with email and password
   * @param {string} email
   * @param {string} password
   * @param {string} name
   * @returns {Promise<{error: Error|null}>}
   */
  const signUp = async (email, password, name) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  /**
   * Sign in with Google
   * @returns {Promise<{error: Error|null}>}
   */
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  /**
   * Sign out
   * @returns {Promise<void>}
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  /**
   * Update user profile
   * @param {Object} data
   * @param {string} [data.name]
   * @param {string} [data.phone]
   * @param {string} [data.avatar_url]
   * @returns {Promise<{error: Error|null}>}
   */
  const updateProfile = async (data) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile
      await fetchProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    isLoggedIn,
    isOwner,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
