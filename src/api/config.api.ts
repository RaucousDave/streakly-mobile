import { http } from '@/api/client';
import { APP_VERSION } from '@/constants/config';
import type { AppConfig } from '@/types/habit';

export async function getAppConfig(): Promise<AppConfig> {
  const response = await http.get('/app/config', { params: { version: APP_VERSION } });
  return response.data as AppConfig;
}
