export interface GeoTrackPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  location_type?: string;
  altitude?: number;
  speed?: number;
  source: string;
  confidence: number;
}

export interface GraphNode {
  id: string;
  label: string;
  node_type: string;
  latitude?: number;
  longitude?: number;
  properties?: Record<string, any>;
}

export interface GraphEdge {
  source_id: string;
  target_id: string;
  relationship: string;
  weight?: number;
}

export interface OsintTargetDTO {
  id?: string;
  name: string;
  aliases?: string[];
  primary_email?: string;
  primary_phone?: string;
  opsec_score?: number;
  classification?: string;
}

export interface DossierReport {
  title: string;
  summary: string;
  risk_score: number;
  markdown: string;
}
