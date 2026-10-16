import React from 'react';
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
    <div className="bg-white rounded-xl shadow-[0_5px_22px_rgba(20,50,80,0.10)] p-5 mb-5 border border-slate-100">
      <h3 className="text-base font-bold text-[#17324d] mt-0 mb-3">Verification</h3>
      
      <div className="p-3 rounded-lg bg-[#f4f8fb] text-xs leading-relaxed border border-[#e2edf4]">
        {status.type === 'idle' && (
          <span>
            Upload the NRPC raw Excel and click <b>Verify Raw Data</b>.
          </span>
        )}
        {status.type === 'verifying' && (
          <span className="text-[#0b6fa4] font-semibold flex items-center gap-2">
            <span className="inline-block animate-spin">⟳</span> Verifying raw NRPC Excel data and checking 7-day plant datasets...
          </span>
        )}
        {status.type === 'success' && (
          <span className="text-[#11733f] font-bold">
            ✓ VERIFIED — {status.message}
          </span>
        )}
        {status.type === 'error' && (
          <span className="text-[#b52b2b] font-bold">
            ✕ VERIFICATION FAILED: {status.message}
          </span>
        )}
      </div>

      {verified && (
        <div className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#edf4f8] text-[#17324d]">
                  <th className="border-b border-[#e6edf2] p-2 text-left font-semibold">Plant</th>
                  <th className="border-b border-[#e6edf2] p-2 text-left font-semibold">Schedule</th>
                  <th className="border-b border-[#e6edf2] p-2 text-left font-semibold">SRAS</th>
                  <th className="border-b border-[#e6edf2] p-2 text-left font-semibold">Actual</th>
                  <th className="border-b border-[#e6edf2] p-2 text-left font-semibold">Frequency</th>
                  <th className="border-b border-[#e6edf2] p-2 text-left font-semibold">Reference Rate</th>
                </tr>
              </thead>
              <tbody>
                {verified.checks.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="border-b border-[#e6edf2] p-2 font-bold text-[#17324d]">{c.plant}</td>
                    <td className="border-b border-[#e6edf2] p-2 text-[#11733f] font-medium">{c.GS_Stations}/7</td>
                    <td className="border-b border-[#e6edf2] p-2 text-[#11733f] font-medium">{c.SRAS}/7</td>
                    <td className="border-b border-[#e6edf2] p-2 text-[#11733f] font-medium">{c.Act_Inj_Gen_Stations}/7</td>
                    <td className="border-b border-[#e6edf2] p-2 text-[#11733f] font-medium">{c.Frequency}/7</td>
                    <td className="border-b border-[#e6edf2] p-2 text-[#11733f] font-medium">{c.Reference_Rate}/7</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-[#5b6d7c] leading-relaxed mt-3 pt-2 border-t border-slate-100">
            <b>Selected week:</b> {verified.dates[0]} to {verified.dates[6]} &nbsp;|&nbsp; <b>ISO Week:</b> {verified.isoWeek.week} (Year: {verified.isoWeek.year}) &nbsp;|&nbsp; <b>Uniform layout:</b> every dataset = 7 rows × 98 columns (Project + Date + D1–D96).
          </p>
        </div>
      )}
    </div>
  );
};
