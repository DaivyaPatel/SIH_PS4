-- Platform metadata only. Regulatory/domain entities are introduced separately.
CREATE TABLE platform_metadata (
    singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton),
    schema_purpose VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO platform_metadata (singleton, schema_purpose)
VALUES (TRUE, 'synthetic-development-foundation');
