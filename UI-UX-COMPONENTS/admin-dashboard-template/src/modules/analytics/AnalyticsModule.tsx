import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Globe, 
  ExternalLink,
  Activity
} from 'lucide-react';
import { IAdminStorageAdapter } from '../../types/adapter';
import { KpiCardData, KeywordRank, SearchConsoleMetric } from '../../types/analytics';
import { EmptyState } from '../../layout/EmptyState';
import { SpatialContainer } from '../../layout/SpatialContainer';

interface AnalyticsModuleProps {
  adapter: IAdminStorageAdapter;
  globalSearchQuery: string;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const AnalyticsModule: React.FC<AnalyticsModuleProps> = ({ adapter, globalSearchQuery, onShowToast }) => {
  const [kpis, setKpis] = useState<KpiCardData[]>([]);
  const [keywords, setKeywords] = useState<KeywordRank[]>([]);
  const [searchConsole, setSearchConsole] = useState<SearchConsoleMetric | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  const loadData = async () => {
    const [kpiData, kwData, scData] = await Promise.all([
      adapter.getKpiCards(),
      adapter.getKeywordRanks(),
      adapter.getSearchConsoleData()
    ]);
    setKpis(kpiData);
    setKeywords(kwData);
    setSearchConsole(scData);
  };

  useEffect(() => {
    loadData();
  }, [adapter]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await adapter.syncAnalytics();
      await loadData();
      onShowToast('Telemetry sync complete', 'success');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredKeywords = keywords.filter(kw => {
    if (!globalSearchQuery) return true;
    return kw.keyword.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
           kw.targetUrl.toLowerCase().includes(globalSearchQuery.toLowerCase());
  });

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Timeframe selector header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} style={{ color: 'var(--brand-text-secondary)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>
            System Telemetry & Organic Discovery
          </span>
        </div>

        <div className="segmented-control">
          {(['7d', '30d', '90d'] as const).map(tf => (
            <button
              key={tf}
              type="button"
              className={`segmented-control-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row with Sparkline Accent */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {kpis.length === 0 ? (
          ['Search Impressions', 'Total Clicks', 'Average CTR', 'Average Position'].map((title) => (
            <SpatialContainer key={title}>
              <div style={{ padding: '18px' }}>
                <span className="form-label">{title}</span>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-ash)', marginTop: '4px' }}>—</div>
                <div style={{ fontSize: '11px', color: 'var(--brand-text-muted)', marginTop: '4px' }}>
                  No telemetry synced
                </div>
              </div>
            </SpatialContainer>
          ))
        ) : (
          kpis.map((kpi) => {
            const isUp = kpi.trend === 'up';
            return (
              <SpatialContainer key={kpi.id}>
                <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="form-label" style={{ marginBottom: 0 }}>{kpi.title}</span>
                      {kpi.deltaPercent !== undefined && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: isUp ? 'var(--signal-live)' : 'var(--signal-danger)'
                          }}
                        >
                          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {kpi.deltaPercent > 0 ? `+${kpi.deltaPercent}%` : `${kpi.deltaPercent}%`}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-ink)', marginTop: '6px' }}>
                      {kpi.value}
                    </div>
                  </div>

                  {/* Minimalist Apple-like SVG Sparkline */}
                  <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--color-hairline-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', color: 'var(--brand-text-muted)', textTransform: 'uppercase' }}>
                      {kpi.timeframe}
                    </span>
                    <svg width="64" height="20" viewBox="0 0 64 20" fill="none">
                      <path
                        d={isUp ? "M0 16 Q 16 12, 32 8 T 64 2" : "M0 4 Q 16 8, 32 12 T 64 18"}
                        stroke={isUp ? "var(--signal-live)" : "var(--signal-danger)"}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </SpatialContainer>
            );
          })
        )}
      </div>

      {/* Search Console Engine Status */}
      <SpatialContainer
        title="Google Search Console Telemetry"
        badge={searchConsole?.isSynced ? 'LIVE TELEMETRY' : 'UNSYNCED'}
        actions={
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="btn-secondary"
            style={{ fontSize: '12px' }}
          >
            <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
            <span>{isSyncing ? 'Synchronizing...' : 'Sync Telemetry'}</span>
          </button>
        }
      >
        <div style={{ padding: '24px' }}>
          {!searchConsole?.isSynced ? (
            <EmptyState
              icon={Globe}
              title="Search Telemetry Disconnected"
              description="Connect Google Search Console API or switch on Demo Fixtures to monitor query clicks, organic impressions, and indexed pages."
              actionLabel="Sync Telemetry"
              onAction={handleSync}
              actionIcon={RefreshCw}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ padding: '16px', border: '1px solid var(--color-hairline)', borderRadius: '8px', backgroundColor: 'var(--surface-recessed)' }}>
                <span className="form-label">Total Clicks</span>
                <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>
                  {searchConsole.totalClicks.toLocaleString()}
                </div>
              </div>
              <div style={{ padding: '16px', border: '1px solid var(--color-hairline)', borderRadius: '8px', backgroundColor: 'var(--surface-recessed)' }}>
                <span className="form-label">Total Impressions</span>
                <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>
                  {searchConsole.totalImpressions.toLocaleString()}
                </div>
              </div>
              <div style={{ padding: '16px', border: '1px solid var(--color-hairline)', borderRadius: '8px', backgroundColor: 'var(--surface-recessed)' }}>
                <span className="form-label">Average CTR</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--signal-info)', marginTop: '4px' }}>
                  {searchConsole.averageCtr}%
                </div>
              </div>
              <div style={{ padding: '16px', border: '1px solid var(--color-hairline)', borderRadius: '8px', backgroundColor: 'var(--surface-recessed)' }}>
                <span className="form-label">Average Position</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--signal-live)', marginTop: '4px' }}>
                  #{searchConsole.averagePosition}
                </div>
              </div>
            </div>
          )}
        </div>
      </SpatialContainer>

      {/* Target Keywords Table */}
      <SpatialContainer
        title="Target Keyword Positions & SERP Visibility"
        badge={`${filteredKeywords.length} tracked`}
      >
        {filteredKeywords.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No Keywords Configured"
            description="Configure monitored keywords to automatically track weekly SERP position changes and search volumes."
          />
        ) : (
          <div className="data-table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Keyword / Search Query</th>
                  <th>Current Position</th>
                  <th>Position Shift</th>
                  <th>Monthly Volume</th>
                  <th>Target URL</th>
                  <th>Last Inspected</th>
                </tr>
              </thead>
              <tbody>
                {filteredKeywords.map((kw) => {
                  const shift = kw.previousPosition - kw.position;
                  return (
                    <tr key={kw.id}>
                      <td style={{ fontWeight: 600 }}>{kw.keyword}</td>
                      <td>
                        <span
                          className={`badge ${
                            kw.position <= 3
                              ? 'badge-live'
                              : kw.position <= 10
                              ? 'badge-info'
                              : 'badge-neutral'
                          }`}
                        >
                          #{kw.position}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            color:
                              shift > 0
                                ? 'var(--signal-live)'
                                : shift < 0
                                ? 'var(--signal-danger)'
                                : 'var(--color-ash)'
                          }}
                        >
                          {shift > 0 ? `+${shift} pos` : shift < 0 ? `${shift} pos` : 'No change'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {kw.monthlyVolume.toLocaleString()} / mo
                      </td>
                      <td>
                        <a
                          href={kw.targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--signal-info)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {kw.targetUrl}
                          </span>
                          <ExternalLink size={12} />
                        </a>
                      </td>
                      <td style={{ fontSize: '11px', color: 'var(--brand-text-muted)' }}>
                        {kw.updatedAt}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SpatialContainer>
    </div>
  );
};
