import type { ToolPage } from '@/lib/seo'

// JSON-LD와 같은 문장을 화면에 그대로 보여준다.
export function PageFaq({
  faq,
  jsonLd,
}: {
  faq: ToolPage['faq']
  jsonLd: object
}) {
  return (
    <section
      aria-labelledby="faq-heading"
      className="max-w-7xl mx-auto px-4 md:px-8 mt-12 space-y-4"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h2 id="faq-heading" className="text-lg font-semibold">
        자주 묻는 질문
      </h2>
      <dl className="space-y-4">
        {faq.map(([question, answer]) => (
          <div
            key={question}
            className="bg-card border border-border rounded-xl p-4 space-y-1"
          >
            <dt className="text-sm font-medium">{question}</dt>
            <dd className="text-sm text-muted-foreground">{answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function ToolAnswer({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground break-keep">{text}</p>
}
