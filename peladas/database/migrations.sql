-- Migration: Peladas Database Schema
-- Created: 2026-03-17

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE sport_type AS ENUM ('futebol', 'futsal', 'volei', 'basquete', 'tenis', 'beach_tennis', 'padel', 'handebol');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    is_owner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on auth user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, is_owner)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), FALSE);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- COURTS TABLE
-- ============================================
CREATE TABLE courts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sport sport_type NOT NULL,
    description TEXT,
    price_per_hour NUMERIC(10,2) NOT NULL CHECK (price_per_hour >= 0),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT,
    location GEOGRAPHY(POINT, 4326),
    amenities TEXT[] DEFAULT '{}',
    photos TEXT[] DEFAULT '{}',
    rating NUMERIC(3,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for courts
CREATE INDEX idx_courts_owner ON courts(owner_id);
CREATE INDEX idx_courts_sport ON courts(sport);
CREATE INDEX idx_courts_city ON courts(city);
CREATE INDEX idx_courts_location ON courts USING GIST(location);
CREATE INDEX idx_courts_active ON courts(is_active) WHERE is_active = TRUE;

-- ============================================
-- TIME_SLOTS TABLE
-- ============================================
CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    weekday INTEGER NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price_override NUMERIC(10,2),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_time_slots_court ON time_slots(court_id);
CREATE INDEX idx_time_slots_weekday ON time_slots(weekday);

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    time_slot TIME NOT NULL,
    status booking_status DEFAULT 'pending',
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    platform_fee NUMERIC(10,2) NOT NULL CHECK (platform_fee >= 0),
    owner_receives NUMERIC(10,2) NOT NULL CHECK (owner_receives >= 0),
    payment_id TEXT,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_active_booking UNIQUE (court_id, booking_date, time_slot)
    WHERE status IN ('pending', 'confirmed')
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_court ON bookings(court_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment ON bookings(payment_id);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_review_per_booking UNIQUE (booking_id)
);

CREATE INDEX idx_reviews_court ON reviews(court_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Function to update court rating after new review
CREATE OR REPLACE FUNCTION update_court_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE courts
    SET rating = (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM reviews
        WHERE court_id = NEW.court_id
    ),
    review_count = (
        SELECT COUNT(*)
        FROM reviews
        WHERE court_id = NEW.court_id
    )
    WHERE id = NEW.court_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_created
    AFTER INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_court_rating();

CREATE TRIGGER on_review_deleted
    AFTER DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_court_rating();

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_favorite UNIQUE (user_id, court_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_court ON favorites(court_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);

-- Courts RLS
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active courts are viewable by everyone"
    ON courts FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Owners can view all their courts"
    ON courts FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Owners can create courts"
    ON courts FOR INSERT WITH CHECK (
        owner_id = auth.uid() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = TRUE)
    );

CREATE POLICY "Owners can update own courts"
    ON courts FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete own courts"
    ON courts FOR DELETE USING (owner_id = auth.uid());

-- Time slots RLS
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Time slots are viewable by everyone"
    ON time_slots FOR SELECT USING (TRUE);

CREATE POLICY "Owners can manage time slots"
    ON time_slots FOR ALL USING (
        EXISTS (
            SELECT 1 FROM courts
            WHERE courts.id = time_slots.court_id
            AND courts.owner_id = auth.uid()
        )
    );

-- Bookings RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
    ON bookings FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Owners can view bookings for their courts"
    ON bookings FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courts
            WHERE courts.id = bookings.court_id
            AND courts.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create bookings"
    ON bookings FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can cancel own pending bookings"
    ON bookings FOR UPDATE USING (
        user_id = auth.uid() AND status IN ('pending', 'confirmed')
    );

-- Reviews RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
    ON reviews FOR SELECT USING (TRUE);

CREATE POLICY "Users can create reviews for completed bookings"
    ON reviews FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = booking_id
            AND bookings.user_id = auth.uid()
            AND bookings.status = 'completed'
        )
    );

CREATE POLICY "Users can delete own reviews"
    ON reviews FOR DELETE USING (user_id = auth.uid());

-- Favorites RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
    ON favorites FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites"
    ON favorites FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own favorites"
    ON favorites FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON courts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at BEFORE UPDATE ON time_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
