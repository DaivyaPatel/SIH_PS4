import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { DeficienciesPaneLeft, type CaseDeficiencyMeta } from './DeficienciesPaneLeft';
import { DeficiencyStatusStepper } from './DeficiencyStatusStepper';
import { DeficiencyCategoryChip } from './DeficiencyCategoryChip';
import { DeficiencyCard } from './DeficiencyCard';
import { DeficiencyResponsePanel } from './DeficiencyResponsePanel';
import { DeficienciesPaneRight } from './DeficienciesPaneRight';
import { DeficienciesWorkspace } from './DeficienciesWorkspace';
import { RoleProvider } from '../../context/RoleContext';
import { ToastProvider } from '../../context/ToastContext';
import { RegionProvider } from '../../context/RegionContext';
import type { CaseDetail, DeficiencyDetail } from '../../types/domain';

// Mock API
vi.mock('../../lib/api', () => ({
  getCases: vi.fn().mockResolvedValue([]),
  getCaseById: vi.fn().mockResolvedValue(null),
  flagDeficiency: vi.fn(),
  respondToDeficiency: vi.fn(),
  resolveDeficiency: vi.fn(),
}));

const mockCaseDetail: CaseDetail = {
  id: 'case-123',
  applicationNumber: 'APP-2026-WRO-002',
  academicYear: '2026-27',
  applicationType: 'INCREASE_IN_INTAKE',
  status: 'DEFICIENCY_FLAGGED',
  currentStage: 'DEFICIENCY_REVIEW',
  readinessScore: 45,
  assignedOfficer: 'Dr. S. K. Joshi (WRO)',
  deadlineAt: '2026-11-04T18:00:00Z',
  submittedAt: '2026-10-15T10:00:00Z',
  updatedAt: '2026-10-24T12:00:00Z',
  deadlineStatus: 'ON_TRACK',
  remainingHours: 120,
  remainingBusinessDays: 5,
  isOverdue: false,
  deadlineAtIst: '04 Nov 2026, 06:00 PM IST',
  institution: {
    id: 'inst-1',
    code: '1-20394857',
    name: 'Saraswati Engineering College',
    institutionType: 'ENGINEERING_COLLEGE',
    region: 'WRO',
    address: 'Sector 4, Gandhinagar, Gujarat 382010',
    establishedYear: 2004,
    contactEmail: 'principal@saraswati.edu.in',
    campuses: [
      {
        id: 'camp-1',
        campusName: 'Main Campus',
        address: 'Sector 4, Gandhinagar',
        landAreaAcres: 12.5,
        builtUpAreaSqM: 24500.0,
        landLeaseStatus: 'LEASED',
        leaseExpiryDate: '2027-06-30',
      },
    ],
  },
  documents: [
    {
      id: 'doc-1',
      documentType: 'LAND_LEASE_DEED',
      documentName: 'Lease_Deed_Expiring_2027.pdf',
      fileHash: 'f4e3d2c1b0a9876543210fedcba9876543210fedcba9876543210fedcba98765',
      verificationStatus: 'DEFICIENT',
      validUntil: '2027-06-30',
      uploadedAt: '2026-10-15T10:00:00Z',
    },
  ],
  deficiencies: [
    {
      id: 'def-1',
      category: 'LAND_AND_BUILDING',
      description: 'Registered land lease deed expires within 14 months (2027-06-30). APH Section 6.17 requires minimum 3-year live validity.',
      status: 'OPEN',
      deadlineDays: 7,
      flaggedAt: '2026-10-24T10:00:00Z',
      resolvedAt: null,
      resolutionComment: null,
      proofDocumentName: null,
      proofDocumentUrl: null,
    },
    {
      id: 'def-2',
      category: 'FIRE_SAFETY',
      description: 'Municipal Fire Safety NOC expired on 2026-03-31; renewed clearance certificate not uploaded.',
      status: 'RESUBMITTED',
      deadlineDays: 7,
      flaggedAt: '2026-10-24T10:00:00Z',
      resolvedAt: null,
      resolutionComment: 'Fire safety NOC renewed by Gandhinagar Municipal Corp on 2026-10-25.',
      proofDocumentName: 'Fire_NOC_Renewal_2026.pdf',
      proofDocumentUrl: '/documents/proofs/fire-noc-renewal.pdf',
    },
  ],
};

const mockCaseMetaList: CaseDeficiencyMeta[] = [
  {
    id: 'case-123',
    applicationNumber: 'APP-2026-WRO-002',
    institutionCode: '1-20394857',
    institutionName: 'Saraswati Engineering College',
    institutionType: 'ENGINEERING_COLLEGE',
    region: 'WRO',
    academicYear: '2026-27',
    applicationType: 'INCREASE_IN_INTAKE',
    status: 'DEFICIENCY_FLAGGED',
    currentStage: 'DEFICIENCY_REVIEW',
    readinessScore: 45,
    assignedOfficer: 'Dr. S. K. Joshi (WRO)',
    deadlineAt: '2026-11-04T18:00:00Z',
    submittedAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-24T12:00:00Z',
    remainingHours: 120,
    remainingBusinessDays: 5,
    isOverdue: false,
    deadlineStatus: 'ON_TRACK',
    deadlineAtIst: '04 Nov 2026, 06:00 PM IST',
    openCount: 1,
    resubmittedCount: 1,
    resolvedCount: 0,
    totalDeficiencies: 2,
  },
  {
    id: 'case-456',
    applicationNumber: 'APP-2026-NRO-003',
    institutionCode: '1-30495861',
    institutionName: 'Greenfield College of Pharmacy',
    institutionType: 'PHARMACY_INSTITUTE',
    region: 'NRO',
    academicYear: '2026-27',
    applicationType: 'EXTENSION_OF_APPROVAL',
    status: 'DEFICIENCY_RESUBMITTED',
    currentStage: 'SCRUTINY_RE_REVIEW',
    readinessScore: 78,
    assignedOfficer: 'Prof. A. K. Verma (NRO)',
    deadlineAt: '2026-10-29T18:00:00Z',
    submittedAt: '2026-10-12T10:00:00Z',
    updatedAt: '2026-10-24T12:00:00Z',
    remainingHours: 24,
    remainingBusinessDays: 1,
    isOverdue: false,
    deadlineStatus: 'APPROACHING_BREACH',
    deadlineAtIst: '29 Oct 2026, 06:00 PM IST',
    openCount: 0,
    resubmittedCount: 1,
    resolvedCount: 0,
    totalDeficiencies: 1,
  },
];

describe('Phase 3: Deficiencies Workspace & Interactive Correction Loop', () => {
  describe('DeficiencyCategoryChip', () => {
    it('renders human-readable category names and icons', () => {
      const html1 = renderToStaticMarkup(<DeficiencyCategoryChip category="LAND_AND_BUILDING" />);
      expect(html1).toContain('Land &amp; Building Norms');

      const html2 = renderToStaticMarkup(<DeficiencyCategoryChip category="FACULTY_CADRE_RATIO" />);
      expect(html2).toContain('Faculty Cadre &amp; Ratio');

      const html3 = renderToStaticMarkup(<DeficiencyCategoryChip category="FIRE_SAFETY" />);
      expect(html3).toContain('Fire Safety &amp; NOC');

      const html4 = renderToStaticMarkup(<DeficiencyCategoryChip category="FINANCIAL_DEPOSIT" />);
      expect(html4).toContain('Financial Deposit / FDR');

      const html5 = renderToStaticMarkup(<DeficiencyCategoryChip category="ACADEMIC_INFRASTRUCTURE" />);
      expect(html5).toContain('Academic Infrastructure');
    });
  });

  describe('DeficiencyStatusStepper', () => {
    it('renders the 3-step statutory pipeline stages', () => {
      const html = renderToStaticMarkup(<DeficiencyStatusStepper status="OPEN" />);
      expect(html).toContain('Flagged &amp; Open');
      expect(html).toContain('Proof Resubmitted');
      expect(html).toContain('Compliance Verified');
      expect(html).toContain('Statutory cure window active');
    });

    it('renders compact mode without error', () => {
      const html = renderToStaticMarkup(<DeficiencyStatusStepper status="RESUBMITTED" compact />);
      expect(html).toContain('Proof Resubmitted');
    });
  });

  describe('DeficienciesPaneLeft', () => {
    it('renders applications with open and review badge counters', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <DeficienciesPaneLeft
            cases={mockCaseMetaList}
            selectedCaseId="case-123"
            onSelectCase={vi.fn()}
            loading={false}
          />
        </MemoryRouter>
      );

      expect(html).toContain('Applications (2)');
      expect(html).toContain('Saraswati Engineering College');
      expect(html).toContain('Greenfield College of Pharmacy');
      expect(html).toContain('1 Open');
      expect(html).toContain('1 Review');
      expect(html).toContain('Search college or application...');
    });

    it('renders loading state when loading prop is true', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <DeficienciesPaneLeft
            cases={[]}
            selectedCaseId={null}
            onSelectCase={vi.fn()}
            loading={true}
          />
        </MemoryRouter>
      );

      expect(html).toContain('Loading deficiency records...');
    });
  });

  describe('DeficiencyCard', () => {
    it('renders deficiency observation, category, cure days, and proof preview button', () => {
      const html = renderToStaticMarkup(
        <RoleProvider>
          <ToastProvider>
            <DeficiencyCard
              deficiency={mockCaseDetail.deficiencies[1]} // RESUBMITTED
              caseId="case-123"
              applicationNumber="APP-2026-WRO-002"
              onRefresh={vi.fn()}
              defaultExpanded={true}
            />
          </ToastProvider>
        </RoleProvider>
      );

      expect(html).toContain('Proof Ready');
      expect(html).toContain('Fire Safety NOC expired on 2026-03-31');
      expect(html).toContain('Fire_NOC_Renewal_2026.pdf');
      expect(html).toContain('Preview Proof');
      expect(html).toContain('Compliance Response Received &amp; Awaiting Verification');
    });

    it('renders verified clearance state for resolved deficiencies', () => {
      const resolvedDef: DeficiencyDetail = {
        ...mockCaseDetail.deficiencies[0],
        status: 'RESOLVED',
        resolvedAt: '2026-10-26T14:00:00Z',
        resolutionComment: 'Verified 5-year registered lease deed with Gandhinagar Municipal Corp.',
        proofDocumentName: 'Registered_Lease_2031.pdf',
      };

      const html = renderToStaticMarkup(
        <RoleProvider>
          <ToastProvider>
            <DeficiencyCard
              deficiency={resolvedDef}
              caseId="case-123"
              applicationNumber="APP-2026-WRO-002"
              onRefresh={vi.fn()}
              defaultExpanded={true}
            />
          </ToastProvider>
        </RoleProvider>
      );

      expect(html).toContain('Compliance Verified &amp; Deficiency Cleared');
      expect(html).toContain('Verified 5-year registered lease deed');
      expect(html).toContain('Registered_Lease_2031.pdf');
      expect(html).toContain('View Proof');
    });
  });

  describe('DeficiencyResponsePanel', () => {
    it('renders drag and drop file area and explanatory comment textarea', () => {
      const html = renderToStaticMarkup(
        <RoleProvider>
          <ToastProvider>
            <DeficiencyResponsePanel
              caseId="case-123"
              deficiencyId="def-1"
              onSuccess={vi.fn()}
            />
          </ToastProvider>
        </RoleProvider>
      );

      expect(html).toContain('Submit Compliance Response &amp; Supporting Proof');
      expect(html).toContain('Click to upload or drag &amp; drop proof document');
      expect(html).toContain('Institutional Explanation &amp; Compliance Notes');
      expect(html).toContain('Submit Compliance Proof');
    });
  });

  describe('DeficienciesPaneRight', () => {
    it('renders hero banner with readiness ring, status chip, action buttons, and filter tabs', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <RoleProvider>
            <ToastProvider>
              <DeficienciesPaneRight
                caseData={mockCaseDetail}
                loading={false}
                onRefresh={vi.fn()}
              />
            </ToastProvider>
          </RoleProvider>
        </MemoryRouter>
      );

      expect(html).toContain('Saraswati Engineering College');
      expect(html).toContain('APP-2026-WRO-002');
      expect(html).toContain('DEFICIENCY_FLAGGED');
      expect(html).toContain('Full Case View');
      expect(html).toContain('All (2)');
      expect(html).toContain('Open (1)');
      expect(html).toContain('Resubmitted (1)');
      expect(html).toContain('Resolved (0)');
    });

    it('renders all-cleared success milestone banner when all deficiencies are resolved', () => {
      const clearedCase: CaseDetail = {
        ...mockCaseDetail,
        status: 'EVC_PENDING',
        readinessScore: 92,
        deficiencies: [
          {
            ...mockCaseDetail.deficiencies[0],
            status: 'RESOLVED',
            resolvedAt: '2026-10-26T12:00:00Z',
          },
        ],
      };

      const html = renderToStaticMarkup(
        <MemoryRouter>
          <RoleProvider>
            <ToastProvider>
              <DeficienciesPaneRight
                caseData={clearedCase}
                loading={false}
                onRefresh={vi.fn()}
              />
            </ToastProvider>
          </RoleProvider>
        </MemoryRouter>
      );

      expect(html).toContain('All Statutory Deficiencies Cleared &amp; Verified');
      expect(html).toContain('Proceed to EVC');
    });

    it('renders empty state when no case is selected', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <RoleProvider>
            <ToastProvider>
              <DeficienciesPaneRight
                caseData={null}
                loading={false}
                onRefresh={vi.fn()}
              />
            </ToastProvider>
          </RoleProvider>
        </MemoryRouter>
      );

      expect(html).toContain('Select an Application');
      expect(html).toContain('Choose an institution from the left pane');
    });
  });

  describe('DeficienciesWorkspace Integration', () => {
    it('renders master two-pane workspace layout container', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <RegionProvider>
            <RoleProvider>
              <ToastProvider>
                <DeficienciesWorkspace />
              </ToastProvider>
            </RoleProvider>
          </RegionProvider>
        </MemoryRouter>
      );

      expect(html).toContain('Applications (0)');
      expect(html).toContain('Select an Application');
    });
  });
});
