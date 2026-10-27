import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  AlertTriangle,
  Building,
  ArrowRight,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { Skeleton } from '../common/Skeleton';
import { getEligibleExperts, getCases } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import type { CaseSummary, EligibleExpertsResponse, ExpertEligibilityResult, Region } from '../../types/domain';

interface EligibilityMatrixViewProps {
  selectedRegion: Region | 'ALL';
  initialCaseId?: string;
  onNavigateToScheduling?: (caseId: string) => void;
}

export function EligibilityMatrixView({
  selectedRegion,
  initialCaseId,
  onNavigateToScheduling,
}: EligibilityMatrixViewProps) {
  const { addToast } = useToast();

  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(initialCaseId || '');
  const [targetDate, setTargetDate] = useState('2026-11-10');
  const [requiredDomain, setRequiredDomain] = useState('COMPUTER_SCIENCE');
  const [eligibilityData, setEligibilityData] = useState<EligibleExpertsResponse | null>(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [selectedPanelExpertIds, setSelectedPanelExpertIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ELIGIBLE' | 'INELIGIBLE'>('ALL');

  const domains = [
    { key: 'COMPUTER_SCIENCE', label: 'Computer Science & IT' },
    { key: 'MECHANICAL_ENGINEERING', label: 'Mechanical Engineering' },
    { key: 'ELECTRICAL_ENGINEERING', label: 'Electrical Engineering' },
    { key: 'CIVIL_ENGINEERING', label: 'Civil & Structural Engineering' },
    { key: 'PHARMACY', label: 'Pharmaceutical Sciences' },
    { key: 'MANAGEMENT', label: 'Management & Business Studies' },
    { key: 'ELECTRONICS_AND_COMMUNICATION', label: 'Electronics & Communication' },
  ];

  // Load cases
  useEffect(() => {
    setLoadingCases(true);
    getCases(undefined, selectedRegion)
      .then(res => {
        setCases(res);
        if (res.length > 0 && !selectedCaseId) {
          // Pre-select EVC_PENDING / EVC_SCHEDULED if present, else first case
          const evcCase = res.find(c => c.status === 'EVC_PENDING' || c.status === 'EVC_SCHEDULED') || res[0];
          setSelectedCaseId(evcCase.id);
        }
        setLoadingCases(false);
      })
      .catch(() => setLoadingCases(false));
  }, [selectedRegion, selectedCaseId]);

  // Load eligibility
  const loadEligibility = useCallback(async (caseId: string, date: string, domain: string) => {
    if (!caseId) return;
    setLoadingEligibility(true);
    try {
      const data = await getEligibleExperts(caseId, date, domain);
      setEligibilityData(data);
      setSelectedPanelExpertIds([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to evaluate expert eligibility';
      addToast({
        type: 'error',
        title: 'Eligibility Evaluation Failed',
        message: msg,
      });
      setEligibilityData(null);
    } finally {
      setLoadingEligibility(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (selectedCaseId) {
      loadEligibility(selectedCaseId, targetDate, requiredDomain);
    }
  }, [selectedCaseId, targetDate, requiredDomain, loadEligibility]);

  const toggleSelectExpert = (expertId: string) => {
    setSelectedPanelExpertIds(prev => {
      if (prev.includes(expertId)) {
        return prev.filter(id => id !== expertId);
      }
      if (prev.length >= 3) {
        addToast({
          type: 'warning',
          title: 'Maximum Panel Size',
          message: 'An EVC panel can comprise a maximum of 3 members per APH regulations.',
        });
        return prev;
      }
      return [...prev, expertId];
    });
  };

  const getReasonChipStyle = (reason: string) => {
    const lower = reason.toLowerCase();
    if (lower.includes('conflict') || lower.includes('affiliated')) {
      return {
        bg: 'var(--status-bad-tint)',
        border: 'var(--status-bad-border)',
        text: 'var(--status-bad-text)',
        icon: <ShieldAlert size={12} />,
        label: 'Conflict of Interest',
      };
    }
    if (lower.includes('unavailable') || lower.includes('date')) {
      return {
        bg: 'var(--status-warn-tint)',
        border: 'var(--status-warn-border)',
        text: 'var(--status-warn-text)',
        icon: <Calendar size={12} />,
        label: 'Date Unavailable',
      };
    }
    return {
      bg: 'var(--status-info-tint)',
      border: 'var(--status-info-border)',
      text: 'var(--status-info-text)',
      icon: <AlertTriangle size={12} />,
      label: 'Domain Mismatch',
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Parameter Control Bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1 }}>
          {/* Case Picker */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
              Target Application Case
            </label>
            <select
              value={selectedCaseId}
              onChange={e => setSelectedCaseId(e.target.value)}
              disabled={loadingCases}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-page)',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
                cursor: 'pointer',
                minWidth: 260,
              }}
            >
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.applicationNumber} — {c.institutionName} ({c.status})
                </option>
              ))}
            </select>
          </div>

          {/* Target Date Picker */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
              Proposed Inspection Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-page)',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          {/* Required Domain */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
              Required Specialization
            </label>
            <select
              value={requiredDomain}
              onChange={e => setRequiredDomain(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-page)',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {domains.map(d => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Panel Composer Summary */}
        {selectedPanelExpertIds.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--accent-subtle)',
              border: '1px solid var(--accent-border)',
              borderRadius: 6,
              padding: '8px 12px',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
              {selectedPanelExpertIds.length} Expert{selectedPanelExpertIds.length > 1 ? 's' : ''} Selected
            </div>
            {onNavigateToScheduling && (
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight size={13} />}
                onClick={() => onNavigateToScheduling(selectedCaseId)}
              >
                Proceed to Scheduling
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Summary Scorecard Strip */}
      {eligibilityData && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '12px 16px',
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Target Institution</span>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
              {eligibilityData.institutionName}
            </div>
          </div>

          <div
            style={{
              background: 'var(--status-ok-tint)',
              border: '1px solid var(--status-ok-border)',
              borderRadius: 8,
              padding: '12px 16px',
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--status-ok-text)' }}>Eligible Experts</span>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--status-ok-text)', marginTop: 2 }}>
              {eligibilityData.eligibleCount} Candidate{eligibilityData.eligibleCount === 1 ? '' : 's'}
            </div>
          </div>

          <div
            style={{
              background: 'var(--status-bad-tint)',
              border: '1px solid var(--status-bad-border)',
              borderRadius: 8,
              padding: '12px 16px',
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--status-bad-text)' }}>Statutorily Disqualified</span>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--status-bad-text)', marginTop: 2 }}>
              {eligibilityData.ineligibleCount} Expert{eligibilityData.ineligibleCount === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      )}

      {/* Segmented Control Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          gap: 8,
          paddingBottom: 4,
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          style={{
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: activeTab === 'ALL' ? 700 : 500,
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'ALL' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'ALL' ? 'var(--text-inverse)' : 'var(--text-secondary)',
          }}
        >
          All Evaluated ({((eligibilityData?.eligibleCount || 0) + (eligibilityData?.ineligibleCount || 0))})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ELIGIBLE')}
          style={{
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: activeTab === 'ELIGIBLE' ? 700 : 500,
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'ELIGIBLE' ? 'var(--status-ok-solid)' : 'transparent',
            color: activeTab === 'ELIGIBLE' ? 'var(--text-inverse)' : 'var(--text-secondary)',
          }}
        >
          Eligible Pool ({eligibilityData?.eligibleCount || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('INELIGIBLE')}
          style={{
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: activeTab === 'INELIGIBLE' ? 700 : 500,
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'INELIGIBLE' ? 'var(--status-bad-solid)' : 'transparent',
            color: activeTab === 'INELIGIBLE' ? 'var(--text-inverse)' : 'var(--text-secondary)',
          }}
        >
          Ineligible &amp; Conflicts ({eligibilityData?.ineligibleCount || 0})
        </button>
      </div>

      {/* Main Evaluated Experts Split Grid */}
      {loadingEligibility ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={140} />
          ))}
        </div>
      ) : !eligibilityData ? (
        <EmptyState
          icon={<Users size={28} style={{ color: 'var(--text-muted)' }} />}
          title="Select an application case"
          description="Pick a case from the top selector to compute conflict-of-interest checks and date availability."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {/* Eligible Experts */}
          {(activeTab === 'ALL' || activeTab === 'ELIGIBLE') &&
            eligibilityData.eligibleExperts.map((exp: ExpertEligibilityResult) => {
              const expId = exp.expertId || exp.id || '';
              const isSelected = selectedPanelExpertIds.includes(expId);

              return (
                <div
                  key={expId}
                  style={{
                    background: 'var(--bg-surface)',
                    border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--status-ok-border)'}`,
                    borderRadius: 8,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                        {exp.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Building size={12} />
                        <span>{exp.affiliatedInstitution}</span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: 'var(--status-ok-tint)',
                        color: 'var(--status-ok-text)',
                        border: '1px solid var(--status-ok-border)',
                      }}
                    >
                      ELIGIBLE
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--status-ok-text)', background: 'var(--status-ok-tint)', padding: '6px 8px', borderRadius: 4 }}>
                    {exp.eligibilityReason}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Domain: <strong>{exp.domain.replace(/_/g, ' ')}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleSelectExpert(expId)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 4,
                        border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--accent)' : 'var(--bg-subtle)',
                        color: isSelected ? 'var(--text-inverse)' : 'var(--text-primary)',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {isSelected ? 'Selected' : 'Select for Panel'}
                    </button>
                  </div>
                </div>
              );
            })}

          {/* Ineligible Experts */}
          {(activeTab === 'ALL' || activeTab === 'INELIGIBLE') &&
            eligibilityData.ineligibleExperts.map((exp: ExpertEligibilityResult) => {
              const chip = getReasonChipStyle(exp.eligibilityReason);
              const expId = exp.expertId || exp.id || '';

              return (
                <div
                  key={expId}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--status-bad-border)',
                    borderRadius: 8,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    boxShadow: 'var(--shadow-sm)',
                    opacity: 0.9,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                        {exp.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Building size={12} />
                        <span>{exp.affiliatedInstitution}</span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: chip.bg,
                        color: chip.text,
                        border: `1px solid ${chip.border}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      {chip.icon}
                      {chip.label}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: chip.text,
                      background: chip.bg,
                      padding: '6px 8px',
                      borderRadius: 4,
                      border: `1px solid ${chip.border}`,
                      lineHeight: 1.4,
                    }}
                  >
                    <strong>Disqualification Note: </strong>
                    {exp.eligibilityReason}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>Domain: {exp.domain.replace(/_/g, ' ')}</span>
                    <span>Region: {exp.region}</span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
