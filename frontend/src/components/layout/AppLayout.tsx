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
        <Header onOpenPalette={() => setPaletteOpen(true)} />

        <main
          style={{
            flex: 1,
            padding: '28px 36px 48px',
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
            padding: '14px 36px',
            borderTop: '1px solid var(--border)',
            fontSize: 12,
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-surface)',
          }}
        >
          <span>Approval Coordination & Compliance Monitoring Service · AY 2026-27</span>
          <span style={{ fontSize: 11 }}>AICTE National Council for Technical Education</span>
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
