'use client';

import { useState, useCallback, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/cn';

/**
 * AxéMap — Enhanced Filter System
 *
 * Comprehensive filtering for the map with state, city, tradition,
 * verification level, accessibility, and category filters.
 */

export type FilterEstado =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export type FilterVerification =
  | 'all'
  | 'INICIANTE'
  | 'EMERGENTE'
  | 'ESTABELECIDO'
  | 'AUTORIDADE'
  | 'LENDAIRO';

export type FilterCategory =
  | 'all'
  | 'casa'
  | 'verificada'
  | 'tradicional'
  | 'federacao'
  | 'evento'
  | 'negocio';

export type FilterAccessibility =
  | 'all'
  | 'acessivel'
  | 'estacionamento'
  | 'sinalizacao'
  | 'rampa'
  | 'elevador';

export interface MapFilters {
  search: string;
  estado: string;
  cidade: string;
  tradicao: string;
  verification: FilterVerification;
  category: FilterCategory;
  accessibility: FilterAccessibility;
}

interface FilterPanelProps {
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
  resultCount?: number;
  tradicoes?: string[];
  cidades?: string[];
  className?: string;
}

const ESTADOS: { value: FilterEstado; label: string }[] = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

const CATEGORIES: { value: FilterCategory; label: string; icon: string }[] = [
  { value: 'all', label: 'Todos', icon: '◎' },
  { value: 'casa', label: 'Casas', icon: '⌂' },
  { value: 'verificada', label: 'Verificadas', icon: '✓' },
  { value: 'tradicional', label: 'Tradicionais', icon: '✦' },
  { value: 'federacao', label: 'Federações', icon: '★' },
  { value: 'evento', label: 'Eventos', icon: '◈' },
  { value: 'negocio', label: 'Negócios', icon: '⊞' },
];

const VERIFICATION_LEVELS: { value: FilterVerification; label: string; color: string }[] = [
  { value: 'all', label: 'Todos os níveis', color: 'hsl(28,14%,42%)' },
  { value: 'LENDAIRO', label: 'Lendário', color: 'hsl(150,42%,36%)' },
  { value: 'AUTORIDADE', label: 'Autoridade', color: 'hsl(150,46%,44%)' },
  { value: 'ESTABELECIDO', label: 'Estabelecido', color: 'hsl(36,85%,44%)' },
  { value: 'EMERGENTE', label: 'Emergente', color: 'hsl(38,90%,40%)' },
  { value: 'INICIANTE', label: 'Iniciante', color: 'hsl(18,66%,47%)' },
];

const ACCESSIBILITY_OPTIONS: { value: FilterAccessibility; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'acessivel', label: 'Acessível' },
  { value: 'estacionamento', label: 'Estacionamento' },
  { value: 'sinalizacao', label: 'Sinalização' },
  { value: 'rampa', label: 'Rampa' },
  { value: 'elevador', label: 'Elevador' },
];

export function FilterPanel({
  filters,
  onFiltersChange,
  resultCount,
  tradicoes = [],
  cidades = [],
  className,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = useCallback(
    (key: keyof MapFilters, value: string) => {
      onFiltersChange({ ...filters, [key]: value });
    },
    [filters, onFiltersChange],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.estado) count++;
    if (filters.cidade) count++;
    if (filters.tradicao) count++;
    if (filters.verification !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.accessibility !== 'all') count++;
    return count;
  }, [filters]);

  const clearAll = useCallback(() => {
    onFiltersChange({
      search: '',
      estado: '',
      cidade: '',
      tradicao: '',
      verification: 'all',
      category: 'all',
      accessibility: 'all',
    });
  }, [onFiltersChange]);

  return (
    <div className={cn('bg-white rounded-xl shadow-lg border border-border/50 overflow-hidden', className)}>
      {/* Search bar */}
      <div className="p-3 border-b border-border/50">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            type="text"
            placeholder="Buscar terreiros, tradições, locais..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 pr-4 h-10 bg-background/50"
          />
        </div>
      </div>

      {/* Quick filters (always visible) */}
      <div className="p-3 border-b border-border/50">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => updateFilter('category', cat.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                filters.category === cat.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
              )}
            >
              <span className="text-sm">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expandable advanced filters */}
      <div className="border-t border-border/50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-sm text-muted-foreground hover:bg-secondary/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            Filtros avançados
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </span>
          <svg
            className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-3">
          {/* Estado */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Estado
            </label>
            <Select value={filters.estado} onValueChange={(v) => updateFilter('estado', v)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos os estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                {ESTADOS.map((uf) => (
                  <SelectItem key={uf.value} value={uf.value}>
                    {uf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cidade */}
          {filters.estado && cidades.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Cidade
              </label>
              <Select value={filters.cidade} onValueChange={(v) => updateFilter('cidade', v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todas as cidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  {cidades.map((cidade) => (
                    <SelectItem key={cidade} value={cidade}>
                      {cidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tradição */}
          {tradicoes.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tradição
              </label>
              <Select value={filters.tradicao} onValueChange={(v) => updateFilter('tradicao', v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todas as tradições" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as tradições</SelectItem>
                  {tradicoes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Nível de Verificação */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Nível de Verificação
            </label>
            <div className="flex flex-wrap gap-1.5">
              {VERIFICATION_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => updateFilter('verification', level.value)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                    filters.verification === level.value
                      ? 'text-white shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                  )}
                  style={
                    filters.verification === level.value
                      ? { backgroundColor: level.color }
                      : undefined
                  }
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Acessibilidade */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Acessibilidade
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ACCESSIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFilter('accessibility', opt.value)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                    filters.accessibility === opt.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="w-full py-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Limpar todos os filtros
            </button>
          )}
          </div>
        )}
      </div>

      {/* Result count */}
      {resultCount !== undefined && (
        <div className="px-4 py-2 bg-secondary/30 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{resultCount}</span>
            {' '}terreiro{resultCount !== 1 ? 's' : ''} encontrado{resultCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
