'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Disc3 } from 'lucide-react'
import { RootNoteSelector } from '@/components/root-note-selector'
import { ScaleSelector } from '@/components/scale-selector'
import { BackingTrackPlayer } from '@/components/backing-track-player'
import { ThemeToggle } from '@/components/theme-toggle'
import { ScaleType } from '@/lib/music-utils'

export default function Page() {
  const [rootNote, setRootNote] = useState('E')
  const [scaleType, setScaleType] = useState<ScaleType>('minor-pentatonic')

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-accent-blue via-accent-teal to-accent-green">
              <Disc3 className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-balance">
                잼 트랙
              </h1>
              <p className="text-muted-foreground text-sm">
                루트와 스케일을 고르고 백킹 트랙에 맞춰 즉흥 연주
              </p>
            </div>
          </Link>
          <ThemeToggle />
        </div>

        <div className="p-4 md:p-6 bg-card border border-border rounded-xl space-y-5">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Root Note
            </label>
            <RootNoteSelector
              rootNote={rootNote}
              onRootNoteChange={setRootNote}
              notationType="alphabetical"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Scale Type
            </label>
            <ScaleSelector
              scaleType={scaleType}
              onScaleTypeChange={setScaleType}
            />
          </div>
        </div>

        <BackingTrackPlayer rootNote={rootNote} scaleType={scaleType} />
      </div>
    </div>
  )
}
