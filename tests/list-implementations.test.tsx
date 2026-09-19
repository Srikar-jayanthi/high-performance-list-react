import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { MetricsProvider } from '../src/context/MetricsContext';
import { StatusBar } from '../src/components/StatusBar';
import { NaiveVersion } from '../src/components/v1-naive/NaiveVersion';
import { BatchedVersion, Row } from '../src/components/v2-batched/BatchedVersion';
import { NativeVersion } from '../src/components/v3-native/NativeVersion';
import { VirtualizedVersion } from '../src/components/v4-virtual/VirtualizedVersion';
import { MetricsDashboard } from '../src/components/dashboard/MetricsDashboard';

describe('High-Performance List UI & Event Delegation', () => {
  describe('Tab Navigation (Requirement 5)', () => {
    it('renders all five tabs with correct labels', () => {
      render(<App />);
      expect(screen.getByTestId('tab-v1')).toHaveTextContent('v1 Naive');
      expect(screen.getByTestId('tab-v2')).toHaveTextContent('v2 Batched');
      expect(screen.getByTestId('tab-v3')).toHaveTextContent('v3 Native');
      expect(screen.getByTestId('tab-v4')).toHaveTextContent('v4 Virtual');
      expect(screen.getByTestId('tab-metrics')).toHaveTextContent('Metrics Dashboard');
    });

    it('switches views when clicking each tab', async () => {
      render(<App />);

      // Switch to v1 Naive
      fireEvent.click(screen.getByTestId('tab-v1'));
      expect(screen.getByTestId('v1-naive-container')).toBeInTheDocument();

      // Switch to v2 Batched
      fireEvent.click(screen.getByTestId('tab-v2'));
      expect(screen.getByTestId('v2-batched-container')).toBeInTheDocument();

      // Switch to v3 Native
      fireEvent.click(screen.getByTestId('tab-v3'));
      expect(screen.getByTestId('v3-native-container')).toBeInTheDocument();

      // Switch to v4 Virtual
      fireEvent.click(screen.getByTestId('tab-v4'));
      expect(screen.getByTestId('v4-virtual-container')).toBeInTheDocument();

      // Switch to Metrics Dashboard
      fireEvent.click(screen.getByTestId('tab-metrics'));
      expect(screen.getByTestId('metrics-dashboard')).toBeInTheDocument();
    });
  });

  describe('StatusBar Component (Requirements 7 & 8)', () => {
    it('displays total count, checked count, and last toggled item correctly', () => {
      render(
        <StatusBar
          totalCount={1_000_000}
          checkedCount={42}
          lastToggledIndex={7}
          onToggleAll={() => {}}
          isAllChecked={false}
          mountTime={12.5}
          clickLatency={1.2}
        />
      );

      expect(screen.getByTestId('stat-total')).toHaveTextContent('1,000,000');
      expect(screen.getByTestId('stat-checked')).toHaveTextContent('42');
      expect(screen.getByTestId('stat-last-toggled')).toHaveTextContent('Item 7');
      expect(screen.getByTestId('metric-mount-time')).toHaveTextContent('12.5 ms');
      expect(screen.getByTestId('metric-click-latency')).toHaveTextContent('1.2 ms');
      expect(screen.getByTestId('toggle-all-button')).toHaveTextContent('Check All');
    });

    it('displays Uncheck All when all items are checked', () => {
      render(
        <StatusBar
          totalCount={1_000_000}
          checkedCount={1_000_000}
          lastToggledIndex={999999}
          onToggleAll={() => {}}
          isAllChecked={true}
          mountTime={10}
          clickLatency={0.5}
        />
      );

      expect(screen.getByTestId('toggle-all-button')).toHaveTextContent('Uncheck All');
    });
  });

  describe('v1: Naive Implementation (Requirement 1 & 6)', () => {
    it('renders checkboxes with labels and updates state on toggle', async () => {
      render(
        <MetricsProvider>
          <NaiveVersion totalItems={10} />
        </MetricsProvider>
      );

      // Check items and labels
      const checkbox0 = screen.getByLabelText(/Item 0/i) as HTMLInputElement;
      expect(checkbox0).not.toBeChecked();

      // Click checkbox
      fireEvent.click(checkbox0);
      expect(checkbox0).toBeChecked();

      // Check status bar updates
      expect(screen.getByTestId('stat-checked')).toHaveTextContent('1');
      expect(screen.getByTestId('stat-last-toggled')).toHaveTextContent('Item 0');
    });

    it('toggles all items on Check All and Uncheck All', async () => {
      render(
        <MetricsProvider>
          <NaiveVersion totalItems={5} />
        </MetricsProvider>
      );

      const toggleAllBtn = screen.getByTestId('toggle-all-button');
      fireEvent.click(toggleAllBtn);

      expect(screen.getByTestId('stat-checked')).toHaveTextContent('5');
      expect(screen.getByTestId('toggle-all-button')).toHaveTextContent('Uncheck All');

      // Click again to uncheck all
      fireEvent.click(toggleAllBtn);
      expect(screen.getByTestId('stat-checked')).toHaveTextContent('0');
      expect(screen.getByTestId('toggle-all-button')).toHaveTextContent('Check All');
    });

    it('allows toggling individual items after Check All is active', () => {
      render(
        <MetricsProvider>
          <NaiveVersion totalItems={5} />
        </MetricsProvider>
      );

      const toggleAllBtn = screen.getByTestId('toggle-all-button');
      fireEvent.click(toggleAllBtn);
      expect(screen.getByTestId('stat-checked')).toHaveTextContent('5');

      // Uncheck item 2
      const checkbox2 = screen.getByLabelText(/Item 2/i) as HTMLInputElement;
      fireEvent.click(checkbox2);
      expect(checkbox2).not.toBeChecked();
      expect(screen.getByTestId('stat-checked')).toHaveTextContent('4');
      expect(screen.getByTestId('toggle-all-button')).toHaveTextContent('Check All');
    });
  });

  describe('v2: Batched Implementation with React.memo (Requirement 2)', () => {
    it('Row component renders checkbox and item label, and calls dispatch on change', () => {
      const dispatch = vi.fn();
      const onItemClicked = vi.fn();

      render(
        <Row
          index={42}
          checked={false}
          dispatch={dispatch}
          onItemClicked={onItemClicked}
        />
      );

      const checkbox = screen.getByLabelText(/Item 42/i) as HTMLInputElement;
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(dispatch).toHaveBeenCalledWith({ type: 'TOGGLE', index: 42 });
      expect(onItemClicked).toHaveBeenCalledWith(42);
    });

    it('BatchedVersion handles state toggling and Check All properly', () => {
      render(
        <MetricsProvider>
          <BatchedVersion totalItems={10} />
        </MetricsProvider>
      );

      const checkbox1 = screen.getByLabelText(/Item 1/i) as HTMLInputElement;
      expect(checkbox1).not.toBeChecked();

      fireEvent.click(checkbox1);
      expect(screen.getByTestId('stat-checked')).toHaveTextContent('1');
      expect(screen.getByTestId('stat-last-toggled')).toHaveTextContent('Item 1');

      // Check All
      fireEvent.click(screen.getByTestId('toggle-all-button'));
      expect(screen.getByTestId('stat-checked')).toHaveTextContent('10');
      expect(screen.getByTestId('toggle-all-button')).toHaveTextContent('Uncheck All');
    });
  });

  describe('v3: Native DOM with Event Delegation (Requirement 3)', () => {
    it('creates DOM nodes inside container and handles delegated click on label/checkbox', async () => {
      render(
        <MetricsProvider>
          <NativeVersion totalItems={20} />
        </MetricsProvider>
      );

      const container = screen.getByTestId('v3-native-list');
      expect(container.children.length).toBeGreaterThan(0);

      // Find first label
      const firstLabel = container.querySelector('label[data-index="0"]') as HTMLElement;
      expect(firstLabel).toBeInTheDocument();
      expect(firstLabel.textContent).toContain('Item 0');

      const checkbox = firstLabel.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      // Click via event delegation
      fireEvent.click(firstLabel);
      expect(checkbox.checked).toBe(true);
      expect(screen.getByTestId('stat-checked')).toHaveTextContent('1');
      expect(screen.getByTestId('stat-last-toggled')).toHaveTextContent('Item 0');
    });

    it('handles Check All and Uncheck All natively', () => {
      render(
        <MetricsProvider>
          <NativeVersion totalItems={15} />
        </MetricsProvider>
      );

      const toggleBtn = screen.getByTestId('toggle-all-button');
      fireEvent.click(toggleBtn);

      expect(screen.getByTestId('stat-checked')).toHaveTextContent('15');
      expect(screen.getByTestId('toggle-all-button')).toHaveTextContent('Uncheck All');

      fireEvent.click(toggleBtn);
      expect(screen.getByTestId('stat-checked')).toHaveTextContent('0');
      expect(screen.getByTestId('toggle-all-button')).toHaveTextContent('Check All');
    });
  });

  describe('v4: Virtualized React Implementation (Requirement 4)', () => {
    it('renders virtualized container with scroll elements and jump button', () => {
      render(
        <MetricsProvider>
          <VirtualizedVersion totalItems={1_000_000} />
        </MetricsProvider>
      );

      expect(screen.getByTestId('v4-scroll-container')).toBeInTheDocument();
      expect(screen.getByTestId('v4-inner-container')).toBeInTheDocument();
      expect(screen.getByTestId('jump-random-button')).toBeInTheDocument();
      expect(screen.getByTestId('stat-total')).toHaveTextContent('1,000,000');
    });

    it('handles Jump to Random Item button without errors', () => {
      render(
        <MetricsProvider>
          <VirtualizedVersion totalItems={1_000_000} />
        </MetricsProvider>
      );

      const jumpBtn = screen.getByTestId('jump-random-button');
      expect(() => fireEvent.click(jumpBtn)).not.toThrow();
    });
  });

  describe('Metrics Dashboard Tab (Requirements 10 & 11)', () => {
    it('renders comparison table with all 5 required metric rows and 4 version columns', () => {
      render(
        <MetricsProvider>
          <MetricsDashboard onSelectTab={() => {}} />
        </MetricsProvider>
      );

      // Check table headers
      const table = screen.getByTestId('metrics-table');
      expect(table).toHaveTextContent('Metric');
      expect(table).toHaveTextContent('v1 Naive');
      expect(table).toHaveTextContent('v2 Batched');
      expect(table).toHaveTextContent('v3 Native');
      expect(table).toHaveTextContent('v4 Virtual');

      // Check all 5 required metric rows
      expect(screen.getByTestId('metric-row-mountTime')).toHaveTextContent('Mount time (ms)');
      expect(screen.getByTestId('metric-row-domNodes')).toHaveTextContent('DOM nodes after mount');
      expect(screen.getByTestId('metric-row-heapUsage')).toHaveTextContent('JS heap after mount (MB)');
      expect(screen.getByTestId('metric-row-clickLatency')).toHaveTextContent('Click latency (ms)');
      expect(screen.getByTestId('metric-row-eventListeners')).toHaveTextContent('Event listeners on container');
    });

    it('populates full benchmark baseline and updates table values', async () => {
      render(
        <MetricsProvider>
          <MetricsDashboard onSelectTab={() => {}} />
        </MetricsProvider>
      );

      const loadBenchmarkBtn = screen.getByTestId('load-benchmark-btn');
      fireEvent.click(loadBenchmarkBtn);

      await waitFor(() => {
        expect(screen.getByTestId('metric-mountTime-v1')).toHaveTextContent('8,420 ms');
        expect(screen.getByTestId('metric-mountTime-v4')).toHaveTextContent('4.8 ms');
        expect(screen.getByTestId('metric-eventListeners-v3')).toHaveTextContent('1');
        expect(screen.getByTestId('metric-eventListeners-v4')).toHaveTextContent('35');
      });
    });

    it('resets metrics table when clicking Reset Live Data', async () => {
      render(
        <MetricsProvider>
          <MetricsDashboard onSelectTab={() => {}} />
        </MetricsProvider>
      );

      // Populate first
      fireEvent.click(screen.getByTestId('load-benchmark-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('metric-mountTime-v1')).toHaveTextContent('8,420 ms');
      });

      // Reset
      fireEvent.click(screen.getByTestId('reset-metrics-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('metric-mountTime-v1')).toHaveTextContent('Visit v1 Naive');
      });
    });

    it('dynamically collects metrics when tabs are visited and persists across navigation (Requirement 11)', async () => {
      render(<App />);

      // App starts on v4 Virtual - metrics for v4 are collected on mount
      await waitFor(() => {
        expect(screen.getByTestId('metric-mount-time')).not.toHaveTextContent('Measuring...');
      });

      // Visit v3 Native
      fireEvent.click(screen.getByTestId('tab-v3'));
      expect(screen.getByTestId('v3-native-container')).toBeInTheDocument();

      // Visit Metrics Dashboard
      fireEvent.click(screen.getByTestId('tab-metrics'));
      expect(screen.getByTestId('metrics-dashboard')).toBeInTheDocument();

      // Check that metrics for v4 and v3 are rendered in their columns and persisted
      await waitFor(() => {
        expect(screen.getByTestId('metric-eventListeners-v3')).toHaveTextContent('1');
        expect(screen.getByTestId('metric-mountTime-v4')).not.toHaveTextContent('Visit v4 Virtual');
      });

      // Switch away to v2 Batched and back to Metrics Dashboard
      fireEvent.click(screen.getByTestId('tab-v2'));
      expect(screen.getByTestId('v2-batched-container')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('tab-metrics'));
      expect(screen.getByTestId('metrics-dashboard')).toBeInTheDocument();

      // Data persists!
      expect(screen.getByTestId('metric-eventListeners-v3')).toHaveTextContent('1');
    });
  });
});
