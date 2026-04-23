import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export function Card({ children, className = '', noPadding = false }: CardProps) {
  return (
    <div 
      className={`
        bg-white/[0.04]
        backdrop-blur-sm
        rounded-2xl 
        border border-white/[0.06]
        shadow-sm hover:shadow-md 
        transition-all duration-300 ease-in-out
        hover:scale-[1.01]
        overflow-hidden
        ${noPadding ? '' : 'p-6'}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
