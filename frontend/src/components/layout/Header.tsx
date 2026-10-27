import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Globe,
  UserCheck,
} from 'lucide-react';
import { useRegion } from '../../context/RegionContext';
import { useRole } from '../../context/RoleContext';
import { useTheme } from '../../context/ThemeContext';
import { getNotifications, getNotificationSummary } from '../../lib/api';
import type { NotificationRecord, Role } from '../../types/domain';

export function Header() {
  const { selectedRegion, setSelectedRegion } = useRegion();
  const { role, setRole } = useRole();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [bellOpen, setBellOpen] = useState(false);
  const [recentNotifs, setRecentNotifs] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setBellOpen(false);
      }
    }
    if (bellOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [bellOpen]);

  const roles: Array<{ key: Role; label: string }> = [
    { key: 'REGIONAL_OFFICER', label: 'Regional Officer' },
    { key: 'SCRUTINY_OFFICER', label: 'Scrutiny Officer' },
    { key: 'INSTITUTION_ADMIN', label: 'Institution Admin' },
    { key: 'EVC_EXPERT', label: 'EVC Expert' },
  ];

  const regions = ['ALL', 'WRO', 'SRO', 'NRO', 'ERO', 'CRO'] as const;

  return (
    <header
      style={{
        height: 60,
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
      {/* Search Input trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/cases')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 12px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text-secondary)',
            fontSize: 13,
            cursor: 'pointer',
            minWidth: 260,
          }}
        >
          <Search size={15} />
          <span style={{ flex: 1, textAlign: 'left' }}>Search cases or colleges…</span>
          <kbd
            style={{
              fontSize: 11,
              fontFamily: 'monospace',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '1px 5px',
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Global Context Pickers & Utilities */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Region Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Globe size={15} style={{ color: 'var(--text-muted)' }} />
          <select
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value as (typeof regions)[number])}
            aria-label="Filter by region"
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            {regions.map(r => (
              <option key={r} value={r}>
                {r === 'ALL' ? 'All Regions' : `Region: ${r}`}
              </option>
            ))}
          </select>
        </div>

        {/* Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <UserCheck size={15} style={{ color: 'var(--text-muted)' }} />
          <select
            value={role}
            onChange={e => setRole(e.target.value as Role)}
            aria-label="Switch active role"
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: 'var(--accent-subtle)',
              color: 'var(--accent)',
              border: '1px solid var(--accent-border)',
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

        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        {/* Notification Bell Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setBellOpen(!bellOpen)}
            aria-label="Notifications"
            style={{
              background: 'transparent',
              border: 0,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  background: 'var(--status-bad-solid)',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  boxSizing: 'border-box',
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
                borderRadius: 8,
                boxShadow: 'var(--shadow-lg)',
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
                <span style={{ fontSize: 13, fontWeight: 600 }}>Recent Notifications</span>
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
                    cursor: 'pointer',
                  }}
                >
                  View all
                </button>
              </div>

              {recentNotifs.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                  No recent notifications
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                        borderRadius: 6,
                        background: 'var(--bg-subtle)',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {n.content.substring(0, 60)}…
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          style={{
            background: 'transparent',
            border: 0,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
}
