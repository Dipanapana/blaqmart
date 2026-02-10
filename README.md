# BLAQMART - Security Products Store

> **Drive Protected. Record Everything.**

## Project Overview

BLAQMART is a nationwide South African e-commerce store specializing in premium dashcams and security products, delivered across all 9 provinces.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma
- **Auth:** Supabase Auth (Phone OTP)
- **Payments:** Yoco Online Checkout
- **Messaging:** Twilio (SMS + WhatsApp)
- **Hosting:** Railway
- **Images:** Cloudinary

## Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma client
pnpm prisma generate

# Push database schema
pnpm prisma db push

# Seed security products
pnpm tsx prisma/seed-security.ts

# Run development server
pnpm dev
```

## Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy connection string to `.env`
3. Run `pnpm prisma db push` to create tables
4. Run `pnpm tsx prisma/seed-security.ts` to seed products

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm prisma generate` - Generate Prisma Client
- `pnpm prisma db push` - Push schema to database
- `pnpm prisma studio` - Open Prisma Studio

## Features

- Premium dashcam product catalog with specs and video demos
- Yoco secured checkout (credit card, debit card, QR code)
- Province-based shipping (R99 Gauteng / R129 other provinces / free over R1,500)
- Phone OTP authentication via Supabase
- Order tracking and SMS notifications
- Vendor dashboard with analytics
- Driver delivery management
- Customer reviews and ratings
- Admin analytics dashboard

## Deployment (Railway)

1. Connect your GitHub repo to Railway
2. Set environment variables in Railway dashboard (see `.env.example`)
3. Add `STANDALONE_BUILD=true` to Railway env vars
4. Railway will auto-deploy using `railway.toml` config

## Environment Variables

See `.env.example` for required environment variables.

## Philosophy

*"I can do all things through Christ who strengthens me."* - Philippians 4:13

## License

ISC
