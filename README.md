# Store Operational Issues Dashboard — Frontend Application

An enterprise-grade, high-performance web dashboard engineered for retail store operations managers. Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **Lucide React**.

---

## 🌟 Key Highlights & Features

### 1. Top Metrics KPI Tiles (Phase 8)
- **Total Open Issues**: Real-time count of active operational tickets (`New` + `In Progress`).
- **High-Priority Issues**: Critical bottleneck incidents needing urgent triage.
- **Resolved Issues**: Successfully resolved and documented issues.
- **Requires Follow-up**: Issues with high priority or pending supervisor sign-off.
- **Click-to-Filter Integration**: Clicking any KPI card directly filters the issues table!

### 2. Multi-Faceted Filter & Search Bar (Phase 5)
- **Store Filter**: Dynamic dropdown populated from backend (`/api/meta`).
- **Category Filter**: Filter by `Equipment`, `Staffing`, `Inventory`, `Cleanliness`, `IT/POS`, `Safety`, `Customer`.
- **Priority Filter**: Filter by `High`, `Medium`, `Low`.
- **Status Filter**: Filter by `New`, `In Progress`, `Resolved`.
- **Global Search**: Live text search across short descriptions, detailed descriptions, store locations, and assigned managers.
- **Active Filter Chips**: Individual badges for each active filter with remove (`✕`) buttons.
- **One-Click Clear All**: Instantly resets all filters back to default.

### 3. Interactive Data Table (Phase 4 & 5)
- **Column-Header Sorting**: Click any column header (`Issue ID`, `Store`, `Category`, `Priority`, `Status`, `Date Reported`, `Manager`) to toggle between ascending (`↑`) and descending (`↓`) order.
- **Priority Visual Highlighting**: High-priority issues feature prominent rose left-border badges and colored alert indicators.
- **Row Click Interaction**: Clicking any row smoothly opens the comprehensive issue detail modal.
- **Pagination Controls**: Configurable page size with Next/Previous and page counter.

### 4. Detail & Action Modal (Phase 6 & 7)
- **Status Management (Phase 6)**:
  - Interactive **Status Dropdown** (`<select>`) plus 1-click status pill buttons.
  - **Audit Author Selector**: Pick the duty manager executing the status transition.
  - **Status History Audit Trail**: Chronological timeline showing previous status transitions (`Old Status ➔ New Status`), author name, and timestamps.
  - Automatic `Resolved Date` display upon resolution.
- **Management Notes CRUD (Phase 7)**:
  - Reverse chronological notes timeline with manager names and timestamps.
  - Add Note form with strict **500-character limit** and client-side validation.

### 5. Resilient Architecture & Graceful Fallback
- Directly connects to Express REST backend (`http://localhost:5001`).
- If backend is offline or unreachable, the frontend automatically falls back to deterministic local mock data with an online/offline status pill indicator.

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript (Strict typing across models and API contracts)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API (`useIssues`) with optimistic UI updates

---

## 📁 Component Directory Structure

```text
dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Base HTML layout, fonts & metadata
│   │   ├── page.tsx                  # Main dashboard entrypoint
│   │   └── globals.css               # Tailwind CSS v4 directives
│   ├── components/
│   │   ├── ui/
│   │   │   └── badge.tsx             # PriorityBadge & StatusBadge components
│   │   └── dashboard/
│   │       ├── header.tsx            # Top nav with backend status indicator
│   │       ├── metrics-summary.tsx   # 4 top KPI metric cards
│   │       ├── filter-bar.tsx        # Multi-dropdowns, search & active chips
│   │       ├── issues-table.tsx      # Table with sorting, badges & pagination
│   │       └── issue-detail-modal.tsx# Status dropdown, audit trail & notes
│   ├── context/
│   │   └── issues-context.tsx        # Global state, optimistic actions & API sync
│   ├── lib/
│   │   ├── api.ts                    # REST API client & data transformations
│   │   └── utils.ts                  # Classnames & styling helpers
│   ├── types/
│   │   └── issues.ts                 # TypeScript interfaces (Issue, Note, History)
│   └── data/
│       └── intial_issues.ts          # Local mock dataset for offline fallback
├── .env.local                        # Environment config (NEXT_PUBLIC_BACKEND_URL)
├── package.json
└── tsconfig.json
```

---

## 🚀 Running the Frontend

### 1. Configure Environment
Verify `.env.local` contains the backend endpoint:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 4. Production Build & Verification
```bash
# Type check
npx tsc --noEmit

# Production Next.js build
npm run build
npm start
```
