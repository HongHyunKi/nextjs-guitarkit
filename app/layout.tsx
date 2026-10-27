import type React from 'react'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Footer } from '@/components/footer'
import { ThemeProvider } from '@/components/theme-provider'
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  GITHUB_PROFILE,
  GITHUB_REPO,
} from '@/lib/site'
import { PUBLISHER_ID, TOOL_PAGES, WEBSITE_ID } from '@/lib/seo'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

const TITLE = `${SITE_NAME} — 무료 기타 연습 도구: 스케일·코드표·메트로놈·튜너`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: SITE_DESCRIPTION,
  generator: 'dev.hyunki',
  alternates: { canonical: '/' },
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: TITLE,
    description: SITE_DESCRIPTION,
    type: 'website',
    locale: 'ko_KR',
    siteName: SITE_NAME,
    // 공유 이미지는 opengraph-image.tsx에서 생성한다.
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: SITE_DESCRIPTION,
    // 트위터도 같은 공유 이미지를 사용한다.
  },
}

// 운영자·사이트는 여기서 한 번만 선언하고 페이지 LD는 @id로 참조한다.
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': PUBLISHER_ID,
      name: 'HongHyunKi',
      url: GITHUB_PROFILE,
      sameAs: [GITHUB_PROFILE, GITHUB_REPO],
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: 'ko-KR',
      publisher: { '@id': PUBLISHER_ID },
    },
    {
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: 'MusicApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
      inLanguage: 'ko-KR',
      featureList: ['스케일 사전', ...TOOL_PAGES.map(p => p.name)],
      isPartOf: { '@id': WEBSITE_ID },
      publisher: { '@id': PUBLISHER_ID },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
