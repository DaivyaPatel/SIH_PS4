import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getCaseById, getCaseReadiness } from '../lib/api';
import { StatusChip } from '../components/common/StatusChip';
import { DeadlineChip } from '../components/common/DeadlineChip';
import { ReadinessRing } from '../components/common/ReadinessRing';
import { Skeleton } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import type { CaseDetail, CaseReadinessResponse } from '../types/domain';

export function CaseDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [readiness, setReadiness] = useState<CaseReadinessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    Promise.all([getCaseById(id), getCaseReadiness(id)])
      .then(([cd, rd]) => {
        setCaseData(cd);
        setReadiness(rd);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Unable to load case details.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Skeleton height={32} width="40%" />
        <Skeleton height={120} />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div style={{ padding: 20, background: 'var(--status-bad-tint)', color: 'var(--status-bad-text)', borderRadius: 8 }}>
        <strong>Error:</strong> {error || 'Case not found'}
        <div style={{ marginTop: 12 }}>
          <Button variant="secondary" size="sm" onClick={() => navigate('/cases')}>
            Back to Cases
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={14} />}
          onClick={() => navigate('/cases')}
          style={{ paddingLeft: 0 }}
        >
          Back to Cases
        </Button>
      </div>

      {/* Header Block */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 24,
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
              {caseData.applicationNumber}
            </span>
            <StatusChip status={caseData.status} />
            <DeadlineChip
              isOverdue={caseData.isOverdue}
              remainingHours={caseData.remainingHours}
              remainingBusinessDays={caseData.remainingBusinessDays}
              deadlineStatus={caseData.deadlineStatus}
              deadlineAtIst={caseData.deadlineAtIst}
            />
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            {caseData.institution.name}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            Region: <strong>{caseData.institution.region}</strong> · Type: {caseData.applicationType} · AY: {caseData.academicYear}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ReadinessRing score={caseData.readinessScore} size="lg" />
        </div>
      </div>

      {/* Layout Grid: Details & Readiness Rail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        {/* Main Details Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>Campus Information</h3>
            {caseData.institution.campuses.map(camp => (
              <div key={camp.id} style={{ fontSize: 13, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Campus Name:</span>
                  <div>{camp.campusName}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Address:</span>
                  <div>{camp.address}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Land Area:</span>
                  <div>{camp.landAreaAcres} Acres</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Built-up Area:</span>
                  <div>{camp.builtUpAreaSqM} sq.m</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Land Lease Status:</span>
                  <div>{camp.landLeaseStatus}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>
              Flagged Deficiencies ({caseData.deficiencies.length})
            </h3>
            {caseData.deficiencies.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--status-ok-text)' }}>
                ✓ Zero deficiencies flagged on this application case. Clean regulatory standing.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {caseData.deficiencies.map(def => (
                  <div
                    key={def.id}
                    style={{
                      padding: 12,
                      background: 'var(--bg-subtle)',
                      borderRadius: 6,
                      fontSize: 13,
                      borderLeft: `3px solid ${def.status === 'RESOLVED' ? 'var(--status-ok-solid)' : 'var(--status-bad-solid)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong>{def.category}</strong>
                      <span style={{ fontSize: 11, fontWeight: 600 }}>{def.status}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>{def.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Rail: Readiness Evaluation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {readiness && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Readiness Breakdown</h4>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{readiness.readinessTier}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {readiness.criteria.map(crit => (
                  <div key={crit.criteriaKey}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{crit.criteriaKey.replace(/_/g, ' ')}</span>
                      <span className="tabular-nums" style={{ fontWeight: 600 }}>
                        {crit.earnedPoints} / {crit.maxPoints} pts
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${crit.scorePercentage}%`,
                          background: crit.status === 'PASSED' ? 'var(--status-ok-solid)' : 'var(--status-warn-solid)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {readiness.blockingPrerequisites.length > 0 && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <h5 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: 'var(--status-bad-text)' }}>
                    Blocking Prerequisites ({readiness.blockingPrerequisites.length})
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {readiness.blockingPrerequisites.map(block => (
                      <div
                        key={block.code}
                        style={{
                          fontSize: 11,
                          padding: 8,
                          background: 'var(--status-bad-tint)',
                          color: 'var(--status-bad-text)',
                          borderRadius: 6,
                        }}
                      >
                        <div>{block.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
