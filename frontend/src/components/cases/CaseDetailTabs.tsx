import { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  AlertTriangle,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Search,
  ExternalLink,
  PlusCircle,
  ArrowUpDown,
  Users,
  Network,
} from 'lucide-react';
import type {
  CaseDetail,
  DocumentDetail,
  DeficiencyDetail,
  AuditEventRecord,
  TimelineEvent,
  TimelineMilestone,
} from '../../types/domain';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { DeficiencyCard } from '../deficiencies/DeficiencyCard';
import { CaseExpertVisitCard } from '../visits/CaseExpertVisitCard';
import { RelationshipGraphCanvas } from '../graph/RelationshipGraphCanvas';
import { buildGraphDataFromCase } from '../../lib/graphData';
import { getCaseTimeline, getCaseAudit } from '../../lib/api';
import { useRole } from '../../context/RoleContext';

interface CaseDetailTabsProps {
  activeTab: number;
  onTabChange: (index: number) => void;
  caseData: CaseDetail;
  onSelectDocument: (doc: DocumentDetail) => void;
  onOpenFlagDeficiency: () => void;
  onOpenRespondDeficiency: (def: DeficiencyDetail) => void;
  onOpenResolveDeficiency: (def: DeficiencyDetail) => void;
  onRefresh?: () => void;
}

export function CaseDetailTabs({
  activeTab,
  onTabChange,
  caseData,
  onSelectDocument,
  onOpenFlagDeficiency,
  onRefresh,
}: CaseDetailTabsProps) {
  const { permissions } = useRole();

  // Timeline state
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [timelineMilestones, setTimelineMilestones] = useState<TimelineMilestone[]>([]);
  const [timelineSort, setTimelineSort] = useState<'desc' | 'asc'>('desc');
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Audit state
  const [auditEvents, setAuditEvents] = useState<AuditEventRecord[]>([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 3) {
      setTimelineLoading(true);
      getCaseTimeline(caseData.id, timelineSort)
        .then(res => {
          setTimelineEvents(res.events || []);
          setTimelineMilestones(res.milestones || []);
          setTimelineLoading(false);
        })
        .catch(() => setTimelineLoading(false));
    } else if (activeTab === 4) {
      setAuditLoading(true);
      getCaseAudit(caseData.id)
        .then(res => {
          setAuditEvents(res || []);
          setAuditLoading(false);
        })
        .catch(() => setAuditLoading(false));
    }
  }, [activeTab, caseData.id, timelineSort]);

  const tabs = [
    { label: 'Overview', icon: Building2 },
    { label: `Deficiencies (${caseData.deficiencies.length})`, icon: AlertTriangle },
    { label: `Documents (${caseData.documents.length})`, icon: FileText },
    { label: 'Timeline', icon: Clock },
    { label: 'Audit Trail', icon: ShieldCheck },
    { label: 'Expert Committee', icon: Users },
    { label: 'Dependencies', icon: Network },
  ];

  const graphData = useMemo(() => buildGraphDataFromCase(caseData), [caseData]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tab Navigation Strip */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          borderRadius: '8px 8px 0 0',
          padding: '0 12px',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === idx;

          return (
            <button
              key={tab.label}
              onClick={() => onTabChange(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '12px 16px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                borderBottom: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 0: Overview */}
      {activeTab === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Institutional Bio Card */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 20,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Institutional Profile
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
                fontSize: 13,
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block', marginBottom: 2 }}>
                  Institution Code
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {caseData.institution.code}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block', marginBottom: 2 }}>
                  Established Year
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {caseData.institution.establishedYear}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block', marginBottom: 2 }}>
                  Contact Email
                </span>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
                  {caseData.institution.contactEmail}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block', marginBottom: 2 }}>
                  Registered Address
                </span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {caseData.institution.address}
                </span>
              </div>
            </div>
          </div>

          {/* Campuses & Infrastructure Card */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 20,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Campuses & Land Ownership ({caseData.institution.campuses.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {caseData.institution.campuses.map(campus => (
                <div
                  key={campus.id}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                      {campus.campusName}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'var(--accent-subtle)',
                        color: 'var(--accent)',
                      }}
                    >
                      {campus.landLeaseStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {campus.address}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 20,
                      marginTop: 4,
                      fontSize: 12,
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div>
                      Land Area: <strong>{campus.landAreaAcres} Acres</strong>
                    </div>
                    <div>
                      Built-up Area: <strong>{campus.builtUpAreaSqM} Sq. M.</strong>
                    </div>
                    {campus.leaseExpiryDate && (
                      <div style={{ color: 'var(--text-muted)' }}>
                        Lease Expiry: <strong>{campus.leaseExpiryDate}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Deficiencies */}
      {activeTab === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Header Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Tracking institutional non-compliance and statutory cure timelines.
            </div>

            {permissions.canFlagDeficiencies && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle size={14} />}
                onClick={onOpenFlagDeficiency}
              >
                Flag Deficiency
              </Button>
            )}
          </div>

          {caseData.deficiencies.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 size={24} style={{ color: 'var(--status-ok)' }} />}
              title="No deficiencies flagged"
              description="This application currently satisfies all statutory scrutiny criteria with zero open defects."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {caseData.deficiencies.map((def, idx) => (
                <DeficiencyCard
                  key={def.id}
                  deficiency={def}
                  caseId={caseData.id}
                  applicationNumber={caseData.applicationNumber}
                  onRefresh={onRefresh || (() => {})}
                  onPreviewProof={(docName, docUrl) => {
                    onSelectDocument({
                      id: `proof-${Date.now()}`,
                      documentType: 'COMPLIANCE_PROOF_RECORD',
                      documentName: docName,
                      fileHash: docUrl ? `sha256-${btoa(docName).slice(0, 32)}` : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                      verificationStatus: 'VERIFIED',
                      validUntil: '2028-06-30',
                      uploadedAt: new Date().toISOString(),
                    });
                  }}
                  defaultExpanded={idx === 0 || def.status !== 'RESOLVED'}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Documents */}
      {activeTab === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Mandatory certificates submitted by the institution under AICTE APH Chapter 1.
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              overflowX: 'auto',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
              <thead>
                <tr
                  style={{
                    background: 'var(--bg-subtle)',
                    borderBottom: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  <th style={{ padding: '10px 14px' }}>Document Name</th>
                  <th style={{ padding: '10px 14px' }}>Category</th>
                  <th style={{ padding: '10px 14px' }}>Verification Status</th>
                  <th style={{ padding: '10px 14px' }}>Valid Until</th>
                  <th style={{ padding: '10px 14px' }}>Uploaded At</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Preview</th>
                </tr>
              </thead>
              <tbody>
                {caseData.documents.map(doc => {
                  const isVerified = doc.verificationStatus === 'VERIFIED';

                  return (
                    <tr
                      key={doc.id}
                      onClick={() => onSelectDocument(doc)}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {doc.documentName}
                      </td>

                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                        {doc.documentType.replace(/_/g, ' ')}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: isVerified ? 'var(--status-ok-tint)' : 'var(--status-warn-tint)',
                            color: isVerified ? 'var(--status-ok-text)' : 'var(--status-warn-text)',
                            border: `1px solid ${isVerified ? 'var(--status-ok-border)' : 'var(--status-warn-border)'}`,
                          }}
                        >
                          {doc.verificationStatus}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                        {doc.validUntil || 'Perpetual'}
                      </td>

                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <ExternalLink size={14} style={{ color: 'var(--accent)' }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Timeline */}
      {activeTab === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Milestone Bar */}
          {timelineMilestones.length > 0 && (
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '14px 18px',
                display: 'grid',
                gridTemplateColumns: `repeat(${timelineMilestones.length}, 1fr)`,
                gap: 10,
              }}
            >
              {timelineMilestones.map((m, mIdx) => {
                const isDone = m.status === 'COMPLETED';

                return (
                  <div key={m.id || m.milestoneKey || mIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: isDone ? 'var(--status-ok)' : 'var(--bg-subtle)',
                        color: isDone ? '#fff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {isDone ? '✓' : '•'}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {m.name || m.milestoneTitle}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.status}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Controls: Sort Order */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setTimelineSort(prev => (prev === 'desc' ? 'asc' : 'desc'))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '5px 10px',
                fontSize: 12,
                cursor: 'pointer',
                color: 'var(--text-secondary)',
              }}
            >
              <ArrowUpDown size={13} />
              <span>{timelineSort === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>

          {/* Feed */}
          {timelineLoading ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading chronological events…
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {timelineEvents.map((evt, eIdx) => (
                <div
                  key={evt.eventId || evt.id || eIdx}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                        {evt.title}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 3,
                          background: 'var(--accent-subtle)',
                          color: 'var(--accent)',
                        }}
                      >
                        {evt.category}
                      </span>
                    </div>
                    <span className="tabular-nums" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {evt.formattedIstTime || evt.formattedTimestamp || evt.timeAgo}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {evt.summary || evt.description}
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Actor: <strong>{evt.actorName || evt.actorId}</strong> ({evt.actorRole})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Audit */}
      {activeTab === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Audit Search */}
          <div style={{ position: 'relative', maxWidth: 360 }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Filter audit records by actor or action…"
              value={auditSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuditSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 32px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-page)',
                color: 'var(--text-primary)',
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>

          {/* Audit Table */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              overflowX: 'auto',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
              <thead>
                <tr
                  style={{
                    background: 'var(--bg-subtle)',
                    borderBottom: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  <th style={{ padding: '10px 14px' }}>Timestamp (IST)</th>
                  <th style={{ padding: '10px 14px' }}>Actor</th>
                  <th style={{ padding: '10px 14px' }}>Role</th>
                  <th style={{ padding: '10px 14px' }}>Action</th>
                  <th style={{ padding: '10px 14px' }}>State Change</th>
                  <th style={{ padding: '10px 14px' }}>Rationale</th>
                </tr>
              </thead>
              <tbody>
                {auditLoading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
                      Loading cryptographic audit trail…
                    </td>
                  </tr>
                ) : (
                  auditEvents
                    .filter(a => {
                      const actorStr = a.actor || a.actorId || '';
                      const actionStr = a.action || '';
                      const ratStr = a.rationale || a.details || '';
                      return auditSearch
                        ? actorStr.toLowerCase().includes(auditSearch.toLowerCase()) ||
                          actionStr.toLowerCase().includes(auditSearch.toLowerCase()) ||
                          ratStr.toLowerCase().includes(auditSearch.toLowerCase())
                        : true;
                    })
                    .map((aud, aIdx) => {
                      const actor = aud.actor || aud.actorId || 'Officer';
                      const roleName = aud.role || aud.actorRole || 'SYSTEM';
                      const timeStr = aud.timestamp || aud.createdAt || new Date().toISOString();
                      const prevStatus = aud.previousStatus || aud.previousState || '—';
                      const newStatus = aud.newStatus || aud.newState || '—';
                      const rationale = aud.rationale || aud.details || '—';

                      return (
                        <tr key={aud.id || aIdx} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="tabular-nums" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                            {new Date(timeStr).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                          </td>
                          <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {actor}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: 'var(--bg-subtle)',
                                border: '1px solid var(--border)',
                              }}
                            >
                              {roleName}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--accent)' }}>
                            {aud.action}
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                            {prevStatus} → <strong>{newStatus}</strong>
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                            {rationale}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Expert Committee */}
      {activeTab === 5 && (
        <CaseExpertVisitCard caseData={caseData} />
      )}

      {/* Tab 6: Dependencies (Topology Graph) */}
      {activeTab === 6 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px', color: 'var(--text-primary)' }}>
              What this case depends on
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              Statutory prerequisite chains, document dependencies, and compliance topology.
            </p>
          </div>
          <RelationshipGraphCanvas
            data={graphData}
            height={540}
            title={`Topological Relationship Graph — ${caseData.applicationNumber}`}
            subtitle={`Tracing statutory compliance neighbourhood for ${caseData.institution.name}`}
            onRefresh={onRefresh}
          />
        </div>
      )}
    </div>
  );
}
