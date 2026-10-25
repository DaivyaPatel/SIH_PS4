-- V6: EVC Expert Pool and Eligibility Management Schema & Seed Fixtures

CREATE TABLE experts (
    id UUID PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    designation VARCHAR(150) NOT NULL,
    domain VARCHAR(80) NOT NULL,
    affiliated_institution VARCHAR(200) NOT NULL,
    region VARCHAR(20) NOT NULL,
    conflict_institutions TEXT,
    available_dates TEXT NOT NULL,
    max_assignments INT NOT NULL DEFAULT 3,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_experts_domain ON experts(domain);
CREATE INDEX idx_experts_region ON experts(region);
CREATE INDEX idx_experts_active ON experts(is_active);

-- Seed 10 diverse academic experts across major domains and regions
INSERT INTO experts (id, name, email, designation, domain, affiliated_institution, region, conflict_institutions, available_dates, max_assignments, is_active)
VALUES
('77777777-7777-7777-7777-777777777001', 'Prof. K. R. Ramanathan', 'kr.ramanathan@iitm.ac.in',
 'Professor & Head, Computer Science', 'COMPUTER_SCIENCE', 'Indian Institute of Technology Madras', 'SRO',
 '33333333-3333-3333-3333-333333333004,1-40586973,National Polytechnic Institute',
 '2026-11-10,2026-11-11,2026-11-12,2026-11-16', 3, TRUE),

('77777777-7777-7777-7777-777777777002', 'Prof. Sunita Deshmukh', 's.deshmukh@coep.ac.in',
 'Professor, Department of Mechanical Engineering', 'MECHANICAL_ENGINEERING', 'COEP Technological University Pune', 'WRO',
 '33333333-3333-3333-3333-333333333001,1-10928371,Apex Institute of Technology & Management',
 '2026-11-10,2026-11-11,2026-11-15,2026-11-17', 2, TRUE),

('77777777-7777-7777-7777-777777777003', 'Prof. Arvind K. Sharma', 'arvind.sharma@ee.iitb.ac.in',
 'Chair Professor, Electrical Engineering', 'ELECTRICAL_ENGINEERING', 'Indian Institute of Technology Bombay', 'WRO',
 '33333333-3333-3333-3333-333333333002,1-20394852,Saraswati Engineering College',
 '2026-11-11,2026-11-12,2026-11-16,2026-11-18', 3, TRUE),

('77777777-7777-7777-7777-777777777004', 'Dr. Meenakshi Sundaram', 'm.sundaram@jssuni.edu.in',
 'Dean, Faculty of Pharmaceutical Sciences', 'PHARMACY', 'JSS College of Pharmacy', 'SRO',
 '',
 '2026-11-10,2026-11-12,2026-11-16,2026-11-19', 3, TRUE),

('77777777-7777-7777-7777-777777777005', 'Prof. B. N. Mukherjee', 'bn.mukherjee@iitk.ac.in',
 'Professor, Structural & Civil Engineering', 'CIVIL_ENGINEERING', 'Indian Institute of Technology Kanpur', 'NRO',
 '33333333-3333-3333-3333-333333333003,1-30495861,Greenfield College of Pharmacy',
 '2026-11-10,2026-11-11,2026-11-12,2026-11-17', 2, TRUE),

('77777777-7777-7777-7777-777777777006', 'Dr. Rajiv V. Singhania', 'rajiv.singhania@iimidr.ac.in',
 'Professor of Management & Dean (Academics)', 'MANAGEMENT', 'Indian Institute of Management Indore', 'CRO',
 '33333333-3333-3333-3333-333333333005,1-50697884,Bharat Institute of Advanced Technology',
 '2026-11-12,2026-11-15,2026-11-16,2026-11-18', 2, TRUE),

('77777777-7777-7777-7777-777777777007', 'Prof. Deepa Venkatraman', 'deepa.v@nitt.edu',
 'Associate Professor, Electronics & Communication', 'ELECTRONICS_AND_COMMUNICATION', 'National Institute of Technology Tiruchirappalli', 'SRO',
 '',
 '2026-11-10,2026-11-11,2026-11-15,2026-11-16', 3, TRUE),

('77777777-7777-7777-7777-777777777008', 'Prof. Anand Mohan Verma', 'amverma@mnnit.ac.in',
 'Professor, Department of Computer Science & Engineering', 'COMPUTER_SCIENCE', 'Motilal Nehru National Institute of Technology Allahabad', 'NRO',
 '',
 '2026-11-11,2026-11-12,2026-11-17,2026-11-18', 3, TRUE),

('77777777-7777-7777-7777-777777777009', 'Dr. Pradeep Kumar Nair', 'pknair@nitk.edu.in',
 'Professor, Chemical Engineering & Environmental Safety', 'CHEMICAL_ENGINEERING', 'National Institute of Technology Karnataka Surathkal', 'SWRO',
 '',
 '2026-11-10,2026-11-12,2026-11-15,2026-11-19', 3, TRUE),

('77777777-7777-7777-7777-777777777010', 'Prof. Shalini Gupta', 'shalini.gupta@dtu.ac.in',
 'Professor, Department of Information Technology', 'INFORMATION_TECHNOLOGY', 'Delhi Technological University', 'NWRO',
 '',
 '2026-11-11,2026-11-12,2026-11-16,2026-11-17', 2, TRUE);
