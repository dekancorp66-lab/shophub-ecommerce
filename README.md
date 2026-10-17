# ShopHub — Full-Stack E-Commerce

Professional e-commerce application with React storefront and FastAPI backend.

**Stack:** React + Vite · FastAPI · SQLAlchemy · SQLite (dev) / PostgreSQL (prod)

> **Note:** Checkout is **Cash on Delivery / demonstration only**. No real payment provider is integrated.

## Features

### Storefront
- Home with hero + featured products
- Product catalog with search, category filter, sorting, pagination
- Product detail pages with related products
- Responsive design

### Cart & Checkout
- Persistent cart for signed-in users
- Stock validation on add / update / checkout
- Order creation with price snapshots and stock decrement (transactional)
- Order history and status tracking

### Accounts
- Registration, login (JWT), logout
- Secure password hashing (bcrypt)
- Profile and order history (users only see their own data)

### Admin
- Protected admin area (`is_admin` flag)
- Create / soft-delete products
- View and update order statuses
- Category management

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- (Optional) PostgreSQL for production

### Backend

```bash
cd backend
pip install -r requirements.txt
# Optional: copy .env.example to .env and edit
export PYTHONPATH=.
python scripts/seed.py          # creates tables + sample data + admin user
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

**Default accounts (after seed):**
| Role     | Email                 | Password      |
|----------|-----------------------|---------------|
| Admin    | admin@shophub.com     | Admin123!     |
| Customer | customer@example.com  | Customer123!  |

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

Set `VITE_API_URL=http://localhost:8000/api/v1` if the API is on another host.

### Database

By default the app uses **SQLite** (`ecommerce.db`) so it runs without external services.

For **PostgreSQL**:

```bash
export DATABASE_URL=postgresql://user:password@localhost:5432/shophub
python scripts/seed.py
uvicorn app.main:app --reload
```

## Project Structure

```
artifacts/
├── backend/
│   ├── app/
│   │   ├── api/          # Route modules (auth, products, cart, orders, admin)
│   │   ├── core/         # Config, security
│   │   ├── db/           # Session, base
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── main.py
│   ├── scripts/seed.py
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios client
│   │   ├── components/
│   │   ├── context/      # Auth + Cart
│   │   ├── pages/
│   │   └── ...
│   └── package.json
└── README.md
```

## Testing

```bash
cd backend
export PYTHONPATH=.
pytest tests/ -v
```

## Deployment Notes

**Frontend (Vercel / Netlify):**
1. Build command: `npm run build`
2. Output: `dist`
3. Set env `VITE_API_URL` to your backend URL

**Backend (Railway, Render, Fly.io, etc.):**
1. Use PostgreSQL
2. Set `DATABASE_URL`, `SECRET_KEY`, CORS origins
3. Run migrations / seed on deploy
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Security Notes

- Change `SECRET_KEY` in production
- Restrict CORS origins
- Admin routes are protected by JWT + `is_admin` check
- Prices and stock are always validated on the backend
- Order items store unit price at purchase time

## License

MIT — demonstration project.
