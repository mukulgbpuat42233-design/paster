# Recent Files Activity History & Verification Reload

Implement a collapsible **Recent Files** section situated directly beneath the Verification card. This module persists verified and generated NRPC weekly workbook runs to browser `localStorage`, providing engineers and grid dispatchers with an audit log of past activities, complete parameter verification metrics, and instant re-load into the active generator without requiring file re-upload.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design choices were confirmed with the user during Phase 1:
> - **Display Location**: Collapsible card placed directly beneath the Verification section (harmonizes with existing card layout and maintains natural top-to-bottom workflow).
> - **Item Capabilities**: Full details view with quick **"Re-load into Active Verification"** action, along with direct generation and file download triggers for past verified sessions.
> - **Persistence**: Browser `localStorage` (retains up to 20 recent verification runs with timestamps, ISO week numbers, file names, parameter counts, and session state).

---

## 1. Overview & Core Concept

- **What It Does**: Automatically logs every verified and generated NRPC weekly input file. Displays historical runs in a clean, high-density collapsible card with date ranges, ISO week numbers, plant parameter breakdown (e.g. 7/7 per station), and status badges.
- **Key Value**: Saves operators time when generating files repeatedly or reviewing previously checked weekly datasets. A single click restores the verified data and dates into the active generator.
- **Target Persona**: Power plant engineers, billing analysts, and grid coordinators at THDCIL processing weekly NRPC Deviation Settlement Mechanism (DSM) filings.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Automatic Logging**:
   - When a user clicks **Verify Raw Data** and validation succeeds, a new entry is saved with `status: "verified"`, timestamp, detected week range, and parameter checks.
   - When the user clicks **Generate 3 Uniform Weekwise Excel Files**, the entry status updates to `"generated"` with generated file names (`THDCIL_Week_<WW>_<YYYY>_<PLANT>_LU_DSM.xlsx`).
2. **Collapsible Header**:
   - Clean card header with title **Recent Files & Activity History**, a badge showing the number of stored runs (e.g., `3 runs`), a toggle arrow, and a **Clear History** button.
3. **Run Item Layout**:
   - Compact table/list row for each session showing:
     - Formatted timestamp (e.g., `16 Oct 2026, 12:15 PM`)
     - File name and size
     - Detected week span (`DD-MM-YYYY to DD-MM-YYYY`) and ISO Week badge (`Week 42 · 2026`)
     - Parameter check pills or compact summary (`Schedule 7/7`, `SRAS 7/7`, `Actual 7/7`, `Freq 7/7`, `Ref Rate 7/7`)
     - Action buttons: **"Load into Verification"** (populates active state) and **"Re-download 3 Files"** (if data available).
4. **Empty State**:
   - Calm, unboxed text: `"No previous files recorded yet. Verified and generated workbooks will appear here automatically."`

### Visual Identity & Theme
- **Color System**: Aligns with THDCIL palette — deep navy header `#073b66`, active brand blue `#0b6fa4`, success green `#16834b`, neutral background `#eef3f8`, and soft borders `#e2edf4`.
- **Typography**: Clean sans hierarchy with `tabular-nums` for timestamps, week numbers, and counts.
- **Anti-Slop Restraint**: No floating pill sandwiches or flashing neon badges. Clean, unboxed text separators and high-contrast readable buttons.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Storage Architecture**:
  - *Chosen Approach*: Store metadata, ISO week info, dates, and lightweight verification check summaries in `localStorage`. Cache the parsed 7-day data window for active quick re-downloads.
  - *Why*: `localStorage` has a ~5MB limit; raw raw Excel files can be several megabytes, so storing the essential structured 7-day window arrays (~40KB per week) ensures dozens of history entries fit reliably without quota errors.
- **Decision 2: Seamless Integration with Active App State**:
  - *Chosen Approach*: Expose an `onLoadHistoryItem(item)` callback in `App.tsx` that restores `verified` data, sets the progress bar to 100%, and activates the green "Generate" button immediately.
  - *Why*: Gives users immediate feedback and eliminates duplicate file selection friction.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                                App.tsx                                 │
│                                                                        │
│  ┌───────────────────────┐              ┌───────────────────────────┐  │
│  │      UploadCard       │              │     VerificationCard      │  │
│  │ (Upload, Verify, Gen) │              │    (Counts, Status, Win)  │  │
│  └──────────┬────────────┘              └───────────────────────────┘  │
│             │ onVerify / onGenerate                                    │
│             ▼                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   RecentFilesHistory Card                        │  │
│  │  - Collapsible header with entry count                           │  │
│  │  - LocalStorage hook (useRecentHistory)                          │  │
│  │  - Run list with ISO Week, dates, parameter stats                │  │
│  │  - Actions: [Load into Verification] [Re-download Files]         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                 ▲                                      │
│                                 │ persist / load                       │
│                        localStorage ("thdc_recent_runs")               │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model (`RecentRunRecord`):
```typescript
export interface RecentRunRecord {
  id: string;
  timestamp: number;
  fileName: string;
  fileSize: number;
  dateRange: [string, string]; // [start, end]
  isoWeek: { year: number; week: number };
  status: 'verified' | 'generated';
  checks: PlantCheck[];
  dataSnapshot?: Record<string, string[][]>;
  dates: string[];
}
```

### Component Breakdown
- `src/components/RecentFilesCard.tsx`: Collapsible history UI with list, details toggle, action buttons, and clear dialog.
- `src/utils/history.ts`: Typed local storage service with error resilience, pruning to last 20 entries, and data serialization.
- `src/App.tsx`: Hooks into `handleVerify` and `handleGenerate` to record events, and handles `onLoadHistoryItem`.

---

## Verification Plan

1. **Compilation**: Run `compile_applet` and `lint_applet` to ensure zero TypeScript or syntax errors.
2. **State & LocalStorage Test**:
   - Verify adding records upon verification and updating on file generation.
   - Verify page reload preserves previous runs.
   - Verify "Load into Verification" updates active UI state and enables the 3-file download button.
   - Verify "Clear History" empties storage and displays clean empty state.
