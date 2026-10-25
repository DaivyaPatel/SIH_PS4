-- Notification & Escalation Ledger Schema and initial seeded notices

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    case_id UUID REFERENCES application_cases(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    recipient_role VARCHAR(60) NOT NULL,
    recipient_contact VARCHAR(150) NOT NULL,
    channel VARCHAR(40) NOT NULL,
    notification_type VARCHAR(60) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(30) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'SENT',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    metadata_json TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_case_id ON notifications(case_id);
CREATE INDEX idx_notifications_recipient_role ON notifications(recipient_role);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Seed initial notifications for demo cases

-- 1. Saraswati Engineering College (DEFICIENCY_FLAGGED)
INSERT INTO notifications (id, case_id, institution_id, recipient_role, recipient_contact, channel, notification_type, title, content, priority, status, is_read, read_at, metadata_json, created_at)
VALUES ('99999999-9999-9999-9999-999999999001', '33333333-3333-3333-3333-333333333002', '11111111-1111-1111-1111-111111111002',
        'INSTITUTION_ADMIN', 'director@saraswatieng.edu', 'EMAIL', 'DEFICIENCY_NOTICE',
        'AICTE Scrutiny: Deficiencies Flagged for Application APP-2026-WRO-002',
        'During scrutiny, 2 deficiencies were identified: (1) Registered land lease deed expires within 14 months; (2) Municipal Fire NOC expired. Please upload rectifications within 7 working days.',
        'HIGH', 'DELIVERED', FALSE, NULL, '{"category":"LAND_AND_FIRE","deadlineDays":7}', CURRENT_TIMESTAMP - INTERVAL '3 days'),
       ('99999999-9999-9999-9999-999999999002', '33333333-3333-3333-3333-333333333002', '11111111-1111-1111-1111-111111111002',
        'INSTITUTION_ADMIN', 'director@saraswatieng.edu', 'SMS', 'DEADLINE_REMINDER',
        'Deadline Reminder: 4 Days Left for Deficiency Resubmission',
        'AICTE Alert: Statutory 7-day cure window for APP-2026-WRO-002 will close soon. Please submit compliance to avoid rejection.',
        'NORMAL', 'DELIVERED', FALSE, NULL, '{"remainingDays":4}', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- 2. Greenfield College of Pharmacy (DEFICIENCY_RESUBMITTED)
INSERT INTO notifications (id, case_id, institution_id, recipient_role, recipient_contact, channel, notification_type, title, content, priority, status, is_read, read_at, metadata_json, created_at)
VALUES ('99999999-9999-9999-9999-999999999003', '33333333-3333-3333-3333-333333333003', '11111111-1111-1111-1111-111111111003',
        'INSTITUTION_ADMIN', 'admin@greenfieldpharmacy.org', 'EMAIL', 'DEFICIENCY_NOTICE',
        'AICTE Scrutiny: Faculty Cadre Ratio Deficiency Flagged',
        'Cadre ratio deficit: 1 Professor required for M.Pharm Pharmaceutics branch. Please appoint qualified faculty and submit joining verification.',
        'HIGH', 'DELIVERED', TRUE, CURRENT_TIMESTAMP - INTERVAL '4 days', '{"category":"FACULTY_CADRE_RATIO"}', CURRENT_TIMESTAMP - INTERVAL '5 days'),
       ('99999999-9999-9999-9999-999999999004', '33333333-3333-3333-3333-333333333003', '11111111-1111-1111-1111-111111111003',
        'SCRUTINY_OFFICER', 'Prof. A. K. Verma (NRO)', 'PORTAL_ALERT', 'STATUS_UPDATE',
        'Deficiency Resubmission: Greenfield College has uploaded Professor joining report',
        'Greenfield College of Pharmacy (APP-2026-NRO-003) has resubmitted compliance with joining report of Dr. R. K. Saxena. Case ready for re-scrutiny.',
        'NORMAL', 'DELIVERED', FALSE, NULL, '{"resubmittedDocument":"Joining_Report_Prof_Saxena.pdf"}', CURRENT_TIMESTAMP - INTERVAL '4 hours');

-- 3. National Polytechnic Institute (EVC_SCHEDULED)
INSERT INTO notifications (id, case_id, institution_id, recipient_role, recipient_contact, channel, notification_type, title, content, priority, status, is_read, read_at, metadata_json, created_at)
VALUES ('99999999-9999-9999-9999-999999999005', '33333333-3333-3333-3333-333333333004', '11111111-1111-1111-1111-111111111004',
        'INSTITUTION_ADMIN', 'registrar@nationalpoly.edu.in', 'EMAIL', 'INSPECTION_APPOINTMENT',
        'EVC Inspection Scheduled: AICTE Expert Committee Assigned',
        'An Expert Visit Committee (EVC) has been scheduled for physical campus inspection. Committee size: 3 members. Please keep statutory registers and labs accessible.',
        'HIGH', 'DELIVERED', FALSE, NULL, '{"visitDate":"2026-11-04","committeeSize":3}', CURRENT_TIMESTAMP - INTERVAL '1 day'),
       ('99999999-9999-9999-9999-999999999006', '33333333-3333-3333-3333-333333333004', '11111111-1111-1111-1111-111111111004',
        'REGIONAL_OFFICER', 'officer.sro@aicte-india.org', 'PORTAL_ALERT', 'INSPECTION_APPOINTMENT',
        'EVC Roster Confirmed: National Polytechnic Institute (APP-2026-SRO-004)',
        'EVC inspection roster finalized for 2026-11-04. 3 experts assigned with zero conflict of interest.',
        'NORMAL', 'DELIVERED', TRUE, CURRENT_TIMESTAMP - INTERVAL '20 hours', '{"visitDate":"2026-11-04"}', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- 4. Apex Institute of Technology & Management (EVC_PENDING)
INSERT INTO notifications (id, case_id, institution_id, recipient_role, recipient_contact, channel, notification_type, title, content, priority, status, is_read, read_at, metadata_json, created_at)
VALUES ('99999999-9999-9999-9999-999999999007', '33333333-3333-3333-3333-333333333001', '11111111-1111-1111-1111-111111111001',
        'INSTITUTION_ADMIN', 'principal@apextech.ac.in', 'EMAIL', 'STATUS_UPDATE',
        'Scrutiny Cleared: APP-2026-WRO-001 Placed in EVC Scheduling Queue',
        'Your application has successfully passed Scrutiny review (Readiness score 92%). It has been queued for automated committee scheduling.',
        'NORMAL', 'DELIVERED', TRUE, CURRENT_TIMESTAMP - INTERVAL '18 hours', '{"readinessScore":92}', CURRENT_TIMESTAMP - INTERVAL '1 day');
