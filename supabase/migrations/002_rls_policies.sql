-- Migration: 002_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE flights    ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reschedules ENABLE ROW LEVEL SECURITY;

-- FLIGHTS: public read
CREATE POLICY "flights_public_read"
  ON flights FOR SELECT USING (true);

-- SEATS: public read
CREATE POLICY "seats_public_read"
  ON seats FOR SELECT USING (true);

-- BOOKINGS: users can only read/write their own
CREATE POLICY "bookings_select_own"
  ON bookings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bookings_insert_own"
  ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_update_own"
  ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- PASSENGERS: accessible via booking ownership
CREATE POLICY "passengers_select_own"
  ON passengers FOR SELECT
  USING (booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid()));

CREATE POLICY "passengers_insert_own"
  ON passengers FOR INSERT
  WITH CHECK (booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid()));

-- RESCHEDULES: accessible via booking ownership
CREATE POLICY "reschedules_select_own"
  ON reschedules FOR SELECT
  USING (booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid()));

CREATE POLICY "reschedules_insert_own"
  ON reschedules FOR INSERT
  WITH CHECK (booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid()));
