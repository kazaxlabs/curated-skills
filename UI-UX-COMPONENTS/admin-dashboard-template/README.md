# Atelier Admin Operating System (Template)

> **High-Performance, Zero-Dependency Enterprise Admin Dashboard & CRM Template**  
> OS-agnostic and Windows-ready: radical simplicity, tactile feedback, glassmorphic frosted surfaces, dual light/dark aesthetics, universal command palette (`Ctrl+K`), and zero external lock-in.

---

## 1. Overview & Design Principles

The **Atelier Admin System** is an empty-shell administrative dashboard and internal operating system designed for enterprise tools, agency workflows, and multi-tenant platforms. It decouples all data persistence behind a modular adapter interface (`IAdminStorageAdapter`), enabling instant swapping between **pristine zero-data empty states**, **demo fixtures**, and **live cloud backends** (Firebase, Supabase, Cloud Functions, custom REST).

### Key IX & Visual Highlights
- **OS-Agnostic Atelier Aesthetics:** Crafted with frosted glass (`backdrop-filter: blur(20px)`), hairline borders (`rgba(255, 255, 255, 0.08)` / `rgba(0, 0, 0, 0.08)`), subtle depth, tactile physics (`active: scale(0.97)`), and universal Windows/cross-platform font stacks (`Segoe UI`, `Montserrat`, `Consolas`).
- **Dual Visual Modes:**
  - **Alpine White (Light Mode):** High-clarity, Swiss-inspired typographic contrast with crisp card surfaces.
  - **Obsidian Cockpit (Dark Mode):** Ultra-deep OLED obsidian (`#0c0e12`) engineered for long-session operational focus.
- **Global Command Palette (`Ctrl+K`):** Keyboard-driven quick navigator and action launcher with search filtering and instant module switching.
- **Floating Status Toast HUD:** Unobtrusive, pill-shaped feedback HUD positioned at top-center for instant operational confirmations.
- **Dual-View CRM:** Switch seamlessly between a high-density tabular view and a visual 5-stage Kanban board.
- **Zero Lock-In:** Ship with in-memory reactivity, or connect any remote API in minutes.

---

## 2. Included Modules

| Module | Core Functionality | Included Components |
|---|---|---|
| **CRM & Pipeline** | Multi-stage lead management, inquiry intake, conversion tracking, customer value estimation, soft-delete vault recovery. | Dual Table/Kanban switcher, `NewLeadModal`, `LeadDrawer`, `VaultModal`. |
| **Content Engine (CMS)** | Multi-collection headless CMS (Services, Portfolios, Testimonials), drag/drop reordering, active toggles. | `CmsModule`, `CmsItemModal`, item renumbering. |
| **Telemetry & SEO** | Organic impressions, click-through rates, average position tracker, Google Search Console sync, keyword tables, SVG sparklines. | `AnalyticsModule`, sparkline cards, keyword rank list. |
| **Privacy & Law 25** | Quebec Law 25 & GDPR compliance dashboard, cookie/marketing consent registry, data erasure logs, point-in-time snapshots. | `SecurityModule`, `ErasureModal`, CSV consent exporter. |
| **Team & RBAC** | Staff directory, granular capability matrix (read/write/delete per module), invite workflows. | `StaffModule`, `InviteStaffModal`. |

---

## 3. Quickstart

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation & Development
```bash
# Navigate to template directory
cd C:\Curated_Skills\UI-UX-COMPONENTS\admin-dashboard-template

# Install dependencies
npm install

# Run local development server
npm run dev

# Run strict TypeScript validation
npm run typecheck

# Build optimized production bundle
npm run build
```

---

## 4. Playwright Automated Endpoint Connection Workflow

The template includes an automated Playwright tool to connect real production endpoints without manual copy-pasting or security leaks.

```bash
npm run connect:endpoints
```

### How it works:
1. **Interactive Menu:** Select your provider (`Firebase`, `Supabase`, `Brevo`, `SerpApi`, or `Custom REST API`).
2. **Headful Browser Session:** Playwright launches a visible Chromium window directed to the service console/auth screen.
3. **Safety Halt:** The CLI emits a security pause banner and **waits for human authentication / 2FA**.
4. **Live Verification Ping:** After credentials are confirmed, the script sends an active verification request to test connectivity.
5. **Secure Local Persistence:** Validated parameters are written directly to `.env.local` (which is gitignored).

Full documentation available in [`ENDPOINT-CONNECTION-WORKFLOW.md`](./ENDPOINT-CONNECTION-WORKFLOW.md).

---

## 5. Directory Structure

```
admin-dashboard-template/
├── scripts/
│   └── connect-endpoints.mjs      # Playwright CLI automating service connections
├── src/
│   ├── adapters/
│   │   ├── MockStorageAdapter.ts  # In-memory storage with reactive pub/sub & demo toggle
│   │   ├── LiveApiAdapter.ts      # Live REST / backend microservice adapter
│   │   └── fixtures.ts            # High-fidelity sample dataset
│   ├── config/
│   │   ├── modules.config.ts      # Pluggable navigation and module registry
│   │   └── endpoints.config.ts    # Typed environment reader (.env.local)
│   ├── layout/
│   │   ├── Sidebar001.tsx         # Frosted glass collapsible navigation rail
│   │   ├── TopBar.tsx             # Header with search, command shortcut, and demo switch
│   │   ├── SpatialContainer.tsx   # Card container with hairline borders
│   │   ├── EmptyState.tsx         # Clean zero-data placeholder illustration
│   │   ├── ToastHUD.tsx           # Floating status feedback HUD
│   │   └── CommandPalette.tsx     # Ctrl+K Universal Command modal
│   ├── modules/
│   │   ├── crm/                   # CRM Table & Kanban views
│   │   ├── cms/                   # Headless content manager
│   │   ├── analytics/             # Performance & telemetry
│   │   ├── security/              # Law 25 / GDPR compliance
│   │   └── staff/                 # Team directory & RBAC
│   ├── types/                     # TypeScript contracts (adapter, crm, cms, etc.)
│   ├── App.tsx                    # Root layout & state orchestrator
│   ├── index.css                  # Apple Atelier design system & CSS variables
│   └── main.tsx                   # React 19 entry point
├── ENDPOINT-CONNECTION-WORKFLOW.md# Step-by-step connection guide
└── package.json
```

---

## 6. Customization & Adapters

To bind the template to your custom backend, simply implement `IAdminStorageAdapter` found in `src/types/adapter.ts`:

```typescript
import { IAdminStorageAdapter } from './types/adapter';

export class MyCustomBackendAdapter implements IAdminStorageAdapter {
  async getLeads() { /* fetch from your database */ }
  async createLead(lead) { /* insert into your database */ }
  // ... implement remaining CRM, CMS, and Security methods
}
```

Then pass your custom adapter to `App.tsx` or swap it in based on environment variables in `endpoints.config.ts`.
