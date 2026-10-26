import { Moon, Sun, Keyboard } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useRole } from '../context/RoleContext';
import { Button } from '../components/common/Button';
import type { Role } from '../types/domain';

export function SettingsRoute() {
  const { theme, setTheme } = useTheme();
  const { role, setRole } = useRole();

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
          Settings & Preferences
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
          Personalize workspace display and access controls
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Appearance */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600 }}>Appearance</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button
              variant={theme === 'light' ? 'primary' : 'secondary'}
              leftIcon={<Sun size={15} />}
              onClick={() => setTheme('light')}
            >
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'primary' : 'secondary'}
              leftIcon={<Moon size={15} />}
              onClick={() => setTheme('dark')}
            >
              Dark
            </Button>
          </div>
        </div>

        {/* Active Role Configuration */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600 }}>Active Role Context</h3>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--text-secondary)' }}>
            Switch active persona to test guarded regulatory transitions and role-specific permissions.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { id: 'REGIONAL_OFFICER' as Role, title: 'Regional Officer', desc: 'Executive oversight, committee scheduling, deadline extensions, final approval.' },
              { id: 'SCRUTINY_OFFICER' as Role, title: 'Scrutiny Officer', desc: 'Document verification, deficiency flagging, compliance resolution.' },
              { id: 'INSTITUTION_ADMIN' as Role, title: 'Institution Representative', desc: 'Application tracking, compliance proof upload, deficiency response.' },
              { id: 'EVC_EXPERT' as Role, title: 'EVC Expert Committee Member', desc: 'Assigned inspection roster, availability declaration.' },
            ].map(r => (
              <div
                key={r.id}
                onClick={() => setRole(r.id)}
                style={{
                  padding: 12,
                  border: `1px solid ${role === r.id ? 'var(--accent)' : 'var(--border)'}`,
                  background: role === r.id ? 'var(--accent-subtle)' : 'var(--bg-page)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: role === r.id ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.desc}</div>
                </div>
                {role === r.id && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>Active</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Keyboard size={16} color="var(--accent)" />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Keyboard Shortcuts</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-subtle)', borderRadius: 4 }}>
              <span>Search / Command Palette</span>
              <kbd style={{ fontFamily: 'monospace', fontWeight: 600 }}>⌘K / Ctrl+K</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-subtle)', borderRadius: 4 }}>
              <span>Close Modal / Drawer</span>
              <kbd style={{ fontFamily: 'monospace', fontWeight: 600 }}>Esc</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
