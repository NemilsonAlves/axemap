'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api-client';
import { TRADICOES_CATALOGO, labelTradicao } from '@/lib/tradicoes';
import { MapView, type MapViewHandle } from '@/lib/map/map-view';
import type { MapGeoPoint } from '@/lib/map/types';
import './onboarding.css';

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const TRADICOES = TRADICOES_CATALOGO.map((t) => t.nome);

interface FormData {
  nome: string;
  tradicao: string;
  cidade: string;
  estado: string;
  latitude: number | null;
  longitude: number | null;
  whatsapp: string;
}

export default function OnboardingPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    nome: '', tradicao: '', cidade: '', estado: '', latitude: null, longitude: null, whatsapp: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef<MapViewHandle>(null);
  const [mapCenter] = useState<MapGeoPoint>({ lat: -14.235, lng: -51.925 });

  const update = (key: keyof FormData, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleMapClick = useCallback((pos: MapGeoPoint) => {
    update('latitude', Math.round(pos.lat * 1000) / 1000);
    update('longitude', Math.round(pos.lng * 1000) / 1000);
  }, []);

  const valid = () => {
    switch (step) {
      case 0: return form.nome.trim().length >= 3;
      case 1: return form.tradicao.trim().length >= 1;
      case 2: return form.cidade.trim().length >= 2 && form.estado.length === 2;
      case 3: return form.latitude !== null && form.longitude !== null;
      case 4: return form.whatsapp.replace(/\D/g, '').length >= 10;
      default: return true;
    }
  };

  const handlePublish = async () => {
    if (!user) { router.push('/auth/login'); return; }
    setSubmitting(true);
    setError('');
    try {
      await api.post<{ id: string; slug: string }>('/onboarding/criar', {
        nome: form.nome, tradicao: form.tradicao, cidade: form.cidade, estado: form.estado,
        latitude: form.latitude, longitude: form.longitude, whatsapp: form.whatsapp,
      }, token || undefined);
      router.push('/central-evolucao');
    } catch (err: any) {
      setError(err.message || 'Erro ao publicar');
    }
    setSubmitting(false);
  };

  if (authLoading) return <div className="onb-loading">Carregando...</div>;
  if (!user) return (
    <div className="onb-container">
      <div className="onb-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h1>Cadastre sua Casa de Axé</h1>
        <p style={{ margin: '1rem 0', color: 'var(--color-gray-300)' }}>Faça login para começar.</p>
        <a href="/auth/login" className="btn btn-primary">Fazer Login</a>
      </div>
    </div>
  );

  const steps = [
    {
      title: 'Qual o nome da Casa de Axé?',
      desc: 'Comece pelo nome. Você pode completar os detalhes depois.',
      content: (
        <div className="onb-field">
          <label>Nome do terreiro</label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => update('nome', e.target.value)}
            placeholder="Ex: Terreiro de Oyá"
            maxLength={200}
            autoFocus
          />
        </div>
      ),
    },
    {
      title: 'Qual a tradição?',
      desc: 'Selecione a tradição principal da sua Casa de Axé.',
      content: (
        <div className="onb-field">
          <label>Tradição</label>
          <select value={form.tradicao} onChange={(e) => update('tradicao', e.target.value)}>
            <option value="">Selecione...</option>
            {TRADICOES.map((t) => <option key={t} value={t}>{labelTradicao(t)}</option>)}
          </select>
          <p className="onb-hint">Se não souber, escolha &quot;Não Informada&quot;. Você pode alterar depois.</p>
        </div>
      ),
    },
    {
      title: 'Onde fica?',
      desc: 'Informe a cidade e o estado.',
      content: (
        <>
          <div className="onb-field">
            <label>Cidade</label>
            <input
              type="text"
              value={form.cidade}
              onChange={(e) => update('cidade', e.target.value)}
              placeholder="Ex: Salvador"
              autoFocus
            />
          </div>
          <div className="onb-field">
            <label>Estado</label>
            <select value={form.estado} onChange={(e) => update('estado', e.target.value)}>
              <option value="">Selecione</option>
              {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>
        </>
      ),
    },
    {
      title: 'Marque a localização no mapa',
      desc: 'Clique no mapa para marcar a posição do terreiro.',
      content: (
        <div className="onb-field">
          <MapView
            ref={mapRef}
            center={mapCenter}
            zoom={form.latitude !== null ? 15 : 4}
            onClick={handleMapClick}
            markers={form.latitude !== null && form.longitude !== null ? [{
              id: 'selected',
              position: { lat: form.latitude, lng: form.longitude },
              title: form.nome || 'Localização selecionada',
            }] : []}
            style={{ height: '280px', borderRadius: 'var(--radius-md)' }}
          />
          {form.latitude !== null && form.longitude !== null && (
            <p className="onb-coords">
              {form.latitude.toFixed(3)}, {form.longitude.toFixed(3)}
            </p>
          )}
        </div>
      ),
    },
    {
      title: 'WhatsApp de contato',
      desc: 'O WhatsApp é o principal canal. Visitantes usarão para falar com você.',
      content: (
        <div className="onb-field">
          <label>WhatsApp</label>
          <input
            type="tel"
            value={form.whatsapp}
            onChange={(e) => update('whatsapp', e.target.value)}
            placeholder="(71) 99999-8888"
            autoFocus
          />
          <p className="onb-hint">Inclua DDD. Seu número ficará visível no perfil público.</p>
        </div>
      ),
    },
    {
      title: 'Pronto para publicar!',
      desc: 'Revise as informações. Após publicar, você será levado à Central de Evolução para completar seu perfil.',
      content: (
        <div className="onb-review">
          <div className="onb-review-item"><strong>Nome:</strong> {form.nome}</div>
          <div className="onb-review-item"><strong>Tradição:</strong> {form.tradicao ? labelTradicao(form.tradicao) : 'Não informada'}</div>
          <div className="onb-review-item"><strong>Cidade:</strong> {form.cidade}/{form.estado}</div>
          <div className="onb-review-item"><strong>Coordenadas:</strong> {form.latitude?.toFixed(3)}, {form.longitude?.toFixed(3)}</div>
          <div className="onb-review-item"><strong>WhatsApp:</strong> {form.whatsapp}</div>
          <div className="onb-next-text">
            Após publicar, você será levado à <strong>Central de Evolução</strong> para:
            <ul>
              <li>Adicionar fotos +15 AxéScore</li>
              <li>Contar sua história +11 AxéScore</li>
              <li>Adicionar horários +6 AxéScore</li>
              <li>Conectar redes sociais +7 AxéScore</li>
              <li>Criar eventos +13 AxéScore</li>
              <li>E muito mais!</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[step];
  const totalSteps = steps.length;

  return (
    <div className="onb-container">
      <div className="onb-card">
        <div className="onb-header">
          <div className="onb-progress">
            {steps.map((_, i) => (
              <div key={i} className={`onb-prog-dot ${i <= step ? 'active' : ''}`} />
            ))}
          </div>
          <div className="onb-step-indicator">Passo {step + 1} de {totalSteps}</div>
        </div>

        <div className="onb-body">
          <h1 className="onb-title">{current.title}</h1>
          <p className="onb-desc">{current.desc}</p>
          {current.content}
        </div>

        {error && <div className="onb-error">{error}</div>}

        <div className="onb-footer">
          {step > 0 && (
            <button className="btn btn-outline" onClick={() => setStep(step - 1)}>
              Voltar
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < totalSteps - 1 ? (
            <button className="btn btn-primary" disabled={!valid()} onClick={() => setStep(step + 1)}>
              Continuar
            </button>
          ) : (
            <button className="btn btn-primary" disabled={submitting} onClick={handlePublish}>
              {submitting ? 'Publicando...' : 'Publicar terreiro'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
