# Market Desk Simulator

## Overview

Market Desk Simulator is a 3D stock broker simulator game where players work as a broker building a stock portfolio day-by-day. The game uses fictional companies, tickers, and procedurally generated market data. Players can buy/sell stocks, manage their portfolio, track reputation, and progress through career levels from Junior to Partner.

The game features a hybrid Idle + Trading system where players earn passive income from their fund while also actively trading for larger gains.

The application is built as a full-stack web application with a React frontend featuring Three.js for 3D rendering and an Express backend. Game state is persisted locally using LocalStorage.

## Idle Income System

### Fund Income
- Players earn passive income every second based on their Fund Size and career level
- Income rates scale with career progression (Junior: $1-5/s, Associate: $5-15/s, Senior: $20-60/s, Partner: $100-300/s)
- Fund Size grows based on positive trading performance

### Tap Boost ("Desk Work")
- Players can tap the "Desk Work" button to temporarily boost idle income
- Each tap adds +2% to income for a short duration (max +100%)
- Boost decays over time when not tapping

### Offline Earnings
- Players earn income while away (up to 8 hours maximum)
- A "Welcome Back" modal shows accumulated earnings when returning
- Offline earnings are based on base income rate at time of exit

### Rewarded Boosts (Mock)
- "Double Fund Income" - 2x income for 30 minutes (1 hour cooldown)
- "Instant Offline Collect" - Collect max offline earnings instantly (24 hour cooldown)
- Boosts use a mock "Watch Ad" flow for activation

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Main UI framework using functional components and hooks
- **Three.js / React Three Fiber**: 3D rendering for the office scene with desk, monitor, and ambient lighting
- **Zustand**: State management for game state (`useStockGame`), audio (`useAudio`), and game phase (`useGame`)
- **Tailwind CSS**: Utility-first styling with custom CSS variables for theming
- **Radix UI**: Headless component primitives for accessible UI elements (dialogs, buttons, etc.)
- **Vite**: Development server and build tool with GLSL shader support

### Backend Architecture
- **Express.js**: HTTP server handling API routes
- **TypeScript**: Full type safety across the codebase
- **Static file serving**: Serves built frontend assets in production
- **Vite middleware**: Development mode hot module replacement

### Data Storage
- **LocalStorage**: Client-side persistence for game saves (day, cash, positions, stocks, reputation, idle state)
- **PostgreSQL with Drizzle ORM**: Database schema defined but primarily used for user management, not core game state
- **In-memory storage**: Server-side fallback storage implementation for user data

### Idle Income Store (`useIdleIncome`)
- Fund Size and base income per second
- Tap boost state (current percentage, decay rate)
- Rewarded boost timers and cooldowns
- Last active timestamp for offline earnings calculation

### Project Structure
```
client/           # Frontend React application
  src/
    components/   # React components (game UI, 3D scene, UI primitives)
    lib/stores/   # Zustand state stores
    hooks/        # Custom React hooks
server/           # Express backend
shared/           # Shared types and database schema
migrations/       # Drizzle database migrations
```

### Key Design Patterns
- **Component-based UI**: Modular game panels (TopBar, MarketPanel, TradePanel, DailyFeed, FundIncomePanel, BoostsPanel)
- **Store-based state**: Centralized game state with computed values and actions
- **Path aliases**: `@/` for client sources, `@shared/` for shared code
- **Game loop tick**: 1-second interval for idle income accrual with timestamp-based math

## External Dependencies

### Core Libraries
- **React 18**: UI framework
- **Three.js / @react-three/fiber**: 3D graphics
- **@react-three/drei**: Three.js helpers and abstractions
- **@react-three/postprocessing**: Visual effects
- **Zustand**: Lightweight state management
- **@tanstack/react-query**: Data fetching and caching

### UI Components
- **Radix UI**: Full suite of accessible component primitives
- **Tailwind CSS**: Styling framework
- **class-variance-authority**: Component variant management
- **Lucide React**: Icon library

### Backend
- **Express.js**: Web server framework
- **Drizzle ORM**: TypeScript ORM for PostgreSQL
- **connect-pg-simple**: Session storage (if sessions are needed)

### Build Tools
- **Vite**: Frontend bundler with HMR
- **esbuild**: Server bundling for production
- **TypeScript**: Type checking across frontend and backend
- **vite-plugin-glsl**: GLSL shader imports

### Database
- **PostgreSQL**: Primary database (configured via `DATABASE_URL` environment variable)
- **Drizzle Kit**: Database migrations and schema management