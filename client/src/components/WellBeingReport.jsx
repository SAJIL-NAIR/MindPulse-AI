import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WellBeingReport({ reportData }) {
  if (!reportData || !reportData.latest) {
    return (
      <div className="card empty-state">
        <div className="empty-state-icon">📄</div>
        <h3>No Report Data</h3>
        <p>Submit your weekly feedback to generate a well-being report.</p>
      </div>
    );
  }

  const { latest, history } = reportData;
  const {
    emotionalState,
    stressLevel,
    overallScore,
    burnoutRisk,
    aiInsights,
    sentimentLabel,
    weekOf
  } = latest;

  const getScoreRingClass = (risk) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'low';
      case 'moderate': return 'moderate';
      case 'high': return 'high';
      default: return '';
    }
  };

  const getEmotionEmoji = (emotion) => {
    const map = {
      happy: '😊', content: '🙂', neutral: '😐', tired: '😴',
      anxious: '😰', stressed: '😫', frustrated: '😤', sad: '😢'
    };
    return map[emotion] || '😐';
  };

  const chartData = history ? [...history].reverse().map(item => ({
    ...item,
    stressScaled: item.stressLevel * 10 // scale to match 0-100 range of burnout score
  })) : [];

  return (
    <div className="report-container">
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <h3 className="card-title">Latest Report: Week of {weekOf}</h3>
        </div>

        <div className="content-grid">
          {/* Score Overview */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)' }}>
            <div className={`score-ring ${getScoreRingClass(burnoutRisk)}`}>
              <div className="score-ring-inner">
                <div className="score-ring-value" style={{ color: `var(--accent-${burnoutRisk === 'High' ? 'coral' : burnoutRisk === 'Moderate' ? 'amber' : 'teal'})` }}>
                  {overallScore}
                </div>
                <div className="score-ring-label">Burnout Score</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
               <span className={`badge badge-${burnoutRisk.toLowerCase()}`}>Risk: {burnoutRisk}</span>
               <span className={`badge badge-${sentimentLabel.toLowerCase()}`}>Sentiment: {sentimentLabel}</span>
            </div>
          </div>

          {/* Details */}
          <div>
             <h4 style={{ marginBottom: 'var(--space-3)', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>Key Metrics</h4>
             <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
               <li style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2)', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                 <span>Emotional State</span>
                 <span>{getEmotionEmoji(emotionalState)} <span style={{ textTransform: 'capitalize' }}>{emotionalState}</span></span>
               </li>
               <li style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2)', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                 <span>Stress Level</span>
                 <span>{stressLevel} / 10</span>
               </li>
             </ul>

             <h4 style={{ marginTop: 'var(--space-5)', marginBottom: 'var(--space-3)', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>AI Insights</h4>
             <ul className="insights-list">
               {aiInsights && aiInsights.map((insight, index) => (
                 <li key={index} className="insight-item">
                   <span className="insight-icon">💡</span>
                   <span>{insight}</span>
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>

      {/* History */}
      {history && history.length > 1 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent History</h3>
          </div>
          
          <div style={{ width: '100%', height: 300, marginTop: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-input)" vertical={false} />
                <XAxis dataKey="weekOf" stroke="var(--text-muted)" fontSize={12} tickMargin={10} />
                <YAxis stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} width={40} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Line type="monotone" dataKey="overallScore" name="Burnout Score" stroke="var(--accent-coral)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-surface)' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="stressScaled" name="Stress Level (x10)" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-surface)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="history-list">
            {history.slice(1, 4).map((record) => (
              <div key={record.id} className="history-item">
                <div className="history-item-left">
                  <div className="history-week">Week of {record.weekOf}</div>
                  <div className="history-emotion">{getEmotionEmoji(record.emotionalState)}  <span style={{ textTransform: 'capitalize' }}>{record.emotionalState}</span></div>
                </div>
                <div className="history-item-right">
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-1)' }}>
                     <span className={`badge badge-${record.burnoutRisk.toLowerCase()}`}>{record.burnoutRisk}</span>
                     <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Score: {record.overallScore}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
