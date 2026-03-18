import { useState, useCallback } from 'react';
import {
  fetchCourts as fetchCourtsService,
  fetchCourtById as fetchCourtByIdService,
  fetchTimeSlots as fetchTimeSlotsService,
  fetchFeaturedCourts as fetchFeaturedCourtsService,
  toggleFavorite as toggleFavoriteService,
  getFavorites as getFavoritesService,
  isCourtFavorited as isCourtFavoritedService
} from '../services/courts.service.js';

/**
 * Hook for courts data management
 * @returns {{
 *   courts: Array,
 *   court: Object|null,
 *   timeSlots: Array,
 *   featuredCourts: Array,
 *   favorites: Array,
 *   loading: boolean,
 *   error: string|null,
 *   pagination: Object,
 *   fetchCourts: Function,
 *   fetchCourtById: Function,
 *   fetchTimeSlots: Function,
 *   fetchFeaturedCourts: Function,
 *   toggleFavorite: Function,
 *   fetchFavorites: Function,
 *   checkIsFavorited: Function
 * }}
 */
export function useCourts() {
  const [courts, setCourts] = useState([]);
  const [court, setCourt] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [featuredCourts, setFeaturedCourts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const fetchCourts = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCourtsService(filters);
      setCourts(result.courts);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourtById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCourtByIdService(id);
      setCourt(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTimeSlots = useCallback(async (courtId, date) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTimeSlotsService(courtId, date);
      setTimeSlots(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedCourts = useCallback(async (limit = 6) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFeaturedCourtsService(limit);
      setFeaturedCourts(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (courtId) => {
    try {
      const result = await toggleFavoriteService(courtId);
      // Update favorites list
      await fetchFavorites();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const fetchFavorites = useCallback(async () => {
    try {
      const result = await getFavoritesService();
      setFavorites(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const checkIsFavorited = useCallback(async (courtId) => {
    try {
      return await isCourtFavoritedService(courtId);
    } catch (err) {
      return false;
    }
  }, []);

  return {
    courts,
    court,
    timeSlots,
    featuredCourts,
    favorites,
    loading,
    error,
    pagination,
    fetchCourts,
    fetchCourtById,
    fetchTimeSlots,
    fetchFeaturedCourts,
    toggleFavorite,
    fetchFavorites,
    checkIsFavorited
  };
}

export default useCourts;
