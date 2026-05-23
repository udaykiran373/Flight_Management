import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import PassengerForm from '@/components/booking/PassengerForm';
import type { Flight, Seat } from '@/types';
import { formatTime, formatDate } from '@/lib/utils';

interface Props {
  searchParams: { flightId?: string; seatId?: string };
}

export default async function BookingPage({ searchParams }: Props) {
  const { flightId, seatId } = searchParams;
  if (!flightId || !seatId) return <div className="text-center pt-32 text-slate-400">Invalid booking params</div>;

  const supabase = createClient();
  const [{ data: flight }, { data: seat }] = await Promise.all([
    supabase.from('flights').select('*').eq('id', flightId).single(),
    supabase.from('seats').select('*').eq('id', seatId).single(),
  ]);

  if (!flight || !seat) return <div className="text-center pt-32 text-slate-400">Not found</div>;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
            Passenger Details
          </h1>

          {/* Flight summary */}
          <div className="glass rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
              <span>{flight.flight_no}</span>
              <span className="capitalize text-xs bg-slate-700 px-2 py-0.5 rounded">{seat.class}</span>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{formatTime(flight.departs_at)}</div>
                <div className="text-slate-400 text-sm">{flight.origin}</div>
              </div>
              <div className="flex-1 border-t border-dashed border-slate-700" />
              <div className="text-right">
                <div className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{formatTime(flight.arrives_at)}</div>
                <div className="text-slate-400 text-sm">{flight.destination}</div>
              </div>
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-white/5 text-sm">
              <span className="text-slate-400">Seat {seat.seat_number}</span>
              <span className="text-white font-semibold">
                ₹{(Number(flight.base_price) + Number(seat.extra_fee)).toLocaleString()}
              </span>
            </div>
          </div>

          <PassengerForm flight={flight as Flight} seat={seat as Seat} />
        </div>
      </main>
    </>
  );
}
