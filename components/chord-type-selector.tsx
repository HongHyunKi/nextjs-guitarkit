'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChordType, CHORD_LABELS } from '@/lib/music-utils'

interface ChordTypeSelectorProps {
  chordType: ChordType
  onChordTypeChange: (type: ChordType) => void
}

const CHORD_ITEMS = (Object.keys(CHORD_LABELS) as ChordType[]).map(value => ({
  value,
  label:
    value === 'major'
      ? 'Major'
      : value === 'minor'
        ? 'm (minor)'
        : CHORD_LABELS[value],
}))

export function ChordTypeSelector({
  chordType,
  onChordTypeChange,
}: ChordTypeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHORD_ITEMS.map(({ value, label }) => (
        <Button
          key={value}
          size="sm"
          variant={chordType === value ? 'default' : 'outline'}
          onClick={() => onChordTypeChange(value)}
          className={cn(
            'transition-all min-w-[3rem]',
            chordType === value &&
              'bg-accent-teal text-background hover:bg-accent-teal/90'
          )}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
