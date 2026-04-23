'use client'

import { useState, useTransition } from 'react'
import { uploadProof } from '../app/actions/proof'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'

export default function LatestDrawResult({ 
  latestDraw, 
  userResult 
}: { 
  latestDraw: any, 
  userResult: any 
}) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{type: 'error'|'success', text: string} | null>(null)

  if (!latestDraw) {
    return (
      <Card className="flex flex-col items-center justify-center py-12 text-center border-dashed">
        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">No draws yet</p>
        <p className="text-gray-500 text-sm mt-1">The monthly draw has not been executed.</p>
      </Card>
    )
  }

  const handleUpload = async (formData: FormData) => {
    startTransition(async () => {
      setMessage(null)
      const result = await uploadProof(null, formData)
      if (result.error) setMessage({ type: 'error', text: result.error })
      if (result.success) setMessage({ type: 'success', text: result.success })
    })
  }

  const isWinner = userResult && userResult.prize > 0;

  return (
    <div className={`relative rounded-3xl p-[2px] overflow-hidden shadow-lg ${isWinner ? 'animate-pulse-glow bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
      
      {/* CSS Confetti Overlay (Only if winner) */}
      {isWinner && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-[slide-up_3s_ease-out_infinite] shadow-[0_0_10px_#facc15]" />
          <div className="absolute top-0 left-2/4 w-3 h-3 bg-pink-400 rounded-full animate-[slide-up_2s_ease-in-out_infinite_0.5s] shadow-[0_0_10px_#f472b6]" />
          <div className="absolute top-0 left-3/4 w-2 h-2 bg-blue-400 rounded-full animate-[slide-up_2.5s_ease-out_infinite_1s] shadow-[0_0_10px_#60a5fa]" />
          <div className="absolute top-0 left-1/3 w-4 h-4 bg-white/50 rounded-full animate-[slide-up_4s_linear_infinite_0.2s]" />
        </div>
      )}

      <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-[22px] p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
        
        <div className="flex-1 w-full text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold text-white uppercase tracking-wider mb-6 shadow-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
            {latestDraw.month} Official Draw
          </div>
          
          <h3 className="text-3xl sm:text-4xl font-extrabold mb-8 text-white drop-shadow-md">Winning Numbers</h3>
          
          {/* Glowing Circular Balls */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6">
            {latestDraw.numbers.map((num: number, idx: number) => (
              <div 
                key={idx} 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-white to-gray-100 text-indigo-700 flex items-center justify-center text-2xl font-black shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-scale-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-[400px] bg-white/[0.06] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl text-center lg:text-left flex flex-col items-center lg:items-start transform transition-transform hover:scale-[1.02]">
          
          {userResult ? (
            <>
              {isWinner ? (
                <div className="w-full flex flex-col items-center lg:items-start animate-slide-up">
                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-4 py-1 rounded-full text-sm mb-4 inline-flex items-center gap-1">
                    🎉 You Won!
                  </div>
                  
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-black text-white">{userResult.match_count}</span>
                    <span className="text-indigo-200/40 font-medium text-lg">Matches</span>
                  </div>

                  <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 mb-4">
                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Prize Amount</p>
                    <p className="text-4xl font-black text-emerald-400">${userResult.prize.toLocaleString()}</p>
                    
                    {userResult.status !== 'pending' && (
                      <div className="mt-3">
                        <Badge variant={userResult.status === 'verified' || userResult.status === 'paid' ? 'success' : 'error'} className="capitalize">
                          Status: {userResult.status}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Upload Form */}
                  {!userResult.proof_url && userResult.match_count >= 3 && (
                    <form action={handleUpload} className="w-full flex flex-col gap-3">
                      <input type="hidden" name="resultId" value={userResult.id} />
                      <div className="w-full border-2 border-dashed border-white/[0.1] rounded-xl p-4 text-center hover:bg-white/[0.03] transition-colors">
                        <label className="text-sm font-medium text-indigo-200/60 cursor-pointer flex flex-col items-center">
                          <svg className="w-6 h-6 text-indigo-200/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          <span>Upload Ticket Proof</span>
                          <span className="text-xs text-indigo-200/30 mt-1">JPG/PNG, Max 2MB</span>
                          <input 
                            type="file" 
                            name="proof" 
                            accept="image/png, image/jpeg, image/jpg" 
                            required
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) setMessage({ type: 'success', text: e.target.files[0].name + ' selected.' })
                            }}
                          />
                        </label>
                      </div>
                      
                      <Button type="submit" isLoading={isPending} fullWidth variant="primary">
                        Submit for Verification
                      </Button>
                    </form>
                  )}

                  {message && (
                    <p className={`mt-3 text-sm font-medium ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                      {message.text}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-6">
                  <div className="w-16 h-16 bg-white/[0.04] rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">😔</span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Better luck next time</h4>
                  <p className="text-indigo-200/40 text-sm">You only matched {userResult.match_count} numbers. Keep playing to increase your chances!</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center text-center py-6">
               <div className="w-16 h-16 bg-white/[0.04] rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🎟️</span>
               </div>
              <h4 className="text-xl font-bold text-white mb-2">No Entry</h4>
              <p className="text-indigo-200/40 text-sm">You didn't log exactly 5 scores before this draw. Make sure to record your scores next month!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
