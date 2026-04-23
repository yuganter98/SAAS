import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { createClient } from "@/utils/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a1a] overflow-hidden relative">
      
      {/* Animated gradient background mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/80 via-[#0a0a1a] to-blue-950/80" />
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[150px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[150px] animate-float pointer-events-none" style={{ animationDelay: '3s' }} />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 text-center z-10 animate-slide-up">
        <div className="max-w-4xl space-y-10">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-md border border-white/[0.08] px-5 py-2.5 rounded-full text-sm text-indigo-200 font-medium shadow-[0_0_30px_rgba(139,92,246,0.08)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
            </span>
            Live &mdash; Season 2026 Active
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-indigo-300/60 tracking-tighter leading-[0.9] drop-shadow-sm">
            Play. Win.<br />Give Back.
          </h1>
          
          <p className="text-lg md:text-xl text-indigo-100/60 max-w-2xl mx-auto font-medium leading-relaxed">
            The only gamified subscription platform where your performance earns you rewards &mdash; while <span className="text-white font-semibold">10% of your fee</span> goes directly to charity.
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-indigo-200/50 font-medium">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">$10K</span>
              <span>monthly pool</span>
            </div>
            <div className="w-px h-6 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">5</span>
              <span>winning numbers</span>
            </div>
            <div className="w-px h-6 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">10%</span>
              <span>to charity</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {user ? (
              <Link href="/dashboard">
                <Button variant="primary" className="text-lg px-10 py-4 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] transition-shadow">
                  Go to Dashboard &rarr;
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button variant="primary" className="text-lg px-10 py-4 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] transition-shadow">
                    Start Playing Now
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="text-lg px-10 py-4 rounded-2xl text-white border-white/10 hover:border-white/30 hover:text-white hover:bg-white/5">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full py-8 flex items-center justify-center border-t border-white/5 mt-auto z-10">
        <p className="text-sm text-indigo-200/30 font-medium">
          &copy; {new Date().getFullYear()} SaaS Platform &mdash; Making a difference, one game at a time.
        </p>
      </footer>
    </div>
  )
}
