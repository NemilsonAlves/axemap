import type { Metadata } from 'next';
import { RedeAxemapIndex } from '../organizacoes/page';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Rede AxéMap — Federações, Organizações e Instituições',
  description:
    'Conheça a rede de federações, associações, institutos, centros culturais e organizações que compõem o ecossistema AxéMap.',
  openGraph: {
    title: 'Rede AxéMap',
    description: 'Federações, organizações e instituições da Rede AxéMap.',
    locale: 'pt_BR',
    siteName: 'AxéMap',
  },
  alternates: { canonical: 'https://axemap.com.br/rede' },
  robots: { index: true, follow: true },
};

export default function RedePage() {
  return (
    <RedeAxemapIndex
      endpoint="/organizacoes?limit=120"
      linkBase="/organizacoes"
    />
  );
}
