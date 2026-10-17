import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/account');
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, padding: '3rem 1rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Welcome back</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Sign in to your ShopHub account</p>
      <form onSubmit={handle} className="card" style={{ padding: '1.5rem' }}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {err && <p className="error-msg" style={{ marginBottom: '1rem' }}>{err}</p>}
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
        Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign up</Link>
      </p>
      <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        Demo: customer@example.com / Customer123!
      </p>
    </div>
  );
}
