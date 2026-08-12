export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AxéMap',
    alternateName: 'AxeMap',
    url: 'https://axemap.com.br',
    description: 'Infraestrutura digital global para descobrir, conectar e preservar tradições africanas e afro-diaspóricas — Mapa · Memória · Ancestralidade · Conexão.',
    inLanguage: ['pt-BR', 'en', 'es', 'fr'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://axemap.com.br/busca?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AxéMap',
    alternateName: 'AxeMap',
    url: 'https://axemap.com.br',
    logo: 'https://axemap.com.br/logo.png',
    description: 'Infraestrutura digital global para tradições africanas e afro-diaspóricas — conectando África, diáspora, comunidades, conhecimento e memória.',
    foundingLocation: {
      '@type': 'Country',
      name: 'Brasil',
    },
    areaServed: {
      '@type': 'Place',
      name: 'Global',
    },
    knowsAbout: [
      'African Traditions', 'African Diaspora', 'Ifá', 'Candomblé', 'Umbanda',
      'Santería', 'Vodou', 'Yorùbá culture', 'African heritage',
      'Afro-Brazilian culture', 'Akan', 'Bantu', 'Igbo',
    ],
    sameAs: [
      'https://instagram.com/axemap',
    ],
  };
}

export function collectionPageSchema(title: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: `https://axemap.com.br${url}`,
    about: 'Terreiro',
    isPartOf: {
      '@type': 'WebSite',
      name: 'AxéMap',
      url: 'https://axemap.com.br',
    },
  };
}

export function itemListSchema(items: Array<{ name: string; url: string }>, itemType: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': itemType,
        name: item.name,
        url: `https://axemap.com.br${item.url}`,
      },
    })),
  };
}

export function datasetSchema(
  name: string,
  description: string,
  variables: Array<{ name: string; value: number }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url: 'https://axemap.com.br',
    measurementTechnique: 'Aggregated data from community submissions',
    variableMeasured: variables.map(v => ({
      '@type': 'PropertyValue',
      name: v.name,
      value: v.value,
    })),
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `https://axemap.com.br${item.url}`,
    })),
  };
}

export function placeSchema(terreiro: {
  nome: string; slug: string; descricaoCurta?: string | null;
  latitude: number; longitude: number; cidade: string; estado: string;
  telefone?: string | null; whatsapp?: string | null;
  trustScore: number; isVerified: boolean;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: terreiro.nome,
    description: terreiro.descricaoCurta || `Terreiro em ${terreiro.cidade}-${terreiro.estado}`,
    url: `https://axemap.com.br/terreiro/${terreiro.slug}`,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: terreiro.latitude,
      longitude: terreiro.longitude,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: terreiro.cidade,
      addressRegion: terreiro.estado,
      addressCountry: 'BR',
    },
    ...(terreiro.telefone ? { telephone: terreiro.telefone } : {}),
  };
}

export function faqPageSchema(faqs: Array<{ pergunta: string; resposta: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.pergunta,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.resposta,
      },
    })),
  };
}
