'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plane, Menu, X, LogOut, Ticket } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/store/userStore';
import { useFlightStore } from '@/store/flightStore';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, reset: resetUser } = useUserStore();
  const { reset: resetFlight } = useFlightStore();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    resetUser();
    resetFlight();
    router.push('/');
    router.refresh();
  };

  const links = [
    { href: '/', label: 'Search' },
    { href: '/my-bookings', label: 'My Bookings' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-700 text-xl tracking-tight">
          <span className="text-indigo-400"><Plane size={22} /></span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>SkyBook</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={cn('text-sm transition-colors', pathname === l.href ? 'text-indigo-400' : 'text-slate-400 hover:text-white')}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-400 transition-colors">
              <LogOut size={15} /> Logout
            </button>
          ) : (
            <Link href="/auth/login" className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile */}
        <button className="md:hidden text-slate-400" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass border-t border-white/5 px-4 py-4 flex flex-col gap-3">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={cn('text-sm py-2', pathname === l.href ? 'text-indigo-400' : 'text-slate-400')}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <button onClick={handleLogout} className="text-left text-sm text-red-400 py-2">Logout</button>
          ) : (
            <Link href="/auth/login" onClick={() => setOpen(false)} className="text-sm text-indigo-400 py-2">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
