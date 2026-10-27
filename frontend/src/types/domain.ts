// AICTE Approval Coordination - Domain Types & API Contracts

export type Region = 'WRO' | 'SRO' | 'NRO' | 'ERO' | 'CRO';

export type CaseStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_SCRUTINY'
  | 'DEFICIENCY_FLAGGED'
  | 'DEFICIENCY_RESUBMITTED'
  | 'EVC_PENDING'
  | 'EVC_SCHEDULED'
  | 'EVC_COMPLETED'
  | 'APPROVED'
  | 'REJECTED';

export type Role =
  | 'REGIONAL_OFFICER'
  | 'SCRUTINY_OFFICER'
  | 'INSTITUTION_ADMIN'
  | 'EVC_EXPERT';

export type NotificationType =
  | 'DEFICIENCY_NOTICE'
  | 'INSPECTION_APPOINTMENT'
  | 'DEADLINE_REMINDER'
  | 'ESCALATION';

export type NotificationPriority = 'NORMAL' | 'HIGH' | 'CRITICAL';

export type NotificationChannel = 'EMAIL' | 'SMS' | 'PORTAL_ALERT';

export interface ApiProblem {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  correlationId: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface DeadlineAnalysis {
  deadlineAt: string | null;
  deadlineAtIst: string | null;
  isOverdue: boolean;
  remainingHours: number;
  remainingBusinessDays: number;
  deadlineStatus: 'ON_TRACK' | 'APPROACHING_DEADLINE' | 'OVERDUE' | 'NO_DEADLINE';
}

export interface CaseSummary {
  id: string;
  applicationNumber: string;
  institutionCode: string;
  institutionName: string;
  institutionType: string;
  region: Region;
  academicYear: string;
  applicationType: string;
  status: CaseStatus;
  currentStage: string;
  readinessScore: number;
  assignedOfficer: string | null;
  deadlineAt: string | null;
  submittedAt: string;
  updatedAt: string;
  isOverdue: boolean;
  remainingHours: number;
  remainingBusinessDays: number;
  deadlineStatus: string;
  deadlineAtIst: string | null;
}

export interface CampusSummary {
  id: string;
  campusName: string;
  address: string;
  landAreaAcres: number;
  builtUpAreaSqM: number;
  landLeaseStatus: string;
  leaseExpiryDate: string | null;
}

export interface InstitutionDetail {
  id: string;
  code: string;
  name: string;
  institutionType: string;
  region: Region;
  address: string;
  establishedYear: number;
  contactEmail: string;
  campuses: CampusSummary[];
}

export interface DeficiencyDetail {
  id: string;
  category: string;
  description: string;
  status: 'OPEN' | 'RESUBMITTED' | 'RESOLVED';
  deadlineDays: number;
  flaggedAt: string;
  resolvedAt: string | null;
  resolutionComment: string | null;
  proofDocumentName: string | null;
  proofDocumentUrl: string | null;
}

export interface DocumentDetail {
  id: string;
  documentType: string;
  documentName: string;
  fileHash: string;
  verificationStatus: 'VERIFIED' | 'DEFICIENT' | 'EXPIRED' | 'REJECTED';
  validUntil: string | null;
  uploadedAt: string;
}

export interface CaseDetail {
  id: string;
  applicationNumber: string;
  academicYear: string;
  applicationType: string;
  status: CaseStatus;
  currentStage: string;
  readinessScore: number;
  assignedOfficer: string | null;
  deadlineAt: string | null;
  submittedAt: string;
  updatedAt: string;
  isOverdue: boolean;
  remainingHours: number;
  remainingBusinessDays: number;
  deadlineStatus: string;
  deadlineAtIst: string | null;
  institution: InstitutionDetail;
  deficiencies: DeficiencyDetail[];
  documents: DocumentDetail[];
}

export interface ReadinessCriteria {
  criteriaKey?: string;
  category?: string;
  scorePercentage: number;
  maxPoints: number;
  earnedPoints: number;
  status: 'PASSED' | 'WARNING' | 'FAILED' | string;
  details: string;
}

export interface BlockingPrerequisite {
  id?: string;
  code?: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | string;
  description: string;
  remedyAction?: string;
  resolutionGuide?: string;
}

export interface RecoveryAction {
  priority: number;
  actionCode?: string;
  actionType?: string;
  description: string;
  assignedRole?: string;
  targetRole?: string;
  targetEndpoint: string;
}

export interface CaseReadinessResponse {
  caseId: string;
  applicationNumber: string;
  institutionName: string;
  currentStatus: string;
  currentStage: string;
  readinessScore: number;
  readinessTier: 'FULLY_COMPLIANT' | 'NEAR_READY' | 'NEEDS_ATTENTION' | 'CRITICAL_DEFICIT';
  readyForNextStage: boolean;
  nextRecommendedStage?: string;
  criteria: ReadinessCriteria[];
  blockingPrerequisites: BlockingPrerequisite[];
  recommendedActions: RecoveryAction[];
  recommendedNextActions?: RecoveryAction[];
  evaluatedAt?: string;
  calculatedAt?: string;
}

export interface TimelineMilestone {
  id?: string;
  name?: string;
  milestoneKey?: string;
  milestoneTitle?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'WARNING' | 'PENDING' | 'FAILED' | string;
  description: string;
  completedAt: string | null;
}

export interface TimelineEvent {
  id?: string;
  eventId?: string;
  eventType: string;
  category: string;
  title: string;
  description?: string;
  summary?: string;
  actorRole: string;
  actorId?: string;
  actorName?: string;
  previousState: string | null;
  newState: string | null;
  badgeColor?: string;
  iconName?: string;
  icon?: string;
  correlationId?: string;
  timestamp: string;
  formattedTimestamp?: string;
  formattedIstTime?: string;
  timeAgo?: string;
}

export interface CaseTimelineResponse {
  caseId: string;
  applicationNumber: string;
  institutionName: string;
  currentStatus?: string;
  status?: string;
  currentStage: string;
  eventCount?: number;
  totalEvents?: number;
  milestones: TimelineMilestone[];
  events: TimelineEvent[];
  generatedAt: string;
}

export interface AuditEventRecord {
  id: string;
  caseId?: string;
  action: string;
  actorRole?: string;
  actorId?: string;
  actor?: string;
  role?: string;
  previousState?: string | null;
  newState?: string | null;
  previousStatus?: string | null;
  newStatus?: string | null;
  details?: string;
  rationale?: string;
  correlationId?: string;
  createdAt?: string;
  timestamp?: string;
}

export interface ExpertDetail {
  id: string;
  name: string;
  email: string;
  designation: string;
  domain: string;
  affiliatedInstitution: string;
  region: Region;
  conflictInstitutions: string[] | string;
  availableDates: string[];
  maxAssignments: number;
  active: boolean;
}

export interface ExpertEligibilityResult {
  id?: string;
  expertId?: string;
  name: string;
  domain: string;
  affiliatedInstitution: string;
  region: Region;
  eligible: boolean;
  eligibilityReason: string;
}

export interface EligibleExpertsResponse {
  caseId: string;
  applicationNumber: string;
  institutionName: string;
  targetDate: string | null;
  requiredDomain: string | null;
  eligibleCount: number;
  ineligibleCount: number;
  eligibleExperts: ExpertEligibilityResult[];
  ineligibleExperts: ExpertEligibilityResult[];
}

export interface ScheduledCommitteeMember {
  expertId: string;
  name: string;
  domain: string;
  designation: string;
  institution?: string;
  affiliatedInstitution?: string;
  region: Region;
  role: 'CHAIRMAN' | 'MEMBER' | string;
}

export interface ScheduledVisitAssignment {
  caseId: string;
  applicationNumber: string;
  institutionName: string;
  region?: Region;
  institutionRegion?: Region;
  inspectionDate?: string;
  scheduledInspectionDate?: string;
  committeeMembers: ScheduledCommitteeMember[];
}

export interface ScheduleOptimizationResponse {
  solverStatus: string;
  solveDurationMs?: number;
  solveTimeMs?: number;
  totalCasesEvaluated?: number;
  totalCasesRequested?: number;
  totalVisitsScheduled?: number;
  totalCasesScheduled?: number;
  scheduledVisits: ScheduledVisitAssignment[];
  unassignedCases: Array<{ caseId: string; applicationNumber: string; reason: string }>;
  solverNotes: string;
}

export interface NotificationRecord {
  id: string;
  caseId: string | null;
  applicationNumber: string | null;
  institutionId: string | null;
  institutionName: string | null;
  recipientRole: Role;
  recipientContact: string;
  channel: NotificationChannel;
  notificationType: NotificationType;
  title: string;
  content: string;
  priority: NotificationPriority;
  status: string;
  isRead: boolean;
  readAt: string | null;
  metadataJson: string | null;
  createdAt: string;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  escalations: number;
  deficiencyNotices: number;
  inspectionAppointments: number;
}

export interface ExecutiveKpiCards {
  totalColleges: number;
  pendingScrutiny: number;
  openDeficiencies: number;
  scheduledInspections: number;
  approvedCount: number;
  rejectedCount: number;
  criticalEscalations: number;
  averageReadinessScore: number;
}

export interface ComplianceOverview {
  totalCases: number;
  cleanCases: number;
  deficiencyFlaggedCases: number;
  deficiencyResubmittedCases: number;
  totalOpenDeficiencies: number;
  totalResolvedDeficiencies: number;
  overallComplianceRate: number;
}

export interface EvcOverview {
  pendingScheduling: number;
  scheduledVisits: number;
  completedVisits: number;
  totalActiveExperts: number;
  defaultCommitteeSize: number;
}

export interface RegulatoryClockOverview {
  onTrack: number;
  approachingDeadline: number;
  overdueBreached: number;
  totalEscalationsDispatched: number;
}

export interface DashboardSummary {
  academicYear: string;
  filteredRegion: Region | null;
  kpiCards: ExecutiveKpiCards;
  compliance: ComplianceOverview;
  evc: EvcOverview;
  clocks: RegulatoryClockOverview;
  statusDistribution: Record<string, number>;
  regionalDistribution: Record<string, number>;
  generatedAt: string;
}

export type SyncOutcome = 'INGESTED' | 'DUPLICATE_SKIPPED' | 'VALIDATION_FAILED';

export interface PortalSyncReceipt {
  receiptId: string;
  externalApplicationId: string;
  caseId: string | null;
  applicationNumber: string | null;
  outcome: SyncOutcome;
  message: string;
  correlationId: string;
  syncedAt: string;
}

export interface IntegrationStatus {
  connected: boolean;
  sourcePortal?: string;
  sourceSystemName?: string;
  totalSyncCount?: number;
  totalSyncedCases?: number;
  totalIngestedCount?: number;
  ingestedCount?: number;
  lastSyncAt?: string | null;
  lastSuccessfulSyncAt?: string | null;
}
