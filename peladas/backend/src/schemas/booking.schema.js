import { z } from 'zod';

export const createBookingSchema = z.object({
  court_id: z.string().uuid('ID da quadra inválido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  time_slot: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM')
});
