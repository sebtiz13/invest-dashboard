<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Context

- **Name:** Invest Dashboard (Smart Wealth Management POC)
- **Goal:** Create a "Lead Magnet" web app for a wealth management consulting firm to pre-qualify prospects.
- **UX Flow:** Users input their financial data -> The app shows an elegant loading screen -> An AI analyzes their situation -> The app displays instant advice and offers an appointment.

# Technical Stack

- Front-End: Next.js 14+ (App Router), React, TypeScript, TailwindCSS, Shadcn UI.
- Database & Auth: Supabase (PostgreSQL, `@supabase/supabase-js`).
- (Off-scope for front-end dev: n8n and Mistral AI API).

# Development Environment

- Use `mise` (mise.jdx.dev) to manage Node.js versions. Install tools at the project level only, not globally.

# Absolute Architecture Rules

- **Asynchronous & Decoupled:** The Next.js front-end MUST NEVER call external AI APIs (n8n or Mistral) directly.
- **Insert & Listen Pattern:**
  1. The front-end inserts user data into the Supabase `leads_patrimoine` table.
  2. It retrieves the generated UUID.
  3. It displays a Skeleton Loader and subscribes to Supabase Realtime to listen exclusively for UPDATE events on that specific UUID.
  4. When the `statut` changes to `analyse_terminee`, the front-end stops the loader and renders the `analyse_ia` content in Markdown.

# Coding Guidelines

- Write modern, minimalist, and clean code.
- Write code and comments in English.
- Write UI in French.