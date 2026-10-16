import React, { useState } from 'react';
import { History, ChevronDown, ChevronRight, Download, RefreshCw, Trash2, FileSpreadsheet, Calendar, CheckCircle2 } from 'lucide-react';
import { RecentRunRecord } from '../types';
import { formatBytes, formatTimestamp, exportHistoryToCSV } from '../utils/history';

interface RecentFilesCardProps {
  history: RecentRunRecord[];
  onLoadItem: (item: RecentRunRecord) => void;
  onRedownloadFiles?: (item: RecentRunRecord) => void;
  onClearHistory: () => void;
  isGenerating?: boolean;
}

export const RecentFilesCard: React.FC<RecentFilesCardProps> = ({
  history,
  onLoadItem,
  onRedownloadFiles,
  onClearHistory,
  isGenerating,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  const toggleExpand = (id: string) => {
    setExpandedItemId(expandedItemId === id ? null : id);
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    onClearHistory();
    setConfirmClear(false);
  };

  const handleExportCSV = () => {
    exportHistoryToCSV(history);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_24px_-4px_rgba(20,50,80,0.08)] p-6 mb-6 border border-slate-200/80">
      {/* Header with Accordion Toggle & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 text-left text-base font-bold text-slate-800 hover:text-[#0b6fa4] transition-colors cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0b6fa4] flex items-center justify-center shrink-0 group-hover:bg-sky-100 transition-colors">
            <History className="w-4 h-4" />
          </div>
          <span className="font-bold">Recent Files &amp; Activity History</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e8f2f8] text-[#073b66] border border-[#d2e4f0]">
            {history.length} {history.length === 1 ? 'record' : 'records'}
          </span>
          <span className="text-slate-400 group-hover:text-[#0b6fa4] transition-transform">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
        </button>

        {history.length > 0 && isOpen && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
              title="Download activity history as a CSV file"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#0b6fa4]" />
              <span>Export History (CSV)</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                confirmClear
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-semibold'
                  : 'text-slate-500 hover:text-rose-600 hover:bg-slate-50'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmClear ? 'Click again to confirm' : 'Clear History'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          {history.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
              <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <div className="font-semibold text-slate-700">No recent activity records yet</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Verified workbooks and generated Excel batches will automatically appear here.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const isExpanded = expandedItemId === item.id;
                const canRedownload = Boolean(item.dataSnapshot && onRedownloadFiles);

                return (
                  <div
                    key={item.id}
                    className="border border-slate-200/90 rounded-xl p-4 bg-white hover:border-[#9fc1d8] hover:shadow-xs transition-all"
                  >
                    {/* Primary summary row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 truncate max-w-[320px] sm:max-w-[420px]" title={item.fileName}>
                            {item.fileName}
                          </span>
                          <span className="text-[11px] text-slate-400 tabular-nums">
                            ({formatBytes(item.fileSize)})
                          </span>
                          {item.status === 'generated' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              3 Files Generated
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" />
                              Verified
                            </span>
                          )}
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 mt-1.5">
                          <span className="tabular-nums font-medium text-slate-700">
                            {formatTimestamp(item.timestamp)}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="inline-flex items-center gap-1 text-[#073b66] font-semibold">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            ISO Week {item.isoWeek.week} ({item.isoWeek.year})
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="tabular-nums font-mono text-slate-700">
                            {item.dateRange[0]} to {item.dateRange[1]}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          className="text-xs text-slate-600 hover:text-slate-900 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          {isExpanded ? 'Hide details' : 'View details'}
                        </button>

                        <button
                          type="button"
                          onClick={() => onLoadItem(item)}
                          disabled={isGenerating}
                          className="inline-flex items-center gap-1.5 bg-[#0b6fa4] hover:bg-[#08557f] disabled:opacity-50 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
                          title="Restore this verified dataset into active verification window"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Load into Verification</span>
                        </button>

                        {canRedownload && (
                          <button
                            type="button"
                            onClick={() => onRedownloadFiles && onRedownloadFiles(item)}
                            disabled={isGenerating}
                            className="inline-flex items-center gap-1.5 bg-[#16834b] hover:bg-[#11673a] disabled:opacity-50 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
                            title="Generate and download 3 Excel files for this week"
                          >
                            <Download className="w-3 h-3" />
                            <span>Re-download</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable details panel */}
                    {isExpanded && (
                      <div className="mt-3.5 pt-3.5 border-t border-slate-100 bg-slate-50/80 -mx-4 -mb-4 p-4 rounded-b-xl">
                        <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                          <span>7-Day Parameter Breakdown</span>
                          <span className="text-[11px] text-slate-500 font-normal">
                            All parameters verified complete (7 of 7 daily records)
                          </span>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                          <table className="w-full border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 text-slate-700 text-left">
                                <th className="border-b border-slate-200 p-2 font-semibold">Plant</th>
                                <th className="border-b border-slate-200 p-2 font-semibold text-center">Schedule</th>
                                <th className="border-b border-slate-200 p-2 font-semibold text-center">SRAS</th>
                                <th className="border-b border-slate-200 p-2 font-semibold text-center">Actual</th>
                                <th className="border-b border-slate-200 p-2 font-semibold text-center">Frequency</th>
                                <th className="border-b border-slate-200 p-2 font-semibold text-center">Reference Rate</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {item.checks.map((c, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/60">
                                  <td className="p-2 font-bold text-slate-800">{c.plant}</td>
                                  <td className="p-2 text-center text-emerald-700 font-mono font-medium">{c.GS_Stations}/7</td>
                                  <td className="p-2 text-center text-emerald-700 font-mono font-medium">{c.SRAS}/7</td>
                                  <td className="p-2 text-center text-emerald-700 font-mono font-medium">{c.Act_Inj_Gen_Stations}/7</td>
                                  <td className="p-2 text-center text-emerald-700 font-mono font-medium">{c.Frequency}/7</td>
                                  <td className="p-2 text-center text-emerald-700 font-mono font-medium">{c.Reference_Rate}/7</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-2.5 space-y-1">
                          <div><b>All 7 Days:</b> {item.dates.join(', ')}</div>
                          <div><b>Generated Files:</b> {item.checks.map(c => `THDCIL_Week_${String(item.isoWeek.week).padStart(2,'0')}_${item.isoWeek.year}_${c.plant.replace(/ /g,'_')}_LU_DSM.xlsx`).join(' • ')}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
