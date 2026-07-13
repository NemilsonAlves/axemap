'use client';

import type { ProfileCompleteness as CompletenessType } from '@/types/terreiro';

export function ProfileCompleteness({ completeness }: { completeness: CompletenessType }) {
  const doneItems = completeness.items.filter((i) => i.done).length;

  return (
    <div className="section-card">
      <h2 className="section-title">Completeza do Perfil</h2>

      <div className="pc-bar-container">
        <div className="pc-bar">
          <div
            className="pc-bar-fill"
            style={{
              width: `${completeness.score}%`,
              background: completeness.score >= 80
                ? 'var(--color-accent)'
                : completeness.score >= 50
                ? '#f59e0b'
                : '#ef4444',
            }}
          />
        </div>
        <span className="pc-percent">{completeness.score}%</span>
      </div>

      <p className="pc-subtitle">
        {doneItems} de {completeness.items.length} itens preenchidos
      </p>

      <div className="pc-lista">
        {completeness.items.map((item) => (
          <div key={item.key} className={`pc-item ${item.done ? 'done' : ''}`}>
            <span className="pc-check">{item.done ? '✓' : '○'}</span>
            <span className="pc-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
