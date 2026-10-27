import type { Region } from './domain';

export type GraphColumnId =
  | 'INSTITUTION'
  | 'APPLICATION'
  | 'REQUIREMENT'
  | 'DOCUMENT'
  | 'REVIEW';

export type GraphNodeStatus = 'OK' | 'WARN' | 'BAD' | 'INFO' | 'NEUTRAL';

export type GraphMode = 'TRACE' | 'EVIDENCE' | 'IMPACT';

export interface GraphNode {
  id: string;
  column: GraphColumnId;
  type:
    | 'INSTITUTION'
    | 'CAMPUS'
    | 'APPLICATION'
    | 'REQUIREMENT'
    | 'DOCUMENT'
    | 'SCRUTINY_REVIEW'
    | 'DEFICIENCY_NOTICE'
    | 'EVC_VISIT'
    | 'FINAL_DECISION';
  title: string;
  subtitle?: string;
  status: GraphNodeStatus;
  statusLabel?: string;
  details: Record<string, string | number | boolean | null | undefined>;
  connectedIds: string[];
  caseId?: string;
  region?: Region;
}

export interface GraphEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  status?: GraphNodeStatus;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
