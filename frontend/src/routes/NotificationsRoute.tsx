import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { getNotifications, markNotificationAsRead } from '../lib/api';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import type { NotificationRecord } from '../types/domain';

export function NotificationsRoute() {
  const [notifs, setNotifs] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = () => {
    setLoading(true);
    getNotifications()
      .then(data => {
        setNotifs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifs(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // Ignore
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
          Notifications & Escalations
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
          Official statutory notices, committee assignments, and regulatory alerts
        </p>
      </div>

      {loading ? (
        <Skeleton height={200} />
      ) : notifs.length === 0 ? (
        <div style={{ padding: 32, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, textAlign: 'center' }}>
          <Bell size={32} color="var(--text-muted)" style={{ marginBottom: 8 }} />
          <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>No Notifications</h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            Your notification ledger is completely clear.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifs.map(n => {
            const isEscalation = n.notificationType === 'ESCALATION';
            return (
              <div
                key={n.id}
                style={{
                  padding: 16,
                  background: isEscalation ? 'var(--status-bad-tint)' : 'var(--bg-surface)',
                  border: `1px solid ${isEscalation ? 'var(--status-bad-border)' : 'var(--border)'}`,
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: isEscalation ? 'var(--status-bad-solid)' : 'var(--accent)',
                        color: 'white',
                      }}
                    >
                      {n.notificationType}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      To: {n.recipientRole} ({n.recipientContact})
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: isEscalation ? 'var(--status-bad-text)' : 'var(--text-primary)' }}>
                    {n.title}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                    {n.content}
                  </p>
                </div>

                {!n.isRead && (
                  <Button variant="ghost" size="sm" onClick={() => handleRead(n.id)}>
                    Mark read
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
