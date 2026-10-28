import { describe, expect, it } from 'vitest';
import { DEMO_CASES, buildDashboardSummary } from '../mock/demoData';
import { deriveCaseState, computeUnifiedMetrics, verifyDataConsistency } from './caseLogic';

describe('Case Logic & Consistency Specification (Officer-Grade)', () => {
  it('correctly classifies ball in court and officer action requirement', () => {
    const states = DEMO_CASES.map(c => deriveCaseState(c));

    // NRO-005 (Approved): closed, no action
    const approvedCase = states.find(s => s.applicationNumber === 'APP-2026-NRO-005')!;
    expect(approvedCase.isClosed).toBe(true);
    expect(approvedCase.clockState).toBe('none');
    expect(approvedCase.needsOfficerAction).toBe(false);
    expect(approvedCase.ballInCourt).toBe('none');

    // WRO-002 (Deficiency flagged): waiting on college
    const defCase = states.find(s => s.applicationNumber === 'APP-2026-WRO-002')!;
    expect(defCase.isClosed).toBe(false);
    expect(defCase.ballInCourt).toBe('college');
    expect(defCase.needsOfficerAction).toBe(false);
    expect(defCase.clockState).toBe('on_track'); // 96h > 48h

    // SRO-003 (Under scrutiny): waiting on officer
    const scrutinyCase = states.find(s => s.applicationNumber === 'APP-2026-SRO-003')!;
    expect(scrutinyCase.isClosed).toBe(false);
    expect(scrutinyCase.ballInCourt).toBe('officer');
    expect(scrutinyCase.needsOfficerAction).toBe(true);
    expect(scrutinyCase.actionLabel).toBe('Scrutinize');

    // SRO-004 (EVC scheduled): waiting on committee
    const evcSchedCase = states.find(s => s.applicationNumber === 'APP-2026-SRO-004')!;
    expect(evcSchedCase.isClosed).toBe(false);
    expect(evcSchedCase.ballInCourt).toBe('committee');
    expect(evcSchedCase.needsOfficerAction).toBe(false);

    // WRO-001 (EVC pending): waiting on officer to schedule
    const evcPendingCase = states.find(s => s.applicationNumber === 'APP-2026-WRO-001')!;
    expect(evcPendingCase.isClosed).toBe(false);
    expect(evcPendingCase.ballInCourt).toBe('officer');
    expect(evcPendingCase.needsOfficerAction).toBe(true);
    expect(evcPendingCase.actionLabel).toBe('Schedule EVC');
  });

  it('ensures no two numbers disagree across cases and dashboard summary', () => {
    const summary = buildDashboardSummary(DEMO_CASES);
    const errors = verifyDataConsistency(DEMO_CASES, summary);
    expect(errors).toEqual([]);

    const metrics = computeUnifiedMetrics(DEMO_CASES);
    expect(metrics.counts.total).toBe(5);
    expect(metrics.counts.active).toBe(4);
    expect(metrics.counts.closed).toBe(1);
    expect(metrics.counts.approved).toBe(1);
    expect(metrics.counts.rejected).toBe(0);
    expect(metrics.counts.overdue).toBe(0);
    expect(metrics.counts.dueSoon).toBe(0);
    expect(metrics.counts.onTrack).toBe(4);
    expect(metrics.counts.waitingOnYou).toBe(2);
    expect(metrics.counts.waitingOnOthers).toBe(2);
  });

  it('correctly sorts action cases by urgency: SRO-003 (8d) before WRO-001 (14d)', () => {
    const metrics = computeUnifiedMetrics(DEMO_CASES);
    const sorted = [...metrics.lists.waitingOnYou].sort((a, b) => {
      if (a.clockState === 'overdue' && b.clockState !== 'overdue') return -1;
      if (b.clockState === 'overdue' && a.clockState !== 'overdue') return 1;
      return a.remainingHours - b.remainingHours;
    });

    expect(sorted.length).toBe(2);
    expect(sorted[0].applicationNumber).toBe('APP-2026-SRO-003');
    expect(sorted[1].applicationNumber).toBe('APP-2026-WRO-001');
  });
});
