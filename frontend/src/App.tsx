import { useEffect, useState } from 'react';
import { getPlatformStatus, type PlatformStatus } from './api/client';

export function PlatformPanel({ status }: { status: PlatformStatus }) {
  const services = [
    ['Identity federation', status.identityIntegrated],
    ['Authorised host connection', status.hostConnected],
    ['External notifications', status.notificationsEnabled],
  ] as const;
  return <section className="panel" aria-labelledby="services-title">
    <div className="section-heading"><h2 id="services-title">Service connections</h2><span className="status">API connected</span></div>
    <p>Environment: {status.environment}. The API exposes platform metadata only.</p>
    <dl>{services.map(([name, connected]) => <div className="service" key={name}>
      <dt>{name}</dt><dd>{connected ? 'Connected' : 'Not connected'}</dd>
    </div>)}</dl>
    <p className="note">Institution records and approval actions become available after scoped access controls are implemented.</p>
  </section>;
}

export function App() {
  const [status, setStatus] = useState<PlatformStatus>();
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setStatus(undefined);
    setError(undefined);
    getPlatformStatus(controller.signal).then(setStatus).catch((failure: unknown) => {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Unable to connect.');
    });
    return () => controller.abort();
  }, [attempt]);

  return <>
    <div className="development">SYNTHETIC DEVELOPMENT · No connection to an AICTE production system</div>
    <header><a className="brand" href="/">AC<span>Approval Coordination</span></a><span className="stage">Foundation workspace</span></header>
    <main>
      <div className="eyebrow">INTEGRATED WORKFLOW & COMPLIANCE</div>
      <h1>A clear view of<br />every next step.</h1>
      <p className="intro">A development foundation for coordinating application movement, compliance deadlines and accountable follow-up.</p>
      <div aria-live="polite" aria-atomic="true">
        {status ? <PlatformPanel status={status} /> : error
          ? <section className="panel"><h2>Service connection unavailable</h2><p>{error}</p><button onClick={() => setAttempt(attempt + 1)}>Try again</button></section>
          : <section className="panel"><p role="status">Connecting to the coordination service…</p></section>}
      </div>
      <p className="safeguard">Regulatory scrutiny, verification, inspections and decisions remain with the competent authority.</p>
    </main>
    <footer>Approval Coordination · Local development shell</footer>
  </>;
}
