import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ExpertProfileDrawer } from './ExpertProfileDrawer';
import { ExpertCard } from './ExpertCard';
import { ExpertPoolView } from './ExpertPoolView';
import { EligibilityMatrixView } from './EligibilityMatrixView';
import { ConstraintSchedulerView } from './ConstraintSchedulerView';
import { CaseExpertVisitCard } from './CaseExpertVisitCard';
import { VisitsRoute } from '../../routes/VisitsRoute';
import { RegionProvider } from '../../context/RegionContext';
import { RoleProvider } from '../../context/RoleContext';
import { ToastProvider } from '../../context/ToastContext';
import type { ExpertDetail, CaseSummary, CaseDetail, ScheduleOptimizationResponse } from '../../types/domain';

// Mock API
vi.mock('../../lib/api', () => ({
  getExperts: vi.fn().mockResolvedValue([]),
  getCaseById: vi.fn().mockResolvedValue(null),
  getCases: vi.fn().mockResolvedValue([]),
  getEligibleExperts: vi.fn().mockResolvedValue({
    caseId: 'case-1',
    applicationNumber: 'APP-2026-SRO-004',
    institutionName: 'National Polytechnic Institute',
    targetDate: '2026-11-10',
    requiredDomain: 'COMPUTER_SCIENCE',
    eligibleCount: 2,
    ineligibleCount: 2,
    eligibleExperts: [
      {
        expertId: 'exp-1',
        name: 'Prof. K. R. Ramanathan',
        domain: 'COMPUTER_SCIENCE',
        affiliatedInstitution: 'Indian Institute of Technology Madras',
        region: 'SRO',
        eligible: true,
        eligibilityReason: 'Domain matched and available on target date',
      },
    ],
    ineligibleExperts: [
      {
        expertId: 'exp-2',
        name: 'Prof. Arvind K. Sharma',
        domain: 'ELECTRICAL_ENGINEERING',
        affiliatedInstitution: 'Indian Institute of Technology Bombay',
        region: 'WRO',
        eligible: false,
        eligibilityReason: 'Conflict of interest: Affiliated with Saraswati Engineering College',
      },
      {
        expertId: 'exp-3',
        name: 'Dr. Rajiv V. Singhania',
        domain: 'MANAGEMENT',
        affiliatedInstitution: 'Indian Institute of Management Indore',
        region: 'CRO',
        eligible: false,
        eligibilityReason: 'Unavailable on requested inspection date',
      },
    ],
  }),
  optimizeSchedule: vi.fn().mockResolvedValue({
    solverStatus: 'OPTIMAL',
    solveTimeMs: 94,
    totalCasesRequested: 1,
    totalCasesScheduled: 1,
    scheduledVisits: [
      {
        caseId: 'case-1',
        applicationNumber: 'APP-2026-SRO-004',
        institutionName: 'National Polytechnic Institute',
        inspectionDate: '2026-11-10',
        committeeMembers: [
          {
            expertId: 'exp-1',
            name: 'Prof. K. R. Ramanathan',
            domain: 'COMPUTER_SCIENCE',
            designation: 'Chair Professor',
            institution: 'IIT Madras',
            region: 'SRO',
            role: 'CHAIRMAN',
          },
          {
            expertId: 'exp-2',
            name: 'Prof. Sunita Deshmukh',
            domain: 'MECHANICAL_ENGINEERING',
            designation: 'Professor',
            institution: 'COEP Pune',
            region: 'WRO',
            role: 'MEMBER',
          },
        ],
      },
    ],
    unassignedCases: [],
    solverNotes: 'Optimal schedule found.',
  }),
}));

const mockExperts: ExpertDetail[] = [
  {
    id: 'exp-1',
    name: 'Prof. K. R. Ramanathan',
    email: 'kr.ramanathan@iitm.ac.in',
    designation: 'Professor & Head, Computer Science',
    domain: 'COMPUTER_SCIENCE',
    affiliatedInstitution: 'Indian Institute of Technology Madras',
    region: 'SRO',
    conflictInstitutions: '1-40586973,National Polytechnic Institute',
    availableDates: ['2026-11-10', '2026-11-11', '2026-11-12'],
    maxAssignments: 3,
    active: true,
  },
  {
    id: 'exp-2',
    name: 'Prof. Sunita Deshmukh',
    email: 's.deshmukh@coep.ac.in',
    designation: 'Professor, Mechanical Engineering',
    domain: 'MECHANICAL_ENGINEERING',
    affiliatedInstitution: 'COEP Technological University Pune',
    region: 'WRO',
    conflictInstitutions: '1-10928371,Apex Institute of Technology',
    availableDates: ['2026-11-10', '2026-11-15'],
    maxAssignments: 2,
    active: true,
  },
];

const mockCases: CaseSummary[] = [
  {
    id: 'case-1',
    applicationNumber: 'APP-2026-SRO-004',
    institutionCode: '1-40586973',
    institutionName: 'National Polytechnic Institute',
    institutionType: 'POLYTECHNIC',
    region: 'SRO',
    academicYear: '2026-27',
    applicationType: 'NEW_INSTITUTION',
    status: 'EVC_SCHEDULED',
    currentStage: 'EVC_INSPECTION',
    readinessScore: 88,
    assignedOfficer: 'Dr. M. R. Swaminathan (SRO)',
    deadlineAt: '2026-11-18T18:00:00Z',
    submittedAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-20T12:00:00Z',
    remainingHours: 180,
    remainingBusinessDays: 8,
    isOverdue: false,
    deadlineStatus: 'ON_TRACK',
    deadlineAtIst: '18 Nov 2026, 06:00 PM IST',
  },
];

const mockCaseDetail: CaseDetail = {
  ...mockCases[0],
  institution: {
    id: 'inst-1',
    code: '1-40586973',
    name: 'National Polytechnic Institute',
    institutionType: 'TECHNICAL_COLLEGE',
    region: 'SRO',
    address: 'Guindy, Chennai',
    establishedYear: 2008,
    contactEmail: 'contact@polytechnic.edu',
    campuses: [],
  },
  documents: [],
  deficiencies: [],
};

describe('Phase 4: Expert Visits & Committee Scheduling', () => {
  describe('ExpertProfileDrawer', () => {
    it('renders expert credentials, declared conflicts, and availability windows', () => {
      const html = renderToStaticMarkup(
        <ToastProvider>
          <ExpertProfileDrawer
            isOpen={true}
            onClose={vi.fn()}
            expert={mockExperts[0]}
          />
        </ToastProvider>
      );

      expect(html).toContain('Prof. K. R. Ramanathan');
      expect(html).toContain('Professor &amp; Head, Computer Science');
      expect(html).toContain('kr.ramanathan@iitm.ac.in');
      expect(html).toContain('Indian Institute of Technology Madras');
      expect(html).toContain('Declared Institutional Conflicts');
      expect(html).toContain('National Polytechnic Institute');
      expect(html).toContain('Available Inspection Windows');
      expect(html).toContain('2026-11-10');
    });
  });

  describe('ExpertCard', () => {
    it('renders card with domain badge, active status, and conflict count', () => {
      const html = renderToStaticMarkup(
        <ExpertCard
          expert={mockExperts[0]}
          onSelect={vi.fn()}
        />
      );

      expect(html).toContain('Prof. K. R. Ramanathan');
      expect(html).toContain('COMPUTER SCIENCE');
      expect(html).toContain('SRO');
      expect(html).toContain('ACTIVE');
      expect(html).toContain('2026-11-10');
      expect(html).toContain('View Profile &amp; Availability');
    });
  });

  describe('ExpertPoolView', () => {
    it('renders search bar, domain filter dropdown, and grid view', () => {
      const html = renderToStaticMarkup(
        <ToastProvider>
          <ExpertPoolView
            experts={mockExperts}
            loading={false}
            selectedRegion="ALL"
          />
        </ToastProvider>
      );

      expect(html).toContain('Search expert or institution...');
      expect(html).toContain('All Specializations');
      expect(html).toContain('Prof. K. R. Ramanathan');
      expect(html).toContain('Prof. Sunita Deshmukh');
      expect(html).toContain('2 experts');
    });

    it('renders skeleton loading state when loading is true', () => {
      const html = renderToStaticMarkup(
        <ToastProvider>
          <ExpertPoolView
            experts={[]}
            loading={true}
            selectedRegion="ALL"
          />
        </ToastProvider>
      );

      expect(html).toContain('pulse');
    });
  });

  describe('EligibilityMatrixView', () => {
    it('renders case selector, date input, and domain selector', () => {
      const html = renderToStaticMarkup(
        <ToastProvider>
          <EligibilityMatrixView
            selectedRegion="ALL"
            initialCaseId="case-1"
          />
        </ToastProvider>
      );

      expect(html).toContain('Target Application Case');
      expect(html).toContain('Proposed Inspection Date');
      expect(html).toContain('Required Specialization');
    });
  });

  describe('ConstraintSchedulerView', () => {
    it('renders calendar matrix with date columns and optimize button', () => {
      const html = renderToStaticMarkup(
        <ToastProvider>
          <ConstraintSchedulerView
            cases={mockCases}
            selectedRegion="ALL"
          />
        </ToastProvider>
      );

      expect(html).toContain('Inspection Window: <strong>10 Nov 2026 – 20 Nov 2026</strong>');
      expect(html).toContain('OR-Tools CP-SAT Engine Active');
      expect(html).toContain('Optimize Schedule');
      expect(html).toContain('APP-2026-SRO-004');
      expect(html).toContain('National Polytechnic Institute');
    });

    it('renders optimization assignments and Chairman badge when result is provided', () => {
      const solverRes: ScheduleOptimizationResponse = {
        solverStatus: 'OPTIMAL',
        solveTimeMs: 94,
        totalCasesRequested: 1,
        totalCasesScheduled: 1,
        scheduledVisits: [
          {
            caseId: 'case-1',
            applicationNumber: 'APP-2026-SRO-004',
            institutionName: 'National Polytechnic Institute',
            inspectionDate: '2026-11-10',
            committeeMembers: [
              {
                expertId: 'exp-1',
                name: 'Prof. K. R. Ramanathan',
                domain: 'COMPUTER_SCIENCE',
                designation: 'Chair Professor',
                institution: 'IIT Madras',
                region: 'SRO',
                role: 'CHAIRMAN',
              },
            ],
          },
        ],
        unassignedCases: [],
        solverNotes: 'Optimal solution found.',
      };

      const html = renderToStaticMarkup(
        <ToastProvider>
          <ConstraintSchedulerView
            cases={mockCases}
            selectedRegion="ALL"
            initialResult={solverRes}
          />
        </ToastProvider>
      );

      expect(html).toContain('Optimization Run Completed');
      expect(html).toContain('CHAIR');
    });
  });

  describe('CaseExpertVisitCard', () => {
    it('renders scheduled committee details with Chairman badge for EVC_SCHEDULED case', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <CaseExpertVisitCard caseData={mockCaseDetail} />
        </MemoryRouter>
      );

      expect(html).toContain('Expert Visit Committee (EVC) Inspection');
      expect(html).toContain('EVC_SCHEDULED');
      expect(html).toContain('Confirmed On-Site Inspection Date: 12 November 2026');
      expect(html).toContain('CHAIRMAN');
      expect(html).toContain('Prof. K. R. Ramanathan');
    });

    it('renders pending scheduling prompt for EVC_PENDING case', () => {
      const pendingCase: CaseDetail = {
        ...mockCaseDetail,
        status: 'EVC_PENDING',
        readinessScore: 92,
      };

      const html = renderToStaticMarkup(
        <MemoryRouter>
          <CaseExpertVisitCard caseData={pendingCase} />
        </MemoryRouter>
      );

      expect(html).toContain('Application Ready for Committee Assignment');
      expect(html).toContain('Schedule Committee Now');
    });
  });

  describe('VisitsRoute Master Integration', () => {
    it('renders the 3 statutory tabs and expert pool directory', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <RegionProvider>
            <RoleProvider>
              <ToastProvider>
                <VisitsRoute />
              </ToastProvider>
            </RoleProvider>
          </RegionProvider>
        </MemoryRouter>
      );

      expect(html).toContain('Expert Visits &amp; Committee Scheduling');
      expect(html).toContain('Expert Pool Directory');
      expect(html).toContain('Eligibility &amp; Conflict Matrix');
      expect(html).toContain('Constraint Scheduler (OR-Tools)');
    });
  });
});
