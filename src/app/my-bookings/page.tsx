import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import BookingCard from '@/components/booking/BookingCard';
import type { Booking } from '@/types';

export default async function MyBookingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?next=/my-bookings');

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, flight:flights(*), seat:seats(*), passengers(*)')
    .eq('user_id', user.id)
    .order('booked_at', { ascending: false });

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
            My Bookings
          </h1>

          {!bookings?.length ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🎫</div>
              <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No bookings yet</h2>
              <p className="text-slate-400 mb-6">Search for flights to start your journey</p>
              <a href="/" className="btn-primary inline-block">Search Flights</a>
            </div>
          ) : (
            <div className="space-y-4">
              {(bookings as Booking[]).map(b => (
                <BookingCard key={b.id} booking={b} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
