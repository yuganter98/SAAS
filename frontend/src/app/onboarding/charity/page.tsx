import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { selectCharity } from '../actions'

export default async function CharitySelectionPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: charities, error } = await supabase
    .from('charities')
    .select('*')
    .order('created_at', { ascending: true })

  if (error || !charities?.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#0a0a1a]">
        <h2 className="text-2xl font-bold mb-4 text-white">No Charities Found</h2>
        <a href="/dashboard" className="text-purple-400 hover:underline">Skip to Dashboard</a>
      </div>
    )
  }

  const cardColors = [
    'from-purple-500/20 to-indigo-500/20 border-purple-500/20 hover:border-purple-400/50',
    'from-blue-500/20 to-cyan-500/20 border-blue-500/20 hover:border-blue-400/50',
    'from-amber-500/20 to-orange-500/20 border-amber-500/20 hover:border-amber-400/50',
  ]

  const accentColors = [
    'text-purple-400',
    'text-blue-400', 
    'text-amber-400',
  ]

  return (
    <div className="flex-1 w-full flex flex-col items-center py-20 px-4 bg-[#0a0a1a] min-h-screen relative overflow-hidden">
      
      {/* Background effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="max-w-5xl w-full flex flex-col gap-12 relative z-10">
        
        <div className="text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-md border border-white/[0.08] px-4 py-2 rounded-full text-sm text-indigo-200/60 font-medium mb-6">
            ❤️ Impact Selection
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-300/60 mb-4">
            Choose Your Cause
          </h1>
          <p className="text-lg text-indigo-200/40 max-w-2xl mx-auto font-medium">
            10% of your subscription goes directly to a charity of your choice. Make an impact while you play.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {charities.map((charity, index) => (
            <form action={selectCharity.bind(null, charity.id)} key={charity.id} className="h-full flex">
              <button 
                type="submit" 
                className={`w-full group relative bg-gradient-to-br ${cardColors[index % 3]} border rounded-2xl overflow-hidden text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
              >
                {/* Image */}
                <div className="h-52 w-full overflow-hidden relative">
                  <img 
                    src={charity.image_url || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&q=80'} 
                    alt={charity.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent" />
                </div>
                
                {/* Content */}
                <div className="p-6 flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-white">{charity.name}</h3>
                  <p className="text-indigo-200/40 text-sm leading-relaxed line-clamp-3">
                    {charity.description}
                  </p>
                  <div className={`mt-3 flex items-center gap-2 ${accentColors[index % 3]} font-bold uppercase text-sm tracking-wider`}>
                    Select Cause 
                    <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  )
}
