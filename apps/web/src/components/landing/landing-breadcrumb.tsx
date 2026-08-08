import Link from 'next/link';
import { JsonLd, breadcrumbSchema } from '@/lib/seo/json-ld';

interface Crumb {
  label: string;
  href?: string;
}

export function LandingBreadcrumb({ items }: { items: Crumb[] }) {
  const schemaItems = items.map((item) => ({
    name: item.label,
    url: item.href || '#',
  }));

  return (
    <>
      <JsonLd data={breadcrumbSchema(schemaItems)} />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              Início
            </Link>
            <span className="mx-1">/</span>
          </li>
          {items.map((item, i) => (
            <li key={i}>
              {item.href ? (
                <>
                  <Link href={item.href} className="hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                  <span className="mx-1">/</span>
                </>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
