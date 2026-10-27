import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  return (
    <header className="shop-header" style={{
      background: 'white', borderBottom: '1px solid var(--color-border)',
      position: 'sticky', top: 0, zIndex: 50
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64, gap: '1rem'
      }}>
        <Link to="/" style={{ fontWeight: 600, fontSize: '1.3rem', color: 'var(--color-text)', letterSpacing: '.02em', fontFamily: 'var(--font-display)' }}>
          ShopHub
        </Link>
        <nav className="shop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, justifyContent: 'center' }}>
          <NavLink to="/products" style={({ isActive }) => ({ fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--color-primary)' : 'inherit' })}>
            Shop
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" style={({ isActive }) => ({ fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--color-primary)' : 'inherit' })}>
              Admin
            </NavLink>
          )}
        </nav>
        <div className="shop-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/cart" style={{ position: 'relative', fontWeight: 500 }}>
            Cart
            {cart.item_count > 0 && (
              <span style={{
                position: 'absolute', top: -8, right: -12, background: 'var(--color-accent)',
                color: 'white', borderRadius: '999px', fontSize: 11, fontWeight: 700,
                minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{cart.item_count}</span>
            )}
          </Link>
          {user ? (
            <>
              <Link to="/account" style={{ fontWeight: 500 }}>{user.full_name?.split(' ')[0] || 'Account'}</Link>
              <button className="btn btn-sm btn-outline" onClick={() => { logout(); navigate('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm btn-outline">Login</Link>
              <Link to="/register" className="btn btn-sm btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
