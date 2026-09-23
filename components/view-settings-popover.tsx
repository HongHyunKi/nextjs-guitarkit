'use client'

import { useEffect, useRef, useState } from 'react'
import { Settings2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { GuitarToneToggle } from '@/components/guitar-tone-toggle'
import { FretControl } from '@/components/fret-control'
import { GuitarTone } from '@/components/fretboard'

interface ViewSettingsPopoverProps {
  guitarTone: GuitarTone
  onGuitarToneChange: (tone: GuitarTone) => void
  startFret: number
  frets: number
  onStartFretChange: (value: number) => void
  onFretsChange: (value: number) => void
}

export function ViewSettingsPopover({
  guitarTone,
  onGuitarToneChange,
  startFret,
  frets,
  onStartFretChange,
  onFretsChange,
}: ViewSettingsPopoverProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(prev => !prev)}
        aria-label="표시 설정 열기"
        aria-expanded={open}
        className={cn(open && 'border-accent-teal text-accent-teal')}
      >
        <Settings2 className="w-4 h-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 z-30 bg-card border border-border rounded-xl p-4 shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              View 설정
            </p>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Guitar Tone
            </label>
            <GuitarToneToggle
              tone={guitarTone}
              onToneChange={onGuitarToneChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Start Fret
            </label>
            <FretControl
              value={startFret}
              onChange={onStartFretChange}
              min={0}
              max={frets - 3}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              End Fret
            </label>
            <FretControl
              value={frets}
              onChange={onFretsChange}
              min={startFret + 3}
              max={24}
            />
          </div>
        </div>
      )}
    </div>
  )
}
