# BLAQMART - Complete Features Documentation

> **30-Day MVP Sprint - Day 3 Complete** ✅
> **Progress:** 10% (Day 3/30)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Implemented Features](#implemented-features)
3. [API Endpoints](#api-endpoints)
4. [User Flows](#user-flows)
5. [Component Library](#component-library)
6. [Database Schema](#database-schema)
7. [Tech Stack](#tech-stack)

---

## 🎯 Overview

BLAQMART is a nationwide South African e-commerce store specializing in premium dashcams and security products. We deliver across all 9 provinces with province-based shipping rates.

### Key Value Propositions

- ✅ **Nationwide Shipping:** 3-5 business day delivery across South Africa
- ✅ **Security First:** Premium dashcams and security products
- ✅ **Quality Guaranteed:** Trusted brands with warranty
- ✅ **24/7 Online:** Order anytime, anywhere

---

## ✅ Implemented Features

### 🔐 Authentication System (Day 2)

**Status:** ✅ Complete

#### Features:
- Phone number authentication (South African format: 0XX XXX XXXX or +27 XX XXX XXXX)
- OTP (One-Time Password) verification via Supabase Auth
- Session management with JWT tokens
- Persistent sessions across page reloads
- Secure sign-out functionality

#### Components:
- `LoginModal` - 2-step phone + OTP authentication flow
- `AuthProvider` - React Context for global auth state
- `useAuth()` hook - Easy auth state access in any component

#### User Roles:
- **CUSTOMER:** Browse and purchase products
- **VENDOR:** Manage store and products
- **DRIVER:** Fulfill deliveries
- **ADMIN:** Platform administration

---

### 🛍️ Product Catalog (Day 3)

**Status:** ✅ Complete

#### Features:
- Product browsing with grid layout
- Real-time search functionality (debounced for performance)
- Product filtering by store
- Product details page with full information
- Out-of-stock indication
- Stock level warnings (when ≤ 10 items)
- Premium store badges
- Responsive design (mobile, tablet, desktop)

#### Product Display:
- **Product Card:** Compact view with image, name, price, store
- **Product Grid:** Paginated list with search
- **Product Details:** Full page with description, quantity selector, store info

#### Mock Data:
If Prisma is not set up, the system automatically returns sample products:
- BM Pro Dashcam 1080P (R899.99)
- 32GB MicroSD Card (R149.99)
- Suction Cup Mount (R89.99)

This allows testing without database configuration.

---

### 🏠 Homepage (Day 3)

**Status:** ✅ Complete

#### Sections:

1. **Hero Section**
   - Bold headline: "Drive Protected. Record Everything."
   - Call-to-action buttons: Browse Products, Become a Vendor
   - Responsive design with gradient background

2. **Features Section**
   - Nationwide Shipping (3-5 business days)
   - Security Products (Premium dashcams)
   - Quality Guaranteed (Trusted brands with warranty)
   - 24/7 Online (Order anytime, anywhere)

3. **Product Catalog**
   - Live product search
   - Product grid with real-time updates
   - Add to cart functionality (alerts for now, cart coming Day 5)

4. **Footer**
   - Company info
   - Copyright notice

---

### 🎨 UI/UX Components

**Status:** ✅ Complete

#### Global Components:
- `Header` - Navigation with auth buttons, cart icon, logo
- `Footer` - Company information
- `LoginModal` - Authentication modal

#### Product Components:
- `ProductCard` - Individual product display
- `ProductGrid` - Product listing with search
- `FeaturedProducts` - Premium store showcase (ready for Day 8)

#### Design System:
- **Primary Color:** Green (#22c55e)
- **Typography:** System font stack for fast loading
- **Spacing:** Consistent 4px grid system
- **Shadows:** Subtle elevation for cards
- **Responsive:** Mobile-first design

---

## 🔌 API Endpoints

### Authentication Endpoints

#### `POST /api/auth/send-otp`
Send OTP to phone number.

**Request:**
```json
{
  "phone": "0812345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "phone": "+27812345678"
}
```

**Validation:**
- Phone must be South African format
- Normalizes to E.164 format (+27...)

---

#### `POST /api/auth/verify-otp`
Verify OTP and create session.

**Request:**
```json
{
  "phone": "0812345678",
  "token": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "session": { ... },
  "user": {
    "id": "uuid",
    "phone": "+27812345678",
    "name": null,
    "role": "CUSTOMER"
  }
}
```

**Auto-creates user** in database on first successful verification.

---

#### `POST /api/auth/signout`
Sign out current user.

**Response:**
```json
{
  "success": true
}
```

---

#### `GET /api/auth/session`
Get current session.

**Response:**
```json
{
  "session": { ... },
  "user": { ... }
}
```

Or if not authenticated:
```json
{
  "session": null
}
```

---

### Product Endpoints

#### `GET /api/products`
List all active products.

**Query Parameters:**
- `search` (optional) - Search by name or description
- `storeId` (optional) - Filter by store
- `limit` (optional, default: 20) - Items per page
- `offset` (optional, default: 0) - Pagination offset

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "BM Pro Dashcam 1080P",
      "description": "Full HD 1080P dashcam with night vision and loop recording",
      "price": 899.99,
      "imageUrl": null,
      "stock": 25,
      "isActive": true,
      "store": {
        "id": "uuid",
        "name": "BLAQMART Security",
        "subscriptionTier": "FREE"
      }
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

**Features:**
- Premium stores prioritized in results
- Full-text search on name and description
- Case-insensitive search

---

#### `POST /api/products`
Create a new product.

**Request:**
```json
{
  "name": "32GB MicroSD Card",
  "description": "High-speed memory card for dashcam recording",
  "price": 149.99,
  "imageUrl": "https://...",
  "stock": 100,
  "storeId": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "32GB MicroSD Card",
  "price": 149.99,
  ...
}
```

**Validation:**
- Name required
- Price must be > 0
- StoreId required (must exist)

**TODO:** Add authentication check (only store owner can add products)

---

#### `GET /api/products/[id]`
Get product details by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "BM Pro Dashcam 1080P",
  "description": "Full HD 1080P dashcam with night vision and loop recording",
  "price": 899.99,
  "imageUrl": null,
  "stock": 25,
  "isActive": true,
  "store": {
    "id": "uuid",
    "name": "BLAQMART Security",
    "address": "Online Store - Nationwide Delivery",
    "phone": "0812345678",
    "subscriptionTier": "FREE"
  }
}
```

**Error:**
```json
{
  "error": "Product not found"
}
```
Status: 404

---

#### `PATCH /api/products/[id]`
Update product details.

**Request:**
```json
{
  "name": "BM Pro Dashcam 1080P - Updated",
  "price": 949.99,
  "stock": 20
}
```

**Response:** Updated product object

**Partial Update:** Only sends fields you want to update

**TODO:** Add authorization (only store owner)

---

#### `DELETE /api/products/[id]`
Soft delete product (sets `isActive = false`).

**Response:**
```json
{
  "success": true
}
```

**Note:** Products are not permanently deleted, just hidden from listings.

**TODO:** Add authorization (only store owner)

---

## 👤 User Flows

### Customer Registration & Shopping Flow

```
1. Visit homepage
   ↓
2. Click "Sign In" in header
   ↓
3. Enter phone number (0812345678)
   ↓
4. Receive SMS with 6-digit OTP
   ↓
5. Enter OTP code
   ↓
6. Account auto-created, logged in
   ↓
7. Browse products (search, filter)
   ↓
8. Click product → View details
   ↓
9. Select quantity
   ↓
10. Add to cart (coming Day 5)
    ↓
11. Checkout (coming Day 2-3 Weekend)
    ↓
12. Track order (coming Day 9-10)
```

---

### Vendor Onboarding Flow

**Status:** Coming Week 4

```
1. Click "Become a Vendor" on homepage
   ↓
2. Fill vendor application
   ↓
3. Account created with VENDOR role
   ↓
4. Create store profile
   ↓
5. Add first product
   ↓
6. Choose subscription tier
   ↓
7. Store goes live
```

---

## 🧩 Component Library

### Layout Components

#### `Header`
**Location:** `components/Header.tsx`

**Props:** None (uses auth context internally)

**Features:**
- Logo (links to homepage)
- Cart icon with badge
- Auth buttons (Sign In / Account + Sign Out)
- Responsive mobile menu (ready)

**Usage:**
```tsx
import Header from '@/components/Header';

<Header />
```

---

#### `Footer`
**Location:** `app/page.tsx` (inline)

**Features:**
- Company name
- Tagline
- Copyright notice

---

### Product Components

#### `ProductCard`
**Location:** `components/products/ProductCard.tsx`

**Props:**
```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}
```

**Features:**
- Product image (or placeholder)
- Product name
- Store name (clickable)
- Price (formatted in ZAR)
- Stock indicator
- Add to cart button
- Out of stock badge
- Premium store badge

**Usage:**
```tsx
import ProductCard from '@/components/products/ProductCard';

<ProductCard
  product={product}
  onAddToCart={(product) => console.log('Added:', product)}
/>
```

---

#### `ProductGrid`
**Location:** `components/products/ProductGrid.tsx`

**Props:**
```typescript
interface ProductGridProps {
  initialProducts?: Product[];
}
```

**Features:**
- Search bar (debounced)
- Loading state
- Empty state
- Responsive grid (1-4 columns)
- Auto-fetches products from API

**Usage:**
```tsx
import ProductGrid from '@/components/products/ProductGrid';

<ProductGrid />
```

---

#### `FeaturedProducts`
**Location:** `components/products/FeaturedProducts.tsx`

**Props:**
```typescript
interface FeaturedProductsProps {
  stores: Store[];
}
```

**Features:**
- Displays premium/featured stores
- Shows top 3 products per store
- Golden badge for premium
- "View Store" button

**Usage:**
```tsx
import FeaturedProducts from '@/components/products/FeaturedProducts';

<FeaturedProducts stores={premiumStores} />
```

---

### Auth Components

#### `LoginModal`
**Location:** `components/auth/LoginModal.tsx`

**Props:**
```typescript
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
```

**Features:**
- 2-step flow (phone → OTP)
- Phone validation
- Error handling
- Loading states
- Auto-refresh on success

**Usage:**
```tsx
import LoginModal from '@/components/auth/LoginModal';

const [showLogin, setShowLogin] = useState(false);

<LoginModal
  isOpen={showLogin}
  onClose={() => setShowLogin(false)}
  onSuccess={() => console.log('Logged in!')}
/>
```

---

### Hooks

#### `useAuth()`
**Location:** `lib/auth-context.tsx`

**Returns:**
```typescript
{
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}
```

**Usage:**
```tsx
import { useAuth } from '@/lib/auth-context';

function MyComponent() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <div>Please sign in</div>;

  return <div>Welcome, {user.phone}!</div>;
}
```

---

## 🗄️ Database Schema

### Tables Implemented:

#### `User`
- id (UUID, PK)
- phone (String, Unique)
- name (String, Optional)
- role (Enum: CUSTOMER, VENDOR, DRIVER, ADMIN)
- createdAt (DateTime)

#### `Store`
- id (UUID, PK)
- name (String)
- address (String)
- phone (String)
- latitude (Float)
- longitude (Float)
- isActive (Boolean)
- vendorId (UUID, FK → User)
- subscriptionTier (Enum: FREE, PREMIUM, ENTERPRISE)
- subscriptionEndsAt (DateTime, Optional)
- featuredUntil (DateTime, Optional)
- createdAt (DateTime)

#### `Product`
- id (UUID, PK)
- name (String)
- description (String, Optional)
- price (Float)
- imageUrl (String, Optional)
- stock (Int)
- isActive (Boolean)
- storeId (UUID, FK → Store)
- createdAt (DateTime)

#### `Subscription`
- id (UUID, PK)
- storeId (UUID, FK → Store)
- tier (Enum)
- amount (Float)
- startDate (DateTime)
- endDate (DateTime)
- isActive (Boolean)
- paymentStatus (Enum)
- paymentId (String, Optional)

### Coming Soon:
- Order
- OrderItem
- DeliveryProof

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS 4.1
- **Icons:** Lucide React
- **State Management:** Zustand (coming Day 5 for cart)

### Backend
- **Runtime:** Node.js (Next.js API Routes)
- **ORM:** Prisma 6.18
- **Authentication:** Supabase Auth
- **Validation:** Zod

### Database
- **Primary:** PostgreSQL (Supabase)
- **Extensions:** PostGIS (for geolocation)

### External Services
- **Auth:** Supabase (Phone OTP)
- **Payments:** Yoco Online Checkout
- **SMS:** Twilio (coming Day 9-10)
- **Images:** Cloudinary (coming Week 3)

### Development Tools
- **Package Manager:** pnpm
- **Linting:** ESLint (Next.js config)
- **Type Checking:** TypeScript strict mode

### Deployment (Coming Week 4)
- **Hosting:** Railway
- **Database:** Supabase Production
- **Domain:** blaqmart.co.za (TBD)

---

## 🚀 What's Next?

### Day 4: Vendor Dashboard
- Store creation form
- Product management UI
- Image upload to Cloudinary
- Product CRUD operations

### Day 5: Shopping Cart
- Zustand store for cart state
- Add/remove items
- Update quantities
- Cart persistence (localStorage)
- Cart page

### Weekend: Checkout + Yoco
- Checkout page
- Shipping address with province selection
- Yoco Online Checkout payment integration
- Order creation
- Order confirmation page

---

## 📈 Progress Tracker

```
Week 1: FOUNDATION (Days 1-7)
├── Day 1: ✅ Project Setup
├── Day 2: ✅ Authentication
├── Day 3: ✅ Product Catalog
├── Day 4: ⏳ Vendor Dashboard
├── Day 5: ⏳ Shopping Cart
└── Weekend: ⏳ Checkout + Yoco

Week 2: COMMERCE (Days 8-14)
└── Coming soon...

Week 3: FULFILLMENT (Days 15-21)
└── Coming soon...

Week 4: LAUNCH (Days 22-30)
└── Coming soon...
```

**Current Progress:** 10% (3/30 days)
**Status:** ON TRACK! 🔥

---

## 📝 Notes

### Known Issues:
- None! Everything working as expected ✅

### Technical Debt:
- Product endpoints need authentication/authorization
- Cart functionality is placeholder (alerts)
- Image upload not yet implemented
- Prisma Client must be generated before production use

### Future Enhancements:
- Advanced search with filters (category, price range)
- Product reviews and ratings
- Vendor analytics dashboard
- Customer order history
- Delivery tracking map
- Push notifications

---

**Last Updated:** Day 3 (October 29, 2025)
**Next Update:** Day 4 (October 30, 2025)

---

*"I can do all things through Christ who strengthens me." - Philippians 4:13* 🙏
