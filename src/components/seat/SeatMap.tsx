'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useFlightStore } from '@/store/flightStore';
import type { Flight, Seat, SeatClass } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  flight: Flight;
  initialSeats: Seat[];
}

const CLASS_ORDER: SeatClass[] = ['first', 'business', 'economy'];
const CLASS_COLORS: Record<SeatClass, string> = {
  first: 'border-amber-500/60 bg-amber-500/10',
  business: 'border-indigo-500/60 bg-indigo-500/10',
  economy: 'border-slate-600 bg-slate-800/50',
};
const CLASS_SELECTED: Record<SeatClass, string> = {
  first: 'border-amber-400 bg-amber-400/30 text-amber-300',
  business: 'border-indigo-400 bg-indigo-400/30 text-indigo-300',
  economy: 'border-sky-400 bg-sky-400/30 text-sky-300',
};

export default function SeatMap({ flight, initialSeats }: Props) {
  const router = useRouter();
  const { selectedSeat, setSelectedSeat, setBookingStep } = useFlightStore();
  const [seats, setSeats] = useState<Seat[]>(initialSeats);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`seats:${flight.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seats', filter: `flight_id=eq.${flight.id}` },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setSeats(prev => prev.map(s => s.id === payload.new.id ? { ...s, ...payload.new as Seat } : s));
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [flight.id]);

  const handleSelect = (seat: Seat) => {
    if (!seat.is_available) return;
    setSelectedSeat(seat.id === selectedSeat?.id ? null : seat);
  };

  const proceedToBooking = () => {
    if (!selectedSeat) return;
    setBookingStep('passengers');
    router.push(`/booking?flightId=${flight.id}&seatId=${selectedSeat.id}`);
  };

  const grouped = CLASS_ORDER.reduce<Record<SeatClass, Seat[]>>((acc, cls) => {
    acc[cls] = seats.filter(s => s.class === cls);
    return acc;
  }, { first: [], business: [], economy: [] });

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Seat map */}
      <div className="flex-1 glass rounded-2xl p-6 overflow-auto max-h-[70vh]">
        <div className="space-y-8">
          {CLASS_ORDER.map(cls => {
            const clsSeats = grouped[cls];
            if (!clsSeats.length) return null;

            // Determine columns based on class
            const cols = cls === 'economy' ? 6 : cls === 'business' ? 4 : 4;
            const rows: Seat[][] = [];
            for (let i = 0; i < clsSeats.length; i += cols) {
              rows.push(clsSeats.slice(i, i + cols));
            }

            return (
              <div key={cls}>
                <div className={cn('inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 border capitalize',
                  cls === 'first' ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' :
                  cls === 'business' ? 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10' :
                  'text-slate-300 border-slate-600 bg-slate-800/50')}>
                  {cls === 'first' ? '⭐ First Class' : cls === 'business' ? '💼 Business' : '✈ Economy'}
                </div>

                <div className="space-y-2">
                  {rows.map((row, ri) => (
                    <div key={ri} className="flex gap-2 justify-center">
                      {row.map((seat, si) => {
                        const isAisle = cls === 'economy' ? si === 2 : si === 1;
                        const isSelected = selectedSeat?.id === seat.id;
                        const isOccupied = !seat.is_available;

                        return (
                          <div key={seat.id} className="flex items-center">
                            {isAisle && <div className="w-4" />}
                            <button
                              disabled={isOccupied}
                              onClick={() => handleSelect(seat)}
                              title={`${seat.seat_number} — ${seat.class}${seat.extra_fee ? ` (+₹${seat.extra_fee})` : ''}`}
                              className={cn(
                                'w-9 h-9 rounded-lg text-xs font-mono font-semibold border transition-all duration-150',
                                isOccupied ? 'opacity-30 cursor-not-allowed bg-slate-700 border-slate-600 text-slate-500' :
                                isSelected ? CLASS_SELECTED[seat.class] + ' ring-2 ring-offset-1 ring-offset-transparent ring-white/30' :
                                CLASS_COLORS[seat.class] + ' text-slate-300 hover:scale-105 hover:brightness-125'
                              )}>
                              {seat.seat_number}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & selection panel */}
      <div className="lg:w-64 space-y-4">
        {/* Legend */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>Legend</h3>
          <div className="space-y-2 text-xs">
            {[
              { label: 'Available', cls: 'border border-slate-600 bg-slate-800/50' },
              { label: 'Selected', cls: 'border border-sky-400 bg-sky-400/30' },
              { label: 'Occupied', cls: 'border border-slate-700 bg-slate-700/30 opacity-40' },
              { label: 'First Class', cls: 'border border-amber-500/60 bg-amber-500/10' },
              { label: 'Business', cls: 'border border-indigo-500/60 bg-indigo-500/10' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={cn('w-6 h-6 rounded', item.cls)} />
                <span className="text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected seat info */}
        {selectedSeat && (
          <div className="glass rounded-xl p-4 border border-indigo-500/30 animate-slide-up">
            <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Selected Seat</h3>
            <div className="text-3xl font-bold text-indigo-400 mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
              {selectedSeat.seat_number}
            </div>
            <div className="text-sm text-slate-400 capitalize">{selectedSeat.class} Class</div>
            {selectedSeat.extra_fee > 0 && (
              <div className="text-sm text-amber-400 mt-1">+₹{selectedSeat.extra_fee} fee</div>
            )}
            <div className="mt-4 text-sm text-slate-400">
              <div className="flex justify-between">
                <span>Base price</span>
                <span>₹{Number(flight.base_price).toLocaleString()}</span>
              </div>
              {selectedSeat.extra_fee > 0 && (
                <div className="flex justify-between">
                  <span>Seat fee</span>
                  <span>₹{selectedSeat.extra_fee}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-white mt-2 pt-2 border-t border-white/10">
                <span>Total</span>
                <span>₹{(Number(flight.base_price) + Number(selectedSeat.extra_fee)).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <button
          disabled={!selectedSeat}
          onClick={proceedToBooking}
          className="btn-primary w-full">
          Continue to Booking →
        </button>
      </div>
    </div>
  );
}
