import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import WeeklyFeedbackForm from '../components/WeeklyFeedbackForm';
import WellBeingReport from '../components/WellBeingReport';
import { API } from '../api';

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('report'); // 'form' or 'report'
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'employee') {
      navigate('/manager');
      return;
    }
    setUser(parsedUser);
    fetchReport(parsedUser.id);
  }, [navigate]);

  const fetchReport = async (userId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/reports/employee/${userId}`);
      if (res.data.hasData) {
        setReportData(res.data);
        setActiveTab('report');
      } else {
        setActiveTab('form');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFeedbackSuccess = (newFeedback) => {
    fetchReport(user.id);
  };

  if (!user || loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="page-container animate-fade-in">
      {/* Navbar */}
      <nav className="navbar" style={{ marginBottom: 'var(--space-8)', borderRadius: 'var(--radius-md)' }}>
        <div className="navbar-brand">
          <div className="logo">💙</div>
          <h1>Pulse</h1>
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
        <h2>Hello, {user.name.split(' ')[0]} 👋</h2>
        <p>Welcome to your personal well-being dashboard.</p>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          My Well-Being Report
        </button>
        <button 
          className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          Submit Weekly Feedback
        </button>
      </div>

      {/* Content */}
      <div className="tab-content">
        {activeTab === 'form' && (
          <div className="card">
             <div className="card-header">
                <h3 className="card-title">Weekly Check-in</h3>
             </div>
             <WeeklyFeedbackForm userId={user.id} onSubmitSuccess={handleFeedbackSuccess} />
          </div>
        )}

        {activeTab === 'report' && (
          <WellBeingReport reportData={reportData} />
        )}
      </div>

    </div>
  );
}
