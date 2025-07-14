# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Summit Matchmaking application for M25 Club Summit - a networking platform that connects founders and investors at M25's flagship events. The application handles user registration, profile management, matchmaking, and scheduling.

## Key Technologies

- **Frontend**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.1
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **State Management**: React Query (TanStack Query) + React Hook Form
- **Backend**: Supabase (PostgreSQL database + Auth + Edge Functions)
- **Validation**: Zod schemas
- **Routing**: React Router DOM v6

## Development Commands

```bash
# Start development server (port 8080)
npm run dev

# Production build
npm run build

# Development build
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Project Architecture

### Directory Structure
```
/src
├── api/           # API service modules for Supabase operations
├── components/    # React components organized by feature
│   ├── admin/     # Admin dashboard components
│   ├── auth/      # Authentication flows
│   ├── dashboard/ # User dashboard components
│   └── ui/        # shadcn/ui components
├── hooks/         # Custom React hooks
├── integrations/  # External service integrations
│   └── supabase/  # Supabase client, types, and queries
├── lib/           # Utility functions
├── pages/         # Page components
├── schemas/       # Zod validation schemas
└── types/         # TypeScript type definitions
```

### Key Features

1. **User Types**: Founders (seeking investment) and Investors (VCs/angels)
2. **Authentication**: Email-based with allowlist control
3. **Matchmaking**: Priority matches and mutual match discovery
4. **Scheduling**: Time slot management for meetings
5. **Admin Dashboard**: User management and Google Sheets sync

### Database Schema

- `profiles`: Base user profiles
- `founder_details`: Founder-specific data (company, stage, funding goals)
- `investor_details`: Investor-specific data (check size, investment interests)
- `priority_matches`: High-priority connection requests
- `allowed_emails`: Registration allowlist
- `time_slots`: Meeting availability

### Supabase Edge Functions

Located in `/supabase/functions/`:
- `create-test-users`: Generate test data
- `sync-to-sheets`: Export data to Google Sheets
- `sync-allowed-emails`: Import allowed emails from Google Sheets

## Important Patterns

### API Services
All Supabase operations go through service modules in `/src/api/`:
- `admin.ts`: Admin operations
- `auth.ts`: Authentication
- `founders.ts`: Founder-specific operations
- `investors.ts`: Investor-specific operations
- `matches.ts`: Matching logic
- `profiles.ts`: Profile management

### Form Handling
Forms use React Hook Form with Zod validation:
```typescript
// Example pattern from src/schemas/
const schema = z.object({...});
const form = useForm({ resolver: zodResolver(schema) });
```

### Authentication Flow
1. User enters email → Check against `allowed_emails` table
2. If allowed → Send magic link → Create/update profile
3. Route to appropriate dashboard based on user type

### Component Organization
- Shared UI components in `/src/components/ui/`
- Feature-specific components grouped by domain
- Page components in `/src/pages/`

## Development Notes

- **Path Alias**: `@/` maps to `./src/`
- **Port**: Development server runs on port 8080
- **Environment**: Supabase credentials are currently hardcoded in `/src/integrations/supabase/client.ts`
- **TypeScript**: Relaxed configuration with some checks disabled
- **Styling**: Tailwind CSS with custom theme configuration in `tailwind.config.ts`