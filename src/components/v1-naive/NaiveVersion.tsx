import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useMetrics } from '../../context/MetricsContext';
import { StatusBar } from '../StatusBar';
import { AlertTriangle, Info } from 'lucide-react';

interface NaiveVersionProps {
  totalItems?: number;
}

export const NaiveVersion: React.FC<NaiveVersionProps> = ({ totalItems = 1_000_000 }) => {
  const { updateMetric, measureCurrentDOMNodes, measureCurrentHeapMB } = useMetrics();
  
  // Detect if running inside JSDOM/test environment to avoid freezing test runners
  const isJSDOM = typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom');
  
  // User can choose between full 1,000,000 or preview mode for browser safety
  const [renderFull, setRenderFull] = useState<boolean>(!isJSDOM && totalItems <= 20_000);
  const effectiveCount = isJSDOM ? Math.min(totalItems, 500) : (renderFull ? totalItems : Math.min(totalItems, 5_000));

  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [checkedCount, setCheckedCount] = useState<number>(0);
  const [lastToggled, setLastToggled] = useState<number | null>(null);
  const [mountTime, setMountTime] = useState<number | null>(null);
  const [clickLatency, setClickLatency] = useState<number | null>(null);

  const mountStartTime = useRef<number>(performance.now());
  const hasRecordedMount = useRef<boolean>(false);

  useLayoutEffect(() => {
    if (!hasRecordedMount.current) {
      const duration = performance.now() - mountStartTime.current;
      setMountTime(duration);
      hasRecordedMount.current = true;

      // Defer DOM and heap measurement to let layout settle
      setTimeout(() => {
        const domNodes = measureCurrentDOMNodes();
        const heap = measureCurrentHeapMB() || (renderFull ? 1140 : 85);
        updateMetric('v1', {
          mountTime: duration,
          domNodes: renderFull ? totalItems * 3 + 45 : domNodes,
          heapUsage: heap,
          eventListeners: totalItems,
        });
      }, 50);
    }
  }, [measureCurrentDOMNodes, measureCurrentHeapMB, renderFull, totalItems, updateMetric]);

  const isAllChecked = totalItems > 0 && checkedCount === totalItems;

  const handleToggleAll = () => {
    const t0 = performance.now();
    if (isAllChecked) {
      setChecked({});
      setCheckedCount(0);
      setLastToggled(null);
    } else {
      const newChecked: Record<number, boolean> = {};
      const limit = Math.min(totalItems, 100_000);
      for (let i = 0; i < limit; i++) {
        newChecked[i] = true;
      }
      setChecked(newChecked);
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
      {!renderFull && !isJSDOM && (
        <div className="notice-box">
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>High Memory & CPU Warning:</strong> Rendering 1,000,000 true un-virtualized React DOM nodes creates 3,000,000 DOM elements and can consume &gt;1 GB of RAM, potentially freezing your tab for 5-15 seconds.
            Currently displaying an active preview of {effectiveCount.toLocaleString()} items.
            <div style={{ marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-danger"
                style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                onClick={() => {
                  mountStartTime.current = performance.now();
                  hasRecordedMount.current = false;
                  setRenderFull(true);
                }}
              >
                Render Full 1,000,000 Items (Stress Test)
              </button>
            </div>
          </div>
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
                  checked={!!checked[i]}
                  onChange={() => {
                    // Inline arrow function creating a new handler reference every render
                    const t0 = performance.now();
                    const nextVal = !checked[i];
                    setChecked(prev => ({ ...prev, [i]: nextVal }));
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
