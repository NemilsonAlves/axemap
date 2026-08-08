import { JsonLd, faqPageSchema } from '@/lib/seo/json-ld';
import type { FAQ } from '@/lib/seo/types';

export function LandingFaq({ faqs }: { faqs: FAQ[] }) {
  if (!faqs.length) return null;

  return (
    <>
      <JsonLd data={faqPageSchema(faqs)} />
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Perguntas Frequentes</h2>
        <div className="space-y-3">
          {faqs.map((item, i) => (
            <details
              key={i}
              className="group bg-card border rounded-lg [&[open]]:border-primary transition-colors"
            >
              <summary className="cursor-pointer font-medium text-foreground px-4 py-3 list-none flex items-center justify-between">
                {item.pergunta}
                <svg
                  className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <p className="px-4 pb-3 text-muted-foreground">{item.resposta}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
