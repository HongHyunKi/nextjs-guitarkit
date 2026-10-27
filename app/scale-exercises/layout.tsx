import type { ReactNode } from 'react'
import { PageFaq } from '@/components/page-faq'
import { getToolPage, toolJsonLd, toolMetadata } from '@/lib/seo'

const PATH = '/scale-exercises'
export const metadata = toolMetadata(PATH)

export default function ScaleExercisesLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      {children}
      <PageFaq faq={getToolPage(PATH).faq} jsonLd={toolJsonLd(PATH)} />
    </>
  )
}
