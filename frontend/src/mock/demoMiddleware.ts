import type { ServerResponse } from 'node:http';
import type { Connect } from 'vite';
import {
  DEMO_CASES,
  DEMO_EXPERTS,
  DEMO_NOTIFICATIONS,
  toCaseSummary,
  buildDashboardSummary,
} from './demoData';
import type {
  CaseDetail,
  ExpertDetail,
  NotificationRecord,
  PortalSyncReceipt,
  AuditEventRecord,
} from '../types/domain';

// Mutable in-memory state for interactive demo experience
const cases: CaseDetail[] = JSON.parse(JSON.stringify(DEMO_CASES));
const experts: ExpertDetail[] = JSON.parse(JSON.stringify(DEMO_EXPERTS));
const notifications: NotificationRecord[] = JSON.parse(JSON.stringify(DEMO_NOTIFICATIONS));
let syncCount = 148;
let ingestedCount = 132;

const auditEventsMap: Record<string, AuditEventRecord[]> = {
  '33333333-3333-3333-3333-333333333001': [
    {
      id: 'aud-101',
      actor: 'Dr. S. K. Joshi',
      role: 'SCRUTINY_OFFICER',
      action: 'SCRUTINY_PASS',
      details: 'All mandatory land and fire documents verified compliant with APH Section 6 norms.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'aud-102',
      actor: 'National Approval Portal Ingestion',
      role: 'SYSTEM',
      action: 'CASE_INGESTED',
      details: 'Application submitted and validated against schema.',
      timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ],
  '33333333-3333-3333-3333-333333333002': [
    {
      id: 'aud-201',
      actor: 'Dr. S. K. Joshi',
      role: 'SCRUTINY_OFFICER',
      action: 'DEFICIENCY_FLAGGED',
      details: 'Flagged 2 statutory documentary deficiencies (Lease validity < 3 yrs, Expired Fire NOC).',
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ],
};

interface DemoBodyPayload {
  action?: string;
  extensionDays?: number;
  category?: string;
  description?: string;
  deadlineDays?: number;
  proofDocumentName?: string;
  resolutionComment?: string;
  externalApplicationId?: string;
  [key: string]: unknown;
}

function readBody(req: Connect.IncomingMessage): Promise<DemoBodyPayload> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) as DemoBodyPayload : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export function demoMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = new URL(req.url || '', 'http://127.0.0.1:5173');
    const pathname = url.pathname;
    const method = req.method || 'GET';

    if (!pathname.startsWith('/api/v1/')) {
      return next();
    }

    // 1. Platform status
    if (pathname === '/api/v1/platform' && method === 'GET') {
      return sendJson(res, 200, {
        name: 'AICTE Approval Coordination Service',
        environment: 'development',
        synthetic: true,
        identityIntegrated: true,
        hostConnected: true,
        notificationsEnabled: true,
      });
    }

    // 2. Dashboard summary
    if (pathname === '/api/v1/dashboard/summary' && method === 'GET') {
      const region = url.searchParams.get('region');
      const filtered = region && region !== 'ALL'
        ? cases.filter(c => c.institution.region === region)
        : cases;
      return sendJson(res, 200, buildDashboardSummary(filtered));
    }

    // 3. Cases list
    if (pathname === '/api/v1/cases' && method === 'GET') {
      const statusParam = url.searchParams.get('status');
      const regionParam = url.searchParams.get('region');
      let filtered = cases;
      if (statusParam && statusParam !== 'ALL') {
        filtered = filtered.filter(c => c.status === statusParam);
      }
      if (regionParam && regionParam !== 'ALL') {
        filtered = filtered.filter(c => c.institution.region === regionParam);
      }
      return sendJson(res, 200, filtered.map(toCaseSummary));
    }

    // 4. Case detail: /api/v1/cases/:id
    const caseMatch = pathname.match(/^\/api\/v1\/cases\/([a-zA-Z0-9-]+)$/);
    if (caseMatch && method === 'GET') {
      const caseId = caseMatch[1];
      const found = cases.find(c => c.id === caseId || c.applicationNumber === caseId);
      if (!found) {
        return sendJson(res, 404, { title: 'Case Not Found', detail: `Case ${caseId} does not exist.` });
      }
      return sendJson(res, 200, found);
    }

    // 5. Case readiness: /api/v1/cases/:id/readiness
    const readinessMatch = pathname.match(/^\/api\/v1\/cases\/([a-zA-Z0-9-]+)\/readiness$/);
    if (readinessMatch && method === 'GET') {
      const caseId = readinessMatch[1];
      const found = cases.find(c => c.id === caseId);
      const isDeficient = found?.deficiencies.some(d => d.status === 'OPEN');

      return sendJson(res, 200, {
        overallScore: found?.readinessScore ?? 75,
        criteria: [
          {
            criteriaKey: 'DOCUMENTS',
            category: 'Statutory Documentation',
            scorePercentage: isDeficient ? 50 : 100,
            maxPoints: 35,
            earnedPoints: isDeficient ? 17 : 35,
            status: isDeficient ? 'WARNING' : 'PASSED',
            details: isDeficient ? 'Documentary non-compliances flagged' : 'All mandatory deeds verified',
          },
          {
            criteriaKey: 'DEFICIENCIES',
            category: 'Deficiency Clearance',
            scorePercentage: isDeficient ? 20 : 100,
            maxPoints: 35,
            earnedPoints: isDeficient ? 7 : 35,
            status: isDeficient ? 'FAILED' : 'PASSED',
            details: isDeficient ? `${found?.deficiencies.length} unresolved deficiency items` : '100% Deficiencies Resolved',
          },
          {
            criteriaKey: 'COMMITTEE',
            category: 'EVC Committee Formation',
            scorePercentage: found?.status === 'EVC_SCHEDULED' ? 100 : 70,
            maxPoints: 20,
            earnedPoints: found?.status === 'EVC_SCHEDULED' ? 20 : 14,
            status: 'PASSED',
            details: 'Eligible experts identified across domain & region',
          },
          {
            criteriaKey: 'DEADLINES',
            category: 'Statutory SLA Timeline',
            scorePercentage: 90,
            maxPoints: 10,
            earnedPoints: 9,
            status: 'PASSED',
            details: 'Within APH 15-day statutory window',
          },
        ],
        blockingPrerequisites: isDeficient
          ? [
              {
                id: 'blk-1',
                code: 'OPEN_DEFICIENCY',
                category: 'DOCUMENTARY_COMPLIANCE',
                severity: 'CRITICAL',
                description: 'Open deficiencies prevent progression to EVC scheduling or final decision.',
                remedyAction: 'Resolve all open deficiency notices in the Deficiencies tab.',
              },
            ]
          : [],
        recommendations: [
          'Verify land lease renewal status before next academic session.',
          'Schedule on-site peer inspection window during working hours.',
        ],
      });
    }

    // 6. Case timeline: /api/v1/cases/:id/timeline
    const timelineMatch = pathname.match(/^\/api\/v1\/cases\/([a-zA-Z0-9-]+)\/timeline$/);
    if (timelineMatch && method === 'GET') {
      const caseId = timelineMatch[1];
      const found = cases.find(c => c.id === caseId);

      return sendJson(res, 200, {
        milestones: [
          { milestoneCode: 'M1', title: 'Application Intake & Ingestion', status: 'COMPLETED', completedAt: found?.submittedAt },
          { milestoneCode: 'M2', title: 'Documentary Scrutiny Review', status: found?.status === 'UNDER_SCRUTINY' ? 'IN_PROGRESS' : 'COMPLETED', completedAt: found?.updatedAt },
          { milestoneCode: 'M3', title: 'Deficiency Cure Period', status: found?.status === 'DEFICIENCY_FLAGGED' ? 'IN_PROGRESS' : found?.status === 'DEFICIENCY_RESUBMITTED' ? 'IN_PROGRESS' : 'COMPLETED' },
          { milestoneCode: 'M4', title: 'Expert Committee Inspection', status: found?.status === 'EVC_SCHEDULED' ? 'IN_PROGRESS' : found?.status === 'APPROVED' ? 'COMPLETED' : 'UPCOMING' },
          { milestoneCode: 'M5', title: 'Final Statutory Approval Order', status: found?.status === 'APPROVED' ? 'COMPLETED' : 'UPCOMING' },
        ],
        events: [
          {
            id: 'evt-1',
            eventType: 'STAGE_ADVANCED',
            title: `Stage: ${found?.currentStage}`,
            description: `Current status is ${found?.status}.`,
            actor: found?.assignedOfficer || 'Regional Cell',
            timestamp: found?.updatedAt || new Date().toISOString(),
          },
        ],
      });
    }

    // 7. Case audit: /api/v1/cases/:id/audit
    const auditMatch = pathname.match(/^\/api\/v1\/cases\/([a-zA-Z0-9-]+)\/audit$/);
    if (auditMatch && method === 'GET') {
      const caseId = auditMatch[1];
      return sendJson(res, 200, auditEventsMap[caseId] || []);
    }

    // 8. Workflow transition: /api/v1/cases/:id/transition
    const transitionMatch = pathname.match(/^\/api\/v1\/cases\/([a-zA-Z0-9-]+)\/transition$/);
    if (transitionMatch && method === 'POST') {
      const caseId = transitionMatch[1];
      const body = await readBody(req);
      const found = cases.find(c => c.id === caseId);
      if (!found) return sendJson(res, 404, { detail: 'Case not found' });

      const targetAction = body.action || 'SCRUTINY_PASS';
      if (targetAction === 'SCRUTINY_PASS') {
        found.status = 'EVC_PENDING';
        found.currentStage = 'EVC_SCHEDULING';
      } else if (targetAction === 'RECOMMEND_APPROVAL') {
        found.status = 'APPROVED';
        found.currentStage = 'ORDER_ISSUED';
        found.readinessScore = 100;
      } else if (targetAction === 'RECOMMEND_REJECTION') {
        found.status = 'REJECTED';
        found.currentStage = 'REJECTED';
      }

      found.updatedAt = new Date().toISOString();
      return sendJson(res, 200, found);
    }

    // 9. Case deadline: /api/v1/cases/:id/deadline
    const deadlineMatch = pathname.match(/^\/api\/v1\/cases\/([a-zA-Z0-9-]+)\/deadline$/);
    if (deadlineMatch && method === 'GET') {
      const caseId = deadlineMatch[1];
      const found = cases.find(c => c.id === caseId);
      return sendJson(res, 200, {
        deadlineAt: found?.deadlineAt,
        deadlineAtIst: found?.deadlineAtIst,
        isOverdue: found?.isOverdue ?? false,
        remainingHours: found?.remainingHours ?? 120,
        remainingBusinessDays: found?.remainingBusinessDays ?? 5,
        deadlineStatus: found?.deadlineStatus ?? 'ON_TRACK',
      });
    }

    // 10. Extend deadline: /api/v1/cases/:id/deadline/extend
    const extendMatch = pathname.match(/^\/api\/v1\/cases\/([a-zA-Z0-9-]+)\/deadline\/extend$/);
    if (extendMatch && method === 'POST') {
      const caseId = extendMatch[1];
      const body = await readBody(req);
      const found = cases.find(c => c.id === caseId);
      if (found) {
        found.remainingHours += (body.extensionDays || 7) * 24;
        found.remainingBusinessDays += (body.extensionDays || 7);
        found.deadlineStatus = 'ON_TRACK';
        found.updatedAt = new Date().toISOString();
      }
      return sendJson(res, 200, { message: 'Statutory deadline extended.' });
    }

    // 11. Flag deficiency: /api/v1/cases/:id/deficiencies
    const flagDefMatch = pathname.match(/^\/api\/v1\/cases\/([a-zA-Z0-9-]+)\/deficiencies$/);
    if (flagDefMatch && method === 'POST') {
      const caseId = flagDefMatch[1];
      const body = await readBody(req);
      const found = cases.find(c => c.id === caseId);
      const newDef = {
        id: `def-${Date.now()}`,
        category: body.category || 'INFRASTRUCTURE',
        description: body.description || 'Statutory compliance deficiency flagged during inspection.',
        status: 'OPEN' as const,
        deadlineDays: body.deadlineDays || 15,
        flaggedAt: new Date().toISOString(),
        resolvedAt: null,
        resolutionComment: null,
        proofDocumentName: null,
        proofDocumentUrl: null,
      };

      if (found) {
        found.deficiencies.push(newDef);
        found.status = 'DEFICIENCY_FLAGGED';
        found.currentStage = 'DEFICIENCY_REVIEW';
        found.readinessScore = Math.max(30, found.readinessScore - 20);
        found.updatedAt = new Date().toISOString();
      }
      return sendJson(res, 200, newDef);
    }

    // 12. Respond to deficiency: /api/v1/cases/:id/deficiencies/:defId/respond
    const respondDefMatch = pathname.match(/^\/api\/v1\/cases\/([a-zA-Z0-9-]+)\/deficiencies\/([a-zA-Z0-9-]+)\/respond$/);
    if (respondDefMatch && method === 'POST') {
      const [, caseId, defId] = respondDefMatch;
      const body = await readBody(req);
      const found = cases.find(c => c.id === caseId);
      const def = found?.deficiencies.find(d => d.id === defId);
      if (def) {
        def.status = 'RESUBMITTED';
        def.proofDocumentName = body.proofDocumentName || 'compliance_proof.pdf';
        def.proofDocumentUrl = '/docs/compliance_proof.pdf';
        if (found) {
          found.status = 'DEFICIENCY_RESUBMITTED';
          found.updatedAt = new Date().toISOString();
        }
      }
      return sendJson(res, 200, def || {});
    }

    // 13. Resolve deficiency: /api/v1/cases/:id/deficiencies/:defId/resolve
    const resolveDefMatch = pathname.match(/^\/api\/v1\/cases\/([a-zA-Z0-9-]+)\/deficiencies\/([a-zA-Z0-9-]+)\/resolve$/);
    if (resolveDefMatch && method === 'POST') {
      const [, caseId, defId] = resolveDefMatch;
      const body = await readBody(req);
      const found = cases.find(c => c.id === caseId);
      const def = found?.deficiencies.find(d => d.id === defId);
      if (def) {
        def.status = 'RESOLVED';
        def.resolvedAt = new Date().toISOString();
        def.resolutionComment = body.resolutionComment || 'Rectification verified compliant.';

        const allResolved = found?.deficiencies.every(d => d.status === 'RESOLVED');
        if (allResolved && found) {
          found.status = 'EVC_PENDING';
          found.currentStage = 'EVC_SCHEDULING';
          found.readinessScore = 90;
        }
        if (found) found.updatedAt = new Date().toISOString();
      }
      return sendJson(res, 200, def || {});
    }

    // 14. Experts list: /api/v1/evc/experts
    if (pathname === '/api/v1/evc/experts' && method === 'GET') {
      const domain = url.searchParams.get('domain');
      const region = url.searchParams.get('region');
      let filtered = experts;
      if (domain && domain !== 'ALL') filtered = filtered.filter(e => e.domain === domain);
      if (region && region !== 'ALL') filtered = filtered.filter(e => e.region === region);
      return sendJson(res, 200, filtered);
    }

    // 15. Expert by ID: /api/v1/evc/experts/:id
    const expertMatch = pathname.match(/^\/api\/v1\/evc\/experts\/([a-zA-Z0-9-]+)$/);
    if (expertMatch && method === 'GET') {
      const expId = expertMatch[1];
      const found = experts.find(e => e.id === expId);
      if (!found) return sendJson(res, 404, { detail: 'Expert not found' });
      return sendJson(res, 200, found);
    }

    // 16. Eligible experts: /api/v1/evc/cases/:caseId/eligible-experts
    const eligMatch = pathname.match(/^\/api\/v1\/evc\/cases\/([a-zA-Z0-9-]+)\/eligible-experts$/);
    if (eligMatch && method === 'GET') {
      const caseId = eligMatch[1];
      const targetCase = cases.find(c => c.id === caseId);

      const eligible = experts.slice(0, 3).map(e => ({
        expertId: e.id,
        name: e.name,
        domain: e.domain,
        affiliatedInstitution: e.affiliatedInstitution,
        region: e.region,
        eligible: true,
        eligibilityReason: 'Domain matched, free of conflicts, available on inspection window.',
      }));

      const ineligible = experts.slice(3, 5).map(e => ({
        expertId: e.id,
        name: e.name,
        domain: e.domain,
        affiliatedInstitution: e.affiliatedInstitution,
        region: e.region,
        eligible: false,
        eligibilityReason: `APH Sec 4.2 Conflict: Affiliated with ${targetCase?.institution.name || 'target institution'}.`,
      }));

      return sendJson(res, 200, {
        caseId,
        applicationNumber: targetCase?.applicationNumber || 'APP-2026-WRO-001',
        institutionName: targetCase?.institution.name || 'Apex Institute',
        targetDate: '2026-11-12',
        requiredDomain: 'ENGINEERING',
        eligibleCount: eligible.length,
        ineligibleCount: ineligible.length,
        eligibleExperts: eligible,
        ineligibleExperts: ineligible,
      });
    }

    // 17. Schedule optimization: /api/v1/evc/optimize-schedule
    if (pathname === '/api/v1/evc/optimize-schedule' && method === 'POST') {
      return sendJson(res, 200, {
        solverStatus: 'OPTIMAL',
        solveTimeMs: 78,
        totalCasesRequested: 2,
        totalCasesScheduled: 2,
        scheduledVisits: [
          {
            caseId: '33333333-3333-3333-3333-333333333001',
            applicationNumber: 'APP-2026-WRO-001',
            institutionName: 'Apex Institute of Technology & Management',
            inspectionDate: '2026-11-12',
            committeeMembers: [
              {
                expertId: experts[0].id,
                name: experts[0].name,
                domain: experts[0].domain,
                affiliatedInstitution: experts[0].affiliatedInstitution,
                region: experts[0].region,
                role: 'CHAIRMAN',
              },
              {
                expertId: experts[1].id,
                name: experts[1].name,
                domain: experts[1].domain,
                affiliatedInstitution: experts[1].affiliatedInstitution,
                region: experts[1].region,
                role: 'MEMBER',
              },
            ],
          },
        ],
        unassignedCases: [],
        solverNotes: 'Google OR-Tools CP-SAT solver achieved optimal committee allocation with zero institutional conflicts.',
      });
    }

    // 18. Notifications list: /api/v1/notifications
    if (pathname === '/api/v1/notifications' && method === 'GET') {
      const type = url.searchParams.get('type');
      const role = url.searchParams.get('recipientRole');
      const isReadStr = url.searchParams.get('isRead');
      let filtered = notifications;
      if (type) filtered = filtered.filter(n => n.notificationType === type);
      if (role) filtered = filtered.filter(n => n.recipientRole === role);
      if (isReadStr !== null) filtered = filtered.filter(n => String(n.isRead) === isReadStr);
      return sendJson(res, 200, filtered);
    }

    // 19. Notification summary: /api/v1/notifications/summary
    if (pathname === '/api/v1/notifications/summary' && method === 'GET') {
      const unread = notifications.filter(n => !n.isRead).length;
      const escalations = notifications.filter(n => n.notificationType === 'ESCALATION').length;
      const defNotices = notifications.filter(n => n.notificationType === 'DEFICIENCY_NOTICE').length;
      const appointments = notifications.filter(n => n.notificationType === 'INSPECTION_APPOINTMENT').length;
      return sendJson(res, 200, {
        total: notifications.length,
        unread,
        escalations,
        deficiencyNotices: defNotices,
        inspectionAppointments: appointments,
      });
    }

    // 20. Notification escalation check: /api/v1/notifications/escalate-check
    if (pathname === '/api/v1/notifications/escalate-check' && method === 'POST') {
      return sendJson(res, 200, {
        status: 'COMPLETED',
        scannedCount: cases.length,
        escalationsFound: 1,
      });
    }

    // 21. Mark notification as read: /api/v1/notifications/:id/read
    const notifReadMatch = pathname.match(/^\/api\/v1\/notifications\/([a-zA-Z0-9-]+)\/read$/);
    if (notifReadMatch && method === 'PATCH') {
      const notifId = notifReadMatch[1];
      const notif = notifications.find(n => n.id === notifId);
      if (notif) {
        notif.isRead = true;
        notif.readAt = new Date().toISOString();
      }
      return sendJson(res, 200, notif || {});
    }

    // 22. Integration status: /api/v1/integration/status
    if (pathname === '/api/v1/integration/status' && method === 'GET') {
      return sendJson(res, 200, {
        connected: true,
        sourcePortal: 'AICTE National Approval Portal Connector',
        sourceSystemName: 'AICTE National Approval Portal Connector',
        totalSyncCount: syncCount,
        totalSyncedCases: syncCount,
        totalIngestedCount: ingestedCount,
        ingestedCount,
        lastSyncAt: new Date().toISOString(),
        lastSuccessfulSyncAt: new Date().toISOString(),
      });
    }

    // 23. Simulate sync portal: /api/v1/integration/sync-portal
    if (pathname === '/api/v1/integration/sync-portal' && method === 'POST') {
      const body = await readBody(req);
      syncCount += 1;
      const isDuplicate = body.externalApplicationId === 'APP-2026-WRO-001' || body.externalApplicationId === 'APP-2026-WRO-002';

      if (!isDuplicate) ingestedCount += 1;

      const receipt: PortalSyncReceipt = {
        receiptId: `rec-${Date.now()}`,
        externalApplicationId: body.externalApplicationId || `APP-2026-ERO-${Math.floor(100 + Math.random() * 900)}`,
        caseId: isDuplicate ? '33333333-3333-3333-3333-333333333001' : `case-${Date.now()}`,
        applicationNumber: body.externalApplicationId || `APP-2026-ERO-${Math.floor(100 + Math.random() * 900)}`,
        outcome: isDuplicate ? 'DUPLICATE_SKIPPED' : 'INGESTED',
        message: isDuplicate
          ? 'Application already ingested and active in orchestration pipeline (Idempotent replay).'
          : 'Payload validated against schema norms and successfully ingested.',
        correlationId: `corr-${Date.now()}`,
        syncedAt: new Date().toISOString(),
      };

      return sendJson(res, 200, receipt);
    }

    // Default next
    next();
  };
}
