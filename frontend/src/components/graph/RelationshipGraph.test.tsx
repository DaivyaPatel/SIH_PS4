import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { GraphNodeCard } from './GraphNodeCard';
import { GraphControls } from './GraphControls';
import { GraphDetailsDrawer } from './GraphDetailsDrawer';
import { RelationshipGraphCanvas } from './RelationshipGraphCanvas';
import { buildGraphDataFromCase } from '../../lib/graphData';
import { CaseDetailTabs } from '../cases/CaseDetailTabs';
import { RegionProvider } from '../../context/RegionContext';
import { RoleProvider } from '../../context/RoleContext';
import { ToastProvider } from '../../context/ToastContext';
import type { CaseDetail } from '../../types/domain';
import type { GraphNode, GraphData } from '../../types/graph';

const mockCaseDetail: CaseDetail = {
  id: 'case-test-101',
  applicationNumber: 'APP-2026-WRO-101',
  academicYear: '2026-27',
  applicationType: 'EXTENSION_OF_APPROVAL',
  status: 'DEFICIENCY_FLAGGED',
  currentStage: 'DEFICIENCY_PERIOD',
  readinessScore: 78,
  assignedOfficer: 'Prof. K. Sharma',
  deadlineAt: '2026-11-05T18:30:00Z',
  deadlineAtIst: '05 Nov 2026, 18:30 IST',
  submittedAt: '2026-09-01T10:00:00Z',
  updatedAt: '2026-10-20T12:00:00Z',
  isOverdue: false,
  remainingHours: 192,
  remainingBusinessDays: 8,
  deadlineStatus: 'APPROACHING_DEADLINE',
  institution: {
    id: 'inst-101',
    code: '1-1092837411',
    name: 'Saraswati Institute of Technology',
    institutionType: 'ENGINEERING',
    region: 'WRO',
    address: 'Survey 42, Hinjewadi Phase 2, Pune, Maharashtra',
    contactEmail: 'principal@saraswati-tech.ac.in',
    establishedYear: 2004,
    campuses: [
      {
        id: 'camp-1',
        campusName: 'Main Hinjewadi Campus',
        address: 'Hinjewadi Phase 2, Pune',
        landAreaAcres: 12.5,
        builtUpAreaSqM: 32000,
        landLeaseStatus: 'OWNED',
        leaseExpiryDate: null,
      },
    ],
  },
  documents: [
    {
      id: 'doc-1',
      documentType: 'LAND_TITLE_DEED',
      documentName: 'land_registry_certificate.pdf',
      fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      verificationStatus: 'VERIFIED',
      validUntil: null,
      uploadedAt: '2026-09-02T11:00:00Z',
    },
    {
      id: 'doc-2',
      documentType: 'FIRE_SAFETY_NOC',
      documentName: 'municipal_fire_noc.pdf',
      fileHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      verificationStatus: 'DEFICIENT',
      validUntil: '2026-12-31',
      uploadedAt: '2026-09-03T09:30:00Z',
    },
  ],
  deficiencies: [
    {
      id: 'def-1',
      category: 'DOCUMENTARY',
      description: 'Building completion plan lacks legible municipal verification seal',
      status: 'OPEN',
      deadlineDays: 15,
      flaggedAt: '2026-10-10T14:00:00Z',
      resolvedAt: null,
      resolutionComment: null,
      proofDocumentName: null,
      proofDocumentUrl: null,
    },
  ],
};

describe('Relationship Graph Components & Topology', () => {
  it('buildGraphDataFromCase generates structured 5-column graph topology', () => {
    const graphData = buildGraphDataFromCase(mockCaseDetail);

    expect(graphData.nodes.length).toBeGreaterThan(0);
    expect(graphData.edges.length).toBeGreaterThan(0);

    const columnsPresent = new Set(graphData.nodes.map(n => n.column));
    expect(columnsPresent.has('INSTITUTION')).toBe(true);
    expect(columnsPresent.has('APPLICATION')).toBe(true);
    expect(columnsPresent.has('REQUIREMENT')).toBe(true);
    expect(columnsPresent.has('DOCUMENT')).toBe(true);
    expect(columnsPresent.has('REVIEW')).toBe(true);

    const instNode = graphData.nodes.find(n => n.type === 'INSTITUTION');
    expect(instNode?.title).toBe('Saraswati Institute of Technology');

    const appNode = graphData.nodes.find(n => n.type === 'APPLICATION');
    expect(appNode?.title).toBe('APP-2026-WRO-101');
  });

  it('GraphNodeCard renders node title, subtitle, and active styling', () => {
    const mockNode: GraphNode = {
      id: 'node-test',
      column: 'APPLICATION',
      type: 'APPLICATION',
      title: 'APP-2026-WRO-101',
      subtitle: 'Stage: EVC Pending',
      status: 'OK',
      statusLabel: 'Active',
      details: { 'Target Year': '2026-27' },
      connectedIds: ['node-inst'],
    };

    const html = renderToStaticMarkup(
      <GraphNodeCard
        node={mockNode}
        isSelected={true}
        isInActivePath={false}
        isDimmed={false}
        onClick={() => {}}
        onHover={() => {}}
      />
    );

    expect(html).toContain('APP-2026-WRO-101');
    expect(html).toContain('Stage: EVC Pending');
    expect(html).toContain('Active');
  });

  it('GraphControls renders zoom, pan, and reset interaction buttons', () => {
    const html = renderToStaticMarkup(
      <GraphControls
        zoomLevel={1.25}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        onReset={() => {}}
        onFitView={() => {}}
      />
    );

    expect(html).toContain('125%');
    expect(html).toContain('aria-label="Zoom in"');
    expect(html).toContain('aria-label="Zoom out"');
    expect(html).toContain('aria-label="Reset layout"');
    expect(html).toContain('aria-label="Fit to view"');
  });

  it('GraphDetailsDrawer renders selected node attributes and connected relationships', () => {
    const mockNode: GraphNode = {
      id: 'node-test-doc',
      column: 'DOCUMENT',
      type: 'DOCUMENT',
      title: 'land_registry_certificate.pdf',
      subtitle: 'LAND TITLE DEED',
      status: 'OK',
      statusLabel: 'Verified',
      details: {
        'Document Type': 'LAND_TITLE_DEED',
        'File Size': '2.0 MB',
        'Verification Status': 'VERIFIED',
      },
      connectedIds: ['node-req-land'],
    };

    const mockGraphData: GraphData = {
      nodes: [
        mockNode,
        {
          id: 'node-req-land',
          column: 'REQUIREMENT',
          type: 'REQUIREMENT',
          title: 'Land Ownership Norms (Sec 2.1)',
          subtitle: 'Statutory Land Deed',
          status: 'OK',
          details: { 'Clause': 'APH Sec 2.1' },
          connectedIds: ['node-test-doc'],
        },
      ],
      edges: [
        {
          id: 'edge-1',
          fromNodeId: 'node-req-land',
          toNodeId: 'node-test-doc',
          status: 'OK',
        },
      ],
    };

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <GraphDetailsDrawer
          isOpen={true}
          node={mockNode}
          allNodes={mockGraphData.nodes}
          onClose={() => {}}
          onSelectNode={() => {}}
        />
      </MemoryRouter>
    );

    expect(html).toContain('land_registry_certificate.pdf');
    expect(html).toContain('LAND_TITLE_DEED');
    expect(html).toContain('Verified');
    expect(html).toContain('Land Ownership Norms (Sec 2.1)');
  });

  it('RelationshipGraphCanvas renders 5 columns, search input, and mode controls', () => {
    const graphData = buildGraphDataFromCase(mockCaseDetail);

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <RelationshipGraphCanvas
          data={graphData}
          title="Test Topology Graph"
          subtitle="Subtitle info"
        />
      </MemoryRouter>
    );

    expect(html).toContain('Test Topology Graph');
    expect(html).toContain('Subtitle info');
    expect(html).toContain('1. Institution');
    expect(html).toContain('2. Application');
    expect(html).toContain('3. Requirement');
    expect(html).toContain('4. Document Evidence');
    expect(html).toContain('5. Review &amp; Decision');
    expect(html).toContain('Trace');
    expect(html).toContain('Evidence');
    expect(html).toContain('Impact');
  });

  it('RelationshipGraphCanvas handles empty node list gracefully', () => {
    const emptyGraphData: GraphData = { nodes: [], edges: [] };

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <RelationshipGraphCanvas
          data={emptyGraphData}
          title="Empty Topology"
        />
      </MemoryRouter>
    );

    expect(html).toContain('No relationship nodes match criteria');
  });

  it('CaseDetailTabs renders Tab 6 Relationships with RelationshipGraphCanvas', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <RegionProvider>
          <RoleProvider>
            <ToastProvider>
              <CaseDetailTabs
                caseData={mockCaseDetail}
                activeTab={6}
                onTabChange={() => {}}
                onRefresh={() => {}}
                onSelectDocument={() => {}}
                onOpenFlagDeficiency={() => {}}
                onOpenRespondDeficiency={() => {}}
                onOpenResolveDeficiency={() => {}}
              />
            </ToastProvider>
          </RoleProvider>
        </RegionProvider>
      </MemoryRouter>
    );

    expect(html).toContain('Topological Relationship Graph — APP-2026-WRO-101');
    expect(html).toContain('Tracing statutory compliance neighbourhood for Saraswati Institute of Technology');
    expect(html).toContain('Institution');
    expect(html).toContain('Application');
  });
});
