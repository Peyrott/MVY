import { supabase } from './supabase.js';

/**
 * @typedef {Object} Court
 * @property {string} id
 * @property {string} name
 * @property {string} sport
 * @property {string} description
 * @property {number} price_per_hour
 * @property {string} address
 * @property {string} city
 * @property {string} state
 * @property {string[]} amenities
 * @property {string[]} photos
 * @property {number} rating
 * @property {number} review_count
 * @property {boolean} is_active
 * @property {string} created_at
 */

/**
 * @typedef {Object} TimeSlot
 * @property {string} id
 * @property {string} court_id
 * @property {number} weekday
 * @property {string} start_time
 * @property {string} end_time
 * @property {number|null} price_override
 * @property {boolean} is_available
 */

/**
 * Fetch courts with filters and pagination
 * @param {Object} filters
 * @param {string} [filters.sport]
 * @param {string} [filters.city]
 * @param {number} [filters.lat]
 * @param {number} [filters.lng]
 * @param {number} [filters.radius]
 * @param {string} [filters.sortBy]
 * @param {number} [filters.page]
 * @param {number} [filters.limit]
 * @returns {Promise<{courts: Court[], pagination: {page: number, limit: number, total: number, totalPages: number}}>}
 */
export async function fetchCourts(filters = {}) {
  const { sport, city, lat, lng, radius = 10, sortBy = 'rating', page = 1, limit = 12 } = filters;

  let query = supabase
    .from('courts')
    .select('*', { count: 'exact' })
    .eq('is_active', true);

  // Apply filters
  if (sport) {
    query = query.eq('sport', sport);
  }

  if (city) {
    query = query.ilike('city', `%${city}%`);
  }

  // Apply sorting
  const sortMap = {
    price_asc: { column: 'price_per_hour', ascending: true },
    price_desc: { column: 'price_per_hour', ascending: false },
    rating: { column: 'rating', ascending: false },
    newest: { column: 'created_at', ascending: false }
  };

  const sort = sortMap[sortBy] || sortMap.rating;
  query = query.order(sort.column, { ascending: sort.ascending });

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  // If geo filter is applied, filter by distance
  let courts = data || [];
  if (lat && lng) {
    // Calculate distance using Haversine formula
    courts = courts.map(court => {
      if (court.location) {
        const distance = calculateDistance(lat, lng, court.location.coordinates[1], court.location.coordinates[0]);
        return { ...court, distance };
      }
      return { ...court, distance: null };
    }).filter(court => court.distance === null || court.distance <= radius);

    // Sort by distance if geo filter applied
    if (sortBy === 'distance') {
      courts.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }
  }

  return {
    courts,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };
}

/**
 * Fetch single court by ID
 * @param {string} id
 * @returns {Promise<Court>}
 */
export async function fetchCourtById(id) {
  const { data, error } = await supabase
    .from('courts')
    .select('*, owner:profiles!owner_id(name)')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch time slots for a court on a specific date
 * @param {string} courtId
 * @param {string} date - ISO date string (YYYY-MM-DD)
 * @returns {Promise<Array>}
 */
export async function fetchTimeSlots(courtId, date) {
  // Get weekday from date (0-6)
  const weekday = new Date(date).getDay();

  // Get available time slots for this weekday
  const { data: slots, error: slotsError } = await supabase
    .from('time_slots')
    .select('*')
    .eq('court_id', courtId)
    .eq('weekday', weekday)
    .eq('is_available', true)
    .order('start_time');

  if (slotsError) throw new Error(slotsError.message);

  // Check which slots are already booked
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('time_slot')
    .eq('court_id', courtId)
    .eq('booking_date', date)
    .in('status', ['pending', 'confirmed']);

  if (bookingsError) throw new Error(bookingsError.message);

  const bookedSlots = new Set(bookings?.map(b => b.time_slot) || []);

  // Mark booked slots
  return (slots || []).map(slot => ({
    ...slot,
    is_booked: bookedSlots.has(slot.start_time),
    date
  }));
}

/**
 * Fetch featured courts
 * @param {number} limit
 * @returns {Promise<Court[]>}
 */
export async function fetchFeaturedCourts(limit = 6) {
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Toggle favorite for a court
 * @param {string} courtId
 * @returns {Promise<{isFavorited: boolean}>}
 */
export async function toggleFavorite(courtId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('court_id', courtId)
    .single();

  if (existing) {
    // Remove favorite
    await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);
    return { isFavorited: false };
  } else {
    // Add favorite
    await supabase
      .from('favorites')
      .insert({ user_id: user.id, court_id: courtId });
    return { isFavorited: true };
  }
}

/**
 * Get user's favorites
 * @returns {Promise<Court[]>}
 */
export async function getFavorites() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('favorites')
    .select('court:courts(*)')
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  return (data || []).map(f => f.court);
}

/**
 * Check if court is favorited
 * @param {string} courtId
 * @returns {Promise<boolean>}
 */
export async function isCourtFavorited(courtId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('court_id', courtId)
    .single();

  return !!data;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distance in km
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
