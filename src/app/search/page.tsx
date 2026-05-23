import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import FlightCard from '@/components/flight/FlightCard';
import type { Flight } from '@/types';
import { formatDate } from '@/lib/utils';

interface Props {
  searchParams: { origin?: string; destination?: string; date?: string; passengers?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const { origin, destination, date, passengers = '1' } = searchParams;

  let flights: Flight[] = [];
  if (origin && destination && date) {
    const supabase = createClient();
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;
    const { data } = await supabase
      .from('flights')
      .select('*')
      .eq('origin', origin)
      .eq('destination', destination)
      .gte('departs_at', startOfDay)
      .lte('departs_at', endOfDay)
      .neq('status', 'cancelled')
      .order('departs_at');
    flights = data ?? [];
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6 animate-fade-in">
            <p className="text-slate-400 text-sm mb-1">Flight results for</p>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
              {origin} → {destination}
              <span className="text-slate-400 font-normal text-lg ml-3">{date ? formatDate(`${date}T00:00`) : ''}</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">{passengers} passenger{Number(passengers) > 1 ? 's' : ''}</p>
          </div>

          {/* Results */}
          {flights.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center animate-slide-up">
              <div className="text-5xl mb-4">✈️</div>
              <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No flights found</h2>
              <p className="text-slate-400">Try a different date or route</p>
            </div>
          ) : (
            <div className="space-y-4 animate-slide-up">
              {flights.map(flight => (
                <FlightCard key={flight.id} flight={flight} passengers={Number(passengers)} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
