-- Integration receipts schema for host portal sync and deduplication

CREATE TABLE integration_receipts (
    id UUID PRIMARY KEY,
    external_source_id VARCHAR(100) NOT NULL,
    case_id UUID REFERENCES application_cases(id) ON DELETE SET NULL,
    outcome VARCHAR(50) NOT NULL,
    details TEXT,
    correlation_id VARCHAR(80),
    synced_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_integration_external_id ON integration_receipts(external_source_id);
CREATE INDEX idx_integration_synced_at ON integration_receipts(synced_at);
