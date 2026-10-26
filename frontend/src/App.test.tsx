import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from './components/common/Button';
import { StatusChip } from './components/common/StatusChip';
import { DeadlineChip } from './components/common/DeadlineChip';
import { ReadinessRing } from './components/common/ReadinessRing';
import { App } from './App';

describe('Phase 0 - Primitive Component Library', () => {
  it('renders button variants and handles loading and disabled states', () => {
    const primaryHtml = renderToStaticMarkup(<Button variant="primary">Proceed</Button>);
    expect(primaryHtml).toContain('Proceed');
    expect(primaryHtml).toContain('var(--accent)');

    const loadingHtml = renderToStaticMarkup(<Button isLoading>Saving</Button>);
    expect(loadingHtml).toContain('disabled=""');
  });

  it('renders status chips with appropriate labels and visual indicators', () => {
    const approvedHtml = renderToStaticMarkup(<StatusChip status="APPROVED" />);
    expect(approvedHtml).toContain('Approved');
    expect(approvedHtml).toContain('var(--status-ok-tint)');

    const flaggedHtml = renderToStaticMarkup(<StatusChip status="DEFICIENCY_FLAGGED" />);
    expect(flaggedHtml).toContain('Deficiency Flagged');
    expect(flaggedHtml).toContain('var(--status-bad-tint)');

    const scrutinyHtml = renderToStaticMarkup(<StatusChip status="UNDER_SCRUTINY" />);
    expect(scrutinyHtml).toContain('Under Scrutiny');
  });

  it('renders deadline chips switching colors across on-track, approaching, and overdue states', () => {
    const onTrack = renderToStaticMarkup(
      <DeadlineChip remainingBusinessDays={5} deadlineStatus="ON_TRACK" />
    );
    expect(onTrack).toContain('5d left');
    expect(onTrack).toContain('var(--status-ok-tint)');

    const approaching = renderToStaticMarkup(
      <DeadlineChip remainingHours={24} deadlineStatus="APPROACHING_DEADLINE" />
    );
    expect(approaching).toContain('24h left');
    expect(approaching).toContain('var(--status-warn-tint)');

    const overdue = renderToStaticMarkup(
      <DeadlineChip isOverdue={true} remainingHours={-72} deadlineStatus="OVERDUE" />
    );
    expect(overdue).toContain('3d overdue');
    expect(overdue).toContain('var(--status-bad-tint)');
  });

  it('renders readiness rings with score percentages and tier classifications', () => {
    const ringHtml = renderToStaticMarkup(<ReadinessRing score={92} size="md" />);
    expect(ringHtml).toContain('92');
    expect(ringHtml).toContain('Fully Compliant');

    const lowRingHtml = renderToStaticMarkup(<ReadinessRing score={35} size="md" />);
    expect(lowRingHtml).toContain('35');
    expect(lowRingHtml).toContain('Critical Deficit');
  });

  it('mounts the application shell and renders branding and navigation elements', () => {
    const appHtml = renderToStaticMarkup(<App />);
    expect(appHtml).toContain('AICTE Approval');
    expect(appHtml).toContain('Workflow Coordination');
    expect(appHtml).toContain('All Regions');
    expect(appHtml).toContain('Regional Officer');
  });
});
