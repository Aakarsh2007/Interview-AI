import React from 'react';

interface MockInterview {
  _id: string;
  jobTitle: string;
  totalScore: number;
  createdAt: string;
}

interface StrategyReport {
  _id: string;
  title: string;
  matchScore: number;
  createdAt: string;
}

interface MockAnalyticsProps {
  mocks: MockInterview[];
  strategies: StrategyReport[];
}

export const MockAnalytics: React.FC<MockAnalyticsProps> = ({ mocks, strategies }) => {
  // Sort data by date
  const sortedMocks = [...mocks]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-7); // Last 7 mocks

  const sortedStrategies = [...strategies]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-7); // Last 7 strategies

  const averageMockScore = mocks.length > 0
    ? Math.round(mocks.reduce((acc, curr) => acc + curr.totalScore, 0) / mocks.length)
    : 0;

  const averageMatchScore = strategies.length > 0
    ? Math.round(strategies.reduce((acc, curr) => acc + curr.matchScore, 0) / strategies.length)
    : 0;

  const totalInterviews = mocks.length;

  // Chart configuration
  const width = 600;
  const height = 240;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Generate path points for mock scores
  const mockPoints = sortedMocks.map((m, index) => {
    const x = padding + (index / Math.max(1, sortedMocks.length - 1)) * chartWidth;
    const y = padding + chartHeight - (m.totalScore / 100) * chartHeight;
    return { x, y, score: m.totalScore, title: m.jobTitle };
  });

  // Generate path points for strategy match scores
  const strategyPoints = sortedStrategies.map((s, index) => {
    const x = padding + (index / Math.max(1, sortedStrategies.length - 1)) * chartWidth;
    const y = padding + chartHeight - (s.matchScore / 100) * chartHeight;
    return { x, y, score: s.matchScore, title: s.title };
  });

  const getLinePath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    return points.reduce((path, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`), '');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(143,68,253,0.15) 0%, transparent 70%)' }}></div>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Average Mock Score</span>
          <span className="glow-text-purple" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{averageMockScore}%</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Performance across {totalInterviews} sessions</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,120,0.15) 0%, transparent 70%)' }}></div>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Average Profile Match</span>
          <span className="glow-text-pink" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>{averageMatchScore}%</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Calculated against all target JD uploads</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }}></div>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Preparation Rating</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-emerald)', textShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
            {averageMockScore >= 75 ? 'Advanced' : averageMockScore >= 50 ? 'Intermediate' : totalInterviews === 0 ? 'No Data' : 'Novice'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Progress status metrics based on AI feedback</span>
        </div>
      </div>

      {/* SVG Analytics Chart */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Performance Analytics</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Visualization of match rates and interview performance over time</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }}></span>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>Mock Interview Score</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-secondary)', boxShadow: '0 0 10px var(--accent-secondary)' }}></span>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>Resume Match Score</span>
            </div>
          </div>
        </div>

        {totalInterviews === 0 && strategies.length === 0 ? (
          <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Generate strategies and finish mock interviews to see performance trends.
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

              {/* Mock Score Path */}
              {mockPoints.length > 1 && (
                <path
                  d={getLinePath(mockPoints)}
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(143,68,253,0.5))' }}
                />
              )}

              {/* Strategy Match Score Path */}
              {strategyPoints.length > 1 && (
                <path
                  d={getLinePath(strategyPoints)}
                  fill="none"
                  stroke="var(--accent-secondary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 2"
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(255,45,120,0.4))' }}
                />
              )}

              {/* Data points and hover nodes */}
              {mockPoints.map((p, i) => (
                <g key={`mock-${i}`}>
                  <circle cx={p.x} cy={p.y} r="5" fill="var(--bg-primary)" stroke="var(--accent-primary)" strokeWidth="3" />
                  <title>{`${p.title}: ${p.score}%`}</title>
                </g>
              ))}

              {strategyPoints.map((p, i) => (
                <g key={`strategy-${i}`}>
                  <circle cx={p.x} cy={p.y} r="4" fill="var(--bg-primary)" stroke="var(--accent-secondary)" strokeWidth="2" />
                  <title>{`${p.title}: ${p.score}%`}</title>
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
