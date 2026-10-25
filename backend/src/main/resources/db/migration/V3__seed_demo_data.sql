-- Seed data: 5 realistic institutions and application cases across primary approval stages

-- 1. Apex Institute of Technology & Management (EVC Pending)
INSERT INTO institutions (id, code, name, institution_type, region, address, established_year, contact_email)
VALUES ('11111111-1111-1111-1111-111111111001', '1-10928371', 'Apex Institute of Technology & Management',
        'ENGINEERING_COLLEGE', 'WRO', 'Plot 42, Hinjewadi Phase 1, Pune, Maharashtra 411057', 2012, 'principal@apextech.ac.in');

INSERT INTO campuses (id, institution_id, campus_name, address, land_area_acres, built_up_area_sqm, land_lease_status, lease_expiry_date)
VALUES ('22222222-2222-2222-2222-222222222001', '11111111-1111-1111-1111-111111111001', 'Pune Main Campus',
        'Plot 42, Hinjewadi Phase 1, Pune, Maharashtra 411057', 15.50, 22000.00, 'OWNED', NULL);

INSERT INTO application_cases (id, application_number, institution_id, academic_year, application_type, status, current_stage, readiness_score, assigned_officer, deadline_at, submitted_at, updated_at)
VALUES ('33333333-3333-3333-3333-333333333001', 'APP-2026-WRO-001', '11111111-1111-1111-1111-111111111001',
        '2026-27', 'EXTENSION_OF_APPROVAL', 'EVC_PENDING', 'EVC_SCHEDULING', 92, 'Dr. S. K. Joshi (WRO)',
        CURRENT_TIMESTAMP + INTERVAL '14 days', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '1 day');

INSERT INTO document_metadata (id, case_id, document_type, document_name, file_hash, verification_status, valid_until)
VALUES ('55555555-5555-5555-5555-555555555001', '33333333-3333-3333-3333-333333333001', 'LAND_LEASE_DEED',
        'Land_Title_Deed_Freehold.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'VERIFIED', '2040-12-31'),
       ('55555555-5555-5555-5555-555555555002', '33333333-3333-3333-3333-333333333001', 'FIRE_NOC',
        'Fire_Safety_Certificate_2026.pdf', 'a1b2c3d4e5f60123456789abcdef0123456789abcdef0123456789abcdef0123', 'VERIFIED', '2028-04-30');

-- 2. Saraswati Engineering College (Deficiency Flagged)
INSERT INTO institutions (id, code, name, institution_type, region, address, established_year, contact_email)
VALUES ('11111111-1111-1111-1111-111111111002', '1-20394852', 'Saraswati Engineering College',
        'ENGINEERING_COLLEGE', 'WRO', 'Survey 88, Sector 12, Navi Mumbai, Maharashtra 400706', 2018, 'director@saraswatieng.edu');

INSERT INTO campuses (id, institution_id, campus_name, address, land_area_acres, built_up_area_sqm, land_lease_status, lease_expiry_date)
VALUES ('22222222-2222-2222-2222-222222222002', '11111111-1111-1111-1111-111111111002', 'Navi Mumbai Campus',
        'Survey 88, Sector 12, Navi Mumbai, Maharashtra 400706', 8.20, 14500.00, 'LEASED_EXPIRING_SOON', '2027-06-30');

INSERT INTO application_cases (id, application_number, institution_id, academic_year, application_type, status, current_stage, readiness_score, assigned_officer, deadline_at, submitted_at, updated_at)
VALUES ('33333333-3333-3333-3333-333333333002', 'APP-2026-WRO-002', '11111111-1111-1111-1111-111111111002',
        '2026-27', 'INCREASE_IN_INTAKE', 'DEFICIENCY_FLAGGED', 'DEFICIENCY_REVIEW', 45, 'Dr. S. K. Joshi (WRO)',
        CURRENT_TIMESTAMP + INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '2 days');

INSERT INTO deficiencies (id, case_id, category, description, status, deadline_days, flagged_at)
VALUES ('44444444-4444-4444-4444-444444444001', '33333333-3333-3333-3333-333333333002', 'LAND_AND_BUILDING',
        'Registered land lease deed expires within 14 months (2027-06-30). APH Section 6.17 requires minimum 3-year live validity for proposed 4-year degree course intake expansion.',
        'OPEN', 7, CURRENT_TIMESTAMP - INTERVAL '3 days'),
       ('44444444-4444-4444-4444-444444444002', '33333333-3333-3333-3333-333333333002', 'FIRE_SAFETY',
        'Municipal Fire Safety NOC expired on 2026-03-31; renewed clearance certificate with municipal receipt not uploaded.',
        'OPEN', 7, CURRENT_TIMESTAMP - INTERVAL '3 days');

INSERT INTO document_metadata (id, case_id, document_type, document_name, file_hash, verification_status, valid_until)
VALUES ('55555555-5555-5555-5555-555555555003', '33333333-3333-3333-3333-333333333002', 'LAND_LEASE_DEED',
        'Lease_Deed_Expiring_2027.pdf', 'f4e3d2c1b0a9876543210fedcba9876543210fedcba9876543210fedcba98765', 'DEFICIENT', '2027-06-30'),
       ('55555555-5555-5555-5555-555555555004', '33333333-3333-3333-3333-333333333002', 'FIRE_NOC',
        'Expired_Fire_NOC.pdf', '789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789a', 'EXPIRED', '2026-03-31');

-- 3. Greenfield College of Pharmacy (Deficiency Resubmitted)
INSERT INTO institutions (id, code, name, institution_type, region, address, established_year, contact_email)
VALUES ('11111111-1111-1111-1111-111111111003', '1-30495861', 'Greenfield College of Pharmacy',
        'PHARMACY_INSTITUTE', 'NRO', 'NH-24, Sitapur Road, Lucknow, Uttar Pradesh 226021', 2015, 'admin@greenfieldpharmacy.org');

INSERT INTO campuses (id, institution_id, campus_name, address, land_area_acres, built_up_area_sqm, land_lease_status, lease_expiry_date)
VALUES ('22222222-2222-2222-2222-222222222003', '11111111-1111-1111-1111-111111111003', 'Lucknow Campus',
        'NH-24, Sitapur Road, Lucknow, Uttar Pradesh 226021', 6.00, 9800.00, 'OWNED', NULL);

INSERT INTO application_cases (id, application_number, institution_id, academic_year, application_type, status, current_stage, readiness_score, assigned_officer, deadline_at, submitted_at, updated_at)
VALUES ('33333333-3333-3333-3333-333333333003', 'APP-2026-NRO-003', '11111111-1111-1111-1111-111111111003',
        '2026-27', 'EXTENSION_OF_APPROVAL', 'DEFICIENCY_RESUBMITTED', 'SCRUTINY_RE_REVIEW', 78, 'Prof. A. K. Verma (NRO)',
        CURRENT_TIMESTAMP + INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '4 hours');

INSERT INTO deficiencies (id, case_id, category, description, status, deadline_days, flagged_at, resolved_at, resolution_comment, proof_document_name, proof_document_url)
VALUES ('44444444-4444-4444-4444-444444444003', '33333333-3333-3333-3333-333333333003', 'FACULTY_CADRE_RATIO',
        'Cadre ratio deficit: 1 Professor required for M.Pharm Pharmaceutics branch.',
        'RESUBMITTED', 7, CURRENT_TIMESTAMP - INTERVAL '5 days', NULL,
        'Appointed Dr. R. K. Saxena as Professor with official joining report and university endorsement letter attached.',
        'Joining_Report_Prof_Saxena.pdf', '/documents/proofs/joining-report-4003.pdf');

INSERT INTO document_metadata (id, case_id, document_type, document_name, file_hash, verification_status, valid_until)
VALUES ('55555555-5555-5555-5555-555555555005', '33333333-3333-3333-3333-333333333003', 'FACULTY_JOINING_REPORT',
        'Joining_Report_Prof_Saxena.pdf', '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 'PENDING_VERIFICATION', '2030-12-31');

-- 4. National Polytechnic Institute (EVC Scheduled)
INSERT INTO institutions (id, code, name, institution_type, region, address, established_year, contact_email)
VALUES ('11111111-1111-1111-1111-111111111004', '1-40586973', 'National Polytechnic Institute',
        'TECHNICAL_COLLEGE', 'SRO', 'Aurobindo Marg, Guindy, Chennai, Tamil Nadu 600025', 2008, 'registrar@nationalpoly.edu.in');

INSERT INTO campuses (id, institution_id, campus_name, address, land_area_acres, built_up_area_sqm, land_lease_status, lease_expiry_date)
VALUES ('22222222-2222-2222-2222-222222222004', '11111111-1111-1111-1111-111111111004', 'Chennai Guindy Campus',
        'Aurobindo Marg, Guindy, Chennai, Tamil Nadu 600025', 12.00, 18500.00, 'OWNED', NULL);

INSERT INTO application_cases (id, application_number, institution_id, academic_year, application_type, status, current_stage, readiness_score, assigned_officer, deadline_at, submitted_at, updated_at)
VALUES ('33333333-3333-3333-3333-333333333004', 'APP-2026-SRO-004', '11111111-1111-1111-1111-111111111004',
        '2026-27', 'NEW_INSTITUTION', 'EVC_SCHEDULED', 'EVC_INSPECTION', 88, 'Dr. M. R. Swaminathan (SRO)',
        CURRENT_TIMESTAMP + INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '1 day');

INSERT INTO document_metadata (id, case_id, document_type, document_name, file_hash, verification_status, valid_until)
VALUES ('55555555-5555-5555-5555-555555555006', '33333333-3333-3333-3333-333333333004', 'BUILDING_SAFETY_CERT',
        'Structural_Safety_Certificate.pdf', 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789', 'VERIFIED', '2029-08-15');

-- 5. Bharat Institute of Advanced Technology (Approved)
INSERT INTO institutions (id, code, name, institution_type, region, address, established_year, contact_email)
VALUES ('11111111-1111-1111-1111-111111111005', '1-50697884', 'Bharat Institute of Advanced Technology',
        'ENGINEERING_COLLEGE', 'CRO', 'Bhadbhada Road, Bhopal, Madhya Pradesh 462044', 2005, 'office@bharattech.edu');

INSERT INTO campuses (id, institution_id, campus_name, address, land_area_acres, built_up_area_sqm, land_lease_status, lease_expiry_date)
VALUES ('22222222-2222-2222-2222-222222222005', '11111111-1111-1111-1111-111111111005', 'Bhopal Central Campus',
        'Bhadbhada Road, Bhopal, Madhya Pradesh 462044', 25.00, 36000.00, 'OWNED', NULL);

INSERT INTO application_cases (id, application_number, institution_id, academic_year, application_type, status, current_stage, readiness_score, assigned_officer, deadline_at, submitted_at, updated_at)
VALUES ('33333333-3333-3333-3333-333333333005', 'APP-2026-CRO-005', '11111111-1111-1111-1111-111111111005',
        '2026-27', 'EXTENSION_OF_APPROVAL', 'APPROVED', 'COMPLETED', 100, 'Dr. Rajesh Patel (CRO)',
        NULL, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP - INTERVAL '2 days');

INSERT INTO document_metadata (id, case_id, document_type, document_name, file_hash, verification_status, valid_until)
VALUES ('55555555-5555-5555-5555-555555555007', '33333333-3333-3333-3333-333333333005', 'APPROVAL_ORDER',
        'AICTE_EoA_Order_2026-27.pdf', '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01', 'VERIFIED', '2027-04-30');
