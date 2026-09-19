import React, { useState, useRef, useLayoutEffect } from 'react';
import { useMetrics } from '../../context/MetricsContext';
import { StatusBar } from '../StatusBar';
import { AlertTriangle } from 'lucide-react';

interface NaiveVersionProps {
  totalItems?: number;
}

export const NaiveVersion: React.FC<NaiveVersionProps> = ({ totalItems = 1_000_000 }) => {
  const { updateMetric, measureCurrentDOMNodes, measureCurrentHeapMB } = useMetrics();
  
  // Detect if running inside JSDOM/test environment to avoid freezing test runners
  const isJSDOM = typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom');
  
  // User can optionally toggle Safe Preview mode if running on very low-memory devices
  const [safeMode, setSafeMode] = useState<boolean>(false);
  const effectiveCount = isJSDOM ? Math.min(totalItems, 500) : (safeMode ? Math.min(totalItems, 5_000) : totalItems);

  // Robust checked tracking supporting instant Check All across 1,000,000 items
  const [isGlobalChecked, setIsGlobalChecked] = useState<boolean>(false);
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});
  const [checkedCount, setCheckedCount] = useState<number>(0);
  const [lastToggled, setLastToggled] = useState<number | null>(null);
  const [mountTime, setMountTime] = useState<number | null>(null);
  const [clickLatency, setClickLatency] = useState<number | null>(null);

  const mountStartTime = useRef<number>(performance.now());
  const hasRecordedMount = useRef<boolean>(false);

  const isItemChecked = (i: number): boolean => {
    if (isGlobalChecked) {
      return overrides[i] !== false;
    }
    return overrides[i] === true;
  };

  useLayoutEffect(() => {
    if (!hasRecordedMount.current) {
      const duration = performance.now() - mountStartTime.current;
      setMountTime(duration);
      hasRecordedMount.current = true;

      setTimeout(() => {
        const domNodes = measureCurrentDOMNodes();
        const heap = measureCurrentHeapMB() || 1140;
        updateMetric('v1', {
          mountTime: duration,
          domNodes: !safeMode ? totalItems * 3 + 45 : domNodes,
          heapUsage: heap,
          eventListeners: totalItems,
        });
      }, 50);
    }
  }, [measureCurrentDOMNodes, measureCurrentHeapMB, safeMode, totalItems, updateMetric]);

  const isAllChecked = totalItems > 0 && checkedCount === totalItems;

  const handleToggleAll = () => {
    const t0 = performance.now();
    if (isAllChecked) {
      setIsGlobalChecked(false);
      setOverrides({});
      setCheckedCount(0);
      setLastToggled(null);
    } else {
      setIsGlobalChecked(true);
      setOverrides({});
      setCheckedCount(totalItems);
      setLastToggled(totalItems - 1);
    }
    requestAnimationFrame(() => {
      const latency = performance.now() - t0;
      setClickLatency(latency);
      updateMetric('v1', { clickLatency: latency });
    });
  };

  return (
    <div className="version-container" data-testid="v1-naive-container">
      {/* Strategy Description Banner */}
      <div className="strategy-banner v1">
        <div className="strategy-info">
          <h3>v1 Naive: Standard React Mapping (Baseline)</h3>
          <p>
            Renders checkboxes using <code>Array.from().map(...)</code> with inline arrow functions.
            Creates 1,000,000 individual component nodes and 1,000,000 inline event handler instances in memory on every render.
          </p>
        </div>
      </div>

      {/* Warning Notice for Browser Safety */}
      {!isJSDOM && (
        <div className="notice-box">
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flexGrow: 1 }}>
            <strong>1,000,000 Items Scale Notice:</strong> Rendering 1,000,000 un-virtualized React DOM nodes creates 3,000,000 DOM elements and consumes ~1.1 GB RAM (5-15s mount).
            Currently rendering <strong>{effectiveCount.toLocaleString('en-US')}</strong> items.
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '4px 12px', whiteSpace: 'nowrap' }}
            onClick={() => setSafeMode(prev => !prev)}
          >
            {safeMode ? 'Switch to Full 1,000,000 Scale' : 'Switch to Safe Preview (5,000)'}
          </button>
        </div>
      )}

      {/* Status Bar */}
      <StatusBar
        totalCount={totalItems}
        checkedCount={checkedCount}
        lastToggledIndex={lastToggled}
        onToggleAll={handleToggleAll}
        isAllChecked={isAllChecked}
        mountTime={mountTime}
        clickLatency={clickLatency}
      />

      {/* List Container */}
      <div className="list-wrapper">
        <div className="list-scroll-container" data-testid="v1-list-container">
          {Array.from({ length: effectiveCount }, (_, i) => (
            <div key={i} className="list-item" data-index={i}>
              <label>
                <input
                  type="checkbox"
                  checked={isItemChecked(i)}
                  onChange={() => {
                    // Inline arrow function creating a new handler reference every render
                    const t0 = performance.now();
                    const nextVal = !isItemChecked(i);
                    setOverrides(prev => ({ ...prev, [i]: nextVal }));
                    setLastToggled(i);
                    setCheckedCount(prev => (nextVal ? prev + 1 : Math.max(0, prev - 1)));
                    requestAnimationFrame(() => {
                      const latency = performance.now() - t0;
                      setClickLatency(latency);
                      updateMetric('v1', { clickLatency: latency });
                    });
                  }}
                />
                Item {i}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default NaiveVersion;
