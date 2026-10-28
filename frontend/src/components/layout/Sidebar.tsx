import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  AlertTriangle,
  Users,
  Bell,
  Radio,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { getNotificationSummary } from '../../lib/api';
import { getStoredItem, setStoredItem } from '../../lib/storage';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    return getStoredItem('aicte_sidebar_collapsed') === 'true';
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    setStoredItem('aicte_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    getNotificationSummary()
      .then(res => setUnreadCount(res.unread))
      .catch(() => {});
  }, [location.pathname]);

  const navItems = [
    { to: '/', label: 'Home', icon: LayoutDashboard },
    { to: '/cases', label: 'Cases', icon: FolderKanban },
    { to: '/deficiencies', label: 'Deficiencies', icon: AlertTriangle },
    { to: '/visits', label: 'Expert visits', icon: Users },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/integration', label: 'Integration status', icon: Radio },
  ];

  return (
    <aside
      style={{
        width: collapsed ? 68 : 248,
        transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: collapsed ? '0 16px' : '0 20px',
          borderBottom: '1px solid var(--border)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
          }}
        >
          <ShieldCheck size={20} />
        </div>
        {!collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              AICTE Approval
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Workflow Coordination</span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive =
            item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '9px 12px' : '9px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-subtle)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                textDecoration: 'none',
                position: 'relative',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-subtle)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>}
              {!collapsed && Boolean(item.badge && item.badge > 0) && (
                <span
                  style={{
                    background: 'var(--status-bad-solid)',
                    color: '#ffffff',
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '1px 6px',
                    minWidth: 18,
                    textAlign: 'center',
                  }}
                >
                  {item.badge}
                </span>
              )}
              {collapsed && Boolean(item.badge && item.badge > 0) && (
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 8,
                    width: 8,
                    height: 8,
                    background: 'var(--status-bad-solid)',
                    borderRadius: 9999,
                  }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Utility Nav */}
      <div style={{ padding: '10px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <NavLink
          to="/settings"
          title={collapsed ? 'Settings' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '9px 12px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: location.pathname === '/settings' ? 600 : 500,
            color: location.pathname === '/settings' ? 'var(--accent)' : 'var(--text-secondary)',
            background: location.pathname === '/settings' ? 'var(--accent-subtle)' : 'transparent',
            borderLeft: location.pathname === '/settings' ? '3px solid var(--accent)' : '3px solid transparent',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            if (location.pathname !== '/settings') {
              e.currentTarget.style.background = 'var(--bg-subtle)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={e => {
            if (location.pathname !== '/settings') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <Settings size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '9px 12px',
            borderRadius: 8,
            fontSize: 13,
            color: 'var(--text-muted)',
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            width: '100%',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
