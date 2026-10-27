export default function Footer() {
  return (
    <footer className="shop-footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <div className="footer-brand">ShopHub</div>
            <p>Good things, chosen with care.</p>
          </div>
          <p className="footer-note">Demonstration store · Cash on Delivery available</p>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} ShopHub</span>
          <span>Made for the everyday</span>
        </div>
      </div>
    </footer>
  );
}
