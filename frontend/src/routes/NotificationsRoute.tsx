import { useEffect, useState, useMemo } from 'react';
import {
  Bell,
  RefreshCw,
  ShieldAlert,
  CheckCheck,
} from 'lucide-react';
import {
  getNotifications,
  getNotificationSummary,
  markNotificationAsRead,
  runEscalationCheck,
} from '../lib/api';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { NotificationItem } from '../components/notifications/NotificationItem';
import { NotificationEscalationBanner } from '../components/notifications/NotificationEscalationBanner';
import { NotificationFilterBar } from '../components/notifications/NotificationFilterBar';
import type { NotificationRecord, NotificationSummary } from '../types/domain';

export function NotificationsRoute() {
  const [notifs, setNotifs] = useState<NotificationRecord[]>([]);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const { addToast } = useToast();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedReadState, setSelectedReadState] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');

  const loadData = () => {
    setLoading(true);
    Promise.all([getNotifications(), getNotificationSummary()])
      .then(([notifData, summaryData]) => {
        setNotifs(notifData);
        setSummary(summaryData);
        setLoading(false);
      })
      .catch((err: Error) => {
        addToast(err.message || 'Failed to load notifications.', 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifs(prev => prev.map(n => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)));
      setSummary(prev => (prev ? { ...prev, unread: Math.max(0, prev.unread - 1) } : null));
      addToast('Notification marked as read.', 'info');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to update notification', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifs.filter(n => !n.isRead);
    if (unread.length === 0) return;

    try {
      await Promise.all(unread.map(n => markNotificationAsRead(n.id)));
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setSummary(prev => (prev ? { ...prev, unread: 0 } : null));
      addToast(`Marked ${unread.length} notifications as read.`, 'success');
    } catch {
      addToast('Some notifications could not be marked as read.', 'error');
    }
  };

  const handleRunEscalationScan = async () => {
    setScanning(true);
    try {
      await runEscalationCheck();
      addToast('Statutory SLA escalation scan completed successfully.', 'success');
      loadData();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Escalation scan failed.', 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedPriority('ALL');
    setSelectedReadState('ALL');
    setSelectedRole('ALL');
  };

  // Critical Escalations (pinned at the top)
  const criticalEscalations = useMemo(() => {
    return notifs.filter(
      n => (n.notificationType === 'ESCALATION' || n.priority === 'CRITICAL') && !n.isRead
    );
  }, [notifs]);

  // Filtered Notifications list
  const filteredNotifications = useMemo(() => {
    return notifs.filter(n => {
      // Type filter
      if (selectedType !== 'ALL' && n.notificationType !== selectedType) return false;
      // Priority filter
      if (selectedPriority !== 'ALL' && n.priority !== selectedPriority) return false;
      // Read state filter
      if (selectedReadState === 'UNREAD' && n.isRead) return false;
      if (selectedReadState === 'READ' && !n.isRead) return false;
      // Role filter
      if (selectedRole !== 'ALL' && n.recipientRole !== selectedRole) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = n.title.toLowerCase().includes(q);
        const contentMatch = n.content.toLowerCase().includes(q);
        const appMatch = (n.applicationNumber || '').toLowerCase().includes(q);
        const instMatch = (n.institutionName || '').toLowerCase().includes(q);
        if (!titleMatch && !contentMatch && !appMatch && !instMatch) return false;
      }
      return true;
    });
  }, [notifs, selectedType, selectedPriority, selectedReadState, selectedRole, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
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
            Notifications & Escalations
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            Statutory regulatory alerts, committee assignments, and SLA breach warnings
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw size={13} />}
          >
            Refresh
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={!summary || summary.unread === 0}
            leftIcon={<CheckCheck size={14} />}
          >
            Mark all read
          </Button>

          <Button
            variant="primary"
            size="sm"
            isLoading={scanning}
            onClick={handleRunEscalationScan}
            leftIcon={<ShieldAlert size={14} />}
          >
            Scan Escalations
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards Strip */}
      {summary && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Ledger
            </div>
            <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
              {summary.total}
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: `1px solid ${summary.unread > 0 ? 'var(--accent-border)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Unread Notices
            </div>
            <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 700, color: summary.unread > 0 ? 'var(--accent)' : 'var(--text-primary)', marginTop: 4 }}>
              {summary.unread}
            </div>
          </div>

          <div
            style={{
              background: summary.escalations > 0 ? 'var(--status-bad-tint)' : 'var(--bg-surface)',
              border: `1px solid ${summary.escalations > 0 ? 'var(--status-bad-border)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: summary.escalations > 0 ? 'var(--status-bad-text)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
              SLA Escalations
            </div>
            <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 700, color: summary.escalations > 0 ? 'var(--status-bad-text)' : 'var(--text-primary)', marginTop: 4 }}>
              {summary.escalations}
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Deficiency Flags
            </div>
            <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
              {summary.deficiencyNotices}
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Inspection Visits
            </div>
            <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
              {summary.inspectionAppointments}
            </div>
          </div>
        </div>
      )}

      {/* Pinned Statutory Escalation Banner */}
      {criticalEscalations.length > 0 && (
        <NotificationEscalationBanner
          escalations={criticalEscalations}
          onMarkAsRead={handleMarkAsRead}
        />
      )}

      {/* Filter Bar */}
      <NotificationFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedReadState={selectedReadState}
        onReadStateChange={setSelectedReadState}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        onReset={handleResetFilters}
        totalFiltered={filteredNotifications.length}
      />

      {/* Content Stream */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Skeleton height={80} />
          <Skeleton height={80} />
          <Skeleton height={80} />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={32} style={{ color: 'var(--text-muted)' }} />}
          title="No Notifications Match"
          description={
            notifs.length === 0
              ? 'Your statutory notification ledger is completely clear.'
              : 'Try clearing or adjusting the selected filter parameters above.'
          }
          actionLabel={notifs.length > 0 ? 'Reset Filter Parameters' : undefined}
          onAction={notifs.length > 0 ? handleResetFilters : undefined}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
