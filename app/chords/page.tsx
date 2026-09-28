'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { RootNoteSelector } from '@/components/root-note-selector'
import { ChordTypeSelector } from '@/components/chord-type-selector'
import { ChordDiagram } from '@/components/chord-diagram'
import { GuitarToneToggle } from '@/components/guitar-tone-toggle'
import { ThemeToggle } from '@/components/theme-toggle'
import { GuitarTone, useGuitarSampler } from '@/lib/guitar-sampler'
import { ChordType, CHORD_LABELS, getChordNotes } from '@/lib/music-utils'
import { getChordVoicings, ChordVoicing } from '@/lib/chord-voicings'

export default function Page() {
  const [rootNote, setRootNote] = useState('C')
  const [chordType, setChordType] = useState<ChordType>('major')
  const [guitarTone, setGuitarTone] = useState<GuitarTone>('electric')
  const { play } = useGuitarSampler(guitarTone)

  const chordNotes = getChordNotes(rootNote, chordType)
  const voicings = getChordVoicings(rootNote, chordType)
  const chordName = `${rootNote}${CHORD_LABELS[chordType]}`

  const strum = (voicing: ChordVoicing) => {
    play(voicing.pitches, '1n', 45) // 저음현부터 45ms 간격 스트럼
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-accent-blue via-accent-teal to-accent-green">
              <BookOpen className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-balance">
                코드사전
              </h1>
              <p className="text-muted-foreground text-sm">
                코드 구성음과 운지법을 다이어그램으로 확인
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Chord
            </p>

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
                Chord Type
              </label>
              <ChordTypeSelector
                chordType={chordType}
                onChordTypeChange={setChordType}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Guitar Tone
              </label>
              <GuitarToneToggle
                tone={guitarTone}
                onToneChange={setGuitarTone}
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-xl font-bold">{chordName}</h2>
            <div className="flex flex-wrap gap-2">
              {chordNotes.map((note, index) => (
                <span
                  key={index}
                  className={
                    index === 0
                      ? 'px-2 py-1 text-sm font-medium rounded border bg-accent-orange/15 text-accent-orange border-accent-orange/30'
                      : 'px-2 py-1 text-sm font-medium rounded border bg-accent-teal/15 text-accent-teal border-accent-teal/30'
                  }
                >
                  {note}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Voicings — 다이어그램을 클릭하면 소리가 납니다
            </p>
            <div className="flex flex-wrap gap-4">
              {voicings.map(voicing => (
                <ChordDiagram
                  key={voicing.form}
                  voicing={voicing}
                  rootNote={rootNote}
                  onPlay={strum}
                />
              ))}
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          홈으로
        </Link>
      </div>
    </div>
  )
}
