'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Booking } from '@/types';
import { formatTime, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Props { booking: Booking; }

export default function BookingCard({ booking }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<'cancel' | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [error, setError] = useState('');

  const flight = booking.flight!;
  const seat = booking.seat!;

  const handleCancel = async () => {
    setLoading('cancel');
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.rpc('cancel_booking', { p_booking_id: booking.id });
    if (err) {
      setError(err.message.includes('2 hours') ? 'Cannot cancel within 2 hours of departure.' : err.message);
    } else {
      router.refresh();
    }
    setLoading(null);
    setShowCancel(false);
  };

  const badgeClass = {
    confirmed: 'badge-confirmed',
    cancelled: 'badge-cancelled',
    rescheduled: 'badge-rescheduled',
  }[booking.status];

  const isCancellable = booking.status === 'confirmed';

  return (
    <div className="glass rounded-2xl p-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium capitalize', badgeClass)}>
              {booking.status}
            </span>
            <span className="text-xs font-mono text-slate-500">{booking.pnr_code}</span>
          </div>
          <h3 className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
            {flight.origin} → {flight.destination}
          </h3>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">₹{Number(booking.total_price).toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
        <div>
          <p className="text-slate-500 text-xs">Departure</p>
          <p className="font-semibold">{formatTime(flight.departs_at)}</p>
          <p className="text-slate-400 text-xs">{formatDate(flight.departs_at)}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Arrival</p>
          <p className="font-semibold">{formatTime(flight.arrives_at)}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Flight</p>
          <p className="font-semibold">{flight.flight_no}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Seat</p>
          <p className="font-semibold capitalize">{seat.seat_number} · {seat.class}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm mb-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
          <AlertTriangle size={15} />
          {error}
        </div>
      )}

      {isCancellable && (
        <div className="flex gap-2 pt-3 border-t border-white/5">
          <a href={`/reschedule?bookingId=${booking.id}`}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-white/10 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-400 transition-all">
            <RefreshCw size={13} /> Reschedule
          </a>
          <button
            onClick={() => setShowCancel(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-white/10 text-slate-400 hover:border-red-500/40 hover:text-red-400 transition-all">
            <X size={13} /> Cancel
          </button>
        </div>
      )}

      <ConfirmDialog
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={handleCancel}
        loading={loading === 'cancel'}
        title="Cancel Booking"
        message={`Are you sure you want to cancel your booking for ${flight.origin} → ${flight.destination}? This action cannot be undone.`}
        confirmLabel="Yes, Cancel"
        danger
      />
    </div>
  );
}
