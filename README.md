# FloresYa v1 - Vanilla JS E-commerce Platform

> Enterprise-grade flower delivery e-commerce platform built with Vanilla JavaScript, Vite, and Supabase.

## 🚀 Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Styling**: Tailwind CSS v4 + Custom Design System
- **Build Tool**: Vite 6.x
- **Testing**: Vitest + jsdom
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (Serverless Functions)
- **Icons**: Lucide Icons

## 📁 Project Structure

```
/floresya-v1
├── index.html              # Entry point
├── /src
│   ├── main.js            # App initialization
│   ├── styles.css         # Tailwind + custom styles
│   ├── /components        # UI components
│   ├── /services          # Business logic layer
│   ├── /utils             # Helper functions
│   └── /types             # JSDoc type definitions (SSOT)
├── /api                   # Vercel serverless functions
├── /public                # Static assets
├── /dist                  # Production build (generated)
└── *.config.js            # Configuration files
```

## 🛠️ Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your Supabase credentials in .env
```

### Available Scripts

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Run full validation (lint + tests)
npm run validate

# Quick validation (lint only)
npm run validate:quick
```

## 🎨 Design System

### Color Palette

- **Coral**: Primary brand color (#ff4757)
- **Forest**: Green tones for nature theme
- **Blush**: Pink accents
- **Sunshine**: Yellow highlights

See `tailwind.config.js` for full color definitions.

## 🏗️ Architecture Principles

Following Silicon Valley standards as defined in `CLAUDE.md`:

1. **Single Source of Truth (SSOT)**: All types in `src/types/index.js`
2. **Service Layer Pattern**: Business logic isolated in `src/services/`
3. **Fail-Fast Philosophy**: Immediate error handling, no silent failures
4. **Zero Technical Debt**: No ESLint/TypeScript errors tolerated
5. **Type Safety**: JSDoc annotations throughout

## 📦 Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

Configure these in Vercel dashboard or `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

## 🧪 Testing

Tests are written with Vitest and follow fail-fast principles:

```bash
# Watch mode
npm test

# Single run
npm run test:run

# Coverage report
npm run test:coverage
```

## 📝 Code Quality

- **ESLint 9.x** (flat config) - enforces clean code
- **Vitest** - fast unit testing
- **JSDoc** - type annotations for VS Code IntelliSense

## 🔐 Security

- Environment variables for sensitive data
- CORS headers configured in `vercel.json`
- Security headers (XSS, Frame Options, etc.)
- Input validation with Zod

## 📄 License

MIT - See LICENSE file

## 👥 Team

FloresYa Development Team

---

**Status**: ✅ Base configuration complete - ready for feature development# floresya-v1
# floresya-v1
