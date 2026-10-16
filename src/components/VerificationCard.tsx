import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, Calendar, FileText, Check } from 'lucide-react';
import { VerificationResult } from '../types';

interface VerificationCardProps {
  status: {
    type: 'idle' | 'verifying' | 'success' | 'error';
    message: string;
  };
  verified: VerificationResult | null;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({ status, verified }) => {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_24px_-4px_rgba(20,50,80,0.08)] p-6 mb-6 border border-slate-200/80">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-bold text-slate-800 m-0 flex items-center gap-2">
          <span>Verification &amp; Integrity Analysis</span>
        </h3>
        {verified && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" /> All 3 Plants Passed
          </span>
        )}
      </div>

      {/* Status banner */}
      <div
        className={`p-4 rounded-xl text-xs leading-relaxed border transition-all ${
          status.type === 'idle'
            ? 'bg-slate-50 border-slate-200 text-slate-600'
            : status.type === 'verifying'
            ? 'bg-sky-50 border-sky-200 text-sky-800'
            : status.type === 'success'
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}
      >
        {status.type === 'idle' && (
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Upload the NRPC raw Excel file above and click <b>Verify Raw Data</b> to scan the sheets and detect complete 7-day windows.
            </span>
          </div>
        )}

        {status.type === 'verifying' && (
          <div className="flex items-center gap-2.5 text-[#0b6fa4] font-semibold">
            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
            <span>Scanning raw workbook sheets and validating 7-day blocks across GS_Stations, SRAS, Act_Inj, Frequency and Reference Rate...</span>
          </div>
        )}

        {status.type === 'success' && (
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-900">✓ VERIFICATION PASSED</div>
              <div className="text-emerald-800 mt-0.5">{status.message}</div>
            </div>
          </div>
        )}

        {status.type === 'error' && (
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-900">✕ VERIFICATION FAILED</div>
              <div className="text-rose-800 mt-0.5">{status.message}</div>
            </div>
          </div>
        )}
      </div>

      {/* Verified Data Report */}
      {verified && (
        <div className="mt-5 pt-5 border-t border-slate-100">
          {/* Metadata pill strip */}
          <div className="bg-slate-50 rounded-xl p-3.5 mb-4 border border-slate-200/80 flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#0b6fa4]" />
              <span className="font-semibold text-slate-600">Selected Week:</span>
              <span className="font-mono font-bold text-slate-900">
                {verified.dates[0]} <span className="text-slate-400 font-sans">to</span> {verified.dates[6]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">ISO Week:</span>
              <span className="px-2 py-0.5 rounded-md bg-[#073b66] text-white font-mono font-bold text-[11px]">
                Week {verified.isoWeek.week} ({verified.isoWeek.year})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Normalization:</span>
              <span className="text-slate-800 font-medium">7 rows × 98 columns (D1–D96)</span>
            </div>
          </div>

          {/* Verification Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 text-left">
                  <th className="p-3 font-bold border-b border-slate-200">Generating Plant</th>
                  <th className="p-3 font-semibold border-b border-slate-200 text-center">Schedule (GS)</th>
                  <th className="p-3 font-semibold border-b border-slate-200 text-center">AGC SRAS</th>
                  <th className="p-3 font-semibold border-b border-slate-200 text-center">Actual Injection</th>
                  <th className="p-3 font-semibold border-b border-slate-200 text-center">Frequency</th>
                  <th className="p-3 font-semibold border-b border-slate-200 text-center">Reference Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {verified.checks.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>{c.plant}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-emerald-50 text-emerald-800 text-[11px] border border-emerald-200">
                        {c.GS_Stations}/7
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-emerald-50 text-emerald-800 text-[11px] border border-emerald-200">
                        {c.SRAS}/7
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-emerald-50 text-emerald-800 text-[11px] border border-emerald-200">
                        {c.Act_Inj_Gen_Stations}/7
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-emerald-50 text-emerald-800 text-[11px] border border-emerald-200">
                        {c.Frequency}/7
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-emerald-50 text-emerald-800 text-[11px] border border-emerald-200">
                        {c.Reference_Rate}/7
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
