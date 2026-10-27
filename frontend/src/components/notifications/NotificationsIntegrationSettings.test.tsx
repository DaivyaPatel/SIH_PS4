import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { NotificationItem } from './NotificationItem';
import { NotificationEscalationBanner } from './NotificationEscalationBanner';
import { NotificationFilterBar } from './NotificationFilterBar';
import { NotificationsRoute } from '../../routes/NotificationsRoute';
import { IntegrationHealthCard } from '../integration/IntegrationHealthCard';
import { SimulateSyncModal } from '../integration/SimulateSyncModal';
import { SyncReceiptsTable } from '../integration/SyncReceiptsTable';
import { IntegrationRoute } from '../../routes/IntegrationRoute';
import { SettingsRoute } from '../../routes/SettingsRoute';
import { ToastProvider } from '../../context/ToastContext';
import { RoleProvider } from '../../context/RoleContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { RegionProvider } from '../../context/RegionContext';
import type {
  NotificationRecord,
  NotificationSummary,
  IntegrationStatus,
  PortalSyncReceipt,
} from '../../types/domain';

const mockNotifications: NotificationRecord[] = [
  {
    id: 'notif-1',
    caseId: 'case-101',
    applicationNumber: 'APP-2026-WRO-101',
    institutionId: 'inst-1',
    institutionName: 'Saraswati Institute of Technology',
    recipientRole: 'REGIONAL_OFFICER',
    recipientContact: 'ro.wro@aicte-india.org',
    channel: 'PORTAL_ALERT',
    notificationType: 'ESCALATION',
    title: 'Statutory Scrutiny SLA Overdue Breached',
    content: 'Case APP-2026-WRO-101 has exceeded statutory 15-day scrutiny timeline.',
    priority: 'CRITICAL',
    status: 'ACTIVE',
    isRead: false,
    readAt: null,
    metadataJson: null,
    createdAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'notif-2',
    caseId: 'case-102',
    applicationNumber: 'APP-2026-SRO-002',
    institutionId: 'inst-2',
    institutionName: 'Madras Polytechnic Institute',
    recipientRole: 'INSTITUTION_ADMIN',
    recipientContact: 'principal@madras-poly.edu.in',
    channel: 'EMAIL',
    notificationType: 'DEFICIENCY_NOTICE',
    title: 'Statutory Deficiencies Flagged in Document Review',
    content: 'Fire Safety NOC is deficient. Cure period of 15 days is active.',
    priority: 'HIGH',
    status: 'ACTIVE',
    isRead: false,
    readAt: null,
    metadataJson: null,
    createdAt: '2026-10-21T14:30:00Z',
  },
  {
    id: 'notif-3',
    caseId: 'case-103',
    applicationNumber: 'APP-2026-NRO-003',
    institutionId: 'inst-3',
    institutionName: 'Delhi Institute of Engineering',
    recipientRole: 'EVC_EXPERT',
    recipientContact: 'expert.raman@iitm.ac.in',
    channel: 'SMS',
    notificationType: 'INSPECTION_APPOINTMENT',
    title: 'Expert Committee Scheduled for On-Site Inspection',
    content: 'You have been assigned as Member for physical verification on 12 Nov 2026.',
    priority: 'NORMAL',
    status: 'ACTIVE',
    isRead: true,
    readAt: '2026-10-22T09:00:00Z',
    metadataJson: null,
    createdAt: '2026-10-22T08:00:00Z',
  },
];

const mockNotificationSummary: NotificationSummary = {
  total: 3,
  unread: 2,
  escalations: 1,
  deficiencyNotices: 1,
  inspectionAppointments: 1,
};

const mockIntegrationStatus: IntegrationStatus = {
  connected: true,
  sourcePortal: 'AICTE National Approval Portal Connector',
  totalSyncCount: 148,
  totalIngestedCount: 132,
  lastSyncAt: '2026-10-27T12:00:00Z',
};

const mockReceipts: PortalSyncReceipt[] = [
  {
    receiptId: 'rec-001',
    externalApplicationId: 'APP-2026-WRO-001',
    caseId: 'case-1',
    applicationNumber: 'APP-2026-WRO-001',
    outcome: 'DUPLICATE_SKIPPED',
    message: 'Application already ingested and active.',
    correlationId: 'corr-001',
    syncedAt: '2026-10-27T10:00:00Z',
  },
  {
    receiptId: 'rec-002',
    externalApplicationId: 'APP-2026-ERO-006',
    caseId: 'case-6',
    applicationNumber: 'APP-2026-ERO-006',
    outcome: 'INGESTED',
    message: 'Successfully ingested into workflow pipeline.',
    correlationId: 'corr-002',
    syncedAt: '2026-10-27T11:30:00Z',
  },
];

// Mock API
vi.mock('../../lib/api', () => ({
  getNotifications: vi.fn().mockImplementation(() => Promise.resolve(mockNotifications)),
  getNotificationSummary: vi.fn().mockImplementation(() => Promise.resolve(mockNotificationSummary)),
  markNotificationAsRead: vi.fn().mockResolvedValue({ id: 'notif-1', isRead: true }),
  runEscalationCheck: vi.fn().mockResolvedValue({ status: 'COMPLETED', escalationsFound: 1 }),
  getIntegrationStatus: vi.fn().mockImplementation(() => Promise.resolve(mockIntegrationStatus)),
  syncPortal: vi.fn().mockImplementation(() =>
    Promise.resolve({
      receiptId: 'rec-sim-101',
      externalApplicationId: 'APP-2026-ERO-006',
      caseId: 'case-sim',
      applicationNumber: 'APP-2026-ERO-006',
      outcome: 'INGESTED',
      message: 'Simulated case ingested successfully.',
      correlationId: 'corr-sim-101',
      syncedAt: '2026-10-27T12:00:00Z',
    })
  ),
}));

vi.mock('../../api/client', () => ({
  getPlatformStatus: vi.fn().mockResolvedValue({
    environment: 'development',
    version: '1.0.0',
    timestamp: '2026-10-27T12:00:00Z',
  }),
}));

describe('Phase 6: Notifications, Integration & Preferences', () => {
  describe('Notification Components', () => {
    it('NotificationItem renders priority, type, role, channel, and case link', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <NotificationItem
            notification={mockNotifications[0]}
            onMarkAsRead={() => {}}
          />
        </MemoryRouter>
      );

      expect(html).toContain('CRITICAL');
      expect(html).toContain('ESCALATION');
      expect(html).toContain('PORTAL_ALERT');
      expect(html).toContain('To: REGIONAL OFFICER');
      expect(html).toContain('Statutory Scrutiny SLA Overdue Breached');
      expect(html).toContain('APP-2026-WRO-101');
      expect(html).toContain('Saraswati Institute of Technology');
      expect(html).toContain('Mark read');
    });

    it('NotificationEscalationBanner renders critical count and action required badge', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <NotificationEscalationBanner
            escalations={[mockNotifications[0]]}
            onMarkAsRead={() => {}}
          />
        </MemoryRouter>
      );

      expect(html).toContain('Statutory Regulatory Escalations (1)');
      expect(html).toContain('ACTION REQUIRED');
      expect(html).toContain('Inspect SLA &amp; Case');
      expect(html).toContain('Acknowledge');
    });

    it('NotificationFilterBar renders search input and filter selects', () => {
      const html = renderToStaticMarkup(
        <NotificationFilterBar
          searchQuery=""
          onSearchChange={() => {}}
          selectedType="ALL"
          onTypeChange={() => {}}
          selectedPriority="ALL"
          onPriorityChange={() => {}}
          selectedReadState="ALL"
          onReadStateChange={() => {}}
          selectedRole="ALL"
          onRoleChange={() => {}}
          onReset={() => {}}
          totalFiltered={12}
        />
      );

      expect(html).toContain('Search notices, application numbers, or institutions…');
      expect(html).toContain('All Notice Types');
      expect(html).toContain('All Priorities');
      expect(html).toContain('All Read States');
      expect(html).toContain('All Recipient Roles');
      expect(html).toContain('Showing <strong>12</strong> notifications');
    });

    it('NotificationsRoute renders summary strip, escalation banner, and notification items', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <ToastProvider>
            <NotificationsRoute />
          </ToastProvider>
        </MemoryRouter>
      );

      expect(html).toContain('Notifications &amp; Escalations');
      expect(html).toContain('Scan Escalations');
      expect(html).toContain('Mark all read');
    });
  });

  describe('Integration Components', () => {
    it('IntegrationHealthCard renders active listener, heartbeat, and 4 metrics', () => {
      const html = renderToStaticMarkup(
        <IntegrationHealthCard
          status={mockIntegrationStatus}
          onRefresh={() => {}}
          onOpenSimulateModal={() => {}}
        />
      );

      expect(html).toContain('ONLINE · ACTIVE LISTENER');
      expect(html).toContain('AICTE National Approval Portal Connector');
      expect(html).toContain('Total Synced Payloads');
      expect(html).toContain('148');
      expect(html).toContain('Ingested Cases');
      expect(html).toContain('132');
      expect(html).toContain('Duplicates Skipped');
      expect(html).toContain('16');
      expect(html).toContain('Simulate Portal Ingestion');
    });

    it('SimulateSyncModal renders test scenarios and form inputs', () => {
      const html = renderToStaticMarkup(
        <SimulateSyncModal
          isOpen={true}
          onClose={() => {}}
          onSuccess={() => {}}
        />
      );

      expect(html).toContain('Simulate National Approval Portal Ingestion');
      expect(html).toContain('Fresh Application');
      expect(html).toContain('Duplicate Case');
      expect(html).toContain('Custom Payload');
      expect(html).toContain('External Application ID');
      expect(html).toContain('AICTE Institution Code');
      expect(html).toContain('Execute Sync Payload');
    });

    it('SyncReceiptsTable renders receipts history with outcome chips and case links', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <SyncReceiptsTable receipts={mockReceipts} />
        </MemoryRouter>
      );

      expect(html).toContain('National Portal Ingestion Receipts');
      expect(html).toContain('APP-2026-WRO-001');
      expect(html).toContain('DUPLICATE SKIPPED');
      expect(html).toContain('APP-2026-ERO-006');
      expect(html).toContain('INGESTED');
      expect(html).toContain('corr-001');
    });

    it('IntegrationRoute renders complete integration management view', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <ToastProvider>
            <IntegrationRoute />
          </ToastProvider>
        </MemoryRouter>
      );

      expect(html).toContain('National Approval Portal Integration');
    });
  });

  describe('Settings & Preferences', () => {
    it('SettingsRoute renders theme toggle, density switcher, role persona, and shortcuts', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <ThemeProvider>
            <RoleProvider>
              <RegionProvider>
                <ToastProvider>
                  <SettingsRoute />
                </ToastProvider>
              </RegionProvider>
            </RoleProvider>
          </ThemeProvider>
        </MemoryRouter>
      );

      expect(html).toContain('Settings &amp; Workspace Preferences');
      expect(html).toContain('Appearance &amp; Interface Theme');
      expect(html).toContain('Light Theme');
      expect(html).toContain('Dark Theme');
      expect(html).toContain('Workspace Display Density');
      expect(html).toContain('Compact');
      expect(html).toContain('Comfortable');
      expect(html).toContain('Spacious');
      expect(html).toContain('Active Role Persona Context');
      expect(html).toContain('Regional Officer (RO)');
      expect(html).toContain('Scrutiny Officer');
      expect(html).toContain('Statutory Notification Channels');
      expect(html).toContain('Portal In-App Alerts');
      expect(html).toContain('Keyboard Shortcuts Reference');
      expect(html).toContain('⌘K / Ctrl+K');
      expect(html).toContain('AICTE Approval Process Handbook (APH 2026-27) SLA Norms');
    });
  });
});
