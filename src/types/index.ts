export type TabType = 'v1' | 'v2' | 'v3' | 'v4' | 'metrics';

export interface PerformanceMetrics {
  mountTime: number | null;        // in ms
  domNodes: number | null;         // count
  heapUsage: number | null;        // in MB
  clickLatency: number | null;     // in ms
  eventListeners: number | null;   // count
}

export type VersionKey = 'v1' | 'v2' | 'v3' | 'v4';

export interface MetricsState {
  v1: PerformanceMetrics;
  v2: PerformanceMetrics;
  v3: PerformanceMetrics;
  v4: PerformanceMetrics;
}

export interface ListStats {
  totalCount: number;
  checkedCount: number;
  lastToggledIndex: number | null;
}
