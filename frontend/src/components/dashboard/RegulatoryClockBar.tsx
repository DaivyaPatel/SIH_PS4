import { useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert } from 'lucide-react';
import type { DashboardSummary } from '../../types/domain';

interface RegulatoryClockBarProps {
  summary: DashboardSummary;
}

export function RegulatoryClockBar({ summary }: RegulatoryClockBarProps) {
  const navigate = useNavigate();
  const clocks = summary.clocks;

  const onTrack = clocks.onTrack || 0;
  const approaching = clocks.approachingDeadline || 0;
  const overdue = clocks.overdueBreached || 0;
  const total = onTrack + approaching + overdue || 1;

  const onTrackPct = Math.round((onTrack / total) * 100);
  const approachingPct = Math.round((approaching / total) * 100);
  const overduePct = Math.round((overdue / total) * 100);

  const segments = [
    {
      label: 'On Track',
      count: onTrack,
      percent: onTrackPct,
      color: 'var(--status-ok)',
      bg: 'var(--status-ok-tint)',
      border: 'var(--status-ok-border)',
      filter: 'ON_TRACK',
      context: '> 48h to statutory cutoff',
    },
    {
      label: 'Approaching Deadline',
      count: approaching,
      percent: approachingPct,
      color: 'var(--status-warn)',
      bg: 'var(--status-warn-tint)',
      border: 'var(--status-warn-border)',
      filter: 'APPROACHING_DEADLINE',
      context: '<= 48h remaining',
    },
    {
      label: 'Overdue / Breached',
      count: overdue,
      percent: overduePct,
      color: 'var(--status-bad)',
      bg: 'var(--status-bad-tint)',
      border: 'var(--status-bad-border)',
      filter: 'OVERDUE',
      context: 'Statutory SLA exceeded',
    },
  ];

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '18px 20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        flex: 1,
      }}
    >
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Regulatory Clock Health
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
            Statutory APH 2026-27 turnaround compliance & SLA adherence
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={15} style={{ color: 'var(--text-muted)' }} />
          <span className="tabular-nums" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
            {total} Cases Monitored
          </span>
        </div>
      </div>

      {/* Stacked Single Horizontal Bar */}
      <div
        style={{
          height: 18,
          width: '100%',
          display: 'flex',
          borderRadius: 6,
          overflow: 'hidden',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
        }}
      >
        {onTrack > 0 && (
          <div
            onClick={() => navigate('/cases?deadline=ON_TRACK')}
            title={`On Track: ${onTrack} (${onTrackPct}%)`}
            style={{
              width: `${onTrackPct}%`,
              background: 'var(--status-ok)',
              cursor: 'pointer',
              transition: 'width 0.4s ease',
            }}
          />
        )}
        {approaching > 0 && (
          <div
            onClick={() => navigate('/cases?deadline=APPROACHING_DEADLINE')}
            title={`Approaching Deadline: ${approaching} (${approachingPct}%)`}
            style={{
              width: `${approachingPct}%`,
              background: 'var(--status-warn)',
              cursor: 'pointer',
              transition: 'width 0.4s ease',
            }}
          />
        )}
        {overdue > 0 && (
          <div
            onClick={() => navigate('/cases?deadline=OVERDUE')}
            title={`Overdue: ${overdue} (${overduePct}%)`}
            style={{
              width: `${overduePct}%`,
              background: 'var(--status-bad)',
              cursor: 'pointer',
              transition: 'width 0.4s ease',
            }}
          />
        )}
      </div>

      {/* Legend & Breakdown Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {segments.map(seg => (
          <div
            key={seg.label}
            onClick={() => navigate(`/cases?deadline=${seg.filter}`)}
            style={{
              background: 'var(--bg-page)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '10px 12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              transition: 'border-color 0.15s ease, background 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = seg.color;
              e.currentTarget.style.background = 'var(--bg-subtle)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--bg-page)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: seg.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {seg.label}
              </span>
            </div>

            <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 700, color: seg.color }}>
              {seg.count} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>({seg.percent}%)</span>
            </div>

            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{seg.context}</div>
          </div>
        ))}
      </div>

      {/* Statutory Escalation Banner if any dispatched */}
      {clocks.totalEscalationsDispatched > 0 && (
        <div
          onClick={() => navigate('/notifications')}
          style={{
            background: 'var(--status-bad-tint)',
            border: '1px solid var(--status-bad-border)',
            borderRadius: 6,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={15} style={{ color: 'var(--status-bad-text)' }} />
            <span style={{ fontSize: 12, color: 'var(--status-bad-text)', fontWeight: 600 }}>
              {clocks.totalEscalationsDispatched} Statutory Escalations Dispatched to Officers
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
            Inspect Inbox →
          </span>
        </div>
      )}
    </div>
  );
}
