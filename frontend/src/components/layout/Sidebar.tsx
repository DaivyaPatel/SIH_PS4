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
import { getStoredItem, setStoredItem } from '../../lib/storage';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    return getStoredItem('aicte_sidebar_collapsed') === 'true';
  });
  const location = useLocation();

  useEffect(() => {
    setStoredItem('aicte_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  const navItems = [
    { to: '/', label: 'Home', icon: LayoutDashboard },
    { to: '/cases', label: 'Cases', icon: FolderKanban },
    { to: '/deficiencies', label: 'Deficiencies', icon: AlertTriangle },
    { to: '/visits', label: 'Expert visits', icon: Users },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/integration', label: 'Integration status', icon: Radio },
  ];

  return (
    <aside
      style={{
        width: collapsed ? 56 : 220,
        transition: 'width 120ms ease',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: collapsed ? '0 14px' : '0 16px',
          borderBottom: '1px solid var(--border)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent)',
            color: 'var(--text-inverse)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={16} />
        </div>
        {!collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              AICTE Approval
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Workflow Coordination</span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '12px 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                gap: 10,
                padding: collapsed ? '8px 14px' : '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-subtle)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                textDecoration: 'none',
                position: 'relative',
              }}
            >
              <Icon size={16} style={{ flexShrink: 0, color: isActive ? 'var(--accent)' : 'var(--text-muted)' }} />
              {!collapsed && <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Utility Nav */}
      <div style={{ padding: '6px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavLink
          to="/settings"
          title={collapsed ? 'Settings' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed ? '8px 14px' : '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            fontWeight: location.pathname === '/settings' ? 600 : 400,
            color: location.pathname === '/settings' ? 'var(--text-primary)' : 'var(--text-secondary)',
            background: location.pathname === '/settings' ? 'var(--bg-subtle)' : 'transparent',
            borderLeft: location.pathname === '/settings' ? '2px solid var(--accent)' : '2px solid transparent',
            textDecoration: 'none',
          }}
        >
          <Settings size={16} style={{ flexShrink: 0, color: location.pathname === '/settings' ? 'var(--accent)' : 'var(--text-muted)' }} />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed ? '8px 14px' : '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            color: 'var(--text-muted)',
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
