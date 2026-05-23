-- Migration: 003_rpc_functions.sql

-- ================================================
-- RPC: reserve_seat
-- Atomically marks a seat as unavailable.
-- Returns TRUE if reserved, FALSE if already taken.
-- ================================================
CREATE OR REPLACE FUNCTION reserve_seat(p_seat_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_available BOOLEAN;
BEGIN
  -- Lock row to prevent concurrent reservation
  SELECT is_available INTO v_available
  FROM seats
  WHERE id = p_seat_id
  FOR UPDATE;

  IF NOT FOUND OR NOT v_available THEN
    RETURN FALSE;
  END IF;

  UPDATE seats SET is_available = FALSE WHERE id = p_seat_id;
  RETURN TRUE;
END;
$$;

-- ================================================
-- RPC: release_seat
-- Marks a seat as available again (rollback on failure).
-- ================================================
CREATE OR REPLACE FUNCTION release_seat(p_seat_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE seats SET is_available = TRUE WHERE id = p_seat_id;
END;
$$;

-- ================================================
-- RPC: cancel_booking
-- Atomically cancels booking and frees seat.
-- Enforces 2-hour cancellation rule.
-- ================================================
CREATE OR REPLACE FUNCTION cancel_booking(p_booking_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_flight_departs TIMESTAMPTZ;
  v_seat_id        UUID;
  v_user_id        UUID;
BEGIN
  -- Verify ownership and get details
  SELECT b.user_id, b.seat_id, f.departs_at
  INTO v_user_id, v_seat_id, v_flight_departs
  FROM bookings b
  JOIN flights f ON f.id = b.flight_id
  WHERE b.id = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 2-hour rule (enforced at DB level)
  IF v_flight_departs - NOW() < INTERVAL '2 hours' THEN
    RAISE EXCEPTION 'Cancellations within 2 hours of departure are not permitted';
  END IF;

  -- Atomically cancel booking and release seat
  UPDATE bookings SET status = 'cancelled' WHERE id = p_booking_id;
  UPDATE seats SET is_available = TRUE WHERE id = v_seat_id;
END;
$$;

-- ================================================
-- RPC: reschedule_booking
-- Moves booking to new flight, records reschedule fee.
-- ================================================
CREATE OR REPLACE FUNCTION reschedule_booking(
  p_booking_id    UUID,
  p_new_flight_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_flight_id  UUID;
  v_old_base_price NUMERIC;
  v_new_base_price NUMERIC;
  v_fee            NUMERIC;
  v_user_id        UUID;
BEGIN
  SELECT b.user_id, b.flight_id, f.base_price
  INTO v_user_id, v_old_flight_id, v_old_base_price
  FROM bookings b
  JOIN flights f ON f.id = b.flight_id
  WHERE b.id = p_booking_id;

  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;
  IF v_user_id != auth.uid() THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  SELECT base_price INTO v_new_base_price FROM flights WHERE id = p_new_flight_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'New flight not found'; END IF;

  v_fee := GREATEST(0, v_new_base_price - v_old_base_price);

  UPDATE bookings
  SET flight_id = p_new_flight_id,
      status = 'rescheduled',
      total_price = total_price + v_fee
  WHERE id = p_booking_id;

  INSERT INTO reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
  VALUES (p_booking_id, v_old_flight_id, p_new_flight_id, v_fee);
END;
$$;

-- ================================================
-- DB TRIGGER: Block cancellations within 2 hours
-- Extra safety at the data layer.
-- ================================================
CREATE OR REPLACE FUNCTION enforce_cancellation_window()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_departs TIMESTAMPTZ;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    SELECT departs_at INTO v_departs FROM flights WHERE id = NEW.flight_id;
    IF v_departs - NOW() < INTERVAL '2 hours' THEN
      RAISE EXCEPTION 'Cancellations within 2 hours of departure are not permitted';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_cancellation_window
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION enforce_cancellation_window();
