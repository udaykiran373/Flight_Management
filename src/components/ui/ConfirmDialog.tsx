'use client';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export default function ConfirmDialog({ open, onClose, onConfirm, loading, title, message, confirmLabel = 'Confirm', danger }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass rounded-2xl p-6 max-w-sm w-full border border-white/10 animate-slide-up">
        <div className="flex items-start gap-3 mb-4">
          <div className={cn('p-2 rounded-lg', danger ? 'bg-red-500/10' : 'bg-amber-500/10')}>
            <AlertTriangle size={18} className={danger ? 'text-red-400' : 'text-amber-400'} />
          </div>
          <div>
            <h3 className="font-semibold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h3>
            <p className="text-sm text-slate-400 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all text-sm">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all', danger
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white')}>
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
