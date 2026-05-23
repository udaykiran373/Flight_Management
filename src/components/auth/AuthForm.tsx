'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/store/userStore';

interface Props { next: string; }

export default function AuthForm({ next }: Props) {
  const router = useRouter();
  const { setUser, setSession } = useUserStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const supabase = createClient();

    if (mode === 'login') {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.user) { setUser(data.user); setSession(data.session); }
      router.push(next);
      router.refresh();
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      setMessage('Check your email to confirm your account, then sign in.');
    }
    setLoading(false);
  };

  return (
    <div className="glass rounded-2xl p-8">
      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6">
        {(['login', 'signup'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2.5 text-sm font-medium capitalize transition-all
              ${mode === m ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {m === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Email</label>
          <input type="email" className="input-dark" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Password</label>
          <input type="password" className="input-dark" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {message && <p className="text-green-400 text-sm">{message}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-4">
        Test account: <span className="text-slate-300">test@skybook.dev</span> / <span className="text-slate-300">test1234</span>
      </p>
    </div>
  );
}
