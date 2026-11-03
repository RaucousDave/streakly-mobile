import AppTabs from '@/components/app-tabs';
import { OfflineSyncProvider } from '@/contexts/offline-context';

export default function TabsLayout() {
  return (
    <OfflineSyncProvider>
      <AppTabs />
    </OfflineSyncProvider>
  );
}
