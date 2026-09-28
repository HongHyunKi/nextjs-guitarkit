'use client'

import Link from 'next/link'
import { Timer } from 'lucide-react'
import { Metronome } from '@/components/metronome'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-accent-blue via-accent-teal to-accent-green">
              <Timer className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-balance">
                메트로놈
              </h1>
              <p className="text-muted-foreground text-sm">
                BPM과 박자를 설정해 리듬 연습
              </p>
            </div>
          </Link>
          <ThemeToggle />
        </div>

        <Metronome />
      </div>
    </div>
  )
}
