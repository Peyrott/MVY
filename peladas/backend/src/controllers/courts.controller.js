import { supabase } from '../services/supabase.js';

/**
 * List courts with filters and pagination
 */
export async function listCourts(req, res, next) {
  try {
    const { sport, city, page = 1, limit = 12 } = req.query;

    let query = supabase
      .from('courts')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (sport) {
      query = query.eq('sport', sport);
    }

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('rating', { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      courts: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single court by ID
 */
export async function getCourt(req, res, next) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('courts')
      .select('*, owner:profiles!owner_id(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Court not found' });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * Get time slots for a court on a specific date
 */
export async function getTimeSlots(req, res, next) {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const weekday = new Date(date).getDay();

    // Get available time slots
    const { data: slots, error: slotsError } = await supabase
      .from('time_slots')
      .select('*')
      .eq('court_id', id)
      .eq('weekday', weekday)
      .eq('is_available', true)
      .order('start_time');

    if (slotsError) throw slotsError;

    // Get booked slots
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('time_slot')
      .eq('court_id', id)
      .eq('booking_date', date)
      .in('status', ['pending', 'confirmed']);

    if (bookingsError) throw bookingsError;

    const bookedSlots = new Set(bookings?.map(b => b.time_slot) || []);

    const result = (slots || []).map(slot => ({
      ...slot,
      is_booked: bookedSlots.has(slot.start_time)
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Create new court (owner only)
 */
export async function createCourt(req, res, next) {
  try {
    const { name, sport, description, price_per_hour, address, city, state, zip_code, amenities } = req.body;

    const { data, error } = await supabase
      .from('courts')
      .insert({
        owner_id: req.user.id,
        name,
        sport,
        description,
        price_per_hour,
        address,
        city,
        state,
        zip_code,
        amenities: amenities || []
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * Update court (owner only)
 */
export async function updateCourt(req, res, next) {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: existing } = await supabase
      .from('courts')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!existing || existing.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { data, error } = await supabase
      .from('courts')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle court active status (owner only)
 */
export async function toggleCourt(req, res, next) {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: existing } = await supabase
      .from('courts')
      .select('owner_id, is_active')
      .eq('id', id)
      .single();

    if (!existing || existing.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { data, error } = await supabase
      .from('courts')
      .update({ is_active: !existing.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * Upload court photo (owner only)
 */
export async function uploadPhoto(req, res, next) {
  try {
    // In a real implementation, this would handle file upload to storage
    // For now, return a placeholder response
    res.json({ message: 'Photo upload endpoint - implement with your storage solution' });
  } catch (error) {
    next(error);
  }
}
