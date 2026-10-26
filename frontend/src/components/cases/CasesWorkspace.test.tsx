import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { CaseFilterBar } from './CaseFilterBar';
import { CaseTableView } from './CaseTableView';
import { CaseBoardView } from './CaseBoardView';
import { CaseDetailHeader } from './CaseDetailHeader';
import { CaseRightRail } from './CaseRightRail';
import { ExtendDeadlineModal } from './ExtendDeadlineModal';
import { RoleProvider } from '../../context/RoleContext';
import { ToastProvider } from '../../context/ToastContext';
import type { CaseSummary, CaseDetail, CaseReadinessResponse } from '../../types/domain';

// Mock test data
const mockCases: CaseSummary[] = [
  {
    id: 'case-1',
    applicationNumber: 'AICTE-2026-ENG-001',
    institutionCode: 'INST-001',
    institutionName: 'Apex Institute of Technology',
    institutionType: 'ENGINEERING_COLLEGE',
    region: 'WRO',
    academicYear: '2026-27',
    applicationType: 'NEW_INSTITUTE',
    status: 'UNDER_SCRUTINY',
    currentStage: 'SCRUTINY',
    readinessScore: 78,
    assignedOfficer: 'Dr. Sharma',
    deadlineAt: '2026-11-15T18:30:00Z',
    submittedAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-20T14:00:00Z',
    isOverdue: false,
    remainingHours: 120,
    remainingBusinessDays: 5,
    deadlineStatus: 'ON_TRACK',
    deadlineAtIst: '15-Nov-2026 06:30 PM',
  },
  {
    id: 'case-2',
    applicationNumber: 'AICTE-2026-ENG-002',
    institutionCode: 'INST-002',
    institutionName: 'National Polytechnic College',
    institutionType: 'POLYTECHNIC',
    region: 'SRO',
    academicYear: '2026-27',
    applicationType: 'EXTENSION_OF_APPROVAL',
    status: 'DEFICIENCY_FLAGGED',
    currentStage: 'DEFICIENCY',
    readinessScore: 42,
    assignedOfficer: 'Smt. Verma',
    deadlineAt: '2026-10-25T18:30:00Z',
    submittedAt: '2026-09-15T09:00:00Z',
    updatedAt: '2026-10-22T11:00:00Z',
    isOverdue: true,
    remainingHours: -72,
    remainingBusinessDays: 0,
    deadlineStatus: 'OVERDUE',
    deadlineAtIst: '25-Oct-2026 06:30 PM',
  },
];

const mockDetail: CaseDetail = {
  id: 'case-1',
  applicationNumber: 'AICTE-2026-ENG-001',
  academicYear: '2026-27',
  applicationType: 'NEW_INSTITUTE',
  status: 'UNDER_SCRUTINY',
  currentStage: 'SCRUTINY',
  readinessScore: 78,
  assignedOfficer: 'Dr. Sharma',
  deadlineAt: '2026-11-15T18:30:00Z',
  submittedAt: '2026-10-01T10:00:00Z',
  updatedAt: '2026-10-20T14:00:00Z',
  isOverdue: false,
  remainingHours: 120,
  remainingBusinessDays: 5,
  deadlineStatus: 'ON_TRACK',
  deadlineAtIst: '15-Nov-2026 06:30 PM',
  institution: {
    id: 'inst-1',
    code: 'INST-001',
    name: 'Apex Institute of Technology',
    institutionType: 'ENGINEERING_COLLEGE',
    region: 'WRO',
    address: 'Survey 104, Hinjawadi Phase 2, Pune',
    establishedYear: 2012,
    contactEmail: 'admin@apexinstitute.edu.in',
    campuses: [
      {
        id: 'camp-1',
        campusName: 'Main Campus',
        address: 'Hinjawadi, Pune',
        landAreaAcres: 12.5,
        builtUpAreaSqM: 25000,
        landLeaseStatus: 'OWNED_FREEHOLD',
        leaseExpiryDate: null,
      },
    ],
  },
  deficiencies: [
    {
      id: 'def-1',
      category: 'FIRE_SAFETY_NOC',
      description: 'Fire Safety Certificate expired on 30-Sep-2026. Current NOC required.',
      status: 'OPEN',
      deadlineDays: 7,
      flaggedAt: '2026-10-18T10:00:00Z',
      resolvedAt: null,
      resolutionComment: null,
      proofDocumentName: null,
      proofDocumentUrl: null,
    },
  ],
  documents: [
    {
      id: 'doc-1',
      documentType: 'LAND_USE_CERTIFICATE',
      documentName: 'Land Conversion Certificate.pdf',
      fileHash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
      verificationStatus: 'VERIFIED',
      validUntil: '2030-01-01',
      uploadedAt: '2026-10-02T12:00:00Z',
    },
  ],
};

const mockReadiness: CaseReadinessResponse = {
  caseId: 'case-1',
  applicationNumber: 'AICTE-2026-ENG-001',
  institutionName: 'Apex Institute of Technology',
  currentStatus: 'UNDER_SCRUTINY',
  currentStage: 'SCRUTINY',
  readinessScore: 78,
  readinessTier: 'NEAR_READY',
  readyForNextStage: false,
  nextRecommendedStage: 'EVC_PENDING',
  criteria: [
    { category: 'DOCUMENTS', scorePercentage: 100, maxPoints: 35, earnedPoints: 35, status: 'PASSED', details: 'All 8 documents verified' },
    { category: 'DEFICIENCIES', scorePercentage: 50, maxPoints: 35, earnedPoints: 17, status: 'WARNING', details: '1 deficiency unresolved' },
    { category: 'COMMITTEE', scorePercentage: 80, maxPoints: 20, earnedPoints: 16, status: 'PASSED', details: 'Committee candidate pool ready' },
    { category: 'DEADLINES', scorePercentage: 100, maxPoints: 10, earnedPoints: 10, status: 'PASSED', details: 'On track' },
  ],
  blockingPrerequisites: [
    {
      id: 'prereq-1',
      category: 'DEFICIENCIES',
      severity: 'CRITICAL',
      description: 'All flagged statutory deficiencies must be resolved before scrutiny clearance.',
      resolutionGuide: 'Clear 1 open deficiency item in Deficiencies tab.',
    },
  ],
  recommendedActions: [
    {
      priority: 1,
      actionType: 'CLEAR_DEFICIENCY',
      description: 'Verify institutional response for Fire Safety NOC',
      assignedRole: 'SCRUTINY_OFFICER',
      targetEndpoint: '/api/v1/cases/case-1/deficiencies/def-1/resolve',
    },
  ],
  evaluatedAt: '2026-10-26T12:00:00Z',
};

describe('Phase 1 - Cases Workspace & Comprehensive Detail Engine', () => {
  it('renders CaseFilterBar with active criteria and counts', () => {
    const html = renderToStaticMarkup(
      <CaseFilterBar
        filters={{
          search: 'Apex',
          stage: 'ALL',
          region: 'WRO',
          deadlineStatus: 'ALL',
          readinessTier: 'ALL',
        }}
        onFilterChange={vi.fn()}
        viewMode="table"
        onViewModeChange={vi.fn()}
        density="comfortable"
        onDensityChange={vi.fn()}
        onExportCsv={vi.fn()}
        totalCount={10}
        filteredCount={1}
      />
    );

    expect(html).toContain('Apex');
    expect(html).toContain('Showing <strong>1</strong> of 10 cases');
    expect(html).toContain('Table');
    expect(html).toContain('Board');
    expect(html).toContain('Export CSV');
    expect(html).toContain('Reset filters');
  });

  it('renders CaseTableView with sortable columns, stage chips, readiness rings, and deadlines', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CaseTableView
          cases={mockCases}
          density="comfortable"
          onExportCases={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(html).toContain('AICTE-2026-ENG-001');
    expect(html).toContain('Apex Institute of Technology');
    expect(html).toContain('WRO');
    expect(html).toContain('Under Scrutiny');
    expect(html).toContain('78%');
    expect(html).toContain('5d left');

    // Overdue case
    expect(html).toContain('National Polytechnic College');
    expect(html).toContain('Deficiency Flagged');
    expect(html).toContain('3d overdue');
  });

  it('renders CaseBoardView grouping applications into stage columns', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CaseBoardView cases={mockCases} />
      </MemoryRouter>
    );

    expect(html).toContain('Intake');
    expect(html).toContain('Under Scrutiny');
    expect(html).toContain('Deficiency Flagged');
    expect(html).toContain('EVC Pending');
    expect(html).toContain('Approved');
    expect(html).toContain('Rejected');

    // Cards
    expect(html).toContain('AICTE-2026-ENG-001');
    expect(html).toContain('AICTE-2026-ENG-002');
  });

  it('renders CaseDetailHeader with 5-stage milestone stepper and guarded transition blockers', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <RoleProvider>
          <ToastProvider>
            <CaseDetailHeader
              caseData={mockDetail}
              readiness={mockReadiness}
              onOpenExtendDeadline={vi.fn()}
              onRefresh={vi.fn()}
              onTabJump={vi.fn()}
            />
          </ToastProvider>
        </RoleProvider>
      </MemoryRouter>
    );

    expect(html).toContain('Apex Institute of Technology');
    expect(html).toContain('AICTE-2026-ENG-001');
    expect(html).toContain('1. Intake');
    expect(html).toContain('2. Scrutiny');
    expect(html).toContain('3. Deficiency');
    expect(html).toContain('4. Expert Visit');
    expect(html).toContain('5. Decision');

    // Guarded blocker banner
    expect(html).toContain('Workflow Advancement Blocked:');
    expect(html).toContain('All flagged statutory deficiencies must be resolved');
    expect(html).toContain('Resolve Prerequisite');
  });

  it('renders CaseRightRail with 4-part score breakdown and blocking prerequisites', () => {
    const html = renderToStaticMarkup(
      <CaseRightRail
        readiness={mockReadiness}
        onTabJump={vi.fn()}
      />
    );

    expect(html).toContain('Readiness Breakdown');
    expect(html).toContain('Mandatory Documents');
    expect(html).toContain('35 / 35 pts');
    expect(html).toContain('Deficiency Clearance');
    expect(html).toContain('17 / 35 pts');
    expect(html).toContain('Blocking Prerequisites (1)');
    expect(html).toContain('Recommended Actions');
  });

  it('renders ExtendDeadlineModal with regulatory notice and days input', () => {
    const html = renderToStaticMarkup(
      <RoleProvider>
        <ToastProvider>
          <ExtendDeadlineModal
            isOpen={true}
            onClose={vi.fn()}
            caseId="case-1"
            applicationNumber="AICTE-2026-ENG-001"
            currentDeadlineAtIst="15-Nov-2026 06:30 PM"
            onSuccess={vi.fn()}
          />
        </ToastProvider>
      </RoleProvider>
    );

    expect(html).toContain('Extend Statutory Deadline');
    expect(html).toContain('Regulatory Compliance Notice');
    expect(html).toContain('Extension Days (Business Days)');
    expect(html).toContain('Confirm Extension');
  });
});
