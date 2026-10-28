import type { CaseDetail, CaseSummary, CaseStatus, DashboardSummary } from '../types/domain';

export type ClockState = 'overdue' | 'due_soon' | 'on_track' | 'none';
export type BallInCourt = 'college' | 'officer' | 'committee' | 'none';

export interface CaseDerivedState {
  id: string;
  applicationNumber: string;
  institutionCode: string;
  institutionName: string;
  region: string;
  status: CaseStatus;
  currentStage: string;
  readinessScore: number;
  nextDeadline: string | null;
  nextDeadlineIst: string;
  clockState: ClockState;
  ballInCourt: BallInCourt;
  needsOfficerAction: boolean;
  why: string;
  earliestClockName: string;
  remainingHours: number;
  relativeTimeText: string;
  stageStep: number;
  stageName: string;
  hasDeficiencyWarning: boolean;
  isClosed: boolean;
  actionLabel: string;
}

/**
 * Maps a statutory CaseStatus to a 5-step pipeline stage:
 * 1. Intake & Registration
 * 2. Scrutiny Committee
 * 3. Institutional Deficiency Cure
 * 4. Expert Visit Committee (EVC)
 * 5. Final Decision
 */
export function getStageStep(status: CaseStatus): { step: number; name: string } {
  switch (status) {
    case 'DRAFT':
    case 'SUBMITTED':
      return { step: 1, name: 'Intake' };
    case 'UNDER_SCRUTINY':
      return { step: 2, name: 'Scrutiny' };
    case 'DEFICIENCY_FLAGGED':
    case 'DEFICIENCY_RESUBMITTED':
      return { step: 3, name: 'Cure' };
    case 'EVC_PENDING':
    case 'EVC_SCHEDULED':
    case 'EVC_COMPLETED':
      return { step: 4, name: 'EVC Visit' };
    case 'APPROVED':
    case 'REJECTED':
      return { step: 5, name: 'Decision' };
    default:
      return { step: 1, name: 'Intake' };
  }
}

/**
 * Pure single source of truth for case state calculation.
 */
export function deriveCaseState(c: CaseSummary | CaseDetail, referenceTime: number = Date.now()): CaseDerivedState {
  const isClosed = c.status === 'APPROVED' || c.status === 'REJECTED';
  const stageInfo = getStageStep(c.status);

  // Determine who has the ball in court
  let ballInCourt: BallInCourt = 'none';
  let needsOfficerAction = false;
  let why = '';
  let actionLabel = 'Review';
  let earliestClockName = 'Turnaround deadline';

  if (!isClosed) {
    switch (c.status) {
      case 'UNDER_SCRUTINY':
        ballInCourt = 'officer';
        needsOfficerAction = true;
        why = 'Verify statutory documentary compliance';
        actionLabel = 'Scrutinize';
        earliestClockName = 'Scrutiny deadline';
        break;
      case 'DEFICIENCY_FLAGGED':
        ballInCourt = 'college';
        needsOfficerAction = false;
        why = 'Waiting on college cure resubmission';
        actionLabel = 'View Deficiencies';
        earliestClockName = 'Cure response deadline';
        break;
      case 'DEFICIENCY_RESUBMITTED':
        ballInCourt = 'officer';
        needsOfficerAction = true;
        why = 'Review resubmitted cure documents';
        actionLabel = 'Verify Cure';
        earliestClockName = 'Verification deadline';
        break;
      case 'EVC_PENDING':
        ballInCourt = 'officer';
        needsOfficerAction = true;
        why = 'Form & lock expert visit committee';
        actionLabel = 'Schedule EVC';
        earliestClockName = 'Committee formation deadline';
        break;
      case 'EVC_SCHEDULED':
        ballInCourt = 'committee';
        needsOfficerAction = false;
        why = 'Waiting on expert committee on-site visit';
        actionLabel = 'View Inspection';
        earliestClockName = 'Visit execution deadline';
        break;
      case 'EVC_COMPLETED':
        ballInCourt = 'officer';
        needsOfficerAction = true;
        why = 'Prepare approval/rejection recommendation';
        actionLabel = 'Recommendation';
        earliestClockName = 'Decision deadline';
        break;
      case 'SUBMITTED':
      case 'DRAFT':
        ballInCourt = 'officer';
        needsOfficerAction = true;
        why = 'Assign scrutiny review officer';
        actionLabel = 'Assign';
        earliestClockName = 'Intake processing deadline';
        break;
    }
  } else {
    why = c.status === 'APPROVED' ? 'Statutory approval order issued' : 'Application rejected';
    actionLabel = 'View Order';
  }

  // Next deadline calculation
  let clockState: ClockState = 'none';
  let remainingHours = 0;
  let relativeTimeText = 'Completed';

  if (!isClosed && c.deadlineAt) {
    const deadlineMs = new Date(c.deadlineAt).getTime();
    const diffMs = deadlineMs - referenceTime;
    remainingHours = Math.round(diffMs / 3600000);

    if (diffMs < 0) {
      clockState = 'overdue';
      const overdueHours = Math.abs(remainingHours);
      const overdueDays = Math.floor(overdueHours / 24);
      const remHours = overdueHours % 24;
      relativeTimeText = overdueDays > 0 ? `Overdue by ${overdueDays}d ${remHours}h` : `Overdue by ${remHours}h`;
    } else if (remainingHours <= 48) {
      clockState = 'due_soon';
      relativeTimeText = `${remainingHours}h left`;
    } else {
      clockState = 'on_track';
      const days = Math.floor(remainingHours / 24);
      relativeTimeText = `${days}d left`;
    }
  }

  const institutionCode = 'institution' in c ? c.institution.code : c.institutionCode;
  const institutionName = 'institution' in c ? c.institution.name : c.institutionName;
  const region = 'institution' in c ? c.institution.region : c.region;

  return {
    id: c.id,
    applicationNumber: c.applicationNumber,
    institutionCode,
    institutionName,
    region,
    status: c.status,
    currentStage: c.currentStage,
    readinessScore: c.readinessScore,
    nextDeadline: c.deadlineAt,
    nextDeadlineIst: c.deadlineAtIst || (c.deadlineAt ? new Date(c.deadlineAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'None'),
    clockState,
    ballInCourt,
    needsOfficerAction,
    why,
    earliestClockName,
    remainingHours,
    relativeTimeText,
    stageStep: stageInfo.step,
    stageName: stageInfo.name,
    hasDeficiencyWarning: c.status === 'DEFICIENCY_FLAGGED' || c.status === 'DEFICIENCY_RESUBMITTED',
    isClosed,
    actionLabel,
  };
}

/**
 * Computes the unified summary metrics from a set of cases using deriveCaseState.
 */
export function computeUnifiedMetrics(cases: Array<CaseSummary | CaseDetail>, referenceTime: number = Date.now()) {
  const derived = cases.map(c => deriveCaseState(c, referenceTime));

  const totalColleges = cases.length;
  const closedCases = derived.filter(d => d.isClosed);
  const activeCases = derived.filter(d => !d.isClosed);

  const overdue = activeCases.filter(d => d.clockState === 'overdue');
  const dueSoon = activeCases.filter(d => d.clockState === 'due_soon');
  const onTrack = activeCases.filter(d => d.clockState === 'on_track');

  const waitingOnYou = activeCases.filter(d => d.needsOfficerAction);
  const waitingOnOthers = activeCases.filter(d => !d.needsOfficerAction);

  const approved = closedCases.filter(d => d.status === 'APPROVED');
  const rejected = closedCases.filter(d => d.status === 'REJECTED');
  const scheduledVisits = cases.filter(c => c.status === 'EVC_SCHEDULED');

  const averageReadiness = totalColleges > 0
    ? Math.round(cases.reduce((sum, c) => sum + c.readinessScore, 0) / totalColleges)
    : 0;

  return {
    counts: {
      total: totalColleges,
      active: activeCases.length,
      closed: closedCases.length,
      overdue: overdue.length,
      dueSoon: dueSoon.length,
      onTrack: onTrack.length,
      waitingOnYou: waitingOnYou.length,
      waitingOnOthers: waitingOnOthers.length,
      approved: approved.length,
      rejected: rejected.length,
      scheduledVisits: scheduledVisits.length,
      averageReadiness,
    },
    lists: {
      overdue,
      dueSoon,
      waitingOnYou,
      waitingOnOthers,
      allActive: activeCases,
      allClosed: closedCases,
    },
  };
}

/**
 * Dev-only consistency checker that asserts no two numbers disagree.
 * Returns an array of error messages (empty if completely consistent).
 */
export function verifyDataConsistency(
  cases: Array<CaseSummary | CaseDetail>,
  summary?: DashboardSummary,
  referenceTime: number = Date.now()
): string[] {
  const errors: string[] = [];
  const metrics = computeUnifiedMetrics(cases, referenceTime);

  // Rule 1: No closed case may be in waitingOnYou
  for (const c of metrics.lists.waitingOnYou) {
    if (c.isClosed) {
      errors.push(`Logic Error: Closed case ${c.applicationNumber} (${c.status}) is marked as needing officer action.`);
    }
  }

  // Rule 2: Active clocks sum must equal active cases
  const clockSum = metrics.counts.overdue + metrics.counts.dueSoon + metrics.counts.onTrack;
  if (clockSum !== metrics.counts.active) {
    errors.push(`Clock Error: Sum of clock states (${clockSum}) does not equal active cases count (${metrics.counts.active}).`);
  }

  // Rule 3: If a DashboardSummary is provided, ensure its clocks and KPIs match
  if (summary) {
    if (summary.kpiCards.totalColleges !== metrics.counts.total) {
      errors.push(`Dashboard mismatch: kpiCards.totalColleges (${summary.kpiCards.totalColleges}) !== cases.length (${metrics.counts.total})`);
    }
    if (summary.kpiCards.approvedCount !== metrics.counts.approved) {
      errors.push(`Dashboard mismatch: approvedCount (${summary.kpiCards.approvedCount}) !== derived approved (${metrics.counts.approved})`);
    }
    if (summary.kpiCards.rejectedCount !== metrics.counts.rejected) {
      errors.push(`Dashboard mismatch: rejectedCount (${summary.kpiCards.rejectedCount}) !== derived rejected (${metrics.counts.rejected})`);
    }
    if (summary.clocks.overdueBreached !== metrics.counts.overdue) {
      errors.push(`Clock mismatch: summary.clocks.overdueBreached (${summary.clocks.overdueBreached}) !== derived overdue (${metrics.counts.overdue})`);
    }
    if (summary.clocks.approachingDeadline !== metrics.counts.dueSoon) {
      errors.push(`Clock mismatch: summary.clocks.approachingDeadline (${summary.clocks.approachingDeadline}) !== derived dueSoon (${metrics.counts.dueSoon})`);
    }
  }

  return errors;
}
