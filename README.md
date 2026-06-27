# Web Analytics Command Center

A deployment-ready analytics dashboard prototype for GA4, Search Console, GTM, Screaming Frog CSV imports, PageSpeed Insights, traffic channels, Core Web Vitals, tag auditing, health scoring, and AI-assisted recommendations.

## Live Integrations

- PageSpeed Insights runs directly from the browser and does not need an API key.
- Screaming Frog import parses CSV files locally in the browser.
- AI Analyst calls `/api/analyst`, which can use `OPENAI_API_KEY`, `CODEX_API_KEY`, or `ANTHROPIC_API_KEY`.

## Database

This prototype does not require a database. Add one when you need persisted users, OAuth tokens, historical analytics snapshots, saved crawl imports, saved AI recommendations, and multi-client workspaces.

## Deploy

Import this repository into Vercel. Set the build command to empty/default and the output directory to `public` if prompted. Add AI keys as Vercel environment variables when ready.
