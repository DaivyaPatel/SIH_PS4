import type { CaseDetail } from '../types/domain';
import type { GraphData, GraphNode, GraphEdge } from '../types/graph';

export function buildGraphDataFromCase(caseData: CaseDetail): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const instId = `inst-${caseData.institution.id || 'main'}`;
  const appId = `app-${caseData.id}`;

  // 1. Column: INSTITUTION
  nodes.push({
    id: instId,
    column: 'INSTITUTION',
    type: 'INSTITUTION',
    title: caseData.institution.name,
    subtitle: `Code: ${caseData.institution.code} • Est. ${caseData.institution.establishedYear}`,
    status: 'OK',
    statusLabel: 'Accredited',
    details: {
      'Institution Name': caseData.institution.name,
      'AICTE Code': caseData.institution.code,
      'Regional Office': `${caseData.institution.region} Region`,
      'Registered Address': caseData.institution.address,
      'Contact Email': caseData.institution.contactEmail,
      'Established Year': caseData.institution.establishedYear,
      'Total Campuses': caseData.institution.campuses.length,
    },
    connectedIds: [appId],
    caseId: caseData.id,
    region: caseData.institution.region,
  });

  // Campuses
  caseData.institution.campuses.forEach((campus, idx) => {
    const campusNodeId = `campus-${campus.id || idx}`;
    nodes.push({
      id: campusNodeId,
      column: 'INSTITUTION',
      type: 'CAMPUS',
      title: campus.campusName,
      subtitle: `${campus.landAreaAcres} Acres • ${campus.landLeaseStatus}`,
      status: campus.landLeaseStatus === 'LEASED' && campus.leaseExpiryDate ? 'WARN' : 'OK',
      statusLabel: campus.landLeaseStatus,
      details: {
        'Campus Name': campus.campusName,
        'Site Address': campus.address,
        'Land Area': `${campus.landAreaAcres} Acres`,
        'Built-Up Area': `${campus.builtUpAreaSqM} sq.m`,
        'Ownership Status': campus.landLeaseStatus,
        'Lease Expiry': campus.leaseExpiryDate || 'Perpetual / Owned',
      },
      connectedIds: [instId],
      caseId: caseData.id,
      region: caseData.institution.region,
    });

    edges.push({
      id: `edge-${campusNodeId}-${instId}`,
      fromNodeId: campusNodeId,
      toNodeId: instId,
      status: 'NEUTRAL',
    });
  });

  // 2. Column: APPLICATION
  const isAppBad = caseData.status === 'DEFICIENCY_FLAGGED' || caseData.isOverdue;
  const isAppWarn = caseData.status === 'DEFICIENCY_RESUBMITTED' || caseData.status === 'UNDER_SCRUTINY';
  const isAppOk = caseData.status === 'APPROVED' || caseData.status === 'EVC_SCHEDULED' || caseData.status === 'EVC_PENDING';
  const appType = caseData.applicationType || 'EXTENSION_OF_APPROVAL';
  const academicYear = caseData.academicYear || '2026-27';
  const readinessScore = caseData.readinessScore ?? 0;

  nodes.push({
    id: appId,
    column: 'APPLICATION',
    type: 'APPLICATION',
    title: caseData.applicationNumber,
    subtitle: `${appType.replace(/_/g, ' ')} • Readiness ${readinessScore}%`,
    status: isAppBad ? 'BAD' : isAppWarn ? 'WARN' : isAppOk ? 'OK' : 'NEUTRAL',
    statusLabel: caseData.status,
    details: {
      'Application Number': caseData.applicationNumber,
      'Academic Year': academicYear,
      'Application Type': appType.replace(/_/g, ' '),
      'Current Stage': caseData.currentStage,
      'Workflow Status': caseData.status,
      'Readiness Score': `${readinessScore} / 100`,
      'Assigned Scrutiny Officer': caseData.assignedOfficer || 'Unassigned',
      'Statutory Deadline': caseData.deadlineAtIst || 'None',
      'SLA Status': caseData.deadlineStatus || 'ON_TRACK',
      'Remaining Window': `${caseData.remainingHours ?? 0} hours (${caseData.remainingBusinessDays ?? 0} business days)`,
    },
    connectedIds: [instId],
    caseId: caseData.id,
    region: caseData.institution?.region || 'WRO',
  });

  edges.push({
    id: `edge-${instId}-${appId}`,
    fromNodeId: instId,
    toNodeId: appId,
    status: isAppBad ? 'BAD' : isAppWarn ? 'WARN' : 'OK',
  });

  // 3. Column: REQUIREMENT & 4. Column: DOCUMENT
  const requirementIds: string[] = [];

  // Requirements definitions per APH
  const reqDefs = [
    {
      id: `req-land-${caseData.id}`,
      title: 'Land Ownership & Lease Deed',
      subtitle: 'APH Sec 6.17: Min 3-Year Live Lease',
      clause: 'APH Section 6.17',
      docTypes: ['LAND_LEASE_DEED', 'LAND_TITLE_DEED'],
    },
    {
      id: `req-fire-${caseData.id}`,
      title: 'Fire Safety NOC Clearance',
      subtitle: 'APH Sec 6.4: Municipal Fire NOC',
      clause: 'APH Section 6.4',
      docTypes: ['FIRE_SAFETY_NOC', 'FIRE_NOC'],
    },
    {
      id: `req-faculty-${caseData.id}`,
      title: 'Faculty Cadre & Ratio Norms',
      subtitle: 'APH Sec 7.2: 1:15 / 1:20 Cadre Ratio',
      clause: 'APH Section 7.2',
      docTypes: ['FACULTY_JOINING_REPORT', 'FACULTY_CREDENTIALS'],
    },
    {
      id: `req-building-${caseData.id}`,
      title: 'Structural Stability Certificate',
      subtitle: 'APH Sec 6.18: Structural Safety',
      clause: 'APH Section 6.18',
      docTypes: ['BUILDING_SAFETY_CERT', 'STRUCTURAL_CERT'],
    },
  ];

  reqDefs.forEach(reqDef => {
    requirementIds.push(reqDef.id);

    // Find documents associated with this requirement
    const matchingDocs = caseData.documents.filter(doc =>
      reqDef.docTypes.some(dt => doc.documentType.toUpperCase().includes(dt) || dt.includes(doc.documentType.toUpperCase()))
    );

    const hasDeficientDoc = matchingDocs.some(d => d.verificationStatus === 'DEFICIENT' || d.verificationStatus === 'EXPIRED');
    const hasVerifiedDoc = matchingDocs.some(d => d.verificationStatus === 'VERIFIED');

    const reqStatus = hasDeficientDoc ? 'BAD' : hasVerifiedDoc ? 'OK' : 'WARN';

    nodes.push({
      id: reqDef.id,
      column: 'REQUIREMENT',
      type: 'REQUIREMENT',
      title: reqDef.title,
      subtitle: reqDef.subtitle,
      status: reqStatus,
      statusLabel: hasDeficientDoc ? 'DEFICIT' : hasVerifiedDoc ? 'COMPLIANT' : 'PENDING',
      details: {
        'Requirement Title': reqDef.title,
        'Statutory Clause': reqDef.clause,
        'Compliance Standing': hasDeficientDoc ? 'Non-Compliant (Deficiency Flagged)' : hasVerifiedDoc ? 'Compliant' : 'Awaiting Review',
        'Evidentiary Documents': matchingDocs.length > 0 ? matchingDocs.map(d => d.documentName).join(', ') : 'No document uploaded',
      },
      connectedIds: [appId],
      caseId: caseData.id,
    });

    edges.push({
      id: `edge-${appId}-${reqDef.id}`,
      fromNodeId: appId,
      toNodeId: reqDef.id,
      status: reqStatus,
    });

    // Create Document Nodes for matching docs
    matchingDocs.forEach(doc => {
      const docNodeId = `doc-${doc.id}`;
      const docStatus =
        doc.verificationStatus === 'VERIFIED'
          ? 'OK'
          : doc.verificationStatus === 'DEFICIENT' || doc.verificationStatus === 'EXPIRED' || doc.verificationStatus === 'REJECTED'
          ? 'BAD'
          : 'WARN';

      const docName = doc.documentName || (doc as unknown as { fileName?: string }).fileName || 'Document';
      const docType = (doc.documentType || 'DOCUMENT').replace(/_/g, ' ');

      nodes.push({
        id: docNodeId,
        column: 'DOCUMENT',
        type: 'DOCUMENT',
        title: docName,
        subtitle: `${docType} • Valid: ${doc.validUntil || 'Perpetual'}`,
        status: docStatus,
        statusLabel: doc.verificationStatus,
        details: {
          'Document Title': docName,
          'Document Type': docType,
          'Verification Status': doc.verificationStatus,
          'SHA-256 Hash': doc.fileHash || '—',
          'Validity Expiration': doc.validUntil || 'No Expiry',
          'Upload Timestamp': doc.uploadedAt || '—',
        },
        connectedIds: [reqDef.id],
        caseId: caseData.id,
      });

      edges.push({
        id: `edge-${reqDef.id}-${docNodeId}`,
        fromNodeId: reqDef.id,
        toNodeId: docNodeId,
        status: docStatus,
      });
    });
  });

  // 5. Column: REVIEW / DECISION
  const reviewNodeIds: string[] = [];

  // Scrutiny Review node
  const scrutinyNodeId = `rev-scrutiny-${caseData.id}`;
  nodes.push({
    id: scrutinyNodeId,
    column: 'REVIEW',
    type: 'SCRUTINY_REVIEW',
    title: 'Statutory Scrutiny Review',
    subtitle: caseData.assignedOfficer ? `Conducted by ${caseData.assignedOfficer}` : 'Regional Scrutiny Cell',
    status: isAppBad ? 'BAD' : isAppWarn ? 'WARN' : 'OK',
    statusLabel: isAppBad ? 'DEFICIENCIES' : 'SCRUTINY_PASS',
    details: {
      'Review Type': 'Documentary Verification & Clause Audit',
      'Assigned Reviewer': caseData.assignedOfficer || 'Scrutiny Officer',
      'Scrutiny Finding': isAppBad ? 'Statutory non-compliances flagged' : 'All mandatory documents verified',
      'Associated Application': caseData.applicationNumber,
    },
    connectedIds: [appId],
    caseId: caseData.id,
  });
  reviewNodeIds.push(scrutinyNodeId);

  edges.push({
    id: `edge-${appId}-${scrutinyNodeId}`,
    fromNodeId: appId,
    toNodeId: scrutinyNodeId,
    status: isAppBad ? 'BAD' : isAppWarn ? 'WARN' : 'OK',
  });

  // Deficiencies nodes (if any)
  (caseData.deficiencies || []).forEach(def => {
    const defNodeId = `def-${def.id}`;
    const defStatus = def.status === 'RESOLVED' ? 'OK' : def.status === 'RESUBMITTED' ? 'INFO' : 'BAD';
    const defCat = (def.category || 'DEFICIENCY').replace(/_/g, ' ');

    nodes.push({
      id: defNodeId,
      column: 'REVIEW',
      type: 'DEFICIENCY_NOTICE',
      title: defCat,
      subtitle: `Status: ${def.status} • Cure Window: ${def.deadlineDays ?? 15}d`,
      status: defStatus,
      statusLabel: def.status,
      details: {
        'Deficiency Category': defCat,
        'Observation Description': def.description,
        'Cure Status': def.status,
        'Statutory Allowance': `${def.deadlineDays ?? 15} business days`,
        'Flagged Timestamp': def.flaggedAt || (def as unknown as { createdAt?: string }).createdAt || '—',
        'Resolved Timestamp': def.resolvedAt || 'Pending Cure',
        'Resolution Note': def.resolutionComment || 'Awaiting Compliance Proof',
        'Submitted Proof': def.proofDocumentName || (def as unknown as { submittedProofUrl?: string }).submittedProofUrl || 'None',
      },
      connectedIds: [scrutinyNodeId],
      caseId: caseData.id,
    });
    reviewNodeIds.push(defNodeId);

    edges.push({
      id: `edge-${scrutinyNodeId}-${defNodeId}`,
      fromNodeId: scrutinyNodeId,
      toNodeId: defNodeId,
      status: defStatus,
    });
  });

  // EVC Inspection node (if reached or scheduled)
  if (caseData.status === 'EVC_PENDING' || caseData.status === 'EVC_SCHEDULED' || caseData.status === 'APPROVED') {
    const evcNodeId = `rev-evc-${caseData.id}`;
    const evcStatus = caseData.status === 'APPROVED' ? 'OK' : caseData.status === 'EVC_SCHEDULED' ? 'INFO' : 'WARN';

    nodes.push({
      id: evcNodeId,
      column: 'REVIEW',
      type: 'EVC_VISIT',
      title: 'Expert Visit Committee (EVC)',
      subtitle: caseData.status === 'EVC_SCHEDULED' ? 'Scheduled 12 Nov 2026' : '3-Member Committee Inspection',
      status: evcStatus,
      statusLabel: caseData.status,
      details: {
        'Inspection Type': 'On-Site Infrastructure & Biometric Audit',
        'Status': caseData.status,
        'Committee Size': '3 Academic Experts (1 Chair + 2 Members)',
        'Conflict Clearance': 'Zero Institutional Conflict of Interest per APH',
        'Application Reference': caseData.applicationNumber,
      },
      connectedIds: [appId],
      caseId: caseData.id,
    });

    edges.push({
      id: `edge-${appId}-${evcNodeId}`,
      fromNodeId: appId,
      toNodeId: evcNodeId,
      status: evcStatus,
    });
  }

  // Final Decision node (if approved or rejected)
  if (caseData.status === 'APPROVED' || caseData.status === 'REJECTED') {
    const decNodeId = `dec-${caseData.id}`;
    const decStatus = caseData.status === 'APPROVED' ? 'OK' : 'BAD';

    nodes.push({
      id: decNodeId,
      column: 'REVIEW',
      type: 'FINAL_DECISION',
      title: `EoA Order: ${caseData.status}`,
      subtitle: `Academic Year: ${caseData.academicYear}`,
      status: decStatus,
      statusLabel: caseData.status,
      details: {
        'Final Order Outcome': caseData.status,
        'Academic Session': caseData.academicYear,
        'Executive Authority': 'AICTE Approval Bureau',
        'Formal Order Document': 'AICTE_EoA_Order_2026-27.pdf',
      },
      connectedIds: [appId],
      caseId: caseData.id,
    });

    edges.push({
      id: `edge-${appId}-${decNodeId}`,
      fromNodeId: appId,
      toNodeId: decNodeId,
      status: decStatus,
    });
  }

  return { nodes, edges };
}
