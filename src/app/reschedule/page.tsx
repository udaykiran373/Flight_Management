import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import RescheduleForm from '@/components/booking/RescheduleForm';
import type { Booking, Flight } from '@/types';

interface Props { searchParams: { bookingId?: string } }

export default async function ReschedulePage({ searchParams }: Props) {
  const { bookingId } = searchParams;
  if (!bookingId) redirect('/my-bookings');

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, flight:flights(*), seat:seats(*)')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single();

  if (!booking) redirect('/my-bookings');

  // Get alternative flights on same route
  const { data: alternatives } = await supabase
    .from('flights')
    .select('*')
    .eq('origin', booking.flight.origin)
    .eq('destination', booking.flight.destination)
    .neq('id', booking.flight_id)
    .neq('status', 'cancelled')
    .gte('departs_at', new Date().toISOString())
    .order('departs_at')
    .limit(10);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Reschedule Flight</h1>
          <p className="text-slate-400 text-sm mb-6">
            Current: {booking.flight.origin} → {booking.flight.destination} · {booking.pnr_code}
          </p>
          <RescheduleForm
            booking={booking as Booking}
            alternatives={(alternatives ?? []) as Flight[]}
          />
        </div>
      </main>
    </>
  );
}
