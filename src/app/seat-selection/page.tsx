import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import SeatMap from '@/components/seat/SeatMap';
import type { Flight, Seat } from '@/types';

interface Props {
  searchParams: { flightId?: string };
}

export default async function SeatSelectionPage({ searchParams }: Props) {
  const { flightId } = searchParams;
  if (!flightId) return <div className="text-center pt-32 text-slate-400">Invalid flight</div>;

  const supabase = createClient();

  const [{ data: flight }, { data: seats }] = await Promise.all([
    supabase.from('flights').select('*').eq('id', flightId).single(),
    supabase.from('seats').select('*').eq('flight_id', flightId).order('seat_number'),
  ]);

  if (!flight) return <div className="text-center pt-32 text-slate-400">Flight not found</div>;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <p className="text-slate-400 text-sm mb-1">Seat selection for</p>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
              {flight.origin} → {flight.destination}
              <span className="text-indigo-400 ml-3 text-lg">{flight.flight_no}</span>
            </h1>
          </div>
          <SeatMap flight={flight as Flight} initialSeats={(seats ?? []) as Seat[]} />
        </div>
      </main>
    </>
  );
}
