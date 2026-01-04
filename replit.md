# Market Desk Simulator

## Overview

Market Desk Simulator is a 3D stock broker simulator game where players work as a broker building a stock portfolio day-by-day. The game uses fictional companies, tickers, and procedurally generated market data. Players can buy/sell stocks, manage their portfolio, track reputation, and progress through career levels from Junior to Partner.

The application is built as a full-stack web application with a React frontend featuring Three.js for 3D rendering and an Express backend. Game state is persisted locally using LocalStorage.

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
- **LocalStorage**: Client-side persistence for game saves (day, cash, positions, stocks, reputation)
- **PostgreSQL with Drizzle ORM**: Database schema defined but primarily used for user management, not core game state
- **In-memory storage**: Server-side fallback storage implementation for user data

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
- **Component-based UI**: Modular game panels (TopBar, MarketPanel, TradePanel, DailyFeed)
- **Store-based state**: Centralized game state with computed values and actions
- **Path aliases**: `@/` for client sources, `@shared/` for shared code

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