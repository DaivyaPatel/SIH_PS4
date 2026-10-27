import { DeficienciesWorkspace } from '../components/deficiencies/DeficienciesWorkspace';

export function DeficienciesRoute() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Page Title & Breadcrumb context */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            Deficiencies & Compliance Workspace
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            Interactive remediation loop for institutional non-compliance, proof verification, and statutory cure tracking
          </p>
        </div>
      </div>

      {/* Two-Pane Workspace Component */}
      <DeficienciesWorkspace />
    </div>
  );
}
