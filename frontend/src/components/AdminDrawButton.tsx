'use client'

import { useTransition, useState } from 'react'
import { executeMonthlyDraw } from '../app/actions/draw'

export default function AdminDrawButton() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  const handleDraw = () => {
    startTransition(async () => {
      setMessage(null)
      try {
        const result = await executeMonthlyDraw()
        if (result?.error) {
          setMessage({ type: 'error', text: result.error })
        } else if (result?.success) {
          setMessage({ 
            type: 'success', 
            text: `${result.success} Numbers: ${result.numbers?.join(', ')}` 
          })
        } else {
          setMessage({ type: 'error', text: 'Received empty response from server.' })
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'A network error occurred.' })
      }
    })
  }

  return (
    <div className="relative bg-gradient-to-r from-red-950/40 to-orange-950/30 border border-red-500/20 rounded-2xl p-6 overflow-hidden">
      {/* Decorative */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h3 className="font-bold text-white text-lg flex items-center gap-2.5">
            <span className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            Draw Control
          </h3>
          <p className="text-sm text-red-200/50 mt-1 ml-[42px]">Execute the official monthly draw and distribute the $10,000 prize pool.</p>
        </div>
        
        <button
          onClick={handleDraw}
          disabled={isPending}
          className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap shadow-[0_0_25px_rgba(239,68,68,0.2)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:scale-[1.02] active:scale-[0.98]"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Executing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Run Monthly Draw
            </>
          )}
        </button>
      </div>
      
      {message && (
        <div className={`mt-4 p-4 rounded-xl text-sm font-medium border animate-fade-in ${message.type === 'error' ? 'bg-red-500/10 text-red-300 border-red-500/20' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
