import type { ReactNode } from 'react'
import { PageFaq } from '@/components/page-faq'
import { getToolPage, toolJsonLd, toolMetadata } from '@/lib/seo'

const PATH = '/guitar-scale'
export const metadata = toolMetadata(PATH)

export default function GuitarScaleLayout({
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
