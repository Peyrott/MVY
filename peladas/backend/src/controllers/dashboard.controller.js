import { supabase } from '../services/supabase.js';

/**
 * Get owner dashboard data
 */
export async function getDashboard(req, res, next) {
  try {
    const { period = '30d' } = req.query;
    const userId = req.user.id;

    // Calculate date range
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get owner's courts
    const { data: courts, error: courtsError } = await supabase
      .from('courts')
      .select('*')
      .eq('owner_id', userId);

    if (courtsError) throw courtsError;

    const courtIds = courts?.map(c => c.id) || [];

    // Get bookings statistics
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .in('court_id', courtIds)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (bookingsError) throw bookingsError;

    // Calculate metrics
    const totalBookings = bookings?.length || 0;
    const revenue = bookings?.reduce((sum, b) => sum + (b.total || 0), 0) || 0;
    const platformFee = bookings?.reduce((sum, b) => sum + (b.platform_fee || 0), 0) || 0;
    const ownerReceives = revenue - platformFee;

    // Get bookings by court
    const bookingsByCourt = courts?.map(court => {
      const courtBookings = bookings?.filter(b => b.court_id === court.id) || [];
      return {
        courtId: court.id,
        courtName: court.name,
        bookings: courtBookings.length,
        revenue: courtBookings.reduce((sum, b) => sum + (b.total || 0), 0)
      };
    });

    // Get recent bookings with court details
    const recentBookings = (bookings || []).slice(0, 10).map(b => ({
      ...b,
      court: courts?.find(c => c.id === b.court_id)
    }));

    res.json({
      courts: courts || [],
      totalBookings,
      revenue,
      platformFee,
      ownerReceives,
      bookingsByCourt,
      recentBookings
    });
  } catch (error) {
    next(error);
  }
}
