import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      await register(form);
      navigate('/account');
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, padding: '3rem 1rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Create account</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Join ShopHub today</p>
      <form onSubmit={handle} className="card" style={{ padding: '1.5rem' }}>
        <div className="form-group">
          <label>Full name</label>
          <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required minLength={2} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Phone (optional)</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
        </div>
        {err && <p className="error-msg" style={{ marginBottom: '1rem' }}>{String(err)}</p>}
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  );
}
