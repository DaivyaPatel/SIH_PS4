-- Domain schema for AICTE Approval Coordination & Case Management

CREATE TABLE institutions (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    institution_type VARCHAR(80) NOT NULL,
    region VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    established_year INT NOT NULL,
    contact_email VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE campuses (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    campus_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    land_area_acres NUMERIC(6,2) NOT NULL,
    built_up_area_sqm NUMERIC(10,2) NOT NULL,
    land_lease_status VARCHAR(50) NOT NULL,
    lease_expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE application_cases (
    id UUID PRIMARY KEY,
    application_number VARCHAR(80) NOT NULL UNIQUE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
    academic_year VARCHAR(20) NOT NULL,
    application_type VARCHAR(80) NOT NULL,
    status VARCHAR(50) NOT NULL,
    current_stage VARCHAR(80) NOT NULL,
    readiness_score INT NOT NULL DEFAULT 0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
    assigned_officer VARCHAR(100),
    deadline_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deficiencies (
    id UUID PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES application_cases(id) ON DELETE CASCADE,
    category VARCHAR(80) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    deadline_days INT NOT NULL DEFAULT 7,
    flagged_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ,
    resolution_comment TEXT,
    proof_document_name VARCHAR(255),
    proof_document_url TEXT
);

CREATE TABLE document_metadata (
    id UUID PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES application_cases(id) ON DELETE CASCADE,
    document_type VARCHAR(80) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_hash VARCHAR(128) NOT NULL,
    verification_status VARCHAR(50) NOT NULL,
    valid_until DATE,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_institutions_region ON institutions(region);
CREATE INDEX idx_campuses_institution_id ON campuses(institution_id);
CREATE INDEX idx_cases_institution_id ON application_cases(institution_id);
CREATE INDEX idx_cases_status ON application_cases(status);
CREATE INDEX idx_deficiencies_case_id ON deficiencies(case_id);
CREATE INDEX idx_documents_case_id ON document_metadata(case_id);
