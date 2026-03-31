# Prompts used and steps taken

---

## (a) Prompts used (summary)

1. **Project bootstrap and product brief**  
   - Create a new project from **Next.js**.  
   - Use **store management** (state) and **mock persistence** for saving data (no real database in the demo).  
   - Include a **demo username and password** for review.  
   - Use **Connect Stitch MCP** and the **mobile and desktop UI** generated there to drive the whole UI for the scenario below.

2. **Product scenario (finance app)**  
   Build a simple **personal finance tracking** application so users can understand spending and make better decisions. It should support:

   - Manual input of **income** and **expenses** through appropriate UIs.  
   - **Categories** (e.g. food, transport, bills, entertainment).  
   - A **summary**: total income, total expenses, remaining balance; optional **monthly income**, **allocated budget**, and **savings targets**.  
   - **Technical expectations**: simple **identification** (login / account / PIN), **mobile-responsive** web, **persistence** of records (in a full product: database; here: mock/local storage), **CRUD** on transactions, a **landing/dashboard** with month expenses, **budget usage %**, **category breakdown**, and **charts** (monthly spending, distribution, trends).  
   - Freedom to extend (smarter UX, AI-assisted ideas, etc.).

3. **Deployment**  
   - Add a **Vercel** workflow or config (e.g. GitHub Actions `vercel.yml`) for deploying the Next.js app.

4. **UI from Stitch**  
   - Use **Stitch-generated UI** (already created in Connect Stitch) for the project **frontend**—align the Next.js app with that design.

5. **Responsive / mobile**  
   - Desktop was done first; **mobile screens** also exist in Stitch—make the application **responsive** and consistent with those mobile patterns.

6. **Design polish**  
   - **Navbar and footer** colors should **match the design** (then: make top and dock **whiter**).  
---

## (b) Steps taken with AI tools


1. **Scaffold and stack**  
   - Next.js **App Router** app with **TypeScript**, **Tailwind CSS**, **Zustand** with **`persist`** middleware for **localStorage** (mock persistence).  
   - **Demo user**: documented credentials (e.g. `demo` / `demo123`) and login flow.

2. **Features vs. scenario**  
   - **Login** gating the dashboard.  
   - **Transactions**: create, update, delete; income vs expense; category, date, note.  
   - **Categories**: add/remove (with safeguards when removing).  
   - **Goals**: monthly income, budget, savings targets.  
   - **Dashboard**: KPIs (month income/expenses, balance, budget %), **Recharts** (category distribution, expense trend), transaction table and forms.

3. **Stitch MCP integration**  
   - Listed Stitch **projects/screens**, pulled **Home Dashboard (desktop)** HTML and **mobile** patterns for layout and tokens.  
   - Mapped **design system** colors (e.g. “Financial Atelier”) into **`globals.css`** (`@theme`) and **Manrope / Inter** + **Material Symbols**.  
   - Rebuilt **dashboard** and **login** to match **desktop** layout (sidebar, hero, insights, recent activity, manage sections).  
   - Added **mobile**: sticky top bar, bento summary, category bars, card-style recents, bottom nav with FAB, scroll targets, **responsive** charts height, mobile-friendly transaction list.

4. **Chrome and theme**  
   - **Nav/dock** colors aligned with design, then shifted to **white** top/dock for a cleaner look.  
   - **Dark/light**: Tailwind `@custom-variant dark` on `html.dark`, **`beforeInteractive`** theme init (`localStorage` + `prefers-color-scheme`), **`ThemeToggle`** on login and dashboard headers.

5. **CI / deploy (AI-assisted file)**  
   - **`.github/workflows/vercel.yml`**: production on push to `main`/`master`, previews on PRs, using Vercel CLI + GitHub secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).

6. **Small fixes**  
   - **Recharts** `Tooltip` typings for strict TypeScript.  
   - Hydration: **`suppressHydrationWarning`** on `<html>` where theme script runs early.

---

## Your steps (outside the AI chat)

- Connected **Stitch MCP** (e.g. via Cursor / Vercel-related setup) and **generated UI first** from the scenario.  
- Used that generated **mobile and desktop** designs as the visual source of truth for the implemented UI.  
- **Deployment**: **Vercel** connected to your **GitHub** repository for hosting and (if configured) automatic deploys.  
- Any manual Vercel project settings, env vars, or domain setup would live in the Vercel dashboard rather than in this repo.

