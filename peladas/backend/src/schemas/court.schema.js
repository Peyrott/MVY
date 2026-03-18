import { z } from 'zod';

export const createCourtSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  sport: z.enum(['futebol', 'futsal', 'volei', 'basquete', 'tenis', 'beach_tennis', 'padel', 'handebol']),
  description: z.string().optional(),
  price_per_hour: z.number().positive('Preço deve ser positivo'),
  address: z.string().min(5, 'Endereço é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  zip_code: z.string().optional(),
  amenities: z.array(z.string()).default([])
});

export const updateCourtSchema = createCourtSchema.partial();
