# 🌿 Bhumi Old School Foods — E-Commerce Website

Full-stack e-commerce website with Heritage Estate design, built for Bhumi Old School Foods.

---

## 📁 Project Structure
```
bhumi/
├── frontend/          # React.js app
├── backend/           # Node.js + Express API
└── supabase/
    └── schema_v2.sql  # Run this in Supabase SQL Editor
```

---

## ⚙️ STEP 1 — Setup Supabase

1. Go to https://supabase.com → your project
2. Click **SQL Editor** → **New Query**
3. Paste the entire contents of `supabase/schema_v2.sql`
4. Click **Run** ✅
5. Go to **Storage** → Create a bucket named `product-images` → Set to **Public**

### Set Admin Email
After the schema runs, run this SQL to set your admin:
```sql
-- Replace with your actual admin email
UPDATE profiles SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-admin@email.com');
```

**OR** set it in frontend `.env` (see Step 3) — the system auto-promotes on first login.

---

## ⚙️ STEP 2 — Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env .env.local
# Edit .env with your values:
```

### backend/.env
```
PORT=5000
SUPABASE_URL=https://uyfyzngkbogtieowfhkx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...your_key
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:3000
```

```bash
npm start   # Production
npm run dev # Development (with nodemon)
```

---

## ⚙️ STEP 3 — Frontend Setup

```bash
cd frontend
npm install
```

### frontend/.env
Create a file called `.env` in the frontend folder:
```
REACT_APP_SUPABASE_URL=https://uyfyzngkbogtieowfhkx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGci...your_key
REACT_APP_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
REACT_APP_ADMIN_EMAIL=your-admin@email.com
```

```bash
npm start   # Development
npm run build  # Production build
```

---

## 🔐 Admin Panel

- Login with the admin email at `/login`
- Admin Panel automatically opens at `/admin`
- **OR** navigate directly to `/admin`

### Admin Features:
| Feature | Path |
|---|---|
| Dashboard | `/admin` |
| Products (Add/Edit/Delete/Images) | `/admin/products` |
| Orders (View/Update Status) | `/admin/orders` |
| Coupons (Create/Edit/Delete) | `/admin/coupons` |

---

## 💳 Razorpay Setup

1. Go to https://razorpay.com → Sign Up / Login
2. Go to **Settings → API Keys → Generate Key**
3. Copy **Key ID** and **Key Secret**
4. Add to both `.env` files
5. For live payments: switch `rzp_test_` to `rzp_live_`

---

## 🌐 Hosting on Hostinger

### Frontend (Static Build):
```bash
cd frontend
npm run build
# Upload the /build folder to Hostinger public_html
```

### Backend (Node.js):
```bash
cd backend
# In Hostinger: Enable Node.js, set entry point to src/index.js
# Upload backend folder
# Set environment variables in Hostinger panel
```

### Domain Setup:
- Point your domain to Hostinger
- Set `FRONTEND_URL` in backend `.env` to your domain
- Update CORS settings if needed

---

## 🎟️ Coupon Codes (Pre-loaded)

| Code | Type | Discount |
|---|---|---|
| WELCOME10 | % | 10% off (min ₹200) |
| BHUMI50 | Flat | ₹50 off (min ₹500) |
| ORGANIC15 | % | 15% off (min ₹300) |
| SAVE100 | Flat | ₹100 off (min ₹999) |
| MILLET20 | % | 20% off (min ₹150) |

---

## 📱 Features Summary

| Feature | Status |
|---|---|
| Product Catalog (50+ items) | ✅ |
| Telugu + English | ✅ |
| Search & Filters | ✅ |
| Cart | ✅ |
| Coupons (% + Flat) | ✅ |
| Razorpay Payment | ✅ |
| Order Tracking | ✅ |
| Customer Reviews | ✅ |
| User Auth (Login/Signup) | ✅ |
| Admin Dashboard | ✅ |
| Admin: Products CRUD | ✅ |
| Admin: Image Upload | ✅ |
| Admin: Orders Management | ✅ |
| Admin: Coupons CRUD | ✅ |
| Mobile Responsive | ✅ |

---

## 🛠 Tech Stack

- **Frontend**: React.js, React Router v6
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Payment**: Razorpay
- **Hosting**: Hostinger

---

## 📞 Support
Built for Bhumi Old School Foods, Hyderabad 🌿
