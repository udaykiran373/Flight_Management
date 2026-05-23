import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { formatTime, formatDate } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface Props {
  searchParams: { pnr?: string; bookingId?: string };
}

export default async function ConfirmationPage({ searchParams }: Props) {
  const { pnr, bookingId } = searchParams;

  const supabase = createClient();
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, flight:flights(*), seat:seats(*), passengers(*)')
    .eq('id', bookingId!)
    .single();

  if (!booking) {
    return (
      <>
        <Navbar />
        <div className="text-center pt-32 text-slate-400">Booking not found</div>
      </>
    );
  }

  const flight = booking.flight;
  const seat = booking.seat;
  const passenger = booking.passengers?.[0];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-xl mx-auto">
          {/* Success header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 mb-4">
              <CheckCircle className="text-green-400" size={32} />
            </div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Booking Confirmed!</h1>
            <p className="text-slate-400 mt-1">Your e-ticket has been generated</p>
          </div>

          {/* PNR Card */}
          <div className="glass rounded-2xl p-6 border border-green-500/20 mb-4 animate-slide-up">
            <div className="text-center mb-6">
              <p className="text-xs text-slate-400 mb-1">PNR Code</p>
              <div className="text-4xl font-bold tracking-widest text-green-400" style={{ fontFamily: 'Syne, sans-serif' }}>
                {pnr}
              </div>
            </div>

            {/* Divider with circles */}
            <div className="relative my-5 border-t border-dashed border-white/10">
              <div className="absolute -left-6 -top-2.5 w-5 h-5 rounded-full bg-[#0a0e1a]" />
              <div className="absolute -right-6 -top-2.5 w-5 h-5 rounded-full bg-[#0a0e1a]" />
            </div>

            {/* Flight details */}
            {flight && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Flight</p>
                  <p className="font-semibold">{flight.flight_no}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Aircraft</p>
                  <p className="font-semibold">{flight.aircraft_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">From</p>
                  <p className="font-semibold">{flight.origin}</p>
                  <p className="text-slate-400 text-sm">{formatTime(flight.departs_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">To</p>
                  <p className="font-semibold">{flight.destination}</p>
                  <p className="text-slate-400 text-sm">{formatTime(flight.arrives_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Date</p>
                  <p className="font-semibold">{formatDate(flight.departs_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Seat</p>
                  <p className="font-semibold capitalize">{seat?.seat_number} · {seat?.class}</p>
                </div>
              </div>
            )}

            {passenger && (
              <div className="border-t border-white/5 pt-4">
                <p className="text-xs text-slate-500 mb-2">Passenger</p>
                <p className="font-semibold">{passenger.full_name}</p>
                <p className="text-sm text-slate-400">{passenger.nationality}</p>
              </div>
            )}

            <div className="border-t border-white/5 pt-4 mt-4 flex justify-between items-center">
              <span className="text-sm text-slate-400">Total Paid</span>
              <span className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                ₹{Number(booking.total_price).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-3 animate-fade-in">
            <Link href="/" className="flex-1 text-center py-3 rounded-xl border border-white/10 text-slate-400 hover:border-white/20 hover:text-white transition-all text-sm">
              Search Again
            </Link>
            <Link href="/my-bookings" className="btn-primary flex-1 text-center text-sm">
              My Bookings →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
