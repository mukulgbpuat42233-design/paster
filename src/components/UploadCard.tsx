import React, { useRef } from 'react';
import { PLANTS } from '../constants';

interface UploadCardProps {
  onFileSelect: (file: File | null) => void;
  onVerify: () => void;
  onGenerate: () => void;
  selectedFile: File | null;
  isVerifying: boolean;
  isGenerating: boolean;
  canGenerate: boolean;
  progressPercent: number;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  onFileSelect,
  onVerify,
  onGenerate,
  selectedFile,
  isVerifying,
  isGenerating,
  canGenerate,
  progressPercent,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_5px_22px_rgba(20,50,80,0.10)] p-5 mb-5 border border-slate-100">
      {/* Uniform Data Rule Subcard */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 mb-5 text-xs text-[#17324d] leading-relaxed">
        <b>UNIFORM DATA RULE:</b> Every parameter table will contain exactly <b>7 data rows</b>: Project Name → Date → <b>96 block values</b>. All parameter tables are normalized to the same <b>98-column</b> structure. Files download with the <b>ISO Week Number</b>.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-5">
        <div>
          <label className="font-bold text-xs text-[#17324d] block mb-2">
            1. Upload Weekly NRPC Raw Excel
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="w-full p-3 border border-dashed border-[#7d9ab2] rounded-lg bg-[#f8fbfd] text-xs text-[#17324d] cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#0b6fa4] file:text-white hover:border-[#0b6fa4] transition-colors"
          />
          <div className="text-xs text-[#5b6d7c] leading-relaxed mt-2">
            Raw workbook is processed locally in your browser. No data is uploaded to a server.
          </div>
          {selectedFile && (
            <div className="mt-2 text-xs text-[#11733f] font-semibold flex items-center gap-1.5">
              <span>✓ Selected:</span> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        <div>
          <label className="font-bold text-xs text-[#17324d] block mb-2">
            Fixed plants
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PLANTS.map((plant) => (
              <span
                key={plant}
                className="inline-block px-2.5 py-1 rounded-full bg-[#e8f2f8] text-[#073b66] text-[11px] font-semibold border border-[#d2e4f0]"
              >
                {plant}
              </span>
            ))}
          </div>
          <div className="text-xs text-[#5b6d7c] leading-relaxed mt-2.5">
            One upload → three separate Excel files, one for each plant.
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <button
          type="button"
          onClick={onVerify}
          disabled={!selectedFile || isVerifying || isGenerating}
          className="bg-[#0b6fa4] hover:bg-[#074f77] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg text-xs cursor-pointer transition-colors shadow-sm"
        >
          {isVerifying ? 'Verifying...' : 'Verify Raw Data'}
        </button>

        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating || isVerifying}
          className="bg-[#16834b] hover:bg-[#11673a] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg text-xs cursor-pointer transition-colors shadow-sm"
        >
          {isGenerating ? 'Generating 3 Excel Files...' : 'Generate 3 Uniform Weekwise Excel Files'}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-[#dfe8ef] rounded-full overflow-hidden mt-3.5">
        <div
          className="h-full bg-[#0b6fa4] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
