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

## AI Processing Backend

AI analysis is powered by **n8n workflows** with the following architecture:

### n8n Workflow: `new-lead`

- **Trigger**: Supabase Database Webhook on `INSERT` events to the `leads_patrimoine` table
- **AI Model**: Mistral Cloud (`mistral-small-latest`) via LangChain integration
- **Processing**: Structured financial analysis with formatted Markdown output
- **Output**: Updates the lead record with `statut: analyse_terminee` and `analyse_ia` content

### Workflow Nodes

1. **Webhook** - Receives lead data from Supabase INSERT events
2. **AI Agent** - LangChain agent with financial advisor persona for "Toulouse Invest"
3. **Mistral Cloud Chat Model** - Provides the LLM capabilities
4. **Supabase Update** - Writes analysis results back to the database

The frontend never calls AI APIs directly. Instead, it uses the **Insert & Listen pattern**: insert data, then subscribe to Realtime updates. When the n8n workflow completes the analysis, Supabase fires the UPDATE event, and the frontend renders the results.

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
