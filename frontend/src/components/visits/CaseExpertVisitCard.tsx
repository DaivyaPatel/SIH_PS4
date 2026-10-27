import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Crown,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '../common/Button';
import type { CaseDetail } from '../../types/domain';

interface CaseExpertVisitCardProps {
  caseData: CaseDetail;
}

export function CaseExpertVisitCard({ caseData }: CaseExpertVisitCardProps) {
  const navigate = useNavigate();

  const isScheduled = caseData.status === 'EVC_SCHEDULED' || caseData.status === 'EVC_COMPLETED';
  const isPending = caseData.status === 'EVC_PENDING';
  const isEarlierStage = !isScheduled && !isPending && caseData.status !== 'APPROVED';

  // Seeded / mock committee data for demonstration when scheduled
  const demoCommittee = [
    {
      role: 'CHAIRMAN',
      name: 'Prof. K. R. Ramanathan',
      designation: 'Professor & Head, Computer Science',
      institution: 'Indian Institute of Technology Madras',
      domain: 'COMPUTER_SCIENCE',
      region: 'SRO',
    },
    {
      role: 'MEMBER',
      name: 'Prof. Sunita Deshmukh',
      designation: 'Professor, Mechanical Engineering',
      institution: 'COEP Technological University Pune',
      domain: 'MECHANICAL_ENGINEERING',
      region: 'WRO',
    },
    {
      role: 'MEMBER',
      name: 'Dr. Meenakshi Sundaram',
      designation: 'Dean, Faculty of Pharmaceutical Sciences',
      institution: 'JSS College of Pharmacy',
      domain: 'PHARMACY',
      region: 'SRO',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header status bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Expert Visit Committee (EVC) Inspection
            </h3>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
                background: isScheduled
                  ? 'var(--status-ok-tint)'
                  : isPending
                  ? 'var(--status-warn-tint)'
                  : 'var(--bg-subtle)',
                color: isScheduled
                  ? 'var(--status-ok-text)'
                  : isPending
                  ? 'var(--status-warn-text)'
                  : 'var(--text-muted)',
                border: `1px solid ${
                  isScheduled
                    ? 'var(--status-ok-border)'
                    : isPending
                    ? 'var(--status-warn-border)'
                    : 'var(--border)'
                }`,
              }}
            >
              {caseData.status}
            </span>
          </div>

          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
            Physical campus inspection conducted under AICTE Approval Process Handbook (APH) Chapter III
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          rightIcon={<ArrowRight size={13} />}
          onClick={() => navigate(`/visits?tab=scheduling&caseId=${caseData.id}`)}
        >
          Open Committee Scheduler
        </Button>
      </div>

      {/* SCHEDULED STATE */}
      {isScheduled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Inspection Date Banner */}
          <div
            style={{
              background: 'var(--status-ok-tint)',
              border: '1px solid var(--status-ok-border)',
              borderRadius: 8,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Calendar size={18} style={{ color: 'var(--status-ok-text)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--status-ok-text)' }}>
                  Confirmed On-Site Inspection Date: 12 November 2026
                </div>
                <div style={{ fontSize: 11, color: 'var(--status-ok-text)', marginTop: 2 }}>
                  Official notification dispatched to institution and committee members with biometric visit verification tokens.
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: 'var(--bg-surface)',
                color: 'var(--status-ok-text)',
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid var(--status-ok-border)',
              }}
            >
              IST 09:30 AM
            </span>
          </div>

          {/* Committee Roster Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              Assigned Inspection Committee (3 Academic Experts)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              {demoCommittee.map((expert, idx) => {
                const isChairman = expert.role === 'CHAIRMAN';

                return (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-surface)',
                      border: `1.5px solid ${isChairman ? 'var(--accent-border)' : 'var(--border)'}`,
                      borderRadius: 8,
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                        {expert.name}
                      </div>

                      {isChairman ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            fontSize: 10,
                            fontWeight: 700,
                            background: '#fef3c7',
                            color: '#92400e',
                            padding: '2px 6px',
                            borderRadius: 4,
                          }}
                        >
                          <Crown size={11} />
                          CHAIRMAN
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            background: 'var(--bg-subtle)',
                            color: 'var(--text-secondary)',
                            padding: '2px 6px',
                            borderRadius: 4,
                          }}
                        >
                          MEMBER
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {expert.designation}
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {expert.institution}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid var(--border)',
                        paddingTop: 8,
                        marginTop: 4,
                        fontSize: 11,
                      }}
                    >
                      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                        {expert.domain.replace(/_/g, ' ')}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {expert.region} Region
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PENDING EVC STATE */}
      {isPending && (
        <div
          style={{
            background: 'var(--status-warn-tint)',
            border: '1px solid var(--status-warn-border)',
            borderRadius: 8,
            padding: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={20} style={{ color: 'var(--status-warn-text)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--status-warn-text)' }}>
                Application Ready for Committee Assignment
              </div>
              <div style={{ fontSize: 12, color: 'var(--status-warn-text)', marginTop: 2 }}>
                All document scrutinies and deficiency remediations are complete (Readiness Score: {caseData.readinessScore}%). Use the Constraint Solver to match a committee without institutional conflicts.
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Sparkles size={14} />}
            onClick={() => navigate(`/visits?tab=scheduling&caseId=${caseData.id}`)}
          >
            Schedule Committee Now
          </Button>
        </div>
      )}

      {/* EARLIER WORKFLOW STAGE */}
      {isEarlierStage && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 20,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <AlertTriangle size={20} style={{ color: 'var(--status-warn-solid)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              EVC Milestone Pending Scrutiny Clearance
            </h4>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Expert Visit Committee inspection is scheduled only after the application passes scrutiny checks with zero unresolved statutory deficiencies. Currently in stage <strong>{caseData.currentStage}</strong> with readiness score <strong>{caseData.readinessScore}%</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Statutory Guidance */}
      <div
        style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 14,
          fontSize: 11,
          color: 'var(--text-muted)',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <ShieldCheck size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
        <span>
          Inspection committees must include at least one Chair Professor from an autonomous Institute of National Importance (IIT/NIT/IISc/Central University) with zero affiliated conflicts within 5 academic years.
        </span>
      </div>
    </div>
  );
}
