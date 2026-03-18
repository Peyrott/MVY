import { z } from 'zod';

export const createReviewSchema = z.object({
  court_id: z.string().uuid('ID da quadra inválido'),
  booking_id: z.string().uuid('ID da reserva inválido'),
  rating: z.number().int().min(1).max(5, 'Avaliação deve ser entre 1 e 5'),
  comment: z.string().min(10, 'Comentário deve ter pelo menos 10 caracteres').optional()
});
