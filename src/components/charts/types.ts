

export interface PerformanceTrendData extends BaseChartData {
  date: string | Date;
  score: number;
  label?: string;
}

export interface TeamActivityData {
  label: string;
  value: number;
  category?: string;
}

export interface KPIMetricsData extends BaseChartData {
  date: string | Date;
  [key: string]: string | Date | number | undefined;
}

export interface BaseChartProps {
  title?: string;
  description?: string;
  isLoading?: boolean;
  className?: string;
}