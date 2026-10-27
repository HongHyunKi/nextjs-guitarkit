import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { TOOL_PAGES } from '@/lib/seo'
import { SCALE_PAGES } from '@/lib/scale-pages'

const ROUTES = [
  '',
  ...TOOL_PAGES.map(p => p.path),
  '/scales',
  ...SCALE_PAGES.map(p => `/scales/${p.slug}`),
]

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(route => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : route.startsWith('/scales/') ? 0.6 : 0.8,
  }))
}
