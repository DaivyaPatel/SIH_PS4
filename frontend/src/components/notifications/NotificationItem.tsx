import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  AlertTriangle,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Bell,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../common/Button';
import type { NotificationRecord } from '../../types/domain';

interface NotificationItemProps {
  notification: NotificationRecord;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const navigate = useNavigate();

  const isEscalation = notification.notificationType === 'ESCALATION';
  const isCritical = notification.priority === 'CRITICAL';
  const isHigh = notification.priority === 'HIGH';

  const getTypeIcon = () => {
    switch (notification.notificationType) {
      case 'ESCALATION':
        return <AlertOctagon size={16} style={{ color: 'var(--status-bad-solid)' }} />;
      case 'DEFICIENCY_NOTICE':
        return <AlertTriangle size={16} style={{ color: 'var(--status-warn-solid)' }} />;
      case 'INSPECTION_APPOINTMENT':
        return <Calendar size={16} style={{ color: 'var(--status-info-solid)' }} />;
      case 'DEADLINE_REMINDER':
        return <Clock size={16} style={{ color: 'var(--accent)' }} />;
      default:
        return <Bell size={16} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  const getChannelIcon = () => {
    switch (notification.channel) {
      case 'EMAIL':
        return <Mail size={12} />;
      case 'SMS':
        return <MessageSquare size={12} />;
      case 'PORTAL_ALERT':
      default:
        return <Bell size={12} />;
    }
  };

  const getPriorityStyle = () => {
    if (isCritical) {
      return {
        bg: 'var(--status-bad-solid)',
        color: '#ffffff',
        border: 'transparent',
      };
    }
    if (isHigh) {
      return {
        bg: 'var(--status-warn-solid)',
        color: '#ffffff',
        border: 'transparent',
      };
    }
    return {
      bg: 'var(--bg-subtle)',
      color: 'var(--text-secondary)',
      border: 'var(--border)',
    };
  };

  const priorityStyle = getPriorityStyle();

  // Target tab based on notification type
  const handleNavigateToCase = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.caseId) return;

    let tabIndex = 0;
    if (notification.notificationType === 'DEFICIENCY_NOTICE') {
      tabIndex = 2; // Deficiencies Tab
    } else if (notification.notificationType === 'INSPECTION_APPOINTMENT') {
      tabIndex = 5; // EVC Tab
    } else if (notification.notificationType === 'DEADLINE_REMINDER' || isEscalation) {
      tabIndex = 3; // Timeline & Deadlines Tab
    }

    navigate(`/cases/${notification.caseId}?tab=${tabIndex}`);
  };

  const formattedDate = new Date(notification.createdAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      style={{
        padding: '14px 16px',
        background: isEscalation
          ? 'var(--status-bad-tint)'
          : notification.isRead
          ? 'var(--bg-surface)'
          : 'var(--bg-page)',
        border: `1px solid ${
          isEscalation
            ? 'var(--status-bad-border)'
            : notification.isRead
            ? 'var(--border)'
            : 'var(--accent-border)'
        }`,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        boxShadow: notification.isRead ? 'none' : 'var(--shadow-sm)',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
        {/* Left Icon Avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: isEscalation ? 'var(--status-bad-subtle)' : 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          {getTypeIcon()}
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header Badges Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 6,
            }}
          >
            {/* Priority Badge */}
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 4,
                background: priorityStyle.bg,
                color: priorityStyle.color,
                letterSpacing: '0.04em',
                lineHeight: 1.3,
              }}
            >
              {notification.priority}
            </span>

            {/* Notification Type Tag */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: isEscalation ? 'var(--status-bad-text)' : 'var(--text-secondary)',
              }}
            >
              {notification.notificationType.replace(/_/g, ' ')}
            </span>

            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>•</span>

            {/* Delivery Channel Chip */}
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {getChannelIcon()}
              <span>{notification.channel}</span>
            </span>

            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>•</span>

            {/* Recipient Role Tag */}
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '1px 5px',
                borderRadius: 3,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              To: {notification.recipientRole.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 14,
              fontWeight: notification.isRead ? 600 : 700,
              color: isEscalation ? 'var(--status-bad-text)' : 'var(--text-primary)',
              margin: '0 0 4px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {!notification.isRead && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: isEscalation ? 'var(--status-bad-solid)' : 'var(--accent)',
                  flexShrink: 0,
                }}
              />
            )}
            <span>{notification.title}</span>
          </div>

          {/* Body Content */}
          <p
            style={{
              margin: '0 0 10px',
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            {notification.content}
          </p>

          {/* Footer Metadata: Case Link, Institution, IST Timestamp */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              fontSize: 12,
              color: 'var(--text-muted)',
            }}
          >
            {notification.caseId && (
              <button
                type="button"
                onClick={handleNavigateToCase}
                style={{
                  background: 'var(--accent-subtle)',
                  border: '1px solid var(--accent-border)',
                  color: 'var(--accent)',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>{notification.applicationNumber || 'View Case File'}</span>
                <ExternalLink size={11} />
              </button>
            )}

            {notification.institutionName && (
              <span style={{ color: 'var(--text-secondary)' }}>
                {notification.institutionName}
              </span>
            )}

            <span className="tabular-nums" style={{ marginLeft: 'auto' }}>
              {formattedDate} IST
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls: Mark as Read */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        {!notification.isRead ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkAsRead(notification.id)}
            leftIcon={<Check size={13} />}
          >
            Mark read
          </Button>
        ) : (
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 6px',
            }}
          >
            <Check size={12} style={{ color: 'var(--status-ok-solid)' }} />
            Read
          </span>
        )}
      </div>
    </div>
  );
}
