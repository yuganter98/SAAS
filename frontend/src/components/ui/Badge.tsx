import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'neutral' | 'success' | 'warning' | 'error' | 'score'
  value?: number // used for score variant to determine color
  className?: string
}

export function Badge({ children, variant = 'neutral', value, className = '' }: BadgeProps) {
  let colorStyles = "bg-gray-100 text-gray-800 border-gray-200"

  if (variant === 'success') colorStyles = "bg-green-100 text-green-800 border-green-200"
  if (variant === 'warning') colorStyles = "bg-yellow-100 text-yellow-800 border-yellow-200"
  if (variant === 'error') colorStyles = "bg-red-100 text-red-800 border-red-200"
  
  // Gamified score colors
  if (variant === 'score' && value !== undefined) {
    if (value >= 35) colorStyles = "bg-gradient-to-br from-green-400 to-emerald-600 text-white border-transparent shadow-sm"
    else if (value >= 20) colorStyles = "bg-gradient-to-br from-blue-400 to-indigo-600 text-white border-transparent shadow-sm"
    else colorStyles = "bg-gradient-to-br from-gray-400 to-slate-600 text-white border-transparent shadow-sm"
  }

  return (
    <span 
      className={`
        inline-flex items-center justify-center 
        px-3 py-1 text-sm font-bold
        rounded-full border
        animate-scale-in
        ${colorStyles}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
