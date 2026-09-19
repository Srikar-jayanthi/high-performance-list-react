import React from 'react';
import { useMetrics } from '../../context/MetricsContext';
import { Play, RotateCcw, Award } from 'lucide-react';

interface MetricsDashboardProps {
  onSelectTab: (tab: 'v1' | 'v2' | 'v3' | 'v4') => void;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ onSelectTab }) => {
  const { metrics, populateAllBenchmarks, resetMetrics } = useMetrics();

  const metricRows = [
    {
      key: 'mountTime',
      label: 'Mount time (ms)',
      format: (val: number | null) => (val !== null ? `${val < 10 ? val.toFixed(1) : Math.round(val).toLocaleString()} ms` : null),
      isBest: (val: number | null, allVals: (number | null)[]) => {
        const valid = allVals.filter((v): v is number => v !== null);
        return val !== null && valid.length > 1 && val === Math.min(...valid);
      },
      isWorst: (val: number | null, allVals: (number | null)[]) => {
        const valid = allVals.filter((v): v is number => v !== null);
        return val !== null && valid.length > 1 && val === Math.max(...valid);
      },
    },
    {
      key: 'domNodes',
      label: 'DOM nodes after mount',
      format: (val: number | null) => (val !== null ? val.toLocaleString() : null),
      isBest: (val: number | null, allVals: (number | null)[]) => {
        const valid = allVals.filter((v): v is number => v !== null);
        return val !== null && valid.length > 1 && val === Math.min(...valid);
      },
      isWorst: (val: number | null, allVals: (number | null)[]) => {
        const valid = allVals.filter((v): v is number => v !== null);
        return val !== null && valid.length > 1 && val === Math.max(...valid);
      },
    },
    {
      key: 'heapUsage',
      label: 'JS heap after mount (MB)',
      format: (val: number | null) => (val !== null ? `${val.toFixed(1)} MB` : null),
      isBest: (val: number | null, allVals: (number | null)[]) => {
        const valid = allVals.filter((v): v is number => v !== null);
        return val !== null && valid.length > 1 && val === Math.min(...valid);
      },
      isWorst: (val: number | null, allVals: (number | null)[]) => {
        const valid = allVals.filter((v): v is number => v !== null);
        return val !== null && valid.length > 1 && val === Math.max(...valid);
      },
    },
    {
      key: 'clickLatency',
      label: 'Click latency (ms)',
      format: (val: number | null) => (val !== null ? `${val.toFixed(1)} ms` : null),
      isBest: (val: number | null, allVals: (number | null)[]) => {
        const valid = allVals.filter((v): v is number => v !== null);
        return val !== null && valid.length > 1 && val === Math.min(...valid);
      },
      isWorst: (val: number | null, allVals: (number | null)[]) => {
        const valid = allVals.filter((v): v is number => v !== null);
        return val !== null && valid.length > 1 && val === Math.max(...valid);
      },
    },
    {
      key: 'eventListeners',
      label: 'Event listeners on container',
      format: (val: number | null) => (val !== null ? val.toLocaleString() : null),
      isBest: (val: number | null, allVals: (number | null)[]) => {
        const valid = allVals.filter((v): v is number => v !== null);
        return val !== null && valid.length > 1 && val === Math.min(...valid);
      },
      isWorst: (val: number | null, allVals: (number | null)[]) => {
        const valid = allVals.filter((v): v is number => v !== null);
        return val !== null && valid.length > 1 && val === Math.max(...valid);
      },
    },
  ] as const;

  const versions: Array<{ key: 'v1' | 'v2' | 'v3' | 'v4'; label: string }> = [
    { key: 'v1', label: 'v1 Naive' },
    { key: 'v2', label: 'v2 Batched' },
    { key: 'v3', label: 'v3 Native' },
    { key: 'v4', label: 'v4 Virtual' },
  ];

  return (
    <div className="metrics-dashboard-container" data-testid="metrics-dashboard">
      <div className="dashboard-card">
        <div className="dashboard-title-row">
          <div>
            <h2>Performance Metrics Comparison</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Live comparison across all four 1,000,000 checkbox rendering strategies.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={populateAllBenchmarks}
              data-testid="load-benchmark-btn"
              title="Populate table with complete standard benchmark profile"
            >
              <Play size={16} />
              <span>Load Full Benchmark Profile</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetMetrics}
              data-testid="reset-metrics-btn"
              title="Reset captured live metrics"
            >
              <RotateCcw size={16} />
              <span>Reset Live Data</span>
            </button>
          </div>
        </div>

        {/* Primary Metrics Comparison Table */}
        <div className="metrics-table-wrapper">
          <table className="metrics-table" data-testid="metrics-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>v1 Naive</th>
                <th>v2 Batched</th>
                <th>v3 Native</th>
                <th>v4 Virtual</th>
              </tr>
            </thead>
            <tbody>
              {metricRows.map((row) => {
                const values = versions.map((v) => metrics[v.key][row.key]);
                return (
                  <tr key={row.key} data-testid={`metric-row-${row.key}`}>
                    <td className="metric-row-name">{row.label}</td>
                    {versions.map((v) => {
                      const val = metrics[v.key][row.key];
                      const formatted = row.format(val);
                      const best = row.isBest(val, values);
                      const worst = row.isWorst(val, values);

                      let cellClass = 'metric-cell-value';
                      if (best) cellClass += ' best';
                      else if (worst) cellClass += ' worst';
                      if (!formatted) cellClass += ' empty';

                      return (
                        <td key={v.key} data-testid={`metric-${row.key}-${v.key}`}>
                          {formatted ? (
                            <span className={cellClass}>
                              {formatted}
                              {best && <Award size={14} style={{ display: 'inline', marginLeft: '5px', verticalAlign: 'middle' }} />}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onSelectTab(v.key)}
                              className="btn btn-secondary"
                              style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                            >
                              Visit {v.label}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Architectural Breakdown & Impact Cards */}
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
        Architectural Analysis & Performance Impact
      </h3>
      <div className="comparison-grid">
        {/* v1 Naive Card */}
        <div className="arch-card" style={{ borderTop: '4px solid var(--accent-red)' }}>
          <div className="arch-card-header">
            <span className="arch-card-title">v1 Naive</span>
            <span className="tab-badge" style={{ color: 'var(--accent-red)' }}>Baseline</span>
          </div>
          <p>
            Standard React map over 1,000,000 items. Inline arrow functions create 1,000,000 handler closures on every render.
            React reconciliation manages 1,000,000 elements simultaneously.
          </p>
          <div className="arch-card-footer" style={{ color: 'var(--accent-red)' }}>
            ⚠️ High Memory (~1.1 GB) &amp; Slow Mount (5-15s)
          </div>
        </div>

        {/* v2 Batched Card */}
        <div className="arch-card" style={{ borderTop: '4px solid var(--accent-amber)' }}>
          <div className="arch-card-header">
            <span className="arch-card-title">v2 Batched</span>
            <span className="tab-badge" style={{ color: 'var(--accent-amber)' }}>useReducer</span>
          </div>
          <p>
            Replaces JS objects with a 1 MB <code>Uint8Array</code>. Passes stable <code>dispatch</code> into memoized <code>Row</code> components via <code>React.memo</code> to prevent cascading re-renders.
          </p>
          <div className="arch-card-footer" style={{ color: 'var(--accent-amber)' }}>
            ⚡ Low State Memory (1 MB), but slow initial mount
          </div>
        </div>

        {/* v3 Native Card */}
        <div className="arch-card" style={{ borderTop: '4px solid var(--accent-purple)' }}>
          <div className="arch-card-header">
            <span className="arch-card-title">v3 Native</span>
            <span className="tab-badge" style={{ color: 'var(--accent-purple)' }}>Event Delegation</span>
          </div>
          <p>
            Bypasses React VDOM entirely. Constructs nodes with a single <code>DocumentFragment</code>.
            Attaches <strong>exactly 1 click listener</strong> to the container, inspecting <code>label[data-index]</code>.
          </p>
          <div className="arch-card-footer" style={{ color: 'var(--accent-purple)' }}>
            🚀 Instant Clicks (~1ms) &amp; 1 Delegated Listener
          </div>
        </div>

        {/* v4 Virtual Card */}
        <div className="arch-card" style={{ borderTop: '4px solid var(--accent-green)' }}>
          <div className="arch-card-header">
            <span className="arch-card-title">v4 Virtual</span>
            <span className="tab-badge" style={{ color: 'var(--accent-green)' }}>Best of Both</span>
          </div>
          <p>
            Uses <code>@tanstack/react-virtual</code> to render only the ~30 visible rows in viewport.
            DOM nodes and memory remain small and constant. Enables instant random jumping anywhere in 1M rows.
          </p>
          <div className="arch-card-footer" style={{ color: 'var(--accent-green)' }}>
            🏆 Lowest Memory (~18 MB) &amp; Instant Mount (~4ms)
          </div>
        </div>
      </div>
    </div>
  );
};
export default MetricsDashboard;
