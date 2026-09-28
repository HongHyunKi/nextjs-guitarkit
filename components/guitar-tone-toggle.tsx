'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GuitarTone } from '@/components/fretboard'

interface GuitarToneToggleProps {
  tone: GuitarTone
  onToneChange: (tone: GuitarTone) => void
}

export function GuitarToneToggle({
  tone,
  onToneChange,
}: GuitarToneToggleProps) {
  const items: { tone: GuitarTone; label: string }[] = [
    { tone: 'electric', label: '일렉' },
    { tone: 'acoustic', label: '어쿠스틱' },
  ]

  return (
    <div className="relative inline-flex p-1 bg-muted rounded-lg">
      {items.map(item => (
        <button
          key={item.tone}
          onClick={() => onToneChange(item.tone)}
          className={cn(
            'relative px-4 py-2 text-sm font-medium rounded-md transition-colors z-10',
            tone === item.tone
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tone === item.tone && (
            <motion.div
              layoutId="guitar-tone-toggle"
              className="absolute inset-0 bg-background rounded-md shadow-sm z-[-1]"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          {item.label}
        </button>
      ))}
    </div>
  )
}
