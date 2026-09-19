import React, { useState } from 'react';
import { TabType } from './types';
import { MetricsProvider } from './context/MetricsContext';
import { NaiveVersion } from './components/v1-naive/NaiveVersion';
import { BatchedVersion } from './components/v2-batched/BatchedVersion';
import { NativeVersion } from './components/v3-native/NativeVersion';
import { VirtualizedVersion } from './components/v4-virtual/VirtualizedVersion';
import { MetricsDashboard } from './components/dashboard/MetricsDashboard';
import { Layers, Zap, Cpu, Eye, BarChart3, CheckSquare2 } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('v4'); // Default to high-performance virtualized for best user experience

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'v1', label: 'v1 Naive', icon: <Layers size={17} /> },
    { id: 'v2', label: 'v2 Batched', icon: <Cpu size={17} /> },
    { id: 'v3', label: 'v3 Native', icon: <Zap size={17} /> },
    { id: 'v4', label: 'v4 Virtual', icon: <Eye size={17} /> },
    { id: 'metrics', label: 'Metrics Dashboard', icon: <BarChart3 size={17} /> },
  ];

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="header-top">
          <div className="title-area">
            <CheckSquare2 size={28} style={{ color: 'var(--primary)' }} />
            <h1 className="app-title">One Million Checkboxes</h1>
          </div>
          <span className="badge">1,000,000 Items Benchmark</span>
        </div>
        <p className="app-subtitle">
          Benchmarking four performance strategies: Naive React, Batched useReducer, Native Event Delegation, and Virtualization.
        </p>
      </header>

      {/* Primary Tab Navigation */}
      <nav className="tabs-nav" role="tablist" aria-label="Performance Strategies">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            data-testid={`tab-${tab.id}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab Panels */}
      <main className="tab-content">
        {activeTab === 'v1' && <NaiveVersion />}
        {activeTab === 'v2' && <BatchedVersion />}
        {activeTab === 'v3' && <NativeVersion />}
        {activeTab === 'v4' && <VirtualizedVersion />}
        {activeTab === 'metrics' && (
          <MetricsDashboard
            onSelectTab={(targetTab) => setActiveTab(targetTab)}
          />
        )}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <MetricsProvider>
      <AppContent />
    </MetricsProvider>
  );
};

export default App;
