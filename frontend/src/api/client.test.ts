import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPlatformStatus } from './client';

afterEach(() => vi.unstubAllGlobals());

describe('platform client', () => {
  it('rejects an HTTP failure instead of showing fabricated service state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    await expect(getPlatformStatus()).rejects.toThrow('unavailable');
  });

  it('rejects a partial or incompatible API response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ name: 'Example' })));
    await expect(getPlatformStatus()).rejects.toThrow('unsupported response');
  });

  it('uses the shared shape and passes cancellation to the network request', async () => {
    const status = { name: 'Example', environment: 'development', synthetic: true,
      identityIntegrated: false, hostConnected: false, notificationsEnabled: false };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(status));
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();
    expect(await getPlatformStatus(controller.signal)).toEqual(status);
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/platform', expect.objectContaining({ signal: controller.signal }));
  });
});
