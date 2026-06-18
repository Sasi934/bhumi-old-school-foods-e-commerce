# ⚡ QUICK START GUIDE — Bhumi Old School Foods
## Get the website running in 15 minutes

---

## STEP 1 — Supabase Setup (5 min)

1. Open https://supabase.com → Login → Your Project
2. Click **SQL Editor** (left sidebar) → **New Query**
3. Copy & paste contents of `supabase/schema_v2.sql` → **Run**
4. New Query again → Copy & paste `supabase/storage_setup.sql` → **Run**
5. Go to **Storage** → Confirm `product-images` bucket exists and is **Public**

---

## STEP 2 — Set Your Admin Email (1 min)

In Supabase SQL Editor, run:
```sql
-- IMPORTANT: Replace with your real admin email
-- Run this AFTER you sign up on the website
UPDATE profiles SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'YOUR_ADMIN_EMAIL@gmail.com'
);
```

**OR** just set `REACT_APP_ADMIN_EMAIL` in the frontend `.env` file —
the system auto-detects and promotes on first login.

---

## STEP 3 — Get Razorpay Keys (3 min)

1. Go to https://razorpay.com → Sign up (free)
2. **Settings** → **API Keys** → **Generate Test Key**
3. Copy **Key ID** (starts with `rzp_test_`) and **Key Secret**

---

## STEP 4 — Configure & Run Frontend (3 min)

```bash
cd frontend

# Create .env file
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_SUPABASE_URL=https://uyfyzngkbogtieowfhkx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGci...  (your key)
REACT_APP_RAZORPAY_KEY_ID=rzp_test_XXXX  (from Step 3)
REACT_APP_ADMIN_EMAIL=your@email.com      (your admin email)
```

```bash
npm install
npm start
# Opens at http://localhost:3000
```

---

## STEP 5 — Configure & Run Backend (2 min)

```bash
cd backend

# Create .env file
cp .env .env.backup
```

Edit `.env`:
```
PORT=5000
SUPABASE_URL=https://uyfyzngkbogtieowfhkx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
RAZORPAY_KEY_ID=rzp_test_XXXX
RAZORPAY_KEY_SECRET=your_secret_here
FRONTEND_URL=http://localhost:3000
```

```bash
npm install
npm run dev
# Runs at http://localhost:5000
```

---

## STEP 6 — Test Admin Panel

1. Go to `http://localhost:3000/signup`
2. Create account with your admin email
3. Go to `http://localhost:3000/admin` — Admin Panel opens ✅

---

## DEPLOY TO HOSTINGER

### Frontend:
```bash
cd frontend
npm run build
# Upload contents of /build folder to Hostinger public_html/
# The .htaccess file handles React SPA routing automatically
```

### Backend:
```bash
# In Hostinger cPanel:
# 1. Enable Node.js Application
# 2. Set Application Root to /backend
# 3. Set Application Startup File to src/index.js
# 4. Add all .env variables in the Environment Variables section
# 5. Click Install Dependencies
# 6. Start the application
```

### Update CORS:
In `backend/.env` set:
```
FRONTEND_URL=https://yourdomain.com
```

---

## ADDING YOUR ADMIN EMAIL LATER

When you decide on the admin email, do ONE of these:

**Option A — SQL (recommended):**
```sql
UPDATE profiles SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@bhumifoods.in');
```

**Option B — .env file:**
```
REACT_APP_ADMIN_EMAIL=admin@bhumifoods.in
```
Then rebuild: `npm run build`

---

## ADDING PRICES LATER

**Option A — Admin Panel (easy):**
- Go to `/admin/inventory`
- Click price field for any product
- Type new price → click away → auto-saves ✅

**Option B — Supabase Dashboard:**
- Go to Supabase → Table Editor → products
- Edit price column directly

---

## UPLOADING PRODUCT IMAGES

1. Login as admin → Go to `/admin/products`
2. Click ✏️ Edit on any product
3. Click the image area → choose photo from your computer
4. Click Save → image uploads to Supabase Storage automatically ✅

---

## COUPON CODES (pre-loaded)

| Code       | Discount                    |
|------------|-----------------------------|
| WELCOME10  | 10% off (min ₹200)          |
| BHUMI50    | ₹50 off (min ₹500)          |
| ORGANIC15  | 15% off (min ₹300)          |
| SAVE100    | ₹100 off (min ₹999)         |
| MILLET20   | 20% off (min ₹150)          |

Create more at `/admin/coupons` anytime.

---

## NEED HELP?
Contact your developer or refer to README.md for full documentation.
