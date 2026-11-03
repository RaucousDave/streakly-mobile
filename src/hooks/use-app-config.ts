import { useQuery } from '@tanstack/react-query';

import { getAppConfig } from '@/api/config.api';
import { queryKeys } from '@/api/query-keys';

/**
 * Used for maintenance and force-update messaging. Failure is silent: the
 * app must remain usable when the config endpoint is unreachable.
 */
export function useAppConfig() {
  return useQuery({
    queryKey: queryKeys.appConfig,
    queryFn: getAppConfig,
    staleTime: 60 * 60_000,
    retry: 1,
  });
}
