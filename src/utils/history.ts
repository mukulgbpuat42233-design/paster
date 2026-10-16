import { RecentRunRecord } from '../types';

const STORAGE_KEY = 'thdc_nrpc_recent_runs';
const MAX_HISTORY_ITEMS = 20;

export function loadHistory(): RecentRunRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error('Failed to load recent history from localStorage:', err);
    return [];
  }
}

export function saveHistoryItem(record: RecentRunRecord): RecentRunRecord[] {
  try {
    const current = loadHistory();
    // Check if record already exists by ID
    const existingIndex = current.findIndex((item) => item.id === record.id);
    let updated: RecentRunRecord[];

    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = record;
    } else {
      updated = [record, ...current].slice(0, MAX_HISTORY_ITEMS);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (quotaErr) {
      console.warn('Storage quota exceeded, retrying without heavy snapshots:', quotaErr);
      // Strip raw dataSnapshots to conserve quota
      const lightweight = updated.map(({ dataSnapshot, ...rest }) => rest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
    }

    return updated;
  } catch (err) {
    console.error('Failed to save history item:', err);
    return [];
  }
}

export function updateHistoryItemStatus(
  id: string,
  status: 'verified' | 'generated'
): RecentRunRecord[] {
  try {
    const current = loadHistory();
    const updated = current.map((item) => {
      if (item.id === id) {
        return { ...item, status };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to update history status:', err);
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // '0' should be '12'
  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

function csvEscape(val: unknown): string {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportHistoryToCSV(history: RecentRunRecord[]): void {
  if (!history || history.length === 0) return;

  const headers = [
    'Date & Time',
    'Raw File Name',
    'Raw File Size',
    'Status',
    'ISO Week',
    'ISO Year',
    'Week Start Date',
    'Week End Date',
    'All Dates (7 Days)',
    'TEHRI HEP Status',
    'KOTESHWAR Status',
    'TEHRI PSP Status',
    'Generated Workbooks',
  ];

  const rows = history.map((item) => {
    const tehri = item.checks.find((c) => c.plant === 'TEHRI HEP');
    const koteshwar = item.checks.find((c) => c.plant === 'KOTESHWAR');
    const psp = item.checks.find((c) => c.plant === 'TEHRI PSP');

    const fmtCheck = (c?: typeof tehri) =>
      c
        ? `GS:${c.GS_Stations}/7; SRAS:${c.SRAS}/7; Act:${c.Act_Inj_Gen_Stations}/7; Freq:${c.Frequency}/7; Ref:${c.Reference_Rate}/7`
        : 'N/A';

    const weekStr = String(item.isoWeek.week).padStart(2, '0');
    const generatedWorkbooks = item.checks
      .map((c) => `THDCIL_Week_${weekStr}_${item.isoWeek.year}_${c.plant.replace(/ /g, '_')}_LU_DSM.xlsx`)
      .join('; ');

    return [
      formatTimestamp(item.timestamp),
      item.fileName,
      formatBytes(item.fileSize),
      item.status === 'generated' ? 'Generated (3 Files)' : 'Verified',
      item.isoWeek.week,
      item.isoWeek.year,
      item.dateRange[0],
      item.dateRange[1],
      item.dates.join('; '),
      fmtCheck(tehri),
      fmtCheck(koteshwar),
      fmtCheck(psp),
      generatedWorkbooks,
    ].map(csvEscape).join(',');
  });

  const csvContent = '\uFEFF' + [headers.map(csvEscape).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const now = new Date();
  const dateStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  link.download = `THDCIL_NRPC_Activity_History_${dateStamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
