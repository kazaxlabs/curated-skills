export interface KpiCardData {
  id: string;
  title: string;
  value: string;
  previousValue?: string;
  deltaPercent?: number;
  trend: 'up' | 'down' | 'neutral';
  timeframe: string;
  category: 'traffic' | 'conversion' | 'revenue' | 'seo';
}

export interface TimeSeriesPoint {
  date: string;
  label: string;
  value: number;
}

export interface KeywordRank {
  id: string;
  keyword: string;
  position: number;
  previousPosition: number;
  monthlyVolume: number;
  targetUrl: string;
  updatedAt: string;
}

export interface SearchConsoleMetric {
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
  dateRange: string;
  isSynced: boolean;
}
