'use client';

import { useEffect, useState, useCallback } from 'react';
import '../../admin/admin.css';

interface HealthCheck {
  status: string;
  version: string;
  timestamp: string;
  uptime: number;
  environment: string;
  checks: Record<string, any>;
}

interface ResourceMetrics {
  status: string;
  version: string;
  timestamp: string;
  uptime: number;
  environment: string;
  checks: Record<string, any>;
  resources: {
    memory: { heapUsed: string; heapTotal: string; rss: string; external?: string };
    cpu: { user: string; system: string };
    uptime: string;
    startTime: string;
  };
}

interface SystemVersion {
  version: string;
  name: string;
  node: string;
  pnpm: string;
  prisma: string;
  docker: string;
  dockerCompose: string;
  os: string;
  commit: string;
  environment: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

function StatusBadge({ status }: { status: string }) {
  const color = status === 'healthy' || status === 'ok' || status === 'ready' || status === 'alive'
    ? '#22c55e'
    : status === 'degraded' || status === 'not_ready'
    ? '#eab308'
    : '#ef4444';
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '12px',
      fontSize: '12px', fontWeight: 600, color: '#fff', backgroundColor: color,
    }}>
      {status}
    </span>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      background: '#1e1e2e', borderRadius: '8px', padding: '12px 16px',
      border: '1px solid #313244',
    }}>
      <div style={{ fontSize: '12px', color: '#6c7086', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: color || '#cdd6f4' }}>{value}</div>
    </div>
  );
}

export default function SystemDashboard() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [status, setStatus] = useState<ResourceMetrics | null>(null);
  const [version, setVersion] = useState<SystemVersion | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [h, s, v, m] = await Promise.all([
        fetch(`${API}/api/v1/system/health`).then(r => r.json()),
        fetch(`${API}/api/v1/system/status`).then(r => r.json()),
        fetch(`${API}/api/v1/system/version`).then(r => r.json()),
        fetch(`${API}/api/v1/system/metrics`).then(r => r.json()),
      ]);
      setHealth(h);
      setStatus(s);
      setVersion(v);
      setMetrics(m);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
    setTime(new Date());
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#cdd6f4' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>🖥️ System Dashboard</h1>
          <p style={{ margin: '4px 0 0', color: '#6c7086', fontSize: '13px' }}>
            Última atualização: {time.toLocaleTimeString('pt-BR')} | Auto-refresh a cada 5s
          </p>
        </div>
        {error && (
          <div style={{ color: '#ef4444', fontSize: '13px', background: '#2d1b1b', padding: '8px 16px', borderRadius: '8px' }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Status Bar */}
      {health && (
        <div style={{
          display: 'flex', gap: '16px', padding: '16px', background: '#1e1e2e',
          borderRadius: '12px', border: '1px solid #313244', marginBottom: '20px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6c7086' }}>Status</div>
            <StatusBadge status={health.status} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6c7086' }}>Ambiente</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{health.environment}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6c7086' }}>Versão</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>v{health.version}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6c7086' }}>Uptime</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m</div>
          </div>
        </div>
      )}

      {/* Health Checks */}
      {health?.checks && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>🔍 Health Checks</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {Object.entries(health.checks).map(([name, check]: [string, any]) => (
              <div key={name} style={{
                background: '#1e1e2e', borderRadius: '8px', padding: '12px 16px',
                border: `1px solid ${check.status === 'ok' ? '#22c55e44' : '#ef444444'}`,
              }}>
                <div style={{ fontSize: '12px', color: '#6c7086', marginBottom: '4px', textTransform: 'capitalize' }}>{name}</div>
                <StatusBadge status={check.status} />
                {check.latency && <div style={{ fontSize: '11px', color: '#6c7086', marginTop: '4px' }}>{check.latency}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resources */}
      {status?.resources && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>💾 Recursos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
            <MetricCard label="Heap Used" value={status.resources.memory.heapUsed} color="#f9e2af" />
            <MetricCard label="Heap Total" value={status.resources.memory.heapTotal} color="#89b4fa" />
            <MetricCard label="RSS" value={status.resources.memory.rss} color="#a6e3a1" />
            {status.resources.memory.external && (
              <MetricCard label="External" value={status.resources.memory.external} color="#f38ba8" />
            )}
            <MetricCard label="CPU User" value={status.resources.cpu.user} color="#cba6f7" />
            <MetricCard label="CPU System" value={status.resources.cpu.system} color="#fab387" />
          </div>
        </div>
      )}

      {/* Latency Metrics */}
      {metrics?.latency && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>⏱️ Latência</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {Object.entries(metrics.latency).map(([name, data]: [string, any]) => (
              <div key={name} style={{
                background: '#1e1e2e', borderRadius: '8px', padding: '12px 16px',
                border: '1px solid #313244',
              }}>
                <div style={{ fontSize: '12px', color: '#6c7086', marginBottom: '8px', textTransform: 'capitalize' }}>{name}</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '12px' }}>Min: <b>{data.min}</b></span>
                  <span style={{ fontSize: '12px' }}>Avg: <b>{data.avg}</b></span>
                  <span style={{ fontSize: '12px' }}>Max: <b>{data.max}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Versions */}
      {version && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>📦 Versões</h2>
          <div style={{
            background: '#1e1e2e', borderRadius: '12px', padding: '16px',
            border: '1px solid #313244',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {Object.entries(version).map(([key, val]) => (
                <div key={key}>
                  <div style={{ fontSize: '11px', color: '#6c7086', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, wordBreak: 'break-all' }}>{String(val)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Raw Metrics */}
      {metrics && (
        <div>
          <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>📈 Métricas Detalhadas</h2>
          <pre style={{
            background: '#11111b', borderRadius: '8px', padding: '16px',
            fontSize: '12px', overflow: 'auto', maxHeight: '300px', border: '1px solid #313244',
          }}>
            {JSON.stringify(metrics, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
