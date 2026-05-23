-- seed.sql
-- 8 flights across 4 routes: DEL↔BOM, BLR↔HYD, MAA↔CCU, GOI↔AMD
-- Each flight gets a full seat map: 4 First, 12 Business, 54 Economy = 70 seats

-- ===================== FLIGHTS =====================
INSERT INTO flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES
-- Route 1: DEL → BOM
('f1000000-0000-0000-0000-000000000001', 'SB101', 'DEL', 'BOM', NOW() + INTERVAL '2 days 06:00', NOW() + INTERVAL '2 days 08:00', 'Airbus A320', 'scheduled', 4500),
('f1000000-0000-0000-0000-000000000002', 'SB102', 'DEL', 'BOM', NOW() + INTERVAL '3 days 14:00', NOW() + INTERVAL '3 days 16:00', 'Boeing 737', 'scheduled', 3800),
-- Route 2: BOM → DEL
('f1000000-0000-0000-0000-000000000003', 'SB201', 'BOM', 'DEL', NOW() + INTERVAL '2 days 10:00', NOW() + INTERVAL '2 days 12:00', 'Airbus A320', 'scheduled', 4200),
('f1000000-0000-0000-0000-000000000004', 'SB202', 'BOM', 'DEL', NOW() + INTERVAL '4 days 18:00', NOW() + INTERVAL '4 days 20:00', 'Airbus A321', 'scheduled', 5100),
-- Route 3: BLR → HYD
('f1000000-0000-0000-0000-000000000005', 'SB301', 'BLR', 'HYD', NOW() + INTERVAL '1 day 07:30', NOW() + INTERVAL '1 day 08:45', 'ATR 72', 'scheduled', 2200),
('f1000000-0000-0000-0000-000000000006', 'SB302', 'BLR', 'HYD', NOW() + INTERVAL '5 days 16:00', NOW() + INTERVAL '5 days 17:15', 'Airbus A320', 'scheduled', 2800),
-- Route 4: MAA → CCU
('f1000000-0000-0000-0000-000000000007', 'SB401', 'MAA', 'CCU', NOW() + INTERVAL '3 days 08:00', NOW() + INTERVAL '3 days 11:00', 'Boeing 737', 'scheduled', 6200),
-- Route 5: GOI → AMD
('f1000000-0000-0000-0000-000000000008', 'SB501', 'GOI', 'AMD', NOW() + INTERVAL '2 days 11:00', NOW() + INTERVAL '2 days 13:30', 'Airbus A320', 'scheduled', 3500);


-- ===================== SEAT MAP GENERATOR =====================
-- Function to insert seats for a flight
CREATE OR REPLACE FUNCTION seed_seats_for_flight(p_flight_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  col_letters TEXT[] := ARRAY['A','B','C','D','E','F'];
  row_num INT;
  col_letter TEXT;
  seat_class TEXT;
  extra NUMERIC;
BEGIN
  -- First class: rows 1-1 (4 seats: A,B,E,F)
  FOREACH col_letter IN ARRAY ARRAY['A','B','E','F'] LOOP
    INSERT INTO seats (flight_id, seat_number, class, is_available, extra_fee)
    VALUES (p_flight_id, '1' || col_letter, 'first', TRUE, 3000);
  END LOOP;

  -- Business class: rows 2-4 (4 seats per row: A,B,E,F)
  FOR row_num IN 2..4 LOOP
    FOREACH col_letter IN ARRAY ARRAY['A','B','E','F'] LOOP
      INSERT INTO seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (p_flight_id, row_num::TEXT || col_letter, 'business', TRUE, 1500);
    END LOOP;
  END LOOP;

  -- Economy class: rows 5-13 (6 seats per row: A,B,C,D,E,F)
  FOR row_num IN 5..13 LOOP
    FOREACH col_letter IN ARRAY col_letters LOOP
      extra := CASE WHEN col_letter IN ('A','F') THEN 500 WHEN col_letter IN ('C','D') THEN 0 ELSE 200 END;
      INSERT INTO seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (p_flight_id, row_num::TEXT || col_letter, 'economy', TRUE, extra);
    END LOOP;
  END LOOP;
END;
$$;

-- Seed seats for all flights
SELECT seed_seats_for_flight('f1000000-0000-0000-0000-000000000001');
SELECT seed_seats_for_flight('f1000000-0000-0000-0000-000000000002');
SELECT seed_seats_for_flight('f1000000-0000-0000-0000-000000000003');
SELECT seed_seats_for_flight('f1000000-0000-0000-0000-000000000004');
SELECT seed_seats_for_flight('f1000000-0000-0000-0000-000000000005');
SELECT seed_seats_for_flight('f1000000-0000-0000-0000-000000000006');
SELECT seed_seats_for_flight('f1000000-0000-0000-0000-000000000007');
SELECT seed_seats_for_flight('f1000000-0000-0000-0000-000000000008');

-- Mark some seats as occupied for realism
UPDATE seats SET is_available = FALSE
WHERE flight_id = 'f1000000-0000-0000-0000-000000000001'
  AND seat_number IN ('5A','5B','6C','7D','8E','9F','10A','11B');

UPDATE seats SET is_available = FALSE
WHERE flight_id = 'f1000000-0000-0000-0000-000000000003'
  AND seat_number IN ('5C','5D','6A','7F','8B','9C');

-- Test user note: create via Supabase dashboard or Auth API
-- Email: test@skybook.dev | Password: test1234
