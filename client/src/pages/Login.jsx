import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const users = [
  { id: 'e1', name: 'Alice Johnson', role: 'employee', dept: 'Customer Service' },
  { id: 'e2', name: 'Brian Smith', role: 'employee', dept: 'Customer Service' },
  { id: 'e3', name: 'Carla Rodriguez', role: 'employee', dept: 'Sales' },
  { id: 'e4', name: 'David Chen', role: 'employee', dept: 'Support' },
  { id: 'e5', name: 'Erin Patel', role: 'employee', dept: 'Sales' },
  { id: 'm1', name: 'Manager Morgan', role: 'manager', dept: 'Operations' },
];

export default function Login() {
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }
    if (!password) {
      setError('Please enter a password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API}/auth/login`, {
        userId: selectedUser,
        password
      });

      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        const user = res.data.user;
        navigate(user.role === 'manager' ? '/manager' : '/employee');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedUserData = users.find(u => u.id === selectedUser);

  return (
    <div className="login-page">
      <div className="login-card animate-slide-up">
        <div className="login-logo">💙</div>
        <h1>Well-Being Pulse</h1>
        <p>Monitor your wellness. Prevent burnout. Thrive at work.</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Select User</label>
            <select
              id="user-select"
              className="form-select"
              value={selectedUser}
              onChange={(e) => { setSelectedUser(e.target.value); setError(''); }}
            >
              <option value="">— Choose your profile —</option>
              <optgroup label="👤 Employees">
                {users.filter(u => u.role === 'employee').map(u => (
                  <option key={u.id} value={u.id}>{u.name} — {u.dept}</option>
                ))}
              </optgroup>
              <optgroup label="👔 Managers">
                {users.filter(u => u.role === 'manager').map(u => (
                  <option key={u.id} value={u.id}>{u.name} — {u.dept}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="password-input"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
            />
            {selectedUserData && (
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                Hint: {selectedUserData.role === 'manager' ? 'manager123' : 'employee123'}
              </p>
            )}
          </div>

          {error && (
            <div style={{
              background: 'hsla(10, 80%, 55%, 0.1)',
              border: '1px solid hsla(10, 80%, 55%, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-3) var(--space-4)',
              marginBottom: 'var(--space-4)',
              color: 'var(--accent-coral)',
              fontSize: 'var(--font-sm)'
            }}>
              {error}
            </div>
          )}

          <button
            id="login-btn"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
