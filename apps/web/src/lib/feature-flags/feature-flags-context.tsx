'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/lib/api-client';

interface FeatureFlagsContextValue {
  flags: Record<string, boolean>;
  loading: boolean;
  isActive: (chave: string) => boolean;
  refresh: () => Promise<void>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue>({
  flags: {},
  loading: true,
  isActive: () => true,
  refresh: async () => {},
});

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await api.get<Record<string, boolean>>('/feature-flags/status');
      setFlags(data);
    } catch {
      setFlags({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const isActive = (chave: string) => flags[chave] ?? true;

  return (
    <FeatureFlagsContext.Provider value={{ flags, loading, isActive, refresh }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}
