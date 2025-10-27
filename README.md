# BLAQMART - Local Commerce Marketplace

> **30-Day MVP Sprint: October 27 - November 25, 2025**

## 🚀 Project Overview

BLAQMART is a local e-commerce marketplace connecting vendors and customers in Warrenton with fast delivery services.

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL + PostGIS (via Supabase)
- **ORM:** Prisma
- **Auth:** Supabase Auth (Phone OTP)
- **Payments:** PayFast
- **Messaging:** Twilio (SMS + WhatsApp)
- **Hosting:** Vercel
- **Images:** Cloudinary

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# Run development server
pnpm dev
```

## 🗄️ Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Enable PostGIS extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
3. Copy connection string to `.env`
4. Run `pnpm db:push` to create tables

## 📝 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:generate` - Generate Prisma Client
- `pnpm db:push` - Push schema to database
- `pnpm db:studio` - Open Prisma Studio

## 🎯 MVP Features

### Week 1: Foundation
- ✅ Database setup
- ✅ Authentication (Phone OTP)
- ✅ Basic UI (Homepage, product browsing)
- ✅ Vendor dashboard
- ⏳ Shopping cart
- ⏳ Checkout + PayFast

### Week 2: Commerce
- ⏳ Order management
- ⏳ Driver assignment
- ⏳ SMS notifications
- ⏳ WhatsApp bot

### Week 3: Polish
- ⏳ Bug fixes
- ⏳ Mobile optimization
- ⏳ Performance improvements

### Week 4: Launch
- ⏳ Vendor onboarding
- ⏳ Product uploads
- ⏳ Testing
- ⏳ 🚀 LAUNCH

## 🔑 Environment Variables

See `.env.example` for required environment variables.

## 📅 Sprint Progress

**Current Day:** 1 / 30
**Start Date:** October 27, 2025
**Launch Date:** November 25, 2025

## 🙏 Philosophy

*"I can do all things through Christ who strengthens me."* - Philippians 4:13

## 📄 License

ISC
