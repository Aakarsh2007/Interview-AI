import React, { useState, useEffect } from 'react';
import { useInterview } from '../hooks/useInterview';

interface AnalyticsData {
  totalInterviews: number;
  totalStrategies: number;
  averageScore: number;
  strongestSkill: string;
  weakestSkill: string;
  scoreHistory: { date: string; score: number }[];
}

export const MockAnalytics: React.FC = () => {
  const { fetchAnalytics, loading } = useInterview();
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      const res = await fetchAnalytics();
      if (res) {
        setData(res);
      }
    };
    loadAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div style={{ color: 'white', padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
        <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Loading analytics dashboard...</div>
        <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '1rem auto' }}></div>
      </div>
    );
  }

  const { totalInterviews, totalStrategies, averageScore, strongestSkill, weakestSkill, scoreHistory } = data;

  // Chart configuration
  const width = 600;
  const height = 240;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Generate points for the SVG score history line
  const points = scoreHistory.map((pt, index) => {
    const x = padding + (index / Math.max(1, scoreHistory.length - 1)) * chartWidth;
    const y = padding + chartHeight - (pt.score / 100) * chartHeight;
    return { x, y, score: pt.score, date: pt.date };
  });

  const getLinePath = (pts: typeof points) => {
    if (pts.length === 0) return '';
    return pts.reduce((path, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`), '');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', fontFamily: 'var(--font-sans)' }}>
      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(143,68,253,0.15) 0%, transparent 70%)' }}></div>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Average Mock Score</span>
          <span className="glow-text-purple" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{averageScore}%</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Performance across {totalInterviews} sessions</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,120,0.15) 0%, transparent 70%)' }}></div>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Strategies Generated</span>
          <span className="glow-text-pink" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>{totalStrategies}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Tailored roadmap plans generated</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }}></div>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Strongest Domain</span>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)', textShadow: '0 0 20px rgba(16,185,129,0.3)', marginTop: '0.5rem' }}>
            {strongestSkill}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', marginTop: 'auto' }}>Best performing interview track</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)' }}></div>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Area for Improvement</span>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-amber)', textShadow: '0 0 20px rgba(245,158,11,0.3)', marginTop: '0.5rem' }}>
            {weakestSkill}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', marginTop: 'auto' }}>Lowest performing category</span>
        </div>
      </div>

      {/* SVG Analytics Chart */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Performance History</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Calculated trend of interview scorecard marks over time</p>
        </div>

        {scoreHistory.length === 0 ? (
          <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Complete mock interviews to begin visualizing performance trends.
          </div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '550px', height: 'auto', background: 'transparent' }}>
              {/* Y Axis Gridlines */}
              {[0, 25, 50, 75, 100].map((level) => {
                const y = padding + chartHeight - (level / 100) * chartHeight;
                return (
                  <g key={level}>
                    <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <text x={padding - 10} y={y + 4} fill="var(--text-dark)" fontSize="10" textAnchor="end">{level}%</text>
                  </g>
                );
              })}

              {/* Progress Trendline */}
              {points.length > 1 && (
                <path
                  d={getLinePath(points)}
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(143,68,253,0.5))' }}
                />
              )}

              {/* Data points */}
              {points.map((p, i) => (
                <g key={`pt-${i}`}>
                  <circle cx={p.x} cy={p.y} r="5" fill="var(--bg-primary)" stroke="var(--accent-primary)" strokeWidth="3" />
                  <text x={p.x} y={p.y - 12} fill="#fff" fontSize="9" fontWeight="700" textAnchor="middle">{p.score}%</text>
                  <text x={p.x} y={height - padding + 15} fill="var(--text-muted)" fontSize="9" textAnchor="middle">{p.date}</text>
                </g>
              ))}

              {/* X Axis Line */}
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
export default MockAnalytics;
