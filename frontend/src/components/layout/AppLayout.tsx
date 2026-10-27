import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { CommandPalette } from '../common/CommandPalette';

export function AppLayout() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Synthetic Coexistence Banner */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border)',
            padding: '6px 24px',
            fontSize: 11,
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>
            <strong>AICTE Approval Orchestration</strong> · Synthetic Demo Coexistence Mode
          </span>
          <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
            Statutory Time: Indian Standard Time (IST / UTC+05:30)
          </span>
        </div>

        <Header onOpenPalette={() => setPaletteOpen(true)} />

        <main
          style={{
            flex: 1,
            padding: '24px 32px 48px',
            maxWidth: 1440,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <Breadcrumbs />
          <Outlet />
        </main>

        <footer
          style={{
            padding: '16px 32px',
            borderTop: '1px solid var(--border)',
            fontSize: 12,
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-surface)',
          }}
        >
          <span>Approval Coordination & Compliance Monitoring Service · v0.1.0</span>
          <span>Regulatory decisions remain exclusively with the statutory authority</span>
        </footer>

        {/* Global Command Palette */}
        <CommandPalette
          isOpen={paletteOpen}
          onClose={() => setPaletteOpen(false)}
        />
      </div>
    </div>
  );
}
