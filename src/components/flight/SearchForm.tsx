'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFlightStore } from '@/store/flightStore';
import { MapPin, Calendar, Users, ArrowLeftRight } from 'lucide-react';

const AIRPORTS = [
  { code: 'DEL', name: 'Delhi' },
  { code: 'BOM', name: 'Mumbai' },
  { code: 'BLR', name: 'Bangalore' },
  { code: 'MAA', name: 'Chennai' },
  { code: 'HYD', name: 'Hyderabad' },
  { code: 'CCU', name: 'Kolkata' },
  { code: 'GOI', name: 'Goa' },
  { code: 'AMD', name: 'Ahmedabad' },
];

export default function SearchForm() {
  const router = useRouter();
  const { searchQuery, setSearchQuery, setBookingStep } = useFlightStore();
  const [form, setForm] = useState(searchQuery);

  const swap = () => setForm(f => ({ ...f, origin: f.destination, destination: f.origin }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.origin || !form.destination || !form.date) return;
    setSearchQuery(form);
    setBookingStep('results');
    const params = new URLSearchParams({
      origin: form.origin,
      destination: form.destination,
      date: form.date,
      passengers: String(form.passengers),
    });
    router.push(`/search?${params}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        {/* Origin */}
        <div className="md:col-span-2">
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">From</label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-3.5 text-indigo-400" />
            <select
              className="input-dark pl-9 appearance-none"
              value={form.origin}
              onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}
              required
            >
              <option value="">Select origin</option>
              {AIRPORTS.map(a => (
                <option key={a.code} value={a.code}>{a.name} ({a.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap */}
        <div className="flex justify-center md:mb-0 mb-0">
          <button type="button" onClick={swap}
            className="p-2.5 rounded-lg border border-white/10 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-400 transition-all">
            <ArrowLeftRight size={16} />
          </button>
        </div>

        {/* Destination */}
        <div className="md:col-span-2">
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">To</label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-3.5 text-sky-400" />
            <select
              className="input-dark pl-9 appearance-none"
              value={form.destination}
              onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
              required
            >
              <option value="">Select destination</option>
              {AIRPORTS.filter(a => a.code !== form.origin).map(a => (
                <option key={a.code} value={a.code}>{a.name} ({a.code})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Date */}
        <div className="md:col-span-2">
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Departure Date</label>
          <div className="relative">
            <Calendar size={15} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="date"
              className="input-dark pl-9"
              value={form.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              required
            />
          </div>
        </div>

        {/* Passengers */}
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Passengers</label>
          <div className="relative">
            <Users size={15} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="number"
              min={1}
              max={9}
              className="input-dark pl-9"
              value={form.passengers}
              onChange={e => setForm(f => ({ ...f, passengers: Number(e.target.value) }))}
            />
          </div>
        </div>
      </div>

      <button type="submit" className="btn-primary w-full text-center py-3 text-base">
        Search Flights ✈
      </button>
    </form>
  );
}
