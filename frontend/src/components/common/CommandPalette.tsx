import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  AlertTriangle,
  Users,
  Bell,
  Radio,
  Settings,
  Sun,
  Moon,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useRole } from '../../context/RoleContext';
import { useToast } from '../../context/ToastContext';
import { getCases, runEscalationCheck } from '../../lib/api';
import type { CaseSummary, Role } from '../../types/domain';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  category: 'Cases' | 'Navigation' | 'Role Switch' | 'Actions';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { setRole } = useRole();
  const { addToast } = useToast();

  // Load cases when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      getCases('ALL', 'ALL')
        .then(setCases)
        .catch(() => {});
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Static commands
  const staticCommands: CommandItem[] = useMemo(() => [
    {
      id: 'nav-home',
      category: 'Navigation',
      title: 'Go to Executive Dashboard',
      subtitle: 'Approval portfolio overview, pipeline funnel, and SLA clock health',
      icon: <LayoutDashboard size={15} style={{ color: 'var(--accent)' }} />,
      action: () => {
        navigate('/');
        onClose();
      },
    },
    {
      id: 'nav-cases',
      category: 'Navigation',
      title: 'Explore Cases Directory',
      subtitle: 'Comprehensive table and kanban board of regulatory cases',
      icon: <FolderKanban size={15} style={{ color: 'var(--accent)' }} />,
      action: () => {
        navigate('/cases');
        onClose();
      },
    },
    {
      id: 'nav-deficiencies',
      category: 'Navigation',
      title: 'Open Deficiencies Workspace',
      subtitle: 'Two-pane compliance rectification and proof clearance workspace',
      icon: <AlertTriangle size={15} style={{ color: 'var(--status-warn-solid)' }} />,
      action: () => {
        navigate('/deficiencies');
        onClose();
      },
    },
    {
      id: 'nav-visits',
      category: 'Navigation',
      title: 'Committee Scheduling & Expert Visits',
      subtitle: 'Academic roster, conflict matrices, and OR-Tools scheduling solver',
      icon: <Users size={15} style={{ color: 'var(--status-info-solid)' }} />,
      action: () => {
        navigate('/visits');
        onClose();
      },
    },
    {
      id: 'nav-notifs',
      category: 'Navigation',
      title: 'Notifications & Statutory Escalations',
      subtitle: 'Official notices, SLA breach warnings, and ledger history',
      icon: <Bell size={15} style={{ color: 'var(--status-bad-solid)' }} />,
      action: () => {
        navigate('/notifications');
        onClose();
      },
    },
    {
      id: 'nav-integration',
      category: 'Navigation',
      title: 'National Portal Integration Gateway',
      subtitle: 'Bi-directional ingestion gateway and idempotency receipts',
      icon: <Radio size={15} style={{ color: 'var(--status-ok-solid)' }} />,
      action: () => {
        navigate('/integration');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      category: 'Navigation',
      title: 'Workspace Preferences & Shortcuts',
      subtitle: 'Theme, density, role persona, notification channels, and APH norms',
      icon: <Settings size={15} style={{ color: 'var(--text-secondary)' }} />,
      action: () => {
        navigate('/settings');
        onClose();
      },
    },
    // Actions
    {
      id: 'act-theme',
      category: 'Actions',
      title: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme`,
      subtitle: 'Toggle workspace appearance',
      icon: theme === 'light' ? <Moon size={15} /> : <Sun size={15} />,
      action: () => {
        toggleTheme();
        onClose();
        addToast(`Switched to ${theme === 'light' ? 'dark' : 'light'} theme.`, 'info');
      },
    },
    {
      id: 'act-escalate',
      category: 'Actions',
      title: 'Run Statutory SLA Escalation Scan',
      subtitle: 'Trigger background evaluation of overdue scrutiny and cure deadlines',
      icon: <ShieldAlert size={15} style={{ color: 'var(--status-bad-solid)' }} />,
      action: () => {
        onClose();
        runEscalationCheck()
          .then(() => addToast('Statutory SLA escalation scan completed.', 'success'))
          .catch(() => addToast('Escalation scan failed.', 'error'));
      },
    },
    // Role Switchers
    {
      id: 'role-ro',
      category: 'Role Switch',
      title: 'Switch Role to Regional Officer (RO)',
      subtitle: 'Executive oversight, committee scheduling, emergency extensions',
      icon: <UserCheck size={15} style={{ color: 'var(--accent)' }} />,
      action: () => {
        setRole('REGIONAL_OFFICER' as Role);
        onClose();
        addToast('Switched persona to Regional Officer.', 'info');
      },
      badge: 'RO',
    },
    {
      id: 'role-so',
      category: 'Role Switch',
      title: 'Switch Role to Scrutiny Officer',
      subtitle: 'Mandatory documentary verification and deficiency flagging',
      icon: <UserCheck size={15} style={{ color: 'var(--accent)' }} />,
      action: () => {
        setRole('SCRUTINY_OFFICER' as Role);
        onClose();
        addToast('Switched persona to Scrutiny Officer.', 'info');
      },
      badge: 'SO',
    },
    {
      id: 'role-inst',
      category: 'Role Switch',
      title: 'Switch Role to Institution Representative',
      subtitle: 'Application progress tracking and compliance proof upload',
      icon: <UserCheck size={15} style={{ color: 'var(--accent)' }} />,
      action: () => {
        setRole('INSTITUTION_ADMIN' as Role);
        onClose();
        addToast('Switched persona to Institution Admin.', 'info');
      },
      badge: 'COLLEGE',
    },
    {
      id: 'role-evc',
      category: 'Role Switch',
      title: 'Switch Role to EVC Expert Committee Member',
      subtitle: 'Assigned inspection roster and availability declaration',
      icon: <UserCheck size={15} style={{ color: 'var(--accent)' }} />,
      action: () => {
        setRole('EVC_EXPERT' as Role);
        onClose();
        addToast('Switched persona to EVC Expert.', 'info');
      },
      badge: 'EVC',
    },
  ], [navigate, onClose, theme, toggleTheme, setRole, addToast]);

  // Dynamic Case commands
  const caseCommands: CommandItem[] = useMemo(() => {
    return cases.map(c => ({
      id: `case-${c.id}`,
      category: 'Cases' as const,
      title: `${c.applicationNumber} · ${c.institutionName}`,
      subtitle: `Stage: ${c.currentStage} • Region: ${c.region} • Readiness: ${c.readinessScore}%`,
      icon: <FolderKanban size={15} style={{ color: 'var(--accent)' }} />,
      action: () => {
        navigate(`/cases/${c.id}`);
        onClose();
      },
      badge: c.status,
    }));
  }, [cases, navigate, onClose]);

  // Combined and filtered items
  const allItems: CommandItem[] = useMemo(() => {
    return [...caseCommands, ...staticCommands];
  }, [caseCommands, staticCommands]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      // Suggest top navigation and recent cases
      return allItems.slice(0, 15);
    }
    const q = query.toLowerCase();
    return allItems.filter(item => {
      return (
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [allItems, query]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Command Palette"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 620,
          maxWidth: '92vw',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--bg-subtle)',
          }}
        >
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, application number, or institution name…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 14,
              color: 'var(--text-primary)',
            }}
          />
          <kbd
            style={{
              fontSize: 10,
              fontFamily: 'monospace',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '2px 6px',
              color: 'var(--text-muted)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results Stream */}
        <div
          ref={listRef}
          style={{
            maxHeight: 380,
            overflowY: 'auto',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {filteredItems.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Sparkles size={24} style={{ marginBottom: 6, opacity: 0.6 }} />
              <div style={{ fontSize: 13, fontWeight: 600 }}>No matching commands or cases</div>
              <div style={{ fontSize: 11, marginTop: 2 }}>Try searching for &quot;WRO&quot;, &quot;deficiencies&quot;, or &quot;visits&quot;</div>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 6,
                    background: isSelected ? 'var(--accent-subtle)' : 'transparent',
                    border: `1px solid ${isSelected ? 'var(--accent-border)' : 'transparent'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ flexShrink: 0 }}>{item.icon}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div
                          style={{
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginTop: 1,
                          }}
                        >
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 3,
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-secondary)',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isSelected && (
                      <ArrowRight size={13} style={{ color: 'var(--accent)' }} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Navigation Bar */}
        <div
          style={{
            padding: '8px 16px',
            background: 'var(--bg-subtle)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span><kbd style={{ fontFamily: 'monospace', fontWeight: 700 }}>↑↓</kbd> Navigate</span>
            <span><kbd style={{ fontFamily: 'monospace', fontWeight: 700 }}>↵</kbd> Select</span>
            <span><kbd style={{ fontFamily: 'monospace', fontWeight: 700 }}>ESC</kbd> Close</span>
          </div>

          <span style={{ fontSize: 10 }}>AICTE Universal Governance Palette</span>
        </div>
      </div>
    </div>
  );
}
