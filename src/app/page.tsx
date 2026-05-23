import Navbar from '@/components/layout/Navbar';
import InstallBanner from '@/components/layout/InstallBanner';
import SearchForm from '@/components/flight/SearchForm';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 flex flex-col items-center justify-center px-4">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Your journey,{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
              seamlessly booked
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Search hundreds of flights, select your seat, and manage your bookings — all in one place.
          </p>
        </div>

        {/* Search Card */}
        <div className="w-full max-w-3xl glass rounded-2xl p-6 md:p-8 animate-slide-up">
          <SearchForm />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 max-w-3xl w-full px-4 animate-fade-in">
          {[
            { icon: '🛫', title: 'Easy Search', desc: 'Find flights across all routes instantly' },
            { icon: '💺', title: 'Seat Selection', desc: 'Choose your seat on an interactive map' },
            { icon: '📱', title: 'Manage Anywhere', desc: 'Reschedule or cancel from any device' },
          ].map((f) => (
            <div key={f.title} className="glass rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <InstallBanner />
    </>
  );
}
