[![Vercel Deploy](https://deploy-badge.vercel.app/vercel/invest-dashboard-ten?style=for-the-badge)](https://invest-dashboard-ten.vercel.app/)
# Invest Dashboard - Smart Wealth Management POC

A **Lead Magnet** web application designed to pre-qualify prospects for wealth management consulting services. The application collects financial data from users, simulates AI-powered analysis, and delivers personalized recommendations to engage high-potential clients.

---

## Architecture & Workflow

The application implements an **asynchronous "Insert & Listen" pattern** that decouples the frontend from AI processing:

1. **Data Insertion**: The Next.js frontend inserts user financial data into the Supabase `leads_patrimoine` table with an initial `en_attente` (pending) status.

2. **Loading State**: The UI immediately displays a loading screen, providing instant feedback to the user.

3. **Realtime Subscription**: The frontend subscribes to Supabase Realtime, listening exclusively for `UPDATE` events on the specific record UUID.

4. **AI Processing**: A Supabase Edge Function (triggered by a Database Webhook) simulates AI analysis and updates the record with `statut: analyse_terminee` and the generated `analyse_ia` content.

5. **Result Display**: When the Realtime event fires, the loading screen is replaced with the formatted analysis, rendered as Markdown.

This architecture ensures the frontend **never blocks** on synchronous HTTP API calls for AI generation, providing a seamless user experience.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14+ (App Router) |
| **Styling** | Tailwind CSS v4, Shadcn UI |
| **Database** | Supabase PostgreSQL |
| **Realtime** | Supabase Realtime (Postgres Changes) |
| **Backend** | Supabase Edge Functions (Deno) |

---

## Database Security: RLS Policies

Row Level Security (RLS) is **enabled** on the `leads_patrimoine` table with the following policies:

### Permission Matrix

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| `anon` | ✅ | ✅ | ❌ | ❌ |
| `authenticated` | ✅ | ✅ | ✅ | ❌ |
| `service_role` | ✅ | ✅ | ✅ | ✅ |

### Table Schema

The `leads_patrimoine` table contains:

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | ❌ | Primary key |
| `nom` | `text` | - | ❌ | User's name |
| `age` | `integer` | - | ❌ | User's age |
| `revenus_mensuels` | `integer` | - | ❌ | Monthly income |
| `epargne_liquide` | `integer` | - | ❌ | Liquid savings |
| `patrimoine_immobilier` | `integer` | - | ❌ | Real estate assets |
| `statut` | `text` | `'en_attente'` | ❌ | Status (`en_attente`, `analyse_terminee`) |
| `analyse_ia` | `text` | - | ✅ | AI-generated analysis (Markdown) |
| `created_at` | `timestamptz` | `now()` | ❌ | Creation timestamp |

---

## Mock Backend

For this proof of concept, AI analysis is simulated using:

- **Supabase Edge Function** (`mock-ia-analysis`): Deployed and triggered via Database Webhook on `INSERT` events to the `leads_patrimoine` table.
- **5-second delay**: Simulates AI processing time.
- **Dummy Markdown generation**: Produces a formatted financial analysis response.

In production, this would be replaced by:
- **n8n workflows** for orchestration
- **Mistral AI API** for actual AI analysis

---

## Getting Started

### Prerequisites

- Node.js (managed via [mise](https://mise.jdx.dev))
- Supabase project with appropriate RLS policies

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Project Structure

```
invest-dashboard/
├── app/
│   ├── globals.css          # Tailwind CSS with typography
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page with form and analysis display
├── supabase/
│   └── functions/
│       └── mock-ia-analysis/ # Edge Function for AI simulation
├── scripts/
│   └── mock-n8n.ts          # Local development mock (deprecated)
└── package.json
```

---

## Development

This project was developed with the assistance of **[Mistral Vibe CLI](https://vibe.mistral.ai/)**, an AI-powered coding agent.
