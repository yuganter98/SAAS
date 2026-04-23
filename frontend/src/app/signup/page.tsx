import Link from 'next/link'
import { signup } from '../auth/actions'
import { Button } from '@/components/ui/Button'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const params = await searchParams;
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#0a0a1a] relative overflow-hidden">
      
      {/* Background effects */}
      <div className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-15%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <Link
        href="/"
        className="absolute left-8 top-8 py-2.5 px-5 rounded-xl flex items-center gap-2 text-sm text-indigo-300/60 hover:text-white hover:bg-white/5 transition-all z-10 font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Home
      </Link>

      <div className="w-full max-w-md px-4 sm:px-0 z-10 animate-slide-up">
        
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-300/60 tracking-tight">
            Create Account
          </h1>
          <p className="text-indigo-200/40 mt-3 font-medium">Join us to play, win, and give back</p>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.3)]">
          <form className="flex flex-col gap-6" action={signup}>
            
            <div>
              <label className="block text-sm font-semibold text-indigo-200/60 mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                className="w-full rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 py-3.5 text-white placeholder-white/20 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                name="name"
                placeholder="Jane Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-200/60 mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="w-full rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 py-3.5 text-white placeholder-white/20 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-indigo-200/60 mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="w-full rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 py-3.5 text-white placeholder-white/20 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button variant="primary" fullWidth className="mt-2 text-md py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              Create Account
            </Button>
            
            {params?.message && (
              <div className="mt-2 p-4 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in text-center">
                {params.message}
              </div>
            )}
            
            <div className="mt-4 text-center text-sm text-indigo-200/40">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Sign in
              </Link>
            </div>

          </form>
        </div>

      </div>
    </div>
  )
}
