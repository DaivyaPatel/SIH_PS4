import type { components } from './schema';

export type PlatformStatus = components['schemas']['PlatformStatus'];

export async function getPlatformStatus(signal?: AbortSignal): Promise<PlatformStatus> {
  const response = await fetch('/api/v1/platform', { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('The coordination service is unavailable.');
  const body: unknown = await response.json();
  if (!isPlatformStatus(body)) throw new Error('The service returned an unsupported response.');
  return body;
}

function isPlatformStatus(value: unknown): value is PlatformStatus {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.name === 'string' && typeof candidate.environment === 'string'
    && ['synthetic', 'identityIntegrated', 'hostConnected', 'notificationsEnabled']
      .every(key => typeof candidate[key] === 'boolean');
}
