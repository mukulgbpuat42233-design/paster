import React from 'react';
import { Table, CheckCircle2, Calculator } from 'lucide-react';
import { TEMPLATE_MAPPING } from '../constants';

export const TemplateMappingCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_24px_-4px_rgba(20,50,80,0.08)] p-6 mb-6 border border-slate-200/80">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-bold text-slate-800 m-0 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0b6fa4] flex items-center justify-center shrink-0">
            <Table className="w-4 h-4" />
          </div>
          <span>Template Architecture &amp; Parameter Row Mapping</span>
        </h3>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Exact row/col alignment preserved
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 text-left">
              <th className="p-3 font-bold border-b border-slate-200">Template Section</th>
              <th className="p-3 font-semibold border-b border-slate-200">Raw NRPC Source Sheet</th>
              <th className="p-3 font-semibold border-b border-slate-200 text-center">Template Rows</th>
              <th className="p-3 font-semibold border-b border-slate-200 text-center">Processing Mode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {TEMPLATE_MAPPING.map((item, idx) => {
              const isFormula = item.source.toLowerCase().includes('formula');
              return (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                    <span>{item.section}</span>
                  </td>
                  <td className="p-3 text-slate-600 font-mono text-[11px]">
                    {item.source}
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-slate-700">
                    {item.rows}
                  </td>
                  <td className="p-3 text-center">
                    {isFormula ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <Calculator className="w-3 h-3 text-amber-600" />
                        Dynamic Formula
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                        <CheckCircle2 className="w-3 h-3 text-sky-600" />
                        Direct Injection
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/60 text-xs text-slate-600 leading-relaxed">
        <p className="m-0">
          <b>Master Template Guarantee:</b> The attached workbook acts as the output master. The generator does not generate arbitrary table markups; it modifies existing OpenXML cell values directly in memory. Column widths, custom fonts, borders, header merges, and formula calculation chains remain 100% intact.
        </p>
      </div>
    </div>
  );
};
