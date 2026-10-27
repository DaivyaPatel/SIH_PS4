import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  CheckCheck,
} from 'lucide-react';
import { StatusChip } from '../common/StatusChip';
import { ReadinessRing } from '../common/ReadinessRing';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { DeficiencyCard } from './DeficiencyCard';
import { FlagDeficiencyModal } from '../cases/FlagDeficiencyModal';
import { DocumentPreviewDrawer } from '../cases/DocumentPreviewDrawer';
import { resolveDeficiency } from '../../lib/api';
import { useRole } from '../../context/RoleContext';
import { useToast } from '../../context/ToastContext';
import type { CaseDetail, DocumentDetail } from '../../types/domain';

interface DeficienciesPaneRightProps {
  caseData: CaseDetail | null;
  loading: boolean;
  onRefresh: () => void;
}

export function DeficienciesPaneRight({
  caseData,
  loading,
  onRefresh,
}: DeficienciesPaneRightProps) {
  const navigate = useNavigate();
  const { role, permissions } = useRole();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'RESUBMITTED' | 'RESOLVED'>('ALL');
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentDetail | null>(null);
  const [bulkResolving, setBulkResolving] = useState(false);

  const canFlag = permissions.canFlagDeficiencies || role === 'SCRUTINY_OFFICER' || role === 'REGIONAL_OFFICER';

  const deficiencies = caseData?.deficiencies || [];

  const openItems = useMemo(() => deficiencies.filter(d => d.status === 'OPEN'), [deficiencies]);
  const resubmittedItems = useMemo(() => deficiencies.filter(d => d.status === 'RESUBMITTED'), [deficiencies]);
  const resolvedItems = useMemo(() => deficiencies.filter(d => d.status === 'RESOLVED'), [deficiencies]);

  const filteredDeficiencies = useMemo(() => {
    if (activeTab === 'OPEN') return openItems;
    if (activeTab === 'RESUBMITTED') return resubmittedItems;
    if (activeTab === 'RESOLVED') return resolvedItems;
    return deficiencies;
  }, [activeTab, deficiencies, openItems, resubmittedItems, resolvedItems]);

  const handlePreviewProof = (docName: string, docUrl?: string | null) => {
    setPreviewDoc({
      id: `proof-${Date.now()}`,
      documentType: 'COMPLIANCE_PROOF_RECORD',
      documentName: docName,
      fileHash: docUrl ? `sha256-${btoa(docName).slice(0, 32)}` : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      verificationStatus: 'VERIFIED',
      validUntil: '2028-06-30',
      uploadedAt: new Date().toISOString(),
    });
  };

  const handleBulkResolve = async () => {
    if (!caseData || resubmittedItems.length === 0) return;
    setBulkResolving(true);

    try {
      for (const item of resubmittedItems) {
        await resolveDeficiency(caseData.id, item.id, {
          resolutionComment: 'Bulk clearance: institutional proof verified compliant with APH norms.',
          actorRole: role,
          actorId: `${role}-OFFICER`,
        });
      }

      addToast({
        type: 'success',
        title: 'Bulk Clearance Complete',
        message: `Successfully verified and cleared ${resubmittedItems.length} resubmitted deficiencies.`,
      });

      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete bulk clearance';
      addToast({
        type: 'error',
        title: 'Bulk Resolution Failed',
        message: msg,
      });
    } finally {
      setBulkResolving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: 13,
          height: '100%',
        }}
      >
        Loading case details and deficiencies...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        <EmptyState
          icon={<FolderOpen size={32} style={{ color: 'var(--accent)' }} />}
          title="Select an Application"
          description="Choose an institution from the left pane to review open statutory non-compliance items, examine uploaded proofs, and clear deficiencies."
        />
      </div>
    );
  }

  const allCleared = deficiencies.length > 0 && openItems.length === 0 && resubmittedItems.length === 0;

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        background: 'var(--bg-page)',
        boxSizing: 'border-box',
      }}
    >
      {/* Case Header Hero Banner */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ReadinessRing score={caseData.readinessScore} size="md" />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: 'var(--accent)' }}>
                {caseData.applicationNumber}
              </span>
              <StatusChip status={caseData.status} />
              <span
                style={{
                  fontSize: 11,
                  background: 'var(--bg-subtle)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                {caseData.institution.region}
              </span>
            </div>

            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              {caseData.institution.name}
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Code: <strong style={{ color: 'var(--text-primary)' }}>{caseData.institution.code}</strong> &bull;{' '}
              Type: {caseData.applicationType.replace(/_/g, ' ')} &bull;{' '}
              Academic Year: {caseData.academicYear}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {canFlag && (
            <Button
              variant="destructive"
              size="sm"
              leftIcon={<PlusCircle size={14} />}
              onClick={() => setIsFlagModalOpen(true)}
            >
              Flag Deficiency
            </Button>
          )}

          {canFlag && resubmittedItems.length >= 2 && (
            <Button
              variant="primary"
              size="sm"
              isLoading={bulkResolving}
              leftIcon={<CheckCheck size={14} />}
              onClick={handleBulkResolve}
            >
              Bulk Resolve ({resubmittedItems.length})
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ExternalLink size={14} />}
            onClick={() => navigate(`/cases/${caseData.id}`)}
          >
            Full Case View
          </Button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Success Milestone Banner: All Deficiencies Cleared */}
        {allCleared && (
          <div
            style={{
              background: 'var(--status-ok-tint)',
              border: '1px solid var(--status-ok-border)',
              borderRadius: 8,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={22} style={{ color: 'var(--status-ok-solid)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--status-ok-text)' }}>
                  All Statutory Deficiencies Cleared & Verified
                </div>
                <div style={{ fontSize: 12, color: 'var(--status-ok-text)', marginTop: 2 }}>
                  Application compliance is fully restored. Workflow state advances to Expert Visit Committee (EVC) scheduling.
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/cases/${caseData.id}`)}
            >
              Proceed to EVC
            </Button>
          </div>
        )}

        {/* Warning Banner: Active Open Deficiencies */}
        {openItems.length > 0 && (
          <div
            style={{
              background: 'var(--status-bad-tint)',
              border: '1px solid var(--status-bad-border)',
              borderRadius: 8,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <AlertTriangle size={18} style={{ color: 'var(--status-bad-text)', flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: 'var(--status-bad-text)', lineHeight: 1.4 }}>
              <strong>{openItems.length} active deficiency notice{openItems.length > 1 ? 's' : ''}</strong> require remediation. Application stage progression is blocked until compliance proofs are uploaded and verified.
            </div>
          </div>
        )}

        {/* Filter Tabs Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            paddingBottom: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            {(
              [
                { id: 'ALL', label: `All (${deficiencies.length})` },
                { id: 'OPEN', label: `Open (${openItems.length})` },
                { id: 'RESUBMITTED', label: `Resubmitted (${resubmittedItems.length})` },
                { id: 'RESOLVED', label: `Resolved (${resolvedItems.length})` },
              ] as const
            ).map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    background: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Showing {filteredDeficiencies.length} item{filteredDeficiencies.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Deficiency Cards List */}
        {filteredDeficiencies.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={24} style={{ color: 'var(--status-ok-solid)' }} />}
            title="No deficiencies in this category"
            description={
              activeTab === 'OPEN'
                ? 'No non-compliance items are currently awaiting cure response.'
                : activeTab === 'RESUBMITTED'
                ? 'No compliance proofs are currently pending officer verification.'
                : 'Flag a statutory deficiency during scrutiny to track remediation here.'
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredDeficiencies.map((def, idx) => (
              <DeficiencyCard
                key={def.id}
                deficiency={def}
                caseId={caseData.id}
                applicationNumber={caseData.applicationNumber}
                onRefresh={onRefresh}
                onPreviewProof={handlePreviewProof}
                defaultExpanded={idx === 0 || def.status !== 'RESOLVED'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Flag Deficiency Modal */}
      {isFlagModalOpen && (
        <FlagDeficiencyModal
          isOpen={isFlagModalOpen}
          onClose={() => setIsFlagModalOpen(false)}
          caseId={caseData.id}
          applicationNumber={caseData.applicationNumber}
          onSuccess={() => {
            setIsFlagModalOpen(false);
            onRefresh();
          }}
        />
      )}

      {/* Proof Document Preview Drawer */}
      <DocumentPreviewDrawer
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />
    </div>
  );
}
