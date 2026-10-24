import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlatformPanel } from './App';

describe('service connections', () => {
  it('labels disconnected capabilities explicitly and provides no approval controls', () => {
    const html = renderToStaticMarkup(<PlatformPanel status={{ name: 'Example', environment: 'development',
      synthetic: true, identityIntegrated: false, hostConnected: false, notificationsEnabled: false }} />);
    expect(html.match(/Not connected/g)).toHaveLength(3);
    expect(html).toContain('scoped access controls');
    expect(html).not.toContain('<button');
  });
});
