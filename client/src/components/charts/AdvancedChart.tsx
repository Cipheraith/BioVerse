/**
 * Advanced Chart Component for BioVerse Visualizations
 * Supports multiple chart types with real-time updates
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { RefreshCw, Download, Maximize2, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import Plot from 'react-plotly.js';
import { PlotData, Layout, Config } from 'plotly.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AdvancedChartProps {
  type: 'line' | 'bar' | 'doughnut' | 'pie' | 'area' | 'heatmap' | 'scatter3d' | 'surface' | 'radar';
  title: string;
  data: ChartData<'line' | 'bar' | 'doughnut' | 'pie'> | PlotData[];
  options?: ChartOptions<'line' | 'bar' | 'doughnut' | 'pie'>;
  layout?: Partial<Layout>;
  height?: number;
  showControls?: boolean;
  realTime?: boolean;
  updateInterval?: number;
  onDataUpdate?: () => void;
  className?: string;
  plotlyConfig?: Partial<Config>;
}

const AdvancedChart: React.FC<AdvancedChartProps> = ({
  type,
  title,
  data,
  options = {},
  layout = {},
  height = 300,
  showControls = true,
  realTime = false,
  updateInterval = 5000,
  onDataUpdate,
  className = '',
  plotlyConfig = {}
}) => {
  const chartRef = useRef<ChartJS | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  // Check if data is Plotly format
  const isPlotlyChart = ['heatmap', 'scatter3d', 'surface', 'radar'].includes(type);
  
  // Real-time data updates
  useEffect(() => {
    const calculateTrendInEffect = () => {
      if (!isPlotlyChart && data.datasets && data.datasets[0] && data.datasets[0].data) {
        const dataPoints = data.datasets[0].data as number[];
        if (dataPoints.length >= 2) {
          const last = dataPoints[dataPoints.length - 1];
          const previous = dataPoints[dataPoints.length - 2];
          
          if (last > previous) setTrend('up');
          else if (last < previous) setTrend('down');
          else setTrend('stable');
        }
      } else if (isPlotlyChart && Array.isArray(data)) {
        // Handle Plotly data trend calculation
        const plotData = data[0];
        if (plotData.y && Array.isArray(plotData.y) && plotData.y.length >= 2) {
          const yData = plotData.y as number[];
          const last = yData[yData.length - 1];
          const previous = yData[yData.length - 2];
          
          if (last > previous) setTrend('up');
          else if (last < previous) setTrend('down');
          else setTrend('stable');
        }
      }
    };

    if (realTime && onDataUpdate) {
      const interval = setInterval(() => {
        onDataUpdate();
        calculateTrendInEffect();
      }, updateInterval);

      return () => clearInterval(interval);
    }
  }, [realTime, updateInterval, onDataUpdate, data, isPlotlyChart]);

  // Default chart options with BioVerse branding
  const defaultOptions: ChartOptions<'line' | 'bar' | 'doughnut' | 'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'Inter, sans-serif'
          }
        }
      },
      title: {
        display: false // We handle title externally
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3B82F6',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          afterLabel: function(context: { datasetIndex: number; parsed: { y: number } }) {
            // Add custom health insights to tooltips
            if (type === 'line' && context.datasetIndex === 0) {
              const value = context.parsed.y;
              if (title.includes('Blood Pressure')) {
                return value > 140 ? '⚠️ High BP - Consult doctor' : 
                       value < 90 ? '⚠️ Low BP - Monitor closely' : 
                       '✅ Normal range';
              }
            }
            return '';
          }
        }
      }
    },
    scales: type !== 'doughnut' && type !== 'pie' ? {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif'
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif'
          }
        }
      }
    } : undefined,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  // Merge custom options with defaults
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    if (onDataUpdate) {
      await onDataUpdate();
    }
    setTimeout(() => setIsLoading(false), 1000);
  };

  // Handle download
  const handleDownload = () => {
    if (chartRef.current) {
      const canvas = chartRef.current.canvas;
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_chart.png`;
      link.href = url;
      link.click();
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Get trend icon
  const TrendIcon = trend === 'up' ? TrendingUp : 
                   trend === 'down' ? TrendingDown : Minus;

  // Get trend color
  const trendColor = trend === 'up' ? 'text-green-500' : 
                     trend === 'down' ? 'text-red-500' : 'text-gray-500';

  // Default Plotly layout
  const defaultPlotlyLayout: Partial<Layout> = {
    autosize: true,
    margin: { l: 50, r: 50, t: 50, b: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      family: 'Inter, sans-serif',
      size: 12,
      color: '#374151'
    },
    ...layout
  };

  // Default Plotly config
  const defaultPlotlyConfig: Partial<Config> = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    ...plotlyConfig
  };

  // Render chart based on type
  const renderChart = () => {
    if (isPlotlyChart) {
      return (
        <Plot
          data={data as PlotData[]}
          layout={{
            ...defaultPlotlyLayout,
            height: isFullscreen ? window.innerHeight - 200 : height
          }}
          config={defaultPlotlyConfig}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      );
    }

    switch (type) {
      case 'line':
      case 'area':
        return (
          <Line
            ref={chartRef}
            data={data as ChartData<'line'>}
            options={mergedOptions}
            height={height}
          />
        );
      case 'bar':
        return (
          <Bar
            ref={chartRef}
            data={data as ChartData<'bar'>}
            options={mergedOptions}
            height={height}
          />
        );
      case 'doughnut':
        return (
          <Doughnut
            ref={chartRef}
            data={data as ChartData<'doughnut'>}
            options={mergedOptions}
            height={height}
          />
        );
      case 'pie':
        return (
          <Pie
            ref={chartRef}
            data={data as ChartData<'pie'>}
            options={mergedOptions}
            height={height}
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      } ${className}`}
    >
      {/* Chart Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            {realTime && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
              </div>
            )}
            <div className={`flex items-center space-x-1 ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span className="text-xs font-medium capitalize">{trend}</span>
            </div>
          </div>

          {showControls && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={handleDownload}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Download chart"
              >
                <Download className="h-4 w-4" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Toggle fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6">
        <div style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}>
          {renderChart()}
        </div>
      </div>

      {/* Chart Footer with BioVerse Branding */}
      <div className="px-6 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>BioVerse Analytics</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AdvancedChart;
