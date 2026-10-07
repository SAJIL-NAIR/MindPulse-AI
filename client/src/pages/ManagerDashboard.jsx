import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API } from '../api';

export default function ManagerDashboard() {
  const [user, setUser] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'manager') {
      navigate('/employee');
      return;
    }
    setUser(parsedUser);
    fetchTeamData(parsedUser.id);
  }, [navigate]);

  const fetchTeamData = async (managerId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/reports/manager/${managerId}`);
      setTeamData(res.data);
    } catch (err) {
      console.error('Error fetching manager report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user || loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!teamData) return <div>Error loading data.</div>;

  const { analytics, riskAlerts, trends, teamDetails, teamSize } = teamData;

  const getRiskIcon = (risk) => {
     switch(risk) {
         case 'Low': return '🟢';
         case 'Moderate': return '🟡';
         case 'High': return '🔴';
         default: return '⚪';
     }
  }

  const chartData = trends ? trends.map(item => ({
    ...item,
    stressScaled: item.avgStress * 10 
  })) : [];

  return (
    <div className="page-container animate-fade-in">
      {/* Navbar */}
      <nav className="navbar" style={{ marginBottom: 'var(--space-8)', borderRadius: 'var(--radius-md)' }}>
        <div className="navbar-brand">
          <div className="logo" style={{ background: 'var(--gradient-warning)' }}>📈</div>
          <h1>Pulse for Managers</h1>
        </div>
        <div className="navbar-user">
          <div className="navbar-user-info">
            <div className="name">{user.name}</div>
            <div className="role">{user.role}</div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Header */}
      <header className="page-header">
        <h2>Team Overview 📊</h2>
        <p>Monitor your team's well-being and identify burnout risks early.</p>
      </header>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card primary">
           <div className="kpi-label">Team Members</div>
           <div className="kpi-value">{teamSize}</div>
           <div className="kpi-sub">Total Active Employees</div>
        </div>
        <div className="kpi-card danger">
           <div className="kpi-label">High Risk</div>
           <div className="kpi-value danger">{analytics.riskDistribution.High || 0}</div>
           <div className="kpi-sub">Employees At Risk of Burnout</div>
        </div>
        <div className="kpi-card warning">
           <div className="kpi-label">Average Stress</div>
           <div className="kpi-value warning">{analytics.avgStress}</div>
           <div className="kpi-sub">Out of 10 (Last 7 Days)</div>
        </div>
        <div className="kpi-card success">
           <div className="kpi-label">Avg Well-Being Score</div>
           <div className="kpi-value success">{100 - analytics.avgScore} <span style={{ fontSize: 'var(--font-sm)', fontWeight: 'normal' }}> / 100</span></div>
           <div className="kpi-sub">Higher is better</div>
        </div>
      </div>

      {/* Trend Chart */}
      {chartData && chartData.length > 0 && (
         <div className="card" style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
             <div className="card-header">
                 <h3 className="card-title">📈 Team Well-Being Trend</h3>
             </div>
             <div style={{ width: '100%', height: 350, marginTop: 'var(--space-6)', marginBottom: 'var(--space-2)' }}>
               <ResponsiveContainer>
                 <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-input)" vertical={false} />
                   <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={12} tickMargin={10} />
                   <YAxis stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} width={40} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                     itemStyle={{ color: 'var(--text-primary)' }}
                   />
                   <Line type="monotone" dataKey="avgScore" name="Avg Burnout Score" stroke="var(--accent-coral)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-surface)' }} activeDot={{ r: 6 }} />
                   <Line type="monotone" dataKey="stressScaled" name="Avg Stress (x10)" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-surface)' }} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
         </div>
      )}

      <div className="content-grid single">
         {/* Risk Alerts Table */}
         <div className="card">
             <div className="card-header">
                 <h3 className="card-title">⚠️ Risk Alerts</h3>
                 <span className="badge badge-high">{riskAlerts.length} Action Needed</span>
             </div>
             {riskAlerts.length > 0 ? (
                 <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Week Of</th>
                                <th>Stress (1-10)</th>
                                <th>Sentiment</th>
                                <th>Burnout Risk</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riskAlerts.map(alert => (
                                <tr key={alert.id}>
                                    <td className="name-cell">{alert.employeeName}</td>
                                    <td>{alert.department}</td>
                                    <td>{alert.weekOf}</td>
                                    <td><span style={{ color: alert.stressLevel >= 7 ? 'var(--accent-coral)' : 'var(--text-primary)' }}>{alert.stressLevel}</span></td>
                                    <td><span className={`badge badge-${alert.sentimentLabel.toLowerCase()}`}>{alert.sentimentLabel}</span></td>
                                    <td><span className={`badge badge-${alert.burnoutRisk.toLowerCase()}`}>{alert.burnoutRisk}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
             ) : (
                 <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                     <div className="empty-state-icon">🎉</div>
                     <h3>No Risks Detected!</h3>
                     <p>Your team is currently in a healthy state.</p>
                 </div>
             )}
         </div>

         {/* All Team Members Directory */}
         <div className="card" style={{ marginTop: 'var(--space-6)' }}>
             <div className="card-header">
                 <h3 className="card-title">👥 Team Directory</h3>
             </div>
             <div className="table-container">
                 <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Status (Risk Level)</th>
                            <th>Latest Submission</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamDetails.map(member => (
                            <tr key={member.id}>
                                <td className="name-cell">{member.name} ({member.id})</td>
                                <td>{member.department}</td>
                                <td>{getRiskIcon(member.burnoutRisk)} <span className={`badge badge-${member.burnoutRisk === 'No Data' ? 'neutral' : member.burnoutRisk.toLowerCase()}`}>{member.burnoutRisk}</span></td>
                                <td>{member.latestFeedback ? member.latestFeedback.weekOf : 'Pending'}</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
         </div>
      </div>

    </div>
  );
}
