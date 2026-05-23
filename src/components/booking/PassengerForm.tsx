'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useFlightStore } from '@/store/flightStore';
import { useUserStore } from '@/store/userStore';
import type { Flight, Seat } from '@/types';

interface Props { flight: Flight; seat: Seat; }

export default function PassengerForm({ flight, seat }: Props) {
  const router = useRouter();
  const { passengerForm, setPassengerForm, setBookingStep, reset } = useFlightStore();
  const { user } = useUserStore();
  const [form, setForm] = useState(passengerForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/auth/login'); return; }
    setLoading(true);
    setError('');
    setPassengerForm(form);

    const supabase = createClient();

    // Lock seat via RPC (prevents double-booking)
    const { data: lockResult, error: lockErr } = await supabase.rpc('reserve_seat', { p_seat_id: seat.id });
    if (lockErr || !lockResult) {
      setError('Seat is no longer available. Please select another seat.');
      setLoading(false);
      return;
    }

    // Generate PNR
    const pnr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const totalPrice = Number(flight.base_price) + Number(seat.extra_fee);

    // Insert booking
    const { data: booking, error: bookErr } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        flight_id: flight.id,
        seat_id: seat.id,
        status: 'confirmed',
        total_price: totalPrice,
        pnr_code: pnr,
      })
      .select()
      .single();

    if (bookErr || !booking) {
      // Release seat lock
      await supabase.rpc('release_seat', { p_seat_id: seat.id });
      setError('Booking failed. Please try again.');
      setLoading(false);
      return;
    }

    // Insert passenger
    await supabase.from('passengers').insert({
      booking_id: booking.id,
      full_name: form.full_name,
      passport_no: form.passport_no,
      nationality: form.nationality,
      dob: form.dob,
    });

    setBookingStep('confirmation');
    router.push(`/confirmation?pnr=${pnr}&bookingId=${booking.id}`);
  };

  const fields: { key: keyof typeof form; label: string; type: string; placeholder: string }[] = [
    { key: 'full_name', label: 'Full Name', type: 'text', placeholder: 'As on passport' },
    { key: 'passport_no', label: 'Passport Number', type: 'text', placeholder: 'e.g. A1234567' },
    { key: 'nationality', label: 'Nationality', type: 'text', placeholder: 'e.g. Indian' },
    { key: 'dob', label: 'Date of Birth', type: 'date', placeholder: '' },
  ];

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5">
      {fields.map(f => (
        <div key={f.key}>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">{f.label}</label>
          <input
            type={f.type}
            className="input-dark"
            placeholder={f.placeholder}
            value={form[f.key]}
            onChange={handleChange(f.key)}
            required
          />
        </div>
      ))}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()}
          className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:border-white/20 hover:text-white transition-all">
          ← Back
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </form>
  );
}
