'use client';
import { useRouter } from 'next/navigation';
import { useFlightStore } from '@/store/flightStore';
import type { Flight } from '@/types';
import { formatTime, formatDuration, formatDate } from '@/lib/utils';
import { Clock, Plane } from 'lucide-react';

interface Props {
  flight: Flight;
  passengers: number;
}

export default function FlightCard({ flight, passengers }: Props) {
  const router = useRouter();
  const { setSelectedFlight, setBookingStep } = useFlightStore();

  const select = () => {
    setSelectedFlight(flight);
    setBookingStep('seats');
    router.push(`/seat-selection?flightId=${flight.id}`);
  };

  const total = (flight.base_price * passengers).toFixed(2);

  return (
    <div className="glass rounded-2xl p-5 hover:border-indigo-500/40 transition-all duration-200 cursor-pointer group"
      onClick={select}>
      <div className="flex items-start justify-between gap-4">
        {/* Flight info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
              {flight.flight_no}
            </span>
            <span className="text-xs text-slate-500">{flight.aircraft_type}</span>
            <span className={`text-xs px-2 py-0.5 rounded capitalize
              ${flight.status === 'scheduled' ? 'text-green-400 bg-green-400/10' :
                flight.status === 'delayed' ? 'text-amber-400 bg-amber-400/10' :
                'text-slate-400 bg-slate-400/10'}`}>
              {flight.status}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                {formatTime(flight.departs_at)}
              </div>
              <div className="text-sm text-slate-400">{flight.origin}</div>
            </div>

            <div className="flex-1 flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-700" />
              <div className="text-slate-500 text-xs flex items-center gap-1">
                <Clock size={11} />
                {formatDuration(flight.departs_at, flight.arrives_at)}
              </div>
              <div className="h-px flex-1 bg-slate-700" />
              <Plane size={14} className="text-indigo-400 rotate-45" />
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                {formatTime(flight.arrives_at)}
              </div>
              <div className="text-sm text-slate-400">{flight.destination}</div>
            </div>
          </div>

          <div className="text-xs text-slate-500 mt-2">{formatDate(flight.departs_at)}</div>
        </div>

        {/* Price & CTA */}
        <div className="text-right flex flex-col items-end gap-3">
          <div>
            <div className="text-xs text-slate-500">from</div>
            <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              ₹{Number(flight.base_price).toLocaleString()}
            </div>
            {passengers > 1 && (
              <div className="text-xs text-slate-500">₹{Number(total).toLocaleString()} total</div>
            )}
          </div>
          <button className="btn-primary text-sm py-2 px-4 group-hover:glow-accent">
            Select →
          </button>
        </div>
      </div>
    </div>
  );
}
