'use client'

import { useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { NotationToggle } from '@/components/notation-toggle'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DEFAULT_SETTINGS,
  PRACTICE_STORAGE_KEY,
  parsePracticeSettings,
  PracticeSettings,
  DisplayMode,
} from '@/lib/practice-settings'
import Link from 'next/link'
import { Fretboard, GuitarTone } from '@/components/fretboard'
import { RootNoteSelector } from '@/components/root-note-selector'
import { ScaleSelector } from '@/components/scale-selector'
import { ViewSettingsPopover } from '@/components/view-settings-popover'
import { CAGEDSelector } from '@/components/caged-selector'
import { BackingTrackPlayer } from '@/components/backing-track-player'
import { ThemeToggle } from '@/components/theme-toggle'
import { Music } from 'lucide-react'
import {
  ScaleType,
  NotationType,
  SCALE_LABELS,
  SCALE_DESCRIPTIONS,
  getScaleNotes,
  CHROMATIC_NOTES,
  noteToFixedSolfege,
  noteToInterval,
} from '@/lib/music-utils'
import {
  CAGEDShape,
  CAGEDSelection,
  getShapeRootPosition,
  supportsCAGED,
} from '@/lib/caged-utils'

export default function Page() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [restored, setRestored] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(false)
  const {
    notationType,
    rootNote,
    scaleType,
    startFret,
    frets,
    cagedEnabled,
    selectedCAGEDShape,
    guitarTone,
    displayMode,
    highlightedNote,
  } = settings
  const update = <K extends keyof PracticeSettings>(
    key: K,
    value: PracticeSettings[K]
  ) => setSettings(prev => ({ ...prev, [key]: value }))
  const setNotationType = (v: NotationType) => update('notationType', v)
  const setRootNote = (v: string) => update('rootNote', v)
  const setScaleType = (v: ScaleType) => update('scaleType', v)
  const setStartFret = (v: number) => update('startFret', v)
  const setFrets = (v: number) => update('frets', v)
  const setCagedEnabled = (v: boolean) => update('cagedEnabled', v)
  const setSelectedCAGEDShape = (v: CAGEDSelection) =>
    update('selectedCAGEDShape', v)
  const setGuitarTone = (v: GuitarTone) => update('guitarTone', v)
  const effectiveMode =
    highlightedNote !== null && displayMode === 'scale'
      ? 'overlay'
      : displayMode
  const displayNote = (note: string) =>
    notationType === 'syllabic'
      ? noteToFixedSolfege(note)
      : notationType === 'intervals'
        ? noteToInterval(note, rootNote)
        : note

  useEffect(() => {
    try {
      setSettings(
        parsePracticeSettings(localStorage.getItem(PRACTICE_STORAGE_KEY))
      )
    } catch {
      /* Use defaults when storage is unavailable. */
    }
    setRestored(true)
  }, [])
  useEffect(() => {
    if (!restored) return
    try {
      localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* Keep practice available without storage. */
    }
  }, [settings, restored])

  const scaleNotes = getScaleNotes(rootNote, scaleType)
  const cagedSupported = supportsCAGED(scaleType)
  const effectiveCaged =
    cagedEnabled && cagedSupported && effectiveMode !== 'all'
  const cagedRootPosition =
    effectiveCaged && selectedCAGEDShape !== 'all'
      ? getShapeRootPosition(rootNote, selectedCAGEDShape as CAGEDShape)
      : null

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent-blue via-accent-teal to-accent-green">
                <Music className="w-6 h-6 text-background" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-balance">
                  GuitarKit
                </h1>
                <p className="text-muted-foreground text-sm">
                  스케일 연습을 더 쉽고 정확하게
                </p>
              </div>
            </Link>
            <ThemeToggle />
          </div>

          {/* Quick Controls — 가장 자주 바꾸는 컨트롤을 프렛보드 바로 위로 */}
          <div className="p-4 md:p-6 bg-card border border-border rounded-xl space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                지판 보기
              </p>
              <ViewSettingsPopover
                guitarTone={guitarTone}
                onGuitarToneChange={setGuitarTone}
                startFret={startFret}
                frets={frets}
                onStartFretChange={setStartFret}
                onFretsChange={setFrets}
              />
            </div>

            <div className="grid grid-cols-3 gap-2" aria-label="지판 표시 모드">
              {(
                [
                  ['all', '전체 음'],
                  ['scale', '스케일만'],
                  ['overlay', '전체 + 스케일'],
                ] as [DisplayMode, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  aria-pressed={effectiveMode === value}
                  onClick={() =>
                    setSettings(prev => ({
                      ...prev,
                      displayMode: value,
                      highlightedNote: null,
                    }))
                  }
                  className={`min-h-11 rounded-lg border px-2 text-sm font-medium break-keep ${effectiveMode === value ? 'bg-accent-teal text-background border-accent-teal' : 'bg-card border-border'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <NotationToggle
                type={notationType}
                onTypeChange={setNotationType}
              />
              <div className="flex items-center gap-2 text-sm">
                <label htmlFor="highlighted-note">음 찾기</label>
                <Select
                  value={
                    highlightedNote === null ? 'none' : String(highlightedNote)
                  }
                  onValueChange={value =>
                    update(
                      'highlightedNote',
                      value === 'none' ? null : Number(value)
                    )
                  }
                >
                  <SelectTrigger
                    id="highlighted-note"
                    aria-label="강조할 음"
                    className="w-32"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">해제</SelectItem>
                    {CHROMATIC_NOTES.map((note, index) => (
                      <SelectItem key={note} value={String(index)}>
                        {note} · {noteToFixedSolfege(note)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <button
                aria-expanded={controlsOpen}
                aria-controls="scale-controls"
                onClick={() => setControlsOpen(v => !v)}
                className="md:hidden text-left cursor-pointer min-h-11 py-3 text-sm font-medium"
              >
                {rootNote} {SCALE_LABELS[scaleType]} ·{' '}
                {selectedCAGEDShape === 'all' || !effectiveCaged
                  ? '전체 포지션'
                  : `${selectedCAGEDShape} 포지션`}{' '}
                · 설정
              </button>
              <div
                id="scale-controls"
                className={`${controlsOpen ? 'block' : 'hidden'} md:block space-y-5 pt-3`}
              >
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Root Note
                  </label>
                  <RootNoteSelector
                    rootNote={rootNote}
                    onRootNoteChange={setRootNote}
                    notationType={notationType}
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
                  <p className="mt-3 text-sm text-muted-foreground break-keep">
                    {SCALE_DESCRIPTIONS[scaleType]}
                  </p>
                </div>

                <div hidden={effectiveMode === 'all'}>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    CAGED System
                  </label>
                  <p className="text-sm text-muted-foreground mb-3 break-keep">
                    C·A·G·E·D는 코드 모양의 이름입니다. 그 모양 주변의 스케일
                    음을 포지션으로 묶어 보여줍니다. 운지는 교재마다 조금 다를
                    수 있습니다.
                    {scaleType === 'minor-pentatonic' &&
                      ' 마이너에서는 같은 으뜸음의 마이너 코드 모양(예: E → Em)을 기준으로 합니다.'}
                  </p>
                  {cagedSupported ? (
                    <CAGEDSelector
                      enabled={cagedEnabled}
                      onEnabledChange={setCagedEnabled}
                      selectedShape={selectedCAGEDShape}
                      onShapeChange={setSelectedCAGEDShape}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground break-keep">
                      이 스케일은 전체 포지션으로 표시합니다. CAGED 운지는
                      메이저·메이저 펜타토닉·마이너 펜타토닉에서만 제공합니다.
                    </p>
                  )}
                  {cagedRootPosition && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedCAGEDShape} Form · 루트{' '}
                      {cagedRootPosition.string}
                      번줄 {cagedRootPosition.fret}프렛
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fretboard */}
          <div className="relative">
            <div className="bg-card border border-border rounded-xl">
              {/* 구성음 범례 — 프렛보드와 한 덩어리로 묶어 참조하기 쉽게 */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-3 md:px-6 pt-6 pb-4">
                <p className="text-sm font-medium text-muted-foreground">
                  <span className="text-foreground font-semibold">
                    {rootNote} {SCALE_LABELS[scaleType]}
                  </span>{' '}
                  구성음
                </p>
                <div className="flex flex-wrap gap-2">
                  {scaleNotes.map((note, index) => (
                    <span
                      key={index}
                      className={
                        index === 0
                          ? 'px-2 py-1 text-sm font-medium rounded border bg-accent-orange/15 text-accent-orange border-accent-orange/30'
                          : 'px-2 py-1 text-sm font-medium rounded border bg-accent-teal/15 text-accent-teal border-accent-teal/30'
                      }
                    >
                      {displayNote(note)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-2 md:px-6 pb-6">
                <Fretboard
                  rootNote={rootNote}
                  scaleType={scaleType}
                  notationType={notationType}
                  startFret={startFret}
                  frets={frets}
                  cagedEnabled={effectiveCaged}
                  selectedCAGEDShape={selectedCAGEDShape}
                  guitarTone={guitarTone}
                  displayMode={effectiveMode}
                  highlightedNote={highlightedNote}
                />
              </div>
            </div>
          </div>

          {/* Backing Track Player */}
          <BackingTrackPlayer rootNote={rootNote} scaleType={scaleType} />
        </div>
      </div>
    </MotionConfig>
  )
}
