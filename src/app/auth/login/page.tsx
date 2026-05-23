import Navbar from '@/components/layout/Navbar';
import AuthForm from '@/components/auth/AuthForm';

interface Props { searchParams: { next?: string } }

export default function LoginPage({ searchParams }: Props) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Welcome back</h1>
            <p className="text-slate-400 mt-1">Sign in to manage your bookings</p>
          </div>
          <AuthForm next={searchParams.next ?? '/'} />
        </div>
      </main>
    </>
  );
}
