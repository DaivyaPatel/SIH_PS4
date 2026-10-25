-- Audit schema and initial audit events for seeded cases

CREATE TABLE audit_events (
    id UUID PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES application_cases(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    actor_role VARCHAR(80) NOT NULL,
    actor_id VARCHAR(150) NOT NULL,
    previous_state VARCHAR(50),
    new_state VARCHAR(50),
    details TEXT,
    correlation_id VARCHAR(80),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_case_id ON audit_events(case_id);
CREATE INDEX idx_audit_created_at ON audit_events(created_at);

-- Seed initial audit event trail for demo cases

-- 1. Apex Institute (APP-2026-WRO-001)
INSERT INTO audit_events (id, case_id, action, actor_role, actor_id, previous_state, new_state, details, correlation_id, created_at)
VALUES ('77777777-7777-7777-7777-777777777001', '33333333-3333-3333-3333-333333333001',
        'APPLICATION_SUBMITTED', 'INSTITUTION_ADMIN', 'principal@apextech.ac.in',
        'DRAFT', 'SUBMITTED', 'Annual Extension of Approval application submitted with 18 supporting documents.',
        'c001-init', CURRENT_TIMESTAMP - INTERVAL '10 days'),
       ('77777777-7777-7777-7777-777777777002', '33333333-3333-3333-3333-333333333001',
        'SCRUTINY_ASSIGNED', 'REGIONAL_OFFICER', 'officer.wro@aicte-india.org',
        'SUBMITTED', 'UNDER_SCRUTINY', 'Application assigned to Scrutiny Committee Panel 4 (WRO).',
        'c001-scrutiny-assign', CURRENT_TIMESTAMP - INTERVAL '8 days'),
       ('77777777-7777-7777-7777-777777777003', '33333333-3333-3333-3333-333333333001',
        'SCRUTINY_CLEARED', 'SCRUTINY_OFFICER', 'Dr. S. K. Joshi (WRO)',
        'UNDER_SCRUTINY', 'EVC_PENDING', 'All land, building, and faculty cadre criteria verified compliant. Advanced to EVC inspection queue.',
        'c001-scrutiny-pass', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- 2. Saraswati Engineering College (APP-2026-WRO-002)
INSERT INTO audit_events (id, case_id, action, actor_role, actor_id, previous_state, new_state, details, correlation_id, created_at)
VALUES ('77777777-7777-7777-7777-777777777004', '33333333-3333-3333-3333-333333333002',
        'APPLICATION_SUBMITTED', 'INSTITUTION_ADMIN', 'director@saraswatieng.edu',
        'DRAFT', 'SUBMITTED', 'Intake Increase application submitted for B.Tech AI & Data Science.',
        'c002-init', CURRENT_TIMESTAMP - INTERVAL '8 days'),
       ('77777777-7777-7777-7777-777777777005', '33333333-3333-3333-3333-333333333002',
        'DEFICIENCY_ISSUED', 'SCRUTINY_OFFICER', 'Dr. S. K. Joshi (WRO)',
        'UNDER_SCRUTINY', 'DEFICIENCY_FLAGGED', 'Flagged 2 deficiencies: Registered land lease expires within 14 months; Municipal Fire NOC expired.',
        'c002-deficiency', CURRENT_TIMESTAMP - INTERVAL '3 days');

-- 3. Greenfield College of Pharmacy (APP-2026-NRO-003)
INSERT INTO audit_events (id, case_id, action, actor_role, actor_id, previous_state, new_state, details, correlation_id, created_at)
VALUES ('77777777-7777-7777-7777-777777777006', '33333333-3333-3333-3333-333333333003',
        'APPLICATION_SUBMITTED', 'INSTITUTION_ADMIN', 'admin@greenfieldpharmacy.org',
        'DRAFT', 'SUBMITTED', 'Annual Extension application submitted.',
        'c003-init', CURRENT_TIMESTAMP - INTERVAL '12 days'),
       ('77777777-7777-7777-7777-777777777007', '33333333-3333-3333-3333-333333333003',
        'DEFICIENCY_ISSUED', 'SCRUTINY_OFFICER', 'Prof. A. K. Verma (NRO)',
        'UNDER_SCRUTINY', 'DEFICIENCY_FLAGGED', 'Cadre ratio deficit: 1 Professor required for M.Pharm Pharmaceutics.',
        'c003-deficiency', CURRENT_TIMESTAMP - INTERVAL '5 days'),
       ('77777777-7777-7777-7777-777777777008', '33333333-3333-3333-3333-333333333003',
        'DEFICIENCY_RESUBMITTED', 'INSTITUTION_ADMIN', 'admin@greenfieldpharmacy.org',
        'DEFICIENCY_FLAGGED', 'DEFICIENCY_RESUBMITTED', 'Appointed Dr. R. K. Saxena as Professor with joining report attached.',
        'c003-resubmit', CURRENT_TIMESTAMP - INTERVAL '4 hours');

-- 4. National Polytechnic Institute (APP-2026-SRO-004)
INSERT INTO audit_events (id, case_id, action, actor_role, actor_id, previous_state, new_state, details, correlation_id, created_at)
VALUES ('77777777-7777-7777-7777-777777777009', '33333333-3333-3333-3333-333333333004',
        'APPLICATION_SUBMITTED', 'INSTITUTION_ADMIN', 'registrar@nationalpoly.edu.in',
        'DRAFT', 'SUBMITTED', 'New Technical Institution establishment application submitted.',
        'c004-init', CURRENT_TIMESTAMP - INTERVAL '15 days'),
       ('77777777-7777-7777-7777-777777777010', '33333333-3333-3333-3333-333333333004',
        'SCRUTINY_CLEARED', 'SCRUTINY_OFFICER', 'Dr. M. R. Swaminathan (SRO)',
        'UNDER_SCRUTINY', 'EVC_PENDING', 'Documentation scrutiny passed; mandatory physical inspection required.',
        'c004-scrutiny-pass', CURRENT_TIMESTAMP - INTERVAL '5 days'),
       ('77777777-7777-7777-7777-777777777011', '33333333-3333-3333-3333-333333333004',
        'EVC_COMMITTEE_SCHEDULED', 'EVC_SCHEDULER', 'SYSTEM_OR_TOOLS',
        'EVC_PENDING', 'EVC_SCHEDULED', 'Optimization engine assigned 3 expert committee members with zero conflict of interest.',
        'c004-evc-sched', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- 5. Bharat Institute of Advanced Technology (APP-2026-CRO-005)
INSERT INTO audit_events (id, case_id, action, actor_role, actor_id, previous_state, new_state, details, correlation_id, created_at)
VALUES ('77777777-7777-7777-7777-777777777012', '33333333-3333-3333-3333-333333333005',
        'APPLICATION_SUBMITTED', 'INSTITUTION_ADMIN', 'office@bharattech.edu',
        'DRAFT', 'SUBMITTED', 'Extension of Approval application submitted.',
        'c005-init', CURRENT_TIMESTAMP - INTERVAL '30 days'),
       ('77777777-7777-7777-7777-777777777013', '33333333-3333-3333-3333-333333333005',
        'EVC_INSPECTION_COMPLETED', 'EVC_CHAIRMAN', 'Prof. H. S. Sharma',
        'EVC_SCHEDULED', 'EVC_COMPLETED', 'Physical inspection completed; campus facilities fully compliant with norms.',
        'c005-evc-complete', CURRENT_TIMESTAMP - INTERVAL '10 days'),
       ('77777777-7777-7777-7777-777777777014', '33333333-3333-3333-3333-333333333005',
        'APPROVAL_GRANTED', 'REGIONAL_COMMITTEE', 'Dr. Rajesh Patel (CRO)',
        'EVC_COMPLETED', 'APPROVED', 'Official Extension of Approval 2026-27 issued by competent authority.',
        'c005-approval', CURRENT_TIMESTAMP - INTERVAL '2 days');
