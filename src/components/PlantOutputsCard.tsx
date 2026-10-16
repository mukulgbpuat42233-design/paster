import React, { useState } from 'react';
import { FileSpreadsheet, Download, CheckCircle2, Archive, Calculator, FileCheck2, ArrowDownToLine, RefreshCw } from 'lucide-react';
import { PLANTS, TEMPLATE_MAPPING } from '../constants';
import { VerificationResult } from '../types';
import { makePlantWorkbook, makeAllPlantsZip } from '../utils/excel';

interface PlantOutputsCardProps {
  verified: VerificationResult | null;
  onGenerateSuccess?: () => void;
}

export const PlantOutputsCard: React.FC<PlantOutputsCardProps> = ({ verified, onGenerateSuccess }) => {
  const [downloadingPlant, setDownloadingPlant] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);
  const [downloadingAll, setDownloadingAll] = useState<boolean>(false);

  if (!verified) return null;

  const weekNum = String(verified.isoWeek.week).padStart(2, '0');
  const year = verified.isoWeek.year;

  const downloadPlantExcel = async (plant: string) => {
    setDownloadingPlant(plant);
    try {
      const blob = await makePlantWorkbook(plant, verified.data, verified.dates);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const plantFileName = plant.replace(/ /g, '_');
      a.download = `THDCIL_Week_${weekNum}_${year}_${plantFileName}_LU_DSM.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      if (onGenerateSuccess) onGenerateSuccess();
    } catch (err: any) {
      alert(`Download failed for ${plant}: ` + (err?.message || 'Unknown error'));
    } finally {
      setDownloadingPlant(null);
    }
  };

  const downloadAllIndividually = async () => {
    setDownloadingAll(true);
    try {
      for (let i = 0; i < PLANTS.length; i++) {
        const plant = PLANTS[i];
        const blob = await makePlantWorkbook(plant, verified.data, verified.dates);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const plantFileName = plant.replace(/ /g, '_');
        a.download = `THDCIL_Week_${weekNum}_${year}_${plantFileName}_LU_DSM.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        await new Promise((res) => setTimeout(res, 250));
      }
      if (onGenerateSuccess) onGenerateSuccess();
    } catch (err: any) {
      alert('Download all failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setDownloadingAll(false);
    }
  };

  const downloadAsZip = async () => {
    setDownloadingZip(true);
    try {
      const zipBlob = await makeAllPlantsZip(verified.data, verified.dates, verified.isoWeek);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `THDCIL_Week_${weekNum}_${year}_All_3_Plants_DSM.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      if (onGenerateSuccess) onGenerateSuccess();
    } catch (err: any) {
      alert('Zip download failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_24px_-4px_rgba(20,50,80,0.08)] p-6 mb-6 border-2 border-emerald-500/30">
      {/* Header with Global Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Verified &amp; Ready for Generation
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 m-0 mt-0.5">
            3 Plants • 3 Separate Uniform Workbooks
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Har plant k liye alag Excel file generate hogi. Har Excel file me 8 ke 8 parameters normalized 7 rows × 98 columns format me included hain.
          </p>
        </div>

        {/* Global Download Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={downloadAsZip}
            disabled={downloadingZip || downloadingAll || downloadingPlant !== null}
            className="inline-flex items-center gap-2 bg-[#073b66] hover:bg-[#052846] disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
            title="Download all 3 plant Excel files combined in a single ZIP package"
          >
            {downloadingZip ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Archive className="w-3.5 h-3.5 text-sky-300" />
            )}
            <span>Download All 3 in ZIP (.zip)</span>
          </button>

          <button
            type="button"
            onClick={downloadAllIndividually}
            disabled={downloadingAll || downloadingZip || downloadingPlant !== null}
            className="inline-flex items-center gap-2 bg-[#16834b] hover:bg-[#11673a] disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
            title="Download all 3 plant Excel files individually"
          >
            {downloadingAll ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ArrowDownToLine className="w-3.5 h-3.5" />
            )}
            <span>Download All 3 Excels (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 3 Plant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
        {PLANTS.map((plant, idx) => {
          const plantCheck = verified.checks.find((c) => c.plant === plant);
          const isCurrentDownloading = downloadingPlant === plant;
          const fileName = `THDCIL_Week_${weekNum}_${year}_${plant.replace(/ /g, '_')}_LU_DSM.xlsx`;
          const capacity = plant.includes('PSP')
            ? '1,000 MW Pumped Storage'
            : plant.includes('KOTESHWAR')
            ? '400 MW Hydro Electric'
            : '1,000 MW Hydro Electric';

          return (
            <div
              key={plant}
              className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/90 flex flex-col justify-between hover:border-emerald-300 hover:shadow-xs transition-all"
            >
              <div>
                {/* Station Tag & Plant Name */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#073b66] text-white">
                    Plant 0{idx + 1}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {capacity}
                  </span>
                </div>

                <div className="font-bold text-sm text-slate-900 mb-1">
                  {plant}
                </div>

                <div className="text-[11px] font-mono text-slate-500 truncate mb-3" title={fileName}>
                  {fileName}
                </div>

                {/* 8 Parameters Checklist */}
                <div className="bg-white rounded-lg p-2.5 border border-slate-200/70 mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2 pb-1 border-b border-slate-100 flex items-center justify-between">
                    <span>8 Parameters in this Excel</span>
                    <span className="text-emerald-700 font-mono">7 Days × 96 Blocks</span>
                  </div>

                  <ul className="space-y-1.5 text-[11px]">
                    {TEMPLATE_MAPPING.map((m, mIdx) => {
                      const isFormula = m.source.toLowerCase().includes('formula');
                      return (
                        <li key={mIdx} className="flex items-center justify-between text-slate-700">
                          <span className="truncate pr-1 flex items-center gap-1.5" title={m.section}>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{m.section}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {isFormula ? 'formula' : 'data'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Individual Download Button */}
              <button
                type="button"
                onClick={() => downloadPlantExcel(plant)}
                disabled={isCurrentDownloading || downloadingAll || downloadingZip}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-[#073b66] hover:text-[#16834b] border border-slate-300 hover:border-emerald-300 font-bold py-2 px-3 rounded-lg text-xs transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {isCurrentDownloading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Excel...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download {plant} (.xlsx)</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Summary Note */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <FileCheck2 className="w-4 h-4 text-emerald-600" />
          <span><b>3 Excels Ready:</b> Each file is independently complete with formulas intact and uniform 98 columns.</span>
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          ISO Week {weekNum} ({year}) • 15-Minute DSM Resolution
        </span>
      </div>
    </div>
  );
};
