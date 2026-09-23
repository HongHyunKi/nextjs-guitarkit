'use client'

import { useId } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function FretControl({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
}) {
  const id = useId()
  return (
    <div className="space-y-2 min-w-0">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Select value={String(value)} onValueChange={v => onChange(Number(v))}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(
            fret => (
              <SelectItem key={fret} value={String(fret)}>
                {fret === 0 ? '0프렛 · 개방현' : `${fret}프렛`}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
