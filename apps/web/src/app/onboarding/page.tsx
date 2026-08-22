'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api-client';
import { TRADICOES_CATALOGO, labelTradicao } from '@/lib/tradicoes';
import { MapView, type MapViewHandle, MapProviderWrapper, leafletProvider } from '@/lib/map';
import type { MapGeoPoint } from '@/lib/map/types';
import './onboarding.css';

const TRADICOES = TRADICOES_CATALOGO.map((t) => t.nome);

interface ViaCEPResponse {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface FormData {
  nome: string;
  tradicao: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude: number | null;
  longitude: number | null;
  whatsapp: string;
}

function formatCEP(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export default function OnboardingPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    nome: '', tradicao: '', cep: '', endereco: '', numero: '', complemento: '',
    bairro: '', cidade: '', estado: '', latitude: null, longitude: null, whatsapp: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef<MapViewHandle>(null);
  const [mapCenter, setMapCenter] = useState<MapGeoPoint>({ lat: -14.235, lng: -51.925 });
  const [mapZoom, setMapZoom] = useState(4);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const [coordConfirmada, setCoordConfirmada] = useState(false);

  const update = (key: keyof FormData, value: string | number | null) =>
    setForm((f) => ({ ...f, [key]: value }));

  const buscarCEP = async (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setBuscandoCep(true);
    setCepError('');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data: ViaCEPResponse = await res.json();
      if (data.erro) {
        setCepError('CEP nao encontrado. Verifique e tente novamente.');
        setBuscandoCep(false);
        return;
      }
      setForm((f) => ({
        ...f,
        endereco: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
      }));
      geocodeAddress(data.logradouro, data.bairro, data.localidade, data.uf);
    } catch {
      setCepError('Erro ao buscar CEP. Tente novamente.');
    }
    setBuscandoCep(false);
  };

  const geocodeAddress = async (logradouro: string, bairro: string, cidade: string, uf: string) => {
    const query = `${logradouro}, ${bairro}, ${cidade}, ${uf}, Brazil`;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br`);
      const results = await res.json();
      if (results.length > 0) {
        const lat = parseFloat(results[0].lat);
        const lon = parseFloat(results[0].lon);
        setMapCenter({ lat, lng: lon });
        setMapZoom(16);
        update('latitude', Math.round(lat * 1000) / 1000);
        update('longitude', Math.round(lon * 1000) / 1000);
        setCoordConfirmada(false);
      }
    } catch {
      // geocoding failed silently
    }
  };

  const handleMapClick = useCallback((pos: MapGeoPoint) => {
    update('latitude', Math.round(pos.lat * 1000) / 1000);
    update('longitude', Math.round(pos.lng * 1000) / 1000);
    setCoordConfirmada(false);
  }, []);

  const valid = () => {
    switch (step) {
      case 0: return form.nome.trim().length >= 3;
      case 1: return form.tradicao.trim().length >= 1;
      case 2: return form.cep.replace(/\D/g, '').length === 8 && form.endereco.trim().length >= 3 && form.numero.trim().length >= 1;
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
        <h1>Cadastre sua Casa de Axe</h1>
        <p style={{ margin: '1rem 0', color: 'var(--color-muted-foreground)' }}>Faca login para comecar.</p>
        <a href="/auth/login" className="btn btn-primary">Fazer Login</a>
      </div>
    </div>
  );

  const steps = [
    {
      title: 'Qual o nome da Casa de Axe?',
      desc: 'Comece pelo nome. Voce pode completar os detalhes depois.',
      content: (
        <div className="onb-field">
          <label>Nome do terreiro</label>
          <input type="text" value={form.nome} onChange={(e) => update('nome', e.target.value)} placeholder="Ex: Terreiro de Oya" maxLength={200} autoFocus />
        </div>
      ),
    },
    {
      title: 'Qual a tradicao?',
      desc: 'Selecione a tradicao principal da sua Casa de Axe.',
      content: (
        <div className="onb-field">
          <label>Tradicao</label>
          <select value={form.tradicao} onChange={(e) => update('tradicao', e.target.value)}>
            <option value="">Selecione...</option>
            {TRADICOES.map((t) => <option key={t} value={t}>{labelTradicao(t)}</option>)}
          </select>
          <p className="onb-hint">Se nao souber, escolha &quot;Nao Informada&quot;. Voce pode alterar depois.</p>
        </div>
      ),
    },
    {
      title: 'Qual o endereco?',
      desc: 'Informe o CEP para buscar o endereco automaticamente.',
      content: (
        <>
          <div className="onb-field">
            <label>CEP</label>
            <input
              type="text"
              value={form.cep}
              onChange={(e) => update('cep', formatCEP(e.target.value))}
              onBlur={() => { if (form.cep.replace(/\D/g, '').length === 8) buscarCEP(form.cep); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); buscarCEP(form.cep); } }}
              placeholder="00000-000"
              maxLength={9}
              autoFocus
              inputMode="numeric"
            />
            {buscandoCep && <p className="onb-hint" style={{ color: 'var(--color-primary)' }}>Buscando endereco...</p>}
            {cepError && <p className="onb-hint" style={{ color: 'var(--color-danger)' }}>{cepError}</p>}
          </div>
          {form.endereco && (
            <>
              <div className="onb-field">
                <label>Endereco</label>
                <input type="text" value={form.endereco} onChange={(e) => update('endereco', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="onb-field" style={{ flex: 1 }}>
                  <label>Numero</label>
                  <input type="text" value={form.numero} onChange={(e) => update('numero', e.target.value)} placeholder="No" autoFocus />
                </div>
                <div className="onb-field" style={{ flex: 2 }}>
                  <label>Complemento</label>
                  <input type="text" value={form.complemento} onChange={(e) => update('complemento', e.target.value)} placeholder="Sala, bloco, referencia..." />
                </div>
              </div>
              <div className="onb-field">
                <label>Bairro</label>
                <input type="text" value={form.bairro} onChange={(e) => update('bairro', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="onb-field" style={{ flex: 3 }}>
                  <label>Cidade</label>
                  <input type="text" value={form.cidade} onChange={(e) => update('cidade', e.target.value)} />
                </div>
                <div className="onb-field" style={{ flex: 1 }}>
                  <label>UF</label>
                  <input type="text" value={form.estado} readOnly maxLength={2} style={{ opacity: 0.7 }} />
                </div>
              </div>
            </>
          )}
        </>
      ),
    },
    {
      title: 'Confirme a localizacao',
      desc: 'Verifique se o pin esta no local correto. Clique no mapa para ajustar.',
      content: (
        <div className="onb-field">
          {form.latitude !== null && form.longitude !== null ? (
            <>
              <MapProviderWrapper provider={leafletProvider}>
                <MapView
                  ref={mapRef}
                  center={mapCenter}
                  zoom={mapZoom}
                  onClick={handleMapClick}
                  markers={[{
                    id: 'selected',
                    position: { lat: form.latitude, lng: form.longitude },
                    title: form.nome || 'Localizacao',
                  }]}
                  style={{ height: '300px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </MapProviderWrapper>
              <p className="onb-coords" style={{ marginTop: '0.5rem' }}>
                {form.endereco}{form.numero ? `, ${form.numero}` : ''} - {form.bairro}, {form.cidade}/{form.estado}
              </p>
              <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-foreground)', fontWeight: 600, marginTop: '0.75rem' }}>
                A localizacao esta correta?
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setCoordConfirmada(false)}
                  style={!coordConfirmada ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' } : {}}>
                  Ajustar no mapa
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setCoordConfirmada(true)}
                  style={coordConfirmada ? { opacity: 1 } : {}}>
                  Sim, esta correto
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted-foreground)' }}>
              Buscando localizacao... Volte e informe o CEP novamente se nao carregar.
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'WhatsApp de contato',
      desc: 'O WhatsApp e o principal canal. Visitantes usarao para falar com voce.',
      content: (
        <div className="onb-field">
          <label>WhatsApp</label>
          <input type="tel" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} placeholder="(71) 99999-8888" autoFocus />
          <p className="onb-hint">Inclua DDD. Seu numero ficara visivel no perfil publico.</p>
        </div>
      ),
    },
    {
      title: 'Pronto para publicar!',
      desc: 'Revise as informacoes. Apos publicar, voce sera levado a Central de Evolucao para completar seu perfil.',
      content: (
        <div className="onb-review">
          <div className="onb-review-item"><strong>Nome:</strong> {form.nome}</div>
          <div className="onb-review-item"><strong>Tradicao:</strong> {form.tradicao ? labelTradicao(form.tradicao) : 'Nao informada'}</div>
          <div className="onb-review-item"><strong>Endereco:</strong> {form.endereco}{form.numero ? `, ${form.numero}` : ''}, {form.bairro} - {form.cidade}/{form.estado}</div>
          <div className="onb-review-item"><strong>Coordenadas:</strong> {form.latitude?.toFixed(3)}, {form.longitude?.toFixed(3)}</div>
          <div className="onb-review-item"><strong>WhatsApp:</strong> {form.whatsapp}</div>
          <div className="onb-next-text">
            Apos publicar, voce sera levado a <strong>Central de Evolucao</strong> para:
            <ul>
              <li>Adicionar fotos +15 AxeScore</li>
              <li>Contar sua historia +11 AxeScore</li>
              <li>Adicionar horarios +6 AxeScore</li>
              <li>Conectar redes sociais +7 AxeScore</li>
              <li>Criar eventos +13 AxeScore</li>
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
