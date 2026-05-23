-- Migration: 005_realtime.sql
-- Enable realtime on seats table for live seat availability updates

ALTER PUBLICATION supabase_realtime ADD TABLE seats;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
