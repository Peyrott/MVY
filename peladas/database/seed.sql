-- Seed data for Peladas
-- Run this after migrations.sql

-- ============================================
-- SAMPLE USERS (create via Supabase Auth first, then update profiles)
-- ============================================

-- Sample courts owner
INSERT INTO profiles (id, name, phone, is_owner, created_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'João Silva', '(11) 98765-4321', TRUE, NOW()),
    ('550e8400-e29b-41d4-a716-446655440001', 'Maria Santos', '(11) 91234-5678', TRUE, NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Carlos Oliveira', '(21) 99876-5432', FALSE, NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'Ana Pereira', '(51) 98765-1234', FALSE, NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE COURTS
-- ============================================
INSERT INTO courts (
    id, owner_id, name, sport, description, price_per_hour,
    address, city, state, zip_code, location, amenities, photos, rating, review_count, is_active
) VALUES
    (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        '550e8400-e29b-41d4-a716-446655440000',
        'Arena Futebol São Paulo',
        'futebol',
        'Quadra de futebol society com grama sintética de alta qualidade, vestiários e estacionamento.',
        150.00,
        'Rua dos Esportes, 123',
        'São Paulo',
        'SP',
        '01001-000',
        ST_SetSRID(ST_MakePoint(-46.6333, -23.5505), 4326)::geography,
        ARRAY['Vestiário', 'Estacionamento', 'Iluminação', 'Chuveiro', 'Lanchonete'],
        ARRAY['https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800'],
        4.8,
        12,
        TRUE
    ),
    (
        'b2c3d4e5-f6a7-8901-bcde-f23456789012',
        '550e8400-e29b-41d4-a716-446655440000',
        'Quadra de Basquete Vila Mariana',
        'basquete',
        'Quadra coberta de basquete com piso de madeira profissional, aros regulares e marcador eletrônico.',
        80.00,
        'Av. Paulista, 1500',
        'São Paulo',
        'SP',
        '01310-100',
        ST_SetSRID(ST_MakePoint(-46.6525, -23.5615), 4326)::geography,
        ARRAY['Quadra coberta', 'Vestiário', 'Lanchonete', 'Estacionamento'],
        ARRAY['https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800'],
        4.6,
        8,
        TRUE
    ),
    (
        'c3d4e5f6-a7b8-9012-cdef-345678901234',
        '550e8400-e29b-41d4-a716-446655440001',
        'Tênis Clube Rio',
        'tenis',
        'Quadras de saibro com iluminação noturna. Aulas disponíveis com profissionais qualificados.',
        120.00,
        'Rua das Palmeiras, 456',
        'Rio de Janeiro',
        'RJ',
        '22041-001',
        ST_SetSRID(ST_MakePoint(-43.1729, -22.9068), 4326)::geography,
        ARRAY['Saibro', 'Iluminação', 'Vestiário', 'Lanchonete', 'Aluguel de raquetes'],
        ARRAY['https://images.unsplash.com/photo-1622163642998-1ea90b40f72b?w=800'],
        4.9,
        23,
        TRUE
    ),
    (
        'd4e5f6a7-b8c9-0123-defa-456789012345',
        '550e8400-e29b-41d4-a716-446655440001',
        'Vôlei Beach Park',
        'volei',
        'Arena de vôlei de praia com areia fina e quadra oficial. Perfeito para grupos e festas.',
        100.00,
        'Av. Beira Mar, 789',
        'Rio de Janeiro',
        'RJ',
        '22010-000',
        ST_SetSRID(ST_MakePoint(-43.1567, -22.9123), 4326)::geography,
        ARRAY['Areia', 'Chuveiro', 'Vestiário', 'Bar', 'Música'],
        ARRAY['https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800'],
        4.7,
        15,
        TRUE
    ),
    (
        'e5f6a7b8-c9d0-1234-efab-567890123456',
        '550e8400-e29b-41d4-a716-446655440000',
        'Futsal Center SP',
        'futsal',
        'Quadra profissional de futsal com piso flutuante e arquibancadas para torcida.',
        180.00,
        'Rua do Futebol, 789',
        'São Paulo',
        'SP',
        '04538-132',
        ST_SetSRID(ST_MakePoint(-46.6789, -23.5678), 4326)::geography,
        ARRAY['Piso flutuante', 'Arquibancada', 'Iluminação LED', 'Vestiário', 'Estacionamento'],
        ARRAY['https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800'],
        4.5,
        6,
        TRUE
    ),
    (
        'f6a7b8c9-d0e1-2345-fabc-678901234567',
        '550e8400-e29b-41d4-a716-446655440001',
        'Padel Premium',
        'padel',
        'Quadras de padel com vidro temperado e grama sintética. Instrutores disponíveis.',
        140.00,
        'Rua do Padel, 321',
        'Rio de Janeiro',
        'RJ',
        '22450-020',
        ST_SetSRID(ST_MakePoint(-43.1890, -22.9350), 4326)::geography,
        ARRAY['Vidro temperado', 'Grama sintética', 'Vestiário', 'Lanchonete', 'Aulas'],
        ARRAY['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800'],
        4.8,
        18,
        TRUE
    );

-- ============================================
-- SAMPLE TIME SLOTS
-- ============================================
-- Generate time slots for each court (all days, 8h-22h)
INSERT INTO time_slots (court_id, weekday, start_time, end_time, is_available)
SELECT
    c.id,
    wd.day,
    (t + '1 hour'::interval * s.hour)::time,
    (t + '1 hour'::interval * (s.hour + 1))::time,
    TRUE
FROM courts c
CROSS JOIN generate_series(0, 6) AS wd(day)
CROSS JOIN generate_series(8, 21) AS s(hour)
CROSS JOIN (SELECT '00:00'::time as t) t;

-- Set some weekend premium prices
UPDATE time_slots SET price_override = 200.00
WHERE weekday IN (5, 6)
AND court_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- ============================================
-- SAMPLE BOOKINGS (COMPLETED - for reviews)
-- ============================================
INSERT INTO bookings (
    id, user_id, court_id, booking_date, time_slot, status,
    total, platform_fee, owner_receives, paid_at, created_at
) VALUES
    (
        uuid_generate_v4(),
        '550e8400-e29b-41d4-a716-446655440002',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        CURRENT_DATE - INTERVAL '10 days',
        '14:00:00',
        'completed',
        150.00,
        30.00,
        120.00,
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '11 days'
    ),
    (
        uuid_generate_v4(),
        '550e8400-e29b-41d4-a716-446655440003',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        CURRENT_DATE - INTERVAL '5 days',
        '16:00:00',
        'completed',
        150.00,
        30.00,
        120.00,
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '6 days'
    ),
    (
        uuid_generate_v4(),
        '550e8400-e29b-41d4-a716-446655440002',
        'c3d4e5f6-a7b8-9012-cdef-345678901234',
        CURRENT_DATE - INTERVAL '15 days',
        '09:00:00',
        'completed',
        120.00,
        24.00,
        96.00,
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '16 days'
    );

-- ============================================
-- SAMPLE REVIEWS
-- ============================================
INSERT INTO reviews (court_id, user_id, booking_id, rating, comment, created_at)
SELECT
    b.court_id,
    b.user_id,
    b.id,
    CASE
        WHEN b.user_id = '550e8400-e29b-41d4-a716-446655440002' THEN 5
        ELSE 4
    END,
    CASE
        WHEN b.user_id = '550e8400-e29b-41d4-a716-446655440002' THEN 'Excelente quadra! Grama perfeita e ótima iluminação.'
        ELSE 'Muito boa, recomendo! Só a lanchonete que demorou um pouco.'
    END,
    NOW() - INTERVAL '2 days'
FROM bookings b
WHERE b.status = 'completed';

-- ============================================
-- SAMPLE FAVORITES
-- ============================================
INSERT INTO favorites (user_id, court_id, created_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'c3d4e5f6-a7b8-9012-cdef-345678901234', NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'd4e5f6a7-b8c9-0123-defa-456789012345', NOW())
ON CONFLICT (user_id, court_id) DO NOTHING;
