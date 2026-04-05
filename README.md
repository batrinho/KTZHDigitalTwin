# KTZ Digital Twin

A real-time locomotive monitoring dashboard for Kazakhstan Temir Zholy (KTZ). Displays live telemetry, system health, route progress, and alerts for active railway routes — with a full administration panel and historical replay.

# **Website**
# https://ktzh-digital-twin.vercel.app/

## **Для того чтобы начать симулятор данных**
Сделайте POST-запрос на  
`https://simulator-service-production.up.railway.app/api/simulator/start` |
`curl -X POST https://simulator-service-production.up.railway.app/api/simulator/start`

## **Чтобы остановить**
Сделайте запрос на  
`https://simulator-service-production.up.railway.app/api/simulator/stop` |
`curl -X POST https://simulator-service-production.up.railway.app/api/simulator/stop`

---

## Stack

| Layer | Technology |
|---|---|
| UI | React 19, TypeScript, CSS custom properties |
| Routing | React Router v7 |
| Build | Vite 8 |
| Real-time | WebSocket (auto-reconnect, single connection per dashboard) |
| REST | Fetch API via typed wrappers |
| State | React hooks + ring buffer for time-series |
| i18n | Custom locale context (English / Russian) |
| Theming | CSS variable tokens, dark/light mode |

---

## Project structure

```
ktzh-react/src/
├── api/               # REST + file download wrappers (one file per resource)
│   ├── client.ts      # apiFetch / apiPost / apiPut / apiDelete / apiDownload
│   ├── alerts.ts      # GET /api/v1/alerts/{id}/active
│   ├── health.ts      # GET /api/v1/health/{id}/history|nearest
│   ├── healthParamWeights.ts  # GET/PUT/DELETE /api/v1/health/param-weights
│   ├── history.ts     # GET /api/v1/history/{id}, export
│   ├── locomotives.ts # CRUD /api/locomotives
│   ├── routeDefinitions.ts    # GET /api/v1/route-definitions
│   ├── routes.ts      # GET /api/v1/routes (live active routes)
│   ├── thresholds.ts  # GET/PUT/DELETE /api/v1/thresholds
│   └── index.ts       # barrel re-exports
│
├── models/            # TypeScript interfaces matching the OpenAPI contract
│   ├── api.ts         # ApiRoute, TelemetryParams, WsMessage, HistoryPoint, …
│   ├── dashboard.ts   # Alert
│   ├── healthParamWeight.ts
│   ├── locomotive.ts
│   ├── route.ts       # HealthInfo helpers (getHealthInfo, categoryToHealthInfo)
│   └── threshold.ts   # ThresholdResponse, UpsertThresholdRequest
│
├── hooks/
│   ├── useRingBuffer.ts      # Fixed-size ring buffer for time-series telemetry
│   ├── useTelemetryWs.ts     # WebSocket connection + all message handlers
│   ├── useDashboardData.ts   # Orchestrates WS + history seeding + route progress
│   └── useRoutes.ts          # Polling hook for the routes list page
│
├── context/
│   ├── ThemeContext.tsx       # dark / light toggle, persists to localStorage
│   └── LocaleContext.tsx      # en / ru switcher with t() helper
│
├── pages/
│   ├── RoutesPage.tsx         # Active routes list
│   ├── DashboardPage.tsx      # Live telemetry dashboard
│   ├── ReplayPage.tsx         # Historical replay with timeline scrubber + export
│   ├── AdminPage.tsx          # Admin shell with sidebar navigation
│   └── admin/
│       ├── FleetManagement.tsx    # Locomotive CRUD
│       ├── AlertThresholds.tsx    # Threshold config (GET/PUT /api/v1/thresholds)
│       ├── HealthParams.tsx       # Health param weights (GET/PUT /api/v1/health/param-weights)
│       └── SystemDiagnostics.tsx  # Queue / connection status
│
├── components/
│   ├── AppHeader.tsx          # Top header with locale / theme / admin toggle
│   ├── RouteCard.tsx          # Route list item with progress bar
│   └── dashboard/
│       ├── TopBar.tsx         # Locomotive identity + LIVE/OFFLINE badge
│       ├── HealthPanel.tsx    # SVG gauge + contributing factors
│       ├── AlertsPanel.tsx    # Alert list with severity colours
│       ├── RouteMap.tsx       # Station timeline + progress/remaining
│       └── TelemetryPanel.tsx # Interactive SVG line charts (last 10 min)
│
├── utils/
│   ├── svg.ts                 # buildPath — maps data array to SVG path string
│   └── time.ts                # formatDuration helper
│
└── i18n/
    ├── en.ts
    ├── ru.ts
    └── index.ts
```

---

## Data flow

```
REST (mount)                      WebSocket (live)
────────────                      ────────────────
GET /api/v1/routes          ───►  useTelemetryWs
GET /api/v1/history/{id}          │  TELEMETRY_SNAPSHOT   → state + ring buffer
GET /api/v1/health/{id}/nearest   │  TELEMETRY            → merged state + ring buffer
GET /api/v1/alerts/{id}/active    │  HEALTH_INDEX_SNAPSHOT → healthScore / category
GET /api/v1/route-definitions     │  HEALTH_INDEX         → healthScore + factors
                                  │  ALERT                → deduped alerts list
                                  ▼
                            useDashboardData
                            │  seeds ring buffer with REST history
                            │  fetches route definition for waypoints
                            │  computes station statuses + progress %
                            ▼
                        DashboardPage (renders all panels)
```

**Key design choices:**

- **Single WebSocket per dashboard** — `useTelemetryWs` owns the connection; components never open their own.
- **Telemetry merge** — partial `TELEMETRY` frames are merged into the previous full state via `latestTelemetry` ref, so no field is lost between updates.
- **Ring buffer** — 900-slot fixed-size buffer (~15 min at 1 Hz). Charts read a `getRange(now-10min, now)` slice, so the displayed window is always time-accurate regardless of message frequency.
- **History seeding** — on mount, `useDashboardData` fetches the last 10 minutes of REST history and pre-fills the ring buffer, so charts are never blank on first load.
- **Alert deduplication** — alerts are keyed by `message + timestamp`; duplicates from REST initial load and WebSocket pushes are silently dropped.

---

## Backend API reference

All endpoints live at `https://api-gateway-production-69b0.up.railway.app`.

### Active routes
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/routes` | All locomotives with live state (polled every 5 s) |

### Telemetry history
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/history/{locomotiveId}` | Historical telemetry (`?from=&to=&resolution=`) |
| GET | `/api/v1/history/{locomotiveId}/export` | CSV export of the same range |

### Health index
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/health/{locoId}/nearest` | Snapshot nearest to `?at=` timestamp |
| GET | `/api/v1/health/{locoId}/history` | Health score series (`?from=&to=`) |

### Health param weights
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/health/param-weights` | All weight/threshold configs |
| PUT | `/api/v1/health/param-weights` | Upsert by `paramName` |
| GET | `/api/v1/health/param-weights/{id}` | Single config by UUID |
| DELETE | `/api/v1/health/param-weights/{id}` | Delete config |

### Alert thresholds
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/thresholds` | All threshold bands |
| PUT | `/api/v1/thresholds` | Upsert by `paramName` |
| GET | `/api/v1/thresholds/{id}` | Single threshold by UUID |
| DELETE | `/api/v1/thresholds/{id}` | Delete threshold |

### Alerts
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/alerts/{locomotiveId}/active` | Currently active (unresolved) alerts |

### Route definitions
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/route-definitions` | All route definitions with waypoints |
| GET | `/api/v1/route-definitions/{id}` | Single definition by UUID |
| GET | `/api/v1/route-definitions/by-route-id/{routeId}` | Definition by route string ID |

### Locomotives
| Method | Path | Description |
|---|---|---|
| GET | `/api/locomotives` | All locomotives |
| POST | `/api/locomotives` | Create locomotive |
| GET | `/api/locomotives/{id}` | Single locomotive |
| PUT | `/api/locomotives/{id}` | Update locomotive |
| DELETE | `/api/locomotives/{id}` | Delete locomotive |

### WebSocket
```
wss://api-gateway-production-69b0.up.railway.app/ws/telemetry?locomotiveId={id}
```

| Message type | Payload | Effect |
|---|---|---|
| `TELEMETRY_SNAPSHOT` | Full telemetry + meta | Replaces telemetry state, pushes to ring buffer |
| `TELEMETRY` | Partial telemetry params | Merged into existing state, pushes to ring buffer |
| `HEALTH_INDEX_SNAPSHOT` | `score`, `category`, `trend` | Sets initial health state |
| `HEALTH_INDEX` | `score`, `topFactors[]` | Updates score + contributing factors |
| `ALERT` | `severity`, `message`, `triggeredAt` | Prepended to alerts list (deduped) |

---

## Getting started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Local development

```bash
cd ktzh-react
npm install
npm run dev
```

The Vite dev server proxies all `/api` and `/ws` requests to the production API gateway, so no local backend is needed.

### Production build

```bash
npm run build
```

Output is placed in `ktzh-react/dist/`. Deploy with any static host (Vercel, Nginx, etc.).

### Environment

The API base URL is configured in `src/api/config.ts`:

```ts
export const API_BASE = import.meta.env.VITE_API_BASE ?? '';
export const WS_BASE  = import.meta.env.VITE_WS_BASE  ?? '';
```

Set `VITE_API_BASE` and `VITE_WS_BASE` in a `.env` file or your hosting provider's environment variables for non-proxied deployments:

```
VITE_API_BASE=https://api-gateway-production-69b0.up.railway.app
VITE_WS_BASE=wss://api-gateway-production-69b0.up.railway.app
```

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Routes | Live list of all active locomotive routes with health badge and destination progress |
| `/dashboard/:id` | Dashboard | Full real-time telemetry dashboard for a single locomotive |
| `/replay/:id` | Replay | Scrubable historical replay with event markers and CSV/PDF export |
| `/admin` | Admin | Administration panel (fleet, alert thresholds, health params, diagnostics) |

### Admin sections

| Section | Endpoint | Purpose |
|---|---|---|
| Fleet Management | `/api/locomotives` | Add, edit, decommission locomotives |
| Alert Thresholds | `/api/v1/thresholds` | Configure `criticalLow/High` + `warningLow/High` bands per parameter |
| Health Parameters | `/api/v1/health/param-weights` | Configure scoring weights and thresholds used by the health index engine |
| System Diagnostics | — | RabbitMQ queue stats, ingestion throughput, locomotive connection states |

---

## Theming

The app ships with dark mode by default. Colours are entirely driven by CSS custom properties defined in `src/index.css` and toggled by a `data-theme="light"` attribute on `<html>`. Every component uses only those variables — no hardcoded colours in component CSS.

## Internationalisation

Switch between English and Russian via the globe icon in the header. Strings live in `src/i18n/en.ts` and `src/i18n/ru.ts`. Add a new language by creating a new file and registering it in `src/i18n/index.ts` and `src/context/LocaleContext.tsx`.
