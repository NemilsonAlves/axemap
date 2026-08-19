import type { Metadata } from 'next';
import { RedeAxemapIndex } from '../organizacoes/page';

export const metadata: Metadata = {
  title: 'Federações | AxéMap',
  description:
    'Conheça as federações e confederações de comunidades e tradições de matriz africana que fazem parte da Rede AxéMap, no Brasil e nas diásporas.',
  alternates: { canonical: 'https://axemap.com.br/federacoes' },
};

export default function FederacoesPage() {
  return (
    <RedeAxemapIndex
      endpoint="/federacoes?limit=120"
      filtroInicial="FEDERACAO"
      linkBase="/federacoes"
      titulo={
        <>
          Federações e confederações da{' '}
          <span className="text-brand-gradient">Rede AxéMap</span>
        </>
      }
      subtitulo="Federações e confederações reúnem casas, templos e comunidades sob estruturas comuns de representação e articulação — na África, no Brasil, no Caribe, nas Américas e na diáspora."
    />
  );
}