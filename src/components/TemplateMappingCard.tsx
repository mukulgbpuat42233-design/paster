import React from 'react';
import { TEMPLATE_MAPPING } from '../constants';

export const TemplateMappingCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-[0_5px_22px_rgba(20,50,80,0.10)] p-5 mb-5 border border-slate-100">
      <h3 className="text-base font-bold text-[#17324d] mt-0 mb-3">Template mapping</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[#edf4f8] text-[#17324d]">
              <th className="border-b border-[#e6edf2] p-2 text-left font-semibold">Template section</th>
              <th className="border-b border-[#e6edf2] p-2 text-left font-semibold">Raw NRPC source</th>
              <th className="border-b border-[#e6edf2] p-2 text-left font-semibold">Template rows</th>
            </tr>
          </thead>
          <tbody>
            {TEMPLATE_MAPPING.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="border-b border-[#e6edf2] p-2 text-[#17324d] font-medium">{item.section}</td>
                <td className="border-b border-[#e6edf2] p-2 text-[#475569]">{item.source}</td>
                <td className="border-b border-[#e6edf2] p-2 text-[#475569]">{item.rows}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[#5b6d7c] leading-relaxed mt-3">
        The attached workbook is used as the output master. The HTML/React does not recreate the worksheet layout; it edits the existing template cells only, so row/column spacing, styles, merged cells and formulas remain intact.
      </p>
    </div>
  );
};
