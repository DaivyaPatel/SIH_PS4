import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, getDashboardSummary, getCases } from './api';

afterEach(() => vi.unstubAllGlobals());

describe('API Client Layer', () => {
  it('generates correlation ID header and parses valid JSON response', async () => {
    const mockData = { academicYear: '2026-27', kpiCards: { totalColleges: 5 } };
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(Response.json(mockData)));
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiFetch<typeof mockData>('/api/v1/test');
    expect(result).toEqual(mockData);

    const calledHeaders = fetchMock.mock.calls[0][1].headers as Headers;
    expect(calledHeaders.get('X-Correlation-ID')).toBeTruthy();
    expect(calledHeaders.get('Accept')).toContain('application/json');
  });

  it('parses RFC 7807 problem json on failure and raises ApiException', async () => {
    const problemJson = {
      type: 'https://api.sih.nic.in/problems/bad-request',
      title: 'Invalid parameter',
      status: 400,
      detail: "Parameter 'region' has an invalid value.",
      instance: '/api/v1/cases',
      correlationId: '12345',
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify(problemJson), {
            status: 400,
            headers: { 'Content-Type': 'application/problem+json' },
          })
        )
      )
    );

    await expect(apiFetch('/api/v1/cases')).rejects.toThrow("Parameter 'region' has an invalid value.");
  });

  it('encodes query parameters properly for dashboard summary and case listing', async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(Response.json([])));
    vi.stubGlobal('fetch', fetchMock);

    await getDashboardSummary('WRO');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/dashboard/summary?region=WRO');

    await getCases('UNDER_SCRUTINY', 'SRO');
    expect(fetchMock.mock.calls[1][0]).toBe('/api/v1/cases?status=UNDER_SCRUTINY&region=SRO');
  });
});
