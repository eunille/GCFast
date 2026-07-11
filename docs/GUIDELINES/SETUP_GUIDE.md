# GCFast-MPTS — Complete Setup Guide

> **Complete step-by-step guide for setting up and running the GC Faculty Association Staff Application**  
> For handover to new developers

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Initial Setup](#initial-setup)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Testing the Application](#testing-the-application)
7. [Development Workflow](#development-workflow)
8. [Troubleshooting](#troubleshooting)
9. [Additional Resources](#additional-resources)

---

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

### Required Software

| Software | Minimum Version | Installation Check |
|----------|----------------|-------------------|
| Node.js | 20.0.0 | `node --version` |
| npm | 10.0.0 | `npm --version` |
| Git | Latest | `git --version` |

### Accounts Needed

- **Supabase Account**: Sign up at https://supabase.com
- **Vercel Account** (optional, for deployment): Sign up at https://vercel.com
- **GitHub Account**: For repository access

---

## Project Overview

**GCFast-MPTS** is a membership and payment tracking system for the Gordon College Faculty Association. It tracks:

- Member registration and management
- Monthly dues (₱60/month) and membership fees (₱200 one-time for full-time members)
- Payment recording and history
- Financial reports and analytics
- Member self-service dashboard

### Tech Stack Summary

- **Framework**: Next.js 16.2.4 (App Router)
- **Language**: TypeScript 5.x
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State Management**: TanStack Query
- **Hosting**: Vercel

---

## Initial Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/eunille/GCFast.git

# Navigate to the frontend directory
cd GCFast/gcfast_frontend
```

### Step 2: Install Dependencies

```bash
# Install all project dependencies
npm install
```

This will install all packages listed in `package.json` including:
- Next.js, React, TypeScript
- Supabase client libraries
- UI components (Radix UI, shadcn/ui)
- Data management (TanStack Query)
- Report generation (ExcelJS, PDFKit)

**Expected output**: Should complete without errors. If you encounter errors, see [Troubleshooting](#troubleshooting).

---

## Database Setup

### Step 1: Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New project"**
3. Fill in the project details:
   - **Name**: `gcfast-mpts` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your users (e.g., Southeast Asia)
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning to complete

### Step 2: Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings → API**
2. Copy the following values (you'll need these for `.env`):
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

### Step 3: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Open .env in your editor
code .env  # or use your preferred editor
```

Fill in your Supabase credentials:

```env
# Supabase credentials (from Step 2)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App URL (keep as localhost for local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# CORS origin (keep as localhost for local development)
ALLOWED_ORIGIN=http://localhost:3000
```

⚠️ **Important**: Never commit `.env` to version control!

### Step 4: Run Database Migrations

Migrations are SQL files that set up your database schema. You need to run them in order.

**Option A: Using Supabase Dashboard (Recommended for beginners)**

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **"New query"**
4. Open each migration file in `supabase/migrations/` in your code editor
5. Copy and paste the content into the SQL editor
6. Run each migration in order:
   - `001_initial_schema.sql` — Creates tables, enums, and views
   - `002_update_monthly_dues_to_60.sql` — Sets dues rate to ₱60
   - `003_member_approval.sql` — Adds member approval system
   - `004_members_nullable_college.sql` — Makes college optional
   - `005_fix_member_payment_summary_left_join.sql` — Fixes payment summary view
   - `006_payment_date_to_timestamptz.sql` — Updates date column type

**Option B: Using Supabase CLI (Advanced)**

```bash
# Install Supabase CLI globally
npm install -g supabase

# Link to your project (requires project password)
supabase link --project-ref your-project-ref

# Run all migrations
supabase db reset --linked
```

**Verification**: After running migrations, check in Supabase Dashboard → Database → Tables. You should see:
- `profiles`
- `colleges`
- `academic_periods`
- `members`
- `dues_configurations`
- `payment_records`
- `member_payment_summary` (view)

### Step 5: Seed the Database

The seed script populates your database with test data:

```bash
npm run seed
```

This creates:
- 1 treasurer account: `treasurer@gcfast.edu` / `Treasurer@123`
- 1 member account: `ashley@gcfast.edu` / `Member@1234`
- 5 colleges (CAHS, CBA, CCS, CEAS, CHTM)
- 12 academic periods (current year months)
- 50 test members across colleges
- 200+ payment records with various statuses

**Expected output**:
```
✅ Seed completed successfully
   - Created 5 colleges
   - Created 12 academic periods
   - Created 3 dues configurations
   - Created 50 members
   - Created 200+ payment records
```

**Troubleshooting**: If seeding fails, you can manually create a treasurer account:

```bash
npm run create-treasurer
```

---

## Running the Application

### Start the Development Server

```bash
npm run dev
```

The application will start on **http://localhost:3000**

**Expected output**:
```
▲ Next.js 16.2.4
- Local:        http://localhost:3000
- Environments: .env

✓ Ready in 2.5s
```

### Access the Application

Open your browser and navigate to:

**Treasurer Login**: http://localhost:3000/login
- Email: `treasurer@gcfast.edu`
- Password: `Treasurer@123`

**Member Login**: http://localhost:3000/login
- Email: `ashley@gcfast.edu`
- Password: `Member@1234`

### Application Routes

**Public Routes:**
- `/login` — Login page
- `/register` — Member registration
- `/register/treasurer` — Treasurer registration

**Treasurer Routes** (requires treasurer role):
- `/treasurer/overview` — Dashboard with stats and charts
- `/treasurer/members` — Member management
- `/treasurer/payments` — Payment recording and summaries
- `/treasurer/reports` — Report generation
- `/treasurer/dues` — Dues configuration

**Member Routes** (requires member role):
- `/member/dashboard` — Member self-service dashboard
- `/member/profile` — Profile management (stub)
- `/member/reports` — Member reports (stub)

---

## Testing the Application

### Manual Testing Checklist

After setup, verify these key features work:

**Authentication:**
- [ ] Login as treasurer
- [ ] Login as member
- [ ] Logout
- [ ] Role-based redirect (treasurer → `/treasurer/overview`, member → `/member/dashboard`)

**Treasurer Features:**
- [ ] View dashboard with stats and charts
- [ ] View member list with filters
- [ ] Create new member
- [ ] Edit member details
- [ ] Record single payment
- [ ] Record bulk payments
- [ ] Generate reports (JSON, Excel, PDF)
- [ ] View payment summaries
- [ ] Configure dues rates

**Member Features:**
- [ ] View personal dashboard
- [ ] View payment history
- [ ] See dues grid (12-month view)
- [ ] Check outstanding balance

### Test Data Overview

The seed script creates members with different payment scenarios:

| Scenario | Member Count | Description |
|----------|-------------|-------------|
| COMPLETE | ~15 | Membership fee + all 12 months paid |
| PARTIAL | ~10 | Fee paid, only first 4 months |
| FEE_ONLY | ~5 | Membership fee only, no dues |
| NO_PAYMENT | ~5 | No payments at all |
| ASSOCIATE | ~15 | Associate members (no fee required) |

---

## Development Workflow

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start

# Run linter
npm run lint

# Seed database with test data
npm run seed

# Create treasurer account manually
npm run create-treasurer
```

### Project Structure Quick Reference

```
gcfast_frontend/
├── app/                    # Next.js pages and API routes
│   ├── (auth)/            # Public auth pages
│   ├── (treasurer)/       # Treasurer-gated pages
│   ├── (member)/          # Member-gated pages
│   └── api/               # API route handlers
├── features/              # Feature modules (4-layer architecture)
│   ├── auth/
│   ├── members/
│   ├── payments/
│   ├── reports/
│   └── dues-configurations/
├── components/            # Shared UI components
│   ├── ui/               # shadcn/ui base components
│   ├── layout/           # Layout components
│   └── common/           # Reusable components
├── lib/                  # Shared utilities
│   ├── supabase/        # Supabase clients
│   ├── utils/           # Helper functions
│   └── hooks/           # Shared hooks
├── supabase/
│   └── migrations/      # Database migration files
├── scripts/             # Utility scripts
├── theme/               # Design tokens
└── docs/                # Documentation
```

### Key Architecture Concepts

This project follows a **strict 4-layer architecture**:

1. **Layer 1 — Domain** (`types/`): Pure TypeScript types and schemas
2. **Layer 2 — Data** (`repositories/`): API calls and data mapping
3. **Layer 3 — Application** (`hooks/`): Business logic and state management
4. **Layer 4 — Presentational** (`components/`): UI components

**Read `GFAST_ARCHITECTURE.md` for complete architectural guidelines.**

### Code Conventions

- **No component exceeds 500 lines** — split into smaller pieces
- **No Supabase calls in components** — only in repositories
- **All colors/spacing from `/theme`** — never hardcode
- **Use `authFetch` for API calls** — handles authentication
- **Use TanStack Query** — for data fetching and caching

---

## Troubleshooting

### Common Issues and Solutions

#### npm install fails

**Problem**: Dependency installation errors

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### Database connection errors

**Problem**: "Failed to connect to Supabase"

**Solutions**:
1. Verify `.env` file exists and has correct credentials
2. Check Supabase project is active (not paused)
3. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
4. Restart development server after changing `.env`

#### Migrations fail

**Problem**: SQL errors when running migrations

**Solutions**:
1. Ensure migrations are run in order (001, 002, 003...)
2. Check for existing tables (you may need to drop them first)
3. Verify you're using the correct Supabase project
4. Try running migrations one at a time using Supabase Dashboard

#### Seed script fails

**Problem**: "Error seeding database"

**Solutions**:
1. Ensure all migrations have been run first
2. Check Supabase service role key is correct in `.env`
3. Try manually creating a treasurer account: `npm run create-treasurer`
4. Check Supabase logs in Dashboard → Database → Logs

#### Port 3000 already in use

**Problem**: "Port 3000 is already in use"

**Solutions**:
```bash
# Option 1: Kill the process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Option 2: Use a different port
PORT=3001 npm run dev
```

#### Authentication errors

**Problem**: "User not authenticated" or redirect loops

**Solutions**:
1. Clear browser cookies and local storage
2. Check Supabase Auth is enabled (Dashboard → Authentication)
3. Verify `NEXT_PUBLIC_APP_URL` matches your actual URL
4. Check user exists in Supabase Dashboard → Authentication → Users

---

## Additional Resources

### Documentation

- **HANDOVER.md** — Comprehensive developer handover guide
- **GFAST_ARCHITECTURE.md** — Complete architecture documentation
- **docs/apidocs/API_REFERENCE.md** — API endpoints reference
- **docs/apidocs/API_MODELS.md** — Data models documentation

### External Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **TanStack Query**: https://tanstack.com/query/latest
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS v4**: https://tailwindcss.com

### Getting Help

- **GitHub Repository**: https://github.com/eunille/GCFast
- **Live Application**: https://gc-fast.vercel.app
- **Supabase Project**: `zobacihyapqdldlnzsnr`

---

## Next Steps After Setup

Once you have the application running:

1. **Explore the codebase** — Start with `HANDOVER.md` for system overview
2. **Review architecture** — Read `GFAST_ARCHITECTURE.md` for code organization
3. **Test key features** — Use the test accounts to explore functionality
4. **Read API docs** — Understand the API structure in `docs/apidocs/`
5. **Check pending features** — See "What's Next" in `HANDOVER.md`

---

**Last Updated**: January 2026  
**Maintainer**: Development Team  
**Version**: 1.0