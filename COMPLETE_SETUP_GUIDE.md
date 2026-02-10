# BLAQMART - Complete Setup Guide
## From Zero to Running in 30 Minutes

> **Prerequisites:** Node.js 18+, pnpm, Git, Text editor (VS Code recommended)

---

## 📋 Table of Contents

1. [Quick Start (TL;DR)](#quick-start-tldr)
2. [Detailed Setup](#detailed-setup)
3. [Testing the Application](#testing-the-application)
4. [Troubleshooting](#troubleshooting)
5. [Development Workflow](#development-workflow)

---

## ⚡ Quick Start (TL;DR)

For experienced developers:

```bash
# Clone and install
git clone https://github.com/Dipanapana/blaqmart.git blaqmart
cd blaqmart
pnpm install

# Set up Supabase (see Step 2 below)
cp .env.example .env
# Edit .env with your Supabase credentials

# Generate Prisma Client and push schema
pnpm db:generate
pnpm db:push

# Run development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🔧 Detailed Setup

### Step 1: Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone <repository-url> blaqmart
cd blaqmart

# Install pnpm if you don't have it
npm install -g pnpm

# Install project dependencies
pnpm install
```

**Expected output:**
```
Packages: +500
++++++++++++++++++++++++++++++
Done in 30s
```

**Verify installation:**
```bash
pnpm --version  # Should show 10.x or higher
node --version  # Should show v18.x or higher
```

---

### Step 2: Create Supabase Project

#### 2.1 Sign Up for Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign in with GitHub (recommended) or email
4. Create a new organization (or use existing)

#### 2.2 Create New Project

1. Click **"New Project"**
2. Fill in details:
   - **Name:** `blaqmart-mvp`
   - **Database Password:** Generate strong password (save this!)
   - **Region:** Choose closest to you:
     - For South Africa: **Europe (Frankfurt)** or **US East**
   - **Pricing Plan:** Free (sufficient for MVP)
3. Click **"Create new project"**
4. Wait 2-3 minutes for provisioning

#### 2.3 Enable PostGIS Extension

PostGIS enables geospatial queries (store locations, delivery distances).

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"+ New query"**
3. Paste and run:

```sql
-- Enable PostGIS for geolocation features
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify installation
SELECT PostGIS_version();
```

4. Click **RUN**
5. You should see PostGIS version (e.g., `3.3.2`)

✅ **Success!** PostGIS is enabled.

#### 2.4 Get Credentials

**Database URL:**
1. Go to **Project Settings** (⚙️ icon in sidebar)
2. Click **Database** in left menu
3. Scroll to **Connection string** → **URI**
4. Copy the URI (looks like: `postgresql://postgres:[YOUR-PASSWORD]@...`)
5. Replace `[YOUR-PASSWORD]` with the password you created in step 2.2

**API Keys:**
1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long JWT token)
   - **service_role** key (⚠️ keep secret!)

---

### Step 3: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env
```

**Edit `.env` file:**

```bash
# Database Connection
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Application URL (keep as is for local development)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Yoco (optional for now, needed for payments later)
YOCO_SECRET_KEY="sk_test_your_yoco_secret_key"
YOCO_WEBHOOK_SECRET="whsec_your_yoco_webhook_secret"

# Twilio (optional for now, needed for SMS later)
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+27000000000"
TWILIO_WHATSAPP_NUMBER="whatsapp:+27000000000"

# Cloudinary (optional for now, needed for image upload later)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Important:** Replace placeholder values with your actual Supabase credentials!

---

### Step 4: Set Up Authentication in Supabase

#### 4.1 Enable Phone Authentication

1. Go to **Authentication** → **Providers** (left sidebar)
2. Find **Phone** in the list
3. Toggle **Enable Phone provider**
4. For now, use **Supabase OTP** (free, limited to testing)
   - Later: Configure Twilio for production
5. Click **Save**

#### 4.2 Configure Auth Settings

1. Go to **Authentication** → **URL Configuration**
2. Under **Site URL**, add:
   ```
   http://localhost:3000
   ```
3. Under **Redirect URLs**, add:
   ```
   http://localhost:3000/**
   ```
4. Click **Save**

✅ **Done!** Phone authentication is configured.

---

### Step 5: Initialize Database

#### 5.1 Generate Prisma Client

```bash
pnpm db:generate
```

**Expected output:**
```
✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

This creates the TypeScript types for your database.

#### 5.2 Push Schema to Database

```bash
pnpm db:push
```

**Expected output:**
```
🚀  Your database is now in sync with your Prisma schema.

✔ Generated Prisma Client
```

**This creates all tables:**
- User
- Store
- Product
- Subscription
- Order (and related tables)
- DeliveryProof

#### 5.3 Verify Tables Created

1. Go to Supabase → **Table Editor**
2. You should see all tables listed in the sidebar
3. Click each table to verify structure

✅ **Success!** Database is set up.

---

### Step 6: Run Development Server

```bash
pnpm dev
```

**Expected output:**
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
- Environments: .env

✓ Ready in 2.3s
```

**Open browser:** [http://localhost:3000](http://localhost:3000)

You should see the BLAQMART homepage! 🎉

---

## 🧪 Testing the Application

### Test 1: Homepage

✅ **What to check:**
- Homepage loads without errors
- Hero section displays
- Features section shows 4 features
- Product grid displays (with mock products)
- Search bar is functional

---

### Test 2: Authentication

✅ **Test Sign In Flow:**

1. Click **"Sign In"** button in header
2. Enter phone number:
   - Format: `0812345678` or `+27812345678`
   - Use your real South African phone number
3. Check your phone for SMS with 6-digit code
4. Enter the code in the modal
5. Click **"Verify & Sign In"**

**Expected result:**
- Modal closes
- Header updates to show phone number
- "Sign Out" button appears

**Troubleshooting phone auth:**
- If you don't receive SMS, Supabase free tier has limits
- Check Supabase logs: **Authentication** → **Logs**
- For testing, you can use Supabase's test phone numbers

✅ **Test Sign Out:**

1. Click **"Sign Out"** button (logout icon in header)
2. Header returns to "Sign In" button

---

### Test 3: Product Browsing

✅ **Test Product Display:**

1. Scroll to **"Browse Products"** section
2. You should see 3 mock products:
   - BM Pro Dashcam 1080P (R15.99)
   - BM 4-Channel DVR Kit (R12.50)
   - 32GB MicroSD Card (R22.99)
3. Each product card shows:
   - Product name
   - Store name
   - Price in ZAR
   - "Add" button

✅ **Test Search:**

1. Type `"dashcam"` in search bar
2. Product list filters to show only matching products
3. Clear search to see all products again

✅ **Test Product Details:**

1. Click any product card
2. Product details page opens
3. Displays:
   - Product image (or placeholder)
   - Full description
   - Price
   - Quantity selector
   - Store information
4. Click **"Add to Cart"** (shows alert for now)
5. Click **"Back"** to return to homepage

---

### Test 4: Responsive Design

✅ **Test Mobile View:**

1. Open Chrome DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or similar
4. Navigate through:
   - Homepage
   - Login modal
   - Product details
5. Everything should be mobile-friendly

---

## 🐛 Troubleshooting

### Issue: `pnpm: command not found`

**Solution:**
```bash
npm install -g pnpm
```

---

### Issue: `Error: Cannot find module '@prisma/client'`

**Solution:**
```bash
pnpm db:generate
```

If error persists:
```bash
rm -rf node_modules
pnpm install
pnpm db:generate
```

---

### Issue: Database connection failed

**Possible causes:**
1. Wrong DATABASE_URL in `.env`
2. Incorrect database password
3. Supabase project not fully provisioned

**Solution:**
1. Verify DATABASE_URL format:
   ```
   postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres
   ```
2. Check password doesn't have special characters that need encoding
3. Test connection:
   ```bash
   pnpm prisma db pull
   ```

---

### Issue: "Failed to send OTP"

**Possible causes:**
1. Phone authentication not enabled in Supabase
2. Invalid phone number format
3. Supabase free tier SMS limit reached

**Solution:**
1. Check Supabase → **Authentication** → **Providers** → Phone is enabled
2. Use correct format: `0812345678` or `+27812345678`
3. Check Supabase logs: **Authentication** → **Logs**
4. For testing, use email auth (coming later) or Supabase test numbers

---

### Issue: Build errors with TypeScript

**Solution:**
```bash
# Check TypeScript errors
pnpm run type-check

# If errors persist, try:
rm -rf .next
pnpm run build
```

---

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 pnpm dev
```

---

### Issue: Environment variables not loading

**Solution:**
1. Verify `.env` file exists in project root
2. Restart dev server (Ctrl+C, then `pnpm dev`)
3. Check file starts with variables like:
   ```
   DATABASE_URL="postgresql://..."
   ```
4. No quotes needed for Next.js (but keep them for safety)

---

## 💻 Development Workflow

### Daily Development

```bash
# Start development server
pnpm dev

# In a separate terminal:
pnpm db:studio  # Open Prisma Studio to view/edit data
```

### Making Database Changes

```bash
# 1. Edit schema.prisma
# 2. Push changes to database
pnpm db:push

# 3. Regenerate Prisma Client
pnpm db:generate
```

### Running Tests

```bash
# Type checking
pnpm run type-check

# Linting
pnpm run lint

# Build (production test)
pnpm run build
```

### Git Workflow

```bash
# Check status
git status

# Add changes
git add .

# Commit with descriptive message
git commit -m "feat: add product filtering"

# Push to branch
git push origin your-branch-name
```

---

## 📊 Development Tools

### Prisma Studio

Visual database editor:

```bash
pnpm db:studio
```

Opens: [http://localhost:5555](http://localhost:5555)

**Features:**
- View all tables
- Edit records
- Add/delete data
- Filter and search

---

### VS Code Extensions (Recommended)

1. **Prisma** - Syntax highlighting for schema.prisma
2. **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes
3. **ESLint** - Code linting
4. **Prettier** - Code formatting

---

## 🚀 Next Steps

### After Setup, You Can:

1. **Explore the codebase:**
   - `app/` - Pages and API routes
   - `components/` - Reusable components
   - `lib/` - Utilities and configs
   - `prisma/` - Database schema

2. **Add your first product:**
   - Open Prisma Studio: `pnpm db:studio`
   - Create a Store (required first)
   - Create a Product linked to that store
   - View it on homepage

3. **Continue development:**
   - Follow the 30-day plan
   - Day 4: Vendor Dashboard
   - Day 5: Shopping Cart
   - Weekend: Checkout + Yoco

---

## 📝 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://...` |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anon key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase service key | `eyJhbGci...` |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Your app URL | `http://localhost:3000` |
| `YOCO_SECRET_KEY` | ⏳ Later | Yoco secret key | `sk_test_...` |
| `YOCO_WEBHOOK_SECRET` | ⏳ Later | Yoco webhook secret | `whsec_...` |
| `TWILIO_ACCOUNT_SID` | ⏳ Later | Twilio account SID | `ACxxxxx` |
| `TWILIO_AUTH_TOKEN` | ⏳ Later | Twilio auth token | `your-token` |
| `TWILIO_PHONE_NUMBER` | ⏳ Later | Twilio phone number | `+27...` |
| `CLOUDINARY_CLOUD_NAME` | ⏳ Later | Cloudinary cloud name | `your-cloud` |

---

## 🎯 Success Checklist

After completing setup, verify:

- ✅ Project runs without errors (`pnpm dev`)
- ✅ Homepage loads at [http://localhost:3000](http://localhost:3000)
- ✅ Can sign in with phone OTP
- ✅ Products display on homepage
- ✅ Can view product details
- ✅ Prisma Studio opens ([http://localhost:5555](http://localhost:5555))
- ✅ Database tables visible in Supabase
- ✅ Build completes successfully (`pnpm build`)

---

## 🆘 Getting Help

### Resources:
- **FEATURES.md** - Complete feature documentation
- **SETUP.md** - Quick setup guide
- **README.md** - Project overview

### Common Commands:
```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm db:generate      # Generate Prisma Client
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Prisma Studio
pnpm run type-check   # Check TypeScript errors
```

---

**Setup Time:** ~20-30 minutes
**Difficulty:** Intermediate
**Status:** Production-ready for MVP

---

*"The journey of a thousand miles begins with a single step."* - Lao Tzu

**Now you're ready to build! Let's go! 🚀**

---

**Last Updated:** Day 3 (October 29, 2025)
