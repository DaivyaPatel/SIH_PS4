import { useState } from 'react';
import {
  Moon,
  Sun,
  Keyboard,
  UserCheck,
  Bell,
  Sliders,
  Check,
  BookOpen,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useRole } from '../context/RoleContext';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import type { Role } from '../types/domain';

type Density = 'comfortable' | 'compact' | 'spacious';

export function SettingsRoute() {
  const { theme, setTheme } = useTheme();
  const { role, setRole, permissions } = useRole();
  const { addToast } = useToast();

  const [density, setDensity] = useState<Density>('comfortable');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [portalAlerts, setPortalAlerts] = useState(true);

  const handleDensityChange = (d: Density) => {
    setDensity(d);
    addToast(`Workspace density set to ${d}.`, 'info');
  };

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    addToast(`Active role switched to ${r.replace(/_/g, ' ')}.`, 'info');
  };

  const rolesConfig: Array<{ id: Role; title: string; subtitle: string; desc: string }> = [
    {
      id: 'REGIONAL_OFFICER',
      title: 'Regional Officer (RO)',
      subtitle: 'Executive Authority',
      desc: 'Overall regional portfolio oversight, committee appointment & scheduling, statutory SLA emergency extensions, and final recommendation or rejection order.',
    },
    {
      id: 'SCRUTINY_OFFICER',
      title: 'Scrutiny Officer',
      subtitle: 'Document Compliance Examiner',
      desc: 'Mandatory documentary verification against APH norms, deficiency flagging with SLA cure windows, and resolution clearance verification.',
    },
    {
      id: 'INSTITUTION_ADMIN',
      title: 'Institution Representative',
      subtitle: 'College Management / Applicant',
      desc: 'Real-time application progress tracking, compliance proof document resubmission, deficiency response submission, and scheduled inspection readiness.',
    },
    {
      id: 'EVC_EXPERT',
      title: 'Expert Visit Committee (EVC) Member',
      subtitle: 'Peer Review Inspector',
      desc: 'Academic peer roster, institutional conflict-of-interest declarations, inspection window availability, and on-site infrastructure verification.',
    },
  ];

  const shortcuts = [
    { key: '⌘K / Ctrl+K', desc: 'Open Global Search & Command Palette' },
    { key: 'Esc', desc: 'Dismiss open Modal, Inspection Drawer, or Graph Node selection' },
    { key: '1 – 6', desc: 'Switch tabs on Case Detail (Overview, Docs, Deficiencies, Timeline, EVC, Graph)' },
    { key: 'Tab', desc: 'Accessible sequential focus navigation' },
    { key: 'Space / Enter', desc: 'Activate selected button or interactive element' },
    { key: '?', desc: 'Quick help reference modal' },
  ];

  return (
    <div style={{ maxWidth: 840, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 4px',
            letterSpacing: '-0.01em',
          }}
        >
          Settings & Workspace Preferences
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
          Configure theme appearance, display density, role context, and statutory notifications
        </p>
      </div>

      {/* 1. Appearance & Theme */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 20,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Sun size={16} style={{ color: 'var(--accent)' }} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            Appearance & Interface Theme
          </h3>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
          UX4G Design System theme matching national portal governance standards
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button
            variant={theme === 'light' ? 'primary' : 'secondary'}
            leftIcon={<Sun size={15} />}
            onClick={() => setTheme('light')}
          >
            Light Theme
          </Button>

          <Button
            variant={theme === 'dark' ? 'primary' : 'secondary'}
            leftIcon={<Moon size={15} />}
            onClick={() => setTheme('dark')}
          >
            Dark Theme
          </Button>
        </div>
      </div>

      {/* 2. Workspace Display Density */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 20,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Sliders size={16} style={{ color: 'var(--accent)' }} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            Workspace Display Density
          </h3>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
          Adjust row heights, table padding, and spacing for high-density regulatory review
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { id: 'compact' as Density, title: 'Compact', subtitle: 'Dense rows for rapid review' },
            { id: 'comfortable' as Density, title: 'Comfortable', subtitle: 'Standard balanced spacing' },
            { id: 'spacious' as Density, title: 'Spacious', subtitle: 'Generous touch-friendly padding' },
          ].map(d => (
            <button
              key={d.id}
              type="button"
              onClick={() => handleDensityChange(d.id)}
              style={{
                padding: '12px 14px',
                borderRadius: 6,
                border: `1.5px solid ${density === d.id ? 'var(--accent)' : 'var(--border)'}`,
                background: density === d.id ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: density === d.id ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {d.title}
                </span>
                {density === d.id && <Check size={14} style={{ color: 'var(--accent)' }} />}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {d.subtitle}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Role Persona Switcher */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 20,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <UserCheck size={16} style={{ color: 'var(--accent)' }} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            Active Role Persona Context
          </h3>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
          Currently active as <strong>{permissions.roleDisplayName}</strong>. Switch role context to simulate workflow transitions and guarded permissions.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rolesConfig.map(r => {
            const isActive = role === r.id;
            return (
              <div
                key={r.id}
                onClick={() => handleRoleSelect(r.id)}
                style={{
                  padding: 14,
                  borderRadius: 6,
                  border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                  background: isActive ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 16,
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                      }}
                    >
                      {r.title}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: 3,
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {r.subtitle}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {r.desc}
                  </p>
                </div>

                {isActive ? (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: 'var(--accent)',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}
                  >
                    Active
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      flexShrink: 0,
                      padding: '3px 8px',
                    }}
                  >
                    Select
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Statutory Notification Delivery Preferences */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 20,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Bell size={16} style={{ color: 'var(--accent)' }} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            Statutory Notification Channels
          </h3>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
          Statutory delivery preferences for APH Chapter 2 compliance notices
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Portal In-App Alerts
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Real-time bell notifications and dashboard escalation alerts
              </div>
            </div>
            <input
              type="checkbox"
              checked={portalAlerts}
              onChange={e => setPortalAlerts(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent)' }}
            />
          </label>

          <div style={{ height: 1, background: 'var(--border)' }} />

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Registered Contact Email Delivery
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Official PDF orders, deficiency letters, and appointment notices
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={e => setEmailAlerts(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent)' }}
            />
          </label>

          <div style={{ height: 1, background: 'var(--border)' }} />

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Urgent SMS Alerts
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Urgent 48-hour cure deadline reminders and statutory escalations
              </div>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={e => setSmsAlerts(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent)' }}
            />
          </label>
        </div>
      </div>

      {/* 5. Keyboard Shortcuts Reference Table */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 20,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Keyboard size={16} style={{ color: 'var(--accent)' }} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            Keyboard Shortcuts Reference
          </h3>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
          Accelerate regulatory workflows with keyboard command shortcuts
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 10 }}>
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 6,
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{sc.desc}</span>
              <kbd
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: 11,
                  padding: '2px 6px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  color: 'var(--accent)',
                }}
              >
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Statutory APH 2026-27 Governance SLA Reference */}
      <div
        style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <BookOpen size={16} style={{ color: 'var(--accent)' }} />
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            AICTE Approval Process Handbook (APH 2026-27) SLA Norms
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, fontSize: 12 }}>
          <div style={{ padding: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Scrutiny Window</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', marginTop: 2 }}>15 Business Days</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>APH Clause 2.4.1</div>
          </div>

          <div style={{ padding: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Deficiency Cure Window</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', marginTop: 2 }}>15 Calendar Days</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>APH Clause 2.4.3</div>
          </div>

          <div style={{ padding: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>EVC Inspection Window</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', marginTop: 2 }}>21 Calendar Days</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>APH Clause 2.5.2</div>
          </div>

          <div style={{ padding: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Final Order SLA</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--status-ok-text)', marginTop: 2 }}>30 April 2027</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>Statutory Cutoff</div>
          </div>
        </div>
      </div>
    </div>
  );
}
