import { createContext, useContext } from 'react';

import { useOfflineSync } from '@/hooks/use-offline-sync';

type OfflineSyncValue = ReturnType<typeof useOfflineSync>;

const OfflineSyncContext = createContext<OfflineSyncValue | null>(null);

/**
 * One sync worker for the whole signed-in app. Running the hook in each screen
 * would schedule duplicate intervals and race two flushes of the same queue.
 */
export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const value = useOfflineSync();

  return <OfflineSyncContext.Provider value={value}>{children}</OfflineSyncContext.Provider>;
}

export function useOfflineSyncContext() {
  const context = useContext(OfflineSyncContext);

  if (!context) {
    throw new Error('useOfflineSyncContext must be used inside OfflineSyncProvider');
  }

  return context;
}
