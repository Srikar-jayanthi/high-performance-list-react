import React from 'react';
import { CheckSquare, Square, Clock, MousePointerClick, Hash } from 'lucide-react';

interface StatusBarProps {
  totalCount: number;
  checkedCount: number;
  lastToggledIndex: number | null;
  onToggleAll: () => void;
  isAllChecked: boolean;
  mountTime: number | null;
  clickLatency: number | null;
  extraActions?: React.ReactNode;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  totalCount,
  checkedCount,
  lastToggledIndex,
  onToggleAll,
  isAllChecked,
  mountTime,
  clickLatency,
  extraActions,
}) => {
  const percentage = ((checkedCount / totalCount) * 100).toFixed(1);

  return (
    <div className="status-bar-container" data-testid="status-bar">
      <div className="status-bar-top">
        <div className="stats-group">
          <div className="stat-item" data-testid="stat-total">
            <span className="stat-label">Total Items</span>
            <span className="stat-value">{totalCount.toLocaleString()}</span>
          </div>

          <div className="stat-item" data-testid="stat-checked">
            <span className="stat-label">Checked</span>
            <span className="stat-value highlight">
              {checkedCount.toLocaleString()}{' '}
              <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>
                ({percentage}%)
              </span>
            </span>
          </div>

          <div className="stat-item" data-testid="stat-last-toggled">
            <span className="stat-label">Last Toggled</span>
            <span className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Hash size={15} style={{ color: 'var(--text-muted)' }} />
              {lastToggledIndex !== null ? `Item ${lastToggledIndex}` : 'None'}
            </span>
          </div>
        </div>

        <div className="actions-group">
          {extraActions}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onToggleAll}
            data-testid="toggle-all-button"
            title={isAllChecked ? "Uncheck all 1,000,000 items" : "Check all 1,000,000 items"}
          >
            {isAllChecked ? (
              <>
                <Square size={16} />
                <span>Uncheck All</span>
              </>
            ) : (
              <>
                <CheckSquare size={16} />
                <span>Check All</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="live-metrics-bar" data-testid="live-metrics-bar">
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Live Performance:</span>
        <div className="metric-pill" data-testid="metric-mount-time">
          <Clock size={14} style={{ color: 'var(--primary)' }} />
          <span>Mount Time:</span>
          <strong>{mountTime !== null ? `${mountTime.toFixed(1)} ms` : 'Measuring...'}</strong>
        </div>

        <div className="metric-pill" data-testid="metric-click-latency">
          <MousePointerClick size={14} style={{ color: 'var(--accent-green)' }} />
          <span>Click Latency:</span>
          <strong>{clickLatency !== null ? `${clickLatency.toFixed(1)} ms` : 'None (click a checkbox)'}</strong>
        </div>
      </div>
    </div>
  );
};
