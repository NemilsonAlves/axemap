'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Shield,
  Download,
  Trash2,
  Edit3,
  Lock,
  FileText,
  Cookie,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api-client';
import { revokeConsent } from '@/lib/consent/consent-manager';

interface ActionState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: ActionState = { loading: false, success: false, error: null };

export default function MeusDadosPage() {
  const { user, token, logout } = useAuth();

  const [exportState, setExportState] = React.useState<ActionState>(initialState);
  const [deleteState, setDeleteState] = React.useState<ActionState>(initialState);
  const [revokeState, setRevokeState] = React.useState<ActionState>(initialState);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleExportarDados = async () => {
    if (!token) return;
    setExportState({ loading: true, success: false, error: null });
    try {
      const data = await api.get('/auth/exportar-dados', token);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `axemap-dados-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportState({ loading: false, success: true, error: null });
    } catch {
      setExportState({ loading: false, success: false, error: 'Erro ao exportar dados. Tente novamente.' });
    }
  };

  const handleDeletarConta = async () => {
    if (!token) return;
    setDeleteState({ loading: true, success: false, error: null });
    try {
      await api.delete('/auth/conta', token);
      setDeleteState({ loading: false, success: true, error: null });
      // Revogar consentimento local e fazer logout
      revokeConsent();
      setTimeout(() => logout(), 2000);
    } catch {
      setDeleteState({ loading: false, success: false, error: 'Erro ao excluir conta. Tente novamente ou entre em contato com privacidade@axemap.com.br' });
    }
    setShowDeleteConfirm(false);
  };

  const handleRevogarConsentimento = async () => {
    setRevokeState({ loading: true, success: false, error: null });
    try {
      if (token) {
        await api.post('/auth/revogar-consentimento', {}, token);
      }
      // Revogar também localmente
      revokeConsent();
      // Reabrir o painel para que o usuário possa reconfigurar
      window.dispatchEvent(new CustomEvent('axemap:open-cookie-consent'));
      setRevokeState({ loading: false, success: true, error: null });
    } catch {
      setRevokeState({ loading: false, success: false, error: 'Erro ao revogar consentimentos. Tente novamente.' });
    }
  };

  const isLoggedIn = !!user;

  return (
    <div className="container-page py-12 max-w-3xl">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="size-8 text-verde-floresta" aria-hidden="true" />
          <h1 className="font-display text-2xl font-black">Central de Privacidade</h1>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Gerencie seus dados pessoais, cookies e consentimentos conforme a{' '}
          <strong>LGPD (Lei 13.709/2018)</strong>. Você tem controle total sobre suas informações.
        </p>
      </div>

      {/* Aviso se não autenticado */}
      {!isLoggedIn && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-5 py-4">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong>Entre na sua conta</strong> para acessar opções de exportação, correção e exclusão de dados.{' '}
            <Link href="/auth/login" className="underline font-medium">Entrar →</Link>
          </p>
        </div>
      )}

      {/* Grade de ações */}
      <div className="grid gap-4 sm:grid-cols-2">

        {/* Gerenciar cookies */}
        <ActionCard
          icon={Cookie}
          title="Preferências de Cookies"
          description="Escolha quais cookies aceitar. Apenas os essenciais são obrigatórios."
          onClick={() => window.dispatchEvent(new CustomEvent('axemap:open-cookie-consent'))}
          buttonLabel="Gerenciar cookies"
          variant="default"
        />

        {/* Exportar dados */}
        <ActionCard
          icon={Download}
          title="Exportar Meus Dados"
          description="Baixe um arquivo JSON com todos os seus dados pessoais armazenados no AxéMap."
          onClick={handleExportarDados}
          buttonLabel={exportState.loading ? 'Exportando...' : 'Solicitar exportação'}
          disabled={!isLoggedIn || exportState.loading}
          state={exportState}
          variant="default"
        />

        {/* Revogar consentimento */}
        <ActionCard
          icon={Lock}
          title="Revogar Consentimentos"
          description="Revogue todos os consentimentos opcionais (analytics, marketing). Apenas cookies essenciais permanecerão ativos."
          onClick={handleRevogarConsentimento}
          buttonLabel={revokeState.loading ? 'Revogando...' : 'Revogar consentimentos'}
          disabled={revokeState.loading}
          state={revokeState}
          variant="default"
        />

        {/* Solicitar correção */}
        <ActionCard
          icon={Edit3}
          title="Solicitar Correção"
          description="Dados incorretos ou desatualizados? Entre em contato para corrigir."
          href="mailto:privacidade@axemap.com.br?subject=Solicitação de Correção de Dados"
          buttonLabel="Enviar solicitação"
          variant="default"
        />

        {/* Excluir conta */}
        <div className="sm:col-span-2">
          <div className="rounded-2xl border border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20 px-5 py-5">
            <div className="flex items-start gap-3 mb-3">
              <Trash2 className="size-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-semibold text-sm text-foreground">Excluir Conta e Dados</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Exclui permanentemente sua conta e anonimiza seus dados pessoais. Registros financeiros e
                  de auditoria são mantidos conforme a lei por até 5 anos.
                </p>
              </div>
            </div>

            {deleteState.success ? (
              <FeedbackMessage type="success" message="Conta excluída com sucesso. Você será desconectado em instantes." />
            ) : deleteState.error ? (
              <FeedbackMessage type="error" message={deleteState.error} />
            ) : showDeleteConfirm ? (
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs text-muted-foreground self-center">Tem certeza? Esta ação não pode ser desfeita.</span>
                <button
                  onClick={handleDeletarConta}
                  disabled={deleteState.loading}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteState.loading ? 'Excluindo...' : 'Confirmar exclusão'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-semibold"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={!isLoggedIn}
                className="mt-2 rounded-lg border border-red-300 bg-white dark:bg-red-950 px-4 py-2 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-40"
              >
                Solicitar exclusão de conta
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Links institucionais */}
      <div className="mt-10 border-t border-border pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Informações
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <InstitutionalLink href="/privacidade" icon={FileText} label="Política de Privacidade" />
          <InstitutionalLink href="/cookies" icon={Cookie} label="Política de Cookies" />
          <InstitutionalLink href="/termos" icon={FileText} label="Termos de Uso" />
          <InstitutionalLink
            href="mailto:privacidade@axemap.com.br"
            icon={Shield}
            label="Contato: privacidade@axemap.com.br"
          />
        </div>
      </div>

      {/* Direitos do titular */}
      <div className="mt-8 rounded-2xl border border-border bg-muted/30 px-5 py-5">
        <h2 className="text-sm font-semibold mb-3">Seus direitos conforme a LGPD</h2>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {[
            'Confirmação da existência de tratamento e acesso aos seus dados',
            'Correção de dados incompletos, inexatos ou desatualizados',
            'Anonimização, bloqueio ou eliminação de dados desnecessários',
            'Portabilidade dos dados a outro fornecedor',
            'Eliminação dos dados tratados com base em consentimento',
            'Informação sobre compartilhamento com terceiros',
            'Revogação do consentimento a qualquer momento',
          ].map((direito) => (
            <li key={direito} className="flex items-start gap-2">
              <ChevronRight className="size-3.5 mt-0.5 shrink-0 text-verde-floresta" aria-hidden="true" />
              {direito}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Respondemos a pedidos em até <strong>15 dias úteis</strong>.
          Contato: <a href="mailto:privacidade@axemap.com.br" className="underline">privacidade@axemap.com.br</a>
        </p>
      </div>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function ActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  href,
  buttonLabel,
  disabled,
  state,
  variant: _variant,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick?: () => void;
  href?: string;
  buttonLabel: string;
  disabled?: boolean;
  state?: ActionState;
  variant: 'default' | 'danger';
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-5">
      <div className="flex items-start gap-3 mb-3">
        <Icon className="size-5 text-verde-floresta shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      {state?.success && <FeedbackMessage type="success" message="Concluído com sucesso!" />}
      {state?.error && <FeedbackMessage type="error" message={state.error} />}
      {href ? (
        <a
          href={href}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent"
        >
          {buttonLabel}
          <ChevronRight className="size-3" aria-hidden="true" />
        </a>
      ) : (
        <button
          onClick={onClick}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {state?.loading && <RefreshCw className="size-3 animate-spin" aria-hidden="true" />}
          {buttonLabel}
        </button>
      )}
    </div>
  );
}

function InstitutionalLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      href={href as any}
      className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground hover:bg-accent transition-colors"
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="flex-1">{label}</span>
      <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
    </Link>
  );
}

function FeedbackMessage({
  type,
  message,
}: {
  type: 'success' | 'error';
  message: string;
}) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs mb-2 ${
        type === 'success'
          ? 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200'
          : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle className="size-3.5 shrink-0 mt-0.5" aria-hidden="true" />
      ) : (
        <AlertCircle className="size-3.5 shrink-0 mt-0.5" aria-hidden="true" />
      )}
      {message}
    </div>
  );
}
