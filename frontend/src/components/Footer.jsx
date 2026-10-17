export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '2.5rem 0', marginTop: '3rem' }}>
      <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>ShopHub</div>
          <p style={{ maxWidth: 280, fontSize: '0.9rem' }}>Premium shopping experience. Demonstration store — Cash on Delivery only.</p>
        </div>
        <div style={{ fontSize: '0.9rem' }}>
          <p>© {new Date().getFullYear()} ShopHub. All rights reserved.</p>
          <p style={{ marginTop: 4 }}>Built with React + FastAPI</p>
        </div>
      </div>
    </footer>
  );
}
