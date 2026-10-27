import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { CommandPalette } from './CommandPalette';
import { ThemeProvider } from '../../context/ThemeContext';
import { RoleProvider } from '../../context/RoleContext';
import { ToastProvider } from '../../context/ToastContext';

vi.mock('../../lib/api', () => ({
  getCases: vi.fn().mockResolvedValue([
    {
      id: 'case-test-1',
      applicationNumber: 'APP-2026-WRO-001',
      institutionName: 'College of Engineering Pune',
      institutionCode: '1-1029384756',
      region: 'WRO',
      status: 'UNDER_SCRUTINY',
      currentStage: 'DOCUMENT_SCRUTINY',
      readinessScore: 82,
    },
  ]),
  runEscalationCheck: vi.fn().mockResolvedValue({ status: 'OK' }),
}));

describe('CommandPalette Component', () => {
  it('returns null when isOpen is false', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ThemeProvider>
          <RoleProvider>
            <ToastProvider>
              <CommandPalette isOpen={false} onClose={() => {}} />
            </ToastProvider>
          </RoleProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(html).not.toContain('aria-label="Global Command Palette"');
  });

  it('renders modal dialog, search input, and command groups when isOpen is true', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ThemeProvider>
          <RoleProvider>
            <ToastProvider>
              <CommandPalette isOpen={true} onClose={() => {}} />
            </ToastProvider>
          </RoleProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(html).toContain('aria-label="Global Command Palette"');
    expect(html).toContain('Type a command, application number, or institution name…');
    expect(html).toContain('Go to Executive Dashboard');
    expect(html).toContain('Explore Cases Directory');
    expect(html).toContain('Open Deficiencies Workspace');
    expect(html).toContain('Committee Scheduling &amp; Expert Visits');
    expect(html).toContain('Notifications &amp; Statutory Escalations');
    expect(html).toContain('National Portal Integration Gateway');
    expect(html).toContain('Workspace Preferences &amp; Shortcuts');
    expect(html).toContain('Switch Role to Regional Officer (RO)');
    expect(html).toContain('Switch Role to Scrutiny Officer');
    expect(html).toContain('AICTE Universal Governance Palette');
  });
});
