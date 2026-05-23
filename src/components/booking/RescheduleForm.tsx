'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Booking, Flight } from '@/types';
import { formatTime, formatDate, formatDuration } from '@/lib/utils';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Props { booking: Booking; alternatives: Flight[]; }

export default function RescheduleForm({ booking, alternatives }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Flight | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fee = selected
    ? Math.max(0, Number(selected.base_price) - Number(booking.flight!.base_price))
    : 0;

  const handleReschedule = async () => {
    if (!selected) return;
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.rpc('reschedule_booking', {
      p_booking_id: booking.id,
      p_new_flight_id: selected.id,
    });
    if (err) {
      setError(err.message);
    } else {
      router.push('/my-bookings');
      router.refresh();
    }
    setLoading(false);
    setConfirm(false);
  };

  if (!alternatives.length) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-slate-400">No alternative flights found on this route.</p>
        <button onClick={() => router.back()} className="mt-4 text-indigo-400 text-sm">← Go back</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alternatives.map(flight => (
        <button key={flight.id}
          onClick={() => setSelected(f => f?.id === flight.id ? null : flight)}
          className={`w-full text-left glass rounded-xl p-4 border transition-all duration-150
            ${selected?.id === flight.id ? 'border-indigo-500/60 bg-indigo-500/5' : 'border-transparent hover:border-white/10'}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-indigo-400">{flight.flight_no}</span>
                <span className="text-xs text-slate-500">{flight.aircraft_type}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <div className="font-semibold">{formatTime(flight.departs_at)}</div>
                  <div className="text-slate-500 text-xs">{flight.origin}</div>
                </div>
                <div className="text-slate-600 text-xs">{formatDuration(flight.departs_at, flight.arrives_at)}</div>
                <div>
                  <div className="font-semibold">{formatTime(flight.arrives_at)}</div>
                  <div className="text-slate-500 text-xs">{flight.destination}</div>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-1">{formatDate(flight.departs_at)}</div>
            </div>
            <div className="text-right">
              <div className="font-bold">₹{Number(flight.base_price).toLocaleString()}</div>
              {flight.base_price > booking.flight!.base_price && (
                <div className="text-xs text-amber-400">+₹{(Number(flight.base_price) - Number(booking.flight!.base_price)).toLocaleString()} fee</div>
              )}
            </div>
          </div>
        </button>
      ))}

      {error && <p className="text-red-400 text-sm p-3 bg-red-500/10 rounded-lg border border-red-500/20">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button onClick={() => router.back()}
          className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all text-sm">
          ← Back
        </button>
        <button disabled={!selected} onClick={() => setConfirm(true)} className="btn-primary flex-1">
          Reschedule{fee > 0 ? ` (+₹${fee})` : ''}
        </button>
      </div>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleReschedule}
        loading={loading}
        title="Confirm Reschedule"
        message={`Reschedule to ${selected?.flight_no} on ${selected ? formatDate(selected.departs_at) : ''}?${fee > 0 ? ` A fee of ₹${fee} will be charged.` : ''}`}
        confirmLabel="Reschedule"
      />
    </div>
  );
}
