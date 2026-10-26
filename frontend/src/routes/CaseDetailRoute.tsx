import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCaseById, getCaseReadiness } from '../lib/api';
import { Skeleton } from '../components/common/Skeleton';
import { CaseDetailHeader } from '../components/cases/CaseDetailHeader';
import { CaseDetailTabs } from '../components/cases/CaseDetailTabs';
import { CaseRightRail } from '../components/cases/CaseRightRail';
import { ExtendDeadlineModal } from '../components/cases/ExtendDeadlineModal';
import { FlagDeficiencyModal } from '../components/cases/FlagDeficiencyModal';
import { RespondDeficiencyModal } from '../components/cases/RespondDeficiencyModal';
import { ResolveDeficiencyModal } from '../components/cases/ResolveDeficiencyModal';
import { DocumentPreviewDrawer } from '../components/cases/DocumentPreviewDrawer';
import type { CaseDetail, CaseReadinessResponse, DocumentDetail, DeficiencyDetail } from '../types/domain';

export function CaseDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [readiness, setReadiness] = useState<CaseReadinessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab State: 0=Overview, 1=Deficiencies, 2=Documents, 3=Timeline, 4=Audit
  const [activeTab, setActiveTab] = useState(0);

  // Modals & Drawers State
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentDetail | null>(null);
  const [docDrawerOpen, setDocDrawerOpen] = useState(false);
  const [respondDef, setRespondDef] = useState<DeficiencyDetail | null>(null);
  const [resolveDef, setResolveDef] = useState<DeficiencyDetail | null>(null);

  const loadCaseData = useCallback(() => {
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
        setError(err.message || 'Unable to retrieve case dossier.');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    loadCaseData();
  }, [loadCaseData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Skeleton height={140} />
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <Skeleton height={400} />
          </div>
          <div style={{ width: 320 }}>
            <Skeleton height={400} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div
        role="alert"
        style={{
          padding: 24,
          background: 'var(--status-bad-tint)',
          color: 'var(--status-bad-text)',
          border: '1px solid var(--status-bad-border)',
          borderRadius: 8,
          maxWidth: 600,
          margin: '40px auto',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Failed to Load Application</h2>
        <p style={{ margin: '0 0 16px', fontSize: 13 }}>{error || 'Application dossier not found.'}</p>
        <button
          onClick={() => navigate('/cases')}
          style={{
            padding: '8px 16px',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Return to Cases
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Case Detail Header (with 5-Stage Stepper and Guarded Action Button) */}
      <CaseDetailHeader
        caseData={caseData}
        readiness={readiness}
        onOpenExtendDeadline={() => setExtendModalOpen(true)}
        onRefresh={loadCaseData}
        onTabJump={tabIdx => setActiveTab(tabIdx)}
      />

      {/* Main Content Layout: Main Tabs + Right Rail */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          alignItems: 'flex-start',
          flexDirection: 'row',
        }}
      >
        {/* Left Column: Interactive Tabs */}
        <CaseDetailTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          caseData={caseData}
          onSelectDocument={doc => {
            setSelectedDoc(doc);
            setDocDrawerOpen(true);
          }}
          onOpenFlagDeficiency={() => setFlagModalOpen(true)}
          onOpenRespondDeficiency={def => setRespondDef(def)}
          onOpenResolveDeficiency={def => setResolveDef(def)}
        />

        {/* Right Column: 320px Sticky Right Rail */}
        <CaseRightRail
          readiness={readiness}
          onTabJump={setActiveTab}
          onOpenFlagDeficiency={() => setFlagModalOpen(true)}
          onOpenExtendDeadline={() => setExtendModalOpen(true)}
        />
      </div>

      {/* Extend Deadline Modal */}
      <ExtendDeadlineModal
        isOpen={extendModalOpen}
        onClose={() => setExtendModalOpen(false)}
        caseId={caseData.id}
        applicationNumber={caseData.applicationNumber}
        currentDeadlineAtIst={caseData.deadlineAtIst}
        onSuccess={loadCaseData}
      />

      {/* Flag Deficiency Modal */}
      <FlagDeficiencyModal
        isOpen={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
        caseId={caseData.id}
        applicationNumber={caseData.applicationNumber}
        onSuccess={loadCaseData}
      />

      {/* Respond Deficiency Modal */}
      {respondDef && (
        <RespondDeficiencyModal
          isOpen={Boolean(respondDef)}
          onClose={() => setRespondDef(null)}
          caseId={caseData.id}
          deficiencyId={respondDef.id}
          deficiencyDescription={respondDef.description}
          onSuccess={loadCaseData}
        />
      )}

      {/* Resolve Deficiency Modal */}
      {resolveDef && (
        <ResolveDeficiencyModal
          isOpen={Boolean(resolveDef)}
          onClose={() => setResolveDef(null)}
          caseId={caseData.id}
          deficiencyId={resolveDef.id}
          deficiencyDescription={resolveDef.description}
          proofDocumentName={resolveDef.proofDocumentName}
          onSuccess={loadCaseData}
        />
      )}

      {/* Document Preview Drawer */}
      <DocumentPreviewDrawer
        isOpen={docDrawerOpen}
        onClose={() => {
          setDocDrawerOpen(false);
          setSelectedDoc(null);
        }}
        document={selectedDoc}
        onFlagAsDeficient={() => {
          setFlagModalOpen(true);
        }}
      />
    </div>
  );
}
