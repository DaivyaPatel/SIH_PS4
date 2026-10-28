import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Sliders,
  Settings,
} from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { useTheme } from '../../context/ThemeContext';
import { useDensity } from '../../context/DensityContext';
import { getNotifications, getNotificationSummary } from '../../lib/api';
import type { NotificationRecord, Role } from '../../types/domain';

interface HeaderProps {
  onOpenPalette?: () => void;
}

export function Header({ onOpenPalette }: HeaderProps = {}) {
  const { role, setRole, permissions } = useRole();
  const { theme, toggleTheme } = useTheme();
  const { density, toggleDensity } = useDensity();
  const navigate = useNavigate();

  const [bellOpen, setBellOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [recentNotifs, setRecentNotifs] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const bellRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getNotifications()
      .then(res => setRecentNotifs(res.slice(0, 5)))
      .catch(() => {});
    getNotificationSummary()
      .then(s => setUnreadCount(s.unread))
      .catch(() => {});
  }, [bellOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setBellOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: Array<{ key: Role; label: string }> = [
    { key: 'REGIONAL_OFFICER', label: 'Regional Officer' },
    { key: 'SCRUTINY_OFFICER', label: 'Scrutiny Officer' },
    { key: 'INSTITUTION_ADMIN', label: 'Institution Admin' },
    { key: 'EVC_EXPERT', label: 'EVC Expert' },
  ];

  return (
    <header
      style={{
        height: 48,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left: Quick Search button */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          onClick={() => (onOpenPalette ? onOpenPalette() : navigate('/cases'))}
          aria-label="Search cases or commands"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 10px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            fontSize: 12,
            cursor: 'pointer',
            minWidth: 260,
          }}
        >
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <span style={{ flex: 1, textAlign: 'left' }}>Search cases or colleges…</span>
          <kbd
            style={{
              fontSize: 10,
              fontFamily: 'monospace',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 3,
              padding: '1px 5px',
              color: 'var(--text-secondary)',
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Notifications Bell & User Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Notification Bell Dropdown */}
        <div style={{ position: 'relative' }} ref={bellRef}>
          <button
            onClick={() => setBellOpen(!bellOpen)}
            aria-label="Notifications"
            style={{
              background: bellOpen ? 'var(--bg-subtle)' : 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px 7px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  minWidth: 15,
                  height: 15,
                  borderRadius: 9999,
                  background: 'var(--status-bad)',
                  color: '#ffffff',
                  fontSize: 9,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 2px',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div
              style={{
                position: 'absolute',
                top: 36,
                right: 0,
                width: 320,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                padding: 12,
                zIndex: 100,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                  paddingBottom: 6,
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600 }}>Notifications</span>
                <button
                  onClick={() => {
                    setBellOpen(false);
                    navigate('/notifications');
                  }}
                  style={{
                    background: 'none',
                    border: 0,
                    color: 'var(--accent)',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  View notifications
                </button>
              </div>

              {recentNotifs.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                  No unread notifications
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {recentNotifs.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setBellOpen(false);
                        if (n.caseId) navigate(`/cases/${n.caseId}`);
                        else navigate('/notifications');
                      }}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-subtle)',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {n.content.substring(0, 65)}…
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User / Officer Menu Dropdown */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-label="User profile and settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              background: userMenuOpen ? 'var(--bg-subtle)' : 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={13} />
            </div>
            <span style={{ fontWeight: 500 }}>{permissions.roleDisplayName}</span>
            <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
          </button>

          {userMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 36,
                right: 0,
                width: 260,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                padding: 10,
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {/* Officer Profile Details */}
              <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Dr. S. K. Joshi</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{permissions.roleDisplayName} · WRO Jurisdiction</div>
              </div>

              {/* Theme & Density Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button
                  onClick={toggleTheme}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: 0,
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                    <span>Theme</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>
                    {theme === 'light' ? 'Light' : 'Dark'}
                  </span>
                </button>

                <button
                  onClick={toggleDensity}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: 0,
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sliders size={14} />
                    <span>Table Density</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>
                    {density === 'compact' ? 'Compact (32px)' : 'Comfortable (40px)'}
                  </span>
                </button>
              </div>

              {/* Developer / Demo Mode Section */}
              <div style={{ paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Developer & Demo
                </div>

                <div style={{ fontSize: 11, color: 'var(--status-ok-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-ok)' }} />
                  Live Simulated · IST (UTC+05:30)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <label htmlFor="role-select" style={{ fontSize: 11, color: 'var(--text-muted)' }}>Persona role:</label>
                  <select
                    id="role-select"
                    value={role}
                    onChange={e => {
                      setRole(e.target.value as Role);
                      setUserMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '4px 6px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {roles.map(r => (
                      <option key={r.key} value={r.key}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Settings Link */}
              <div style={{ paddingTop: 6, borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/settings');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: 0,
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Settings size={14} />
                  <span>All Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
