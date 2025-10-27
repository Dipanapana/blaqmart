# BLAQMART Setup Guide

## Day 2: Database & Authentication Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (or use existing)
4. Create new project:
   - **Name:** blaqmart-mvp
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to South Africa (Europe - Frankfurt or US East)
   - Click "Create new project" (takes 2-3 minutes)

### 2. Enable PostGIS Extension

PostGIS is required for geospatial queries (store locations, delivery distance, etc.)

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **+ New query**
3. Run this SQL:

```sql
-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify it's enabled
SELECT PostGIS_version();
```

4. Click **Run** - you should see the PostGIS version

### 3. Get Your Supabase Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy these values:

   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role key** (⚠️ keep this secret!)

4. Go to **Database** → **Connection string**
5. Copy the **URI** connection string
6. Replace `[YOUR-PASSWORD]` with your database password

### 4. Configure Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and update these values:

```bash
# Database (from Supabase "Database" → "Connection string" → "URI")
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Supabase (from Supabase "Project Settings" → "API")
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# App URL (keep as is for local development)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 5. Enable Phone Authentication in Supabase

1. Go to **Authentication** → **Providers**
2. Find **Phone** in the list
3. Enable it
4. For now, use **Supabase OTP** (free, limited)
   - Later, configure Twilio for production

5. Go to **Authentication** → **Settings**
6. Under **Site URL**, add: `http://localhost:3000`
7. Under **Redirect URLs**, add: `http://localhost:3000/**`

### 6. Push Database Schema

Now push our Prisma schema to Supabase:

```bash
# Generate Prisma Client
pnpm db:generate

# Push schema to database (creates all tables)
pnpm db:push
```

You should see:
```
✔ Generated Prisma Client
Your database is now in sync with your schema.
```

### 7. Verify Database Tables

1. Go to Supabase → **Table Editor**
2. You should see these tables:
   - User
   - Store
   - Product
   - Order
   - OrderItem
   - Subscription
   - DeliveryProof

### 8. Test Authentication

1. Start the dev server:
   ```bash
   pnpm dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Click **Sign In** button

4. Enter a South African phone number (e.g., `0812345678`)

5. Check your phone for the OTP code

6. Enter the code and verify it works!

### 9. Optional: View Database with Prisma Studio

```bash
pnpm db:studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555) to view/edit database records.

---

## Troubleshooting

### "Failed to send OTP"
- Check that Phone auth is enabled in Supabase
- Verify your phone number is in correct format
- For testing, you can use Supabase's test phone numbers

### "Database connection failed"
- Verify DATABASE_URL is correct
- Check your database password
- Ensure your IP is allowed (Supabase allows all by default)

### "Prisma Client not generated"
- Run `pnpm db:generate`
- Restart your dev server

---

## Next Steps (Day 3)

Once authentication is working:
- ✅ Users can sign in with phone OTP
- ✅ Sessions are persisted
- ✅ Header shows user info

Tomorrow we'll build:
- Product browsing UI
- Product API endpoints
- Homepage with real data

---

**Day 2/30 Complete!** ✅🔥
