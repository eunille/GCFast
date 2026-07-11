# GCFast-MPTS — Gordon College Faculty Association System

> **Membership & Payment Tracking System**  
> A Next.js-based application for managing faculty association memberships, dues collection, and financial reporting.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://gc-fast.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com)

---

## 🚀 Quick Start

```bash
# Clone and navigate
git clone https://github.com/eunille/GCFast.git
cd GCFast/gcfast_frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run database migrations (see SETUP_GUIDE.md)
# Then seed the database
npm run seed

# Start development server
npm run dev
```

Visit **http://localhost:3000** and login with:
- **Treasurer**: `treasurer@gcfast.edu` / `Treasurer@123`
- **Member**: `ashley@gcfast.edu` / `Member@1234`

---

## 📚 Documentation

**New to this project?** Start here:

| Document | Purpose | Audience |
|----------|---------|----------|
| **[SETUP_GUIDE.md](SETUP_GUIDE.md)** | Complete installation and setup instructions | New developers |
| **[HANDOVER.md](HANDOVER.md)** | Comprehensive system overview and handover guide | All developers |
| **[GFAST_ARCHITECTURE.md](GFAST_ARCHITECTURE.md)** | Detailed architecture and coding conventions | All developers |
| **[docs/apidocs/API_REFERENCE.md](docs/apidocs/API_REFERENCE.md)** | API endpoints documentation | Backend/API developers |

---

## 🎯 What This System Does

GCFast-MPTS helps the Gordon College Faculty Association manage:

- **Member Registration** — Track full-time and associate faculty members per college
- **Dues Collection** — Record monthly dues (₱60) and membership fees (₱200)
- **Payment Tracking** — Single and bulk payment recording with history
- **Financial Reports** — Payment summaries, outstanding balances, collection rates
- **Member Self-Service** — Members view their own dues status and payment history

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.2.4 (App Router) |
| **Language** | TypeScript 5.x |
| **Database** | Supabase (PostgreSQL) |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **State** | TanStack Query v5 |
| **Charts** | Recharts v3 |
| **Reports** | ExcelJS + PDFKit |
| **Auth** | Supabase Auth (JWT) |
| **Hosting** | Vercel |

---

## 📁 Project Structure

```
gcfast_frontend/
├── app/                    # Next.js App Router pages & API routes
│   ├── (auth)/            # Public authentication pages
│   ├── (treasurer)/       # Treasurer dashboard & features
│   ├── (member)/          # Member self-service portal
│   └── api/               # Backend API endpoints
├── features/              # Feature modules (4-layer architecture)
│   ├── auth/              # Authentication
│   ├── members/           # Member management
│   ├── payments/          # Payment recording & tracking
│   ├── reports/           # Report generation
│   └── dues-configurations/ # Dues rate management
├── components/            # Shared UI components
├── lib/                   # Utilities, hooks, types
├── supabase/              # Database migrations
├── scripts/               # Seed & utility scripts
├── theme/                 # Design tokens
└── docs/                  # Additional documentation
```

---

## 🔑 Key Features

### For Treasurers
- 📊 **Dashboard** — Stats, charts, recent transactions
- 👥 **Member Management** — CRUD operations, filters, bulk actions
- 💰 **Payment Recording** — Single & bulk payment entry
- 📈 **Reports** — Generate Excel/PDF reports with filters
- ⚙️ **Dues Configuration** — Manage rate history

### For Members
- 📱 **Personal Dashboard** — Payment status overview
- 📅 **Dues Grid** — 12-month visual payment tracker
- 📜 **Payment History** — Complete transaction log
- 💳 **Balance Display** — Outstanding amount tracking

---

## 🔐 User Roles

| Role | Access | Login |
|------|--------|-------|
| **Treasurer** | Full system access | `/login` |
| **Member** | Personal dashboard only | `/login` |

Members are invited by treasurers via email magic links.

---

## 🗄️ Database Schema

Core tables:
- `profiles` — User accounts (links to Supabase Auth)
- `colleges` — Faculty colleges/departments
- `academic_periods` — Month/year tracking periods
- `members` — Faculty member records
- `dues_configurations` — Rate history (append-only)
- `payment_records` — All payment transactions
- `member_payment_summary` — Computed view for reports

See `supabase/migrations/` for complete schema.

---

## 📦 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Run production build
npm run lint             # Run ESLint
npm run seed             # Seed database with test data
npm run create-treasurer # Create treasurer account manually
```

---

## 🏗️ Architecture

This project follows a **strict 4-layer architecture**:

1. **Domain Layer** (`types/`) — Pure TypeScript types and business rules
2. **Data Layer** (`repositories/`) — API calls and data mapping
3. **Application Layer** (`hooks/`) — Business logic and state management
4. **Presentation Layer** (`components/`) — UI components

**Core Rules:**
- No component exceeds 500 lines
- No Supabase calls in components (only in repositories)
- All colors/spacing from `/theme` (never hardcoded)
- Layers only import downward (4 → 3 → 2 → 1)

Read **[GFAST_ARCHITECTURE.md](GFAST_ARCHITECTURE.md)** for complete guidelines.

---

## 🌐 Deployment

**Live Application**: https://gc-fast.vercel.app

The app is deployed on Vercel with:
- Automatic deployments on push to `main`
- Environment variables configured in Vercel dashboard
- Production database on Supabase

See **[HANDOVER.md](HANDOVER.md#13-deployment)** for deployment details.

---

## 🐛 Troubleshooting

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Database connection fails | Check `.env` credentials and Supabase project status |
| Port 3000 in use | Use `PORT=3001 npm run dev` or kill existing process |
| Seed script fails | Ensure migrations are run first, check service role key |
| Authentication errors | Clear cookies, verify Supabase Auth is enabled |

See **[SETUP_GUIDE.md#troubleshooting](SETUP_GUIDE.md#troubleshooting)** for detailed solutions.

---

## 📖 Learn More

- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **TanStack Query**: https://tanstack.com/query/latest
- **shadcn/ui Components**: https://ui.shadcn.com
- **Tailwind CSS v4**: https://tailwindcss.com

---

## 🤝 Contributing

This project is maintained by the development team. For questions or issues:

- **GitHub**: https://github.com/eunille/GCFast
- **Documentation**: See HANDOVER.md for system overview

---

## 📋 What's Next

Potential future enhancements (see HANDOVER.md for details):

- Email notifications on payment recorded
- Member profile editing (self-service)
- Bulk member import (CSV upload)
- Academic period management UI
- Dark mode support
- Unit/integration tests

---

## 📝 License

Private project for Gordon College Faculty Association.

---

**Version**: 1.0  
**Last Updated**: July 2026  
**Maintained by**: Development Team