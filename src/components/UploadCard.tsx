import React, { useRef, useState } from 'react';
import { UploadCloud, FileCheck, Download, AlertCircle, RefreshCw, Layers } from 'lucide-react';
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
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file && file.name.endsWith('.xlsx')) {
      onFileSelect(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_24px_-4px_rgba(20,50,80,0.08)] p-6 mb-6 border border-slate-200/80">
      {/* Uniform Data Rule Callout */}
      <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-blue-50/60 border border-sky-100 rounded-xl p-4 mb-6 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#0b6fa4] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <Layers className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-700 leading-relaxed flex-1">
          <span className="font-bold text-[#073b66] uppercase tracking-wider block mb-0.5 text-[11px]">
            Uniform Parameter Data Rule
          </span>
          Every parameter dataset is strictly normalized to <b>7 data rows</b> (one per calendar day): <code className="bg-white px-1.5 py-0.5 rounded text-[#073b66] font-mono border border-sky-200/60">Project Name</code> → <code className="bg-white px-1.5 py-0.5 rounded text-[#073b66] font-mono border border-sky-200/60">Date</code> → <b>96 block values (D1–D96)</b> across 98 columns. Output workbooks automatically calculate formulas and download with standard <b>ISO Week Numbering</b>.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6">
        {/* Upload Dropzone */}
        <div>
          <label className="font-bold text-xs uppercase tracking-wider text-slate-700 block mb-2">
            1. Select or Drop Weekly NRPC Raw Workbook (.xlsx)
          </label>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-[#0b6fa4] bg-sky-50/80 scale-[0.99]'
                : selectedFile
                ? 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-400'
                : 'border-slate-300 bg-[#f9fbfd] hover:border-[#0b6fa4] hover:bg-sky-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center gap-2">
              {selectedFile ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 break-all">
                      {selectedFile.name}
                    </div>
                    <div className="text-[11px] text-slate-500 tabular-nums mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop to replace file
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-sky-100/70 text-[#0b6fa4] flex items-center justify-center shadow-xs">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#0b6fa4] hover:underline">
                      Click to browse
                    </span>{' '}
                    <span className="text-xs text-slate-500">or drag and drop your raw NRPC Excel file here</span>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Supports standard NRPC raw weekly sheets (GS_Stations, SRAS, Act_Inj, Frequency, etc.)
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Files are processed locally in your web browser. No data leaves your machine or is sent to any server.</span>
          </div>
        </div>

        {/* Fixed Plants Station Cards */}
        <div className="flex flex-col justify-between">
          <div>
            <label className="font-bold text-xs uppercase tracking-wider text-slate-700 block mb-2">
              Fixed Generation Stations
            </label>
            <div className="space-y-2">
              {PLANTS.map((plant, index) => (
                <div
                  key={plant}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 hover:border-sky-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-[#073b66] text-white text-[10px] font-bold flex items-center justify-center">
                      0{index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{plant}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {plant.includes('PSP') ? '1,000 MW PSP' : plant.includes('KOTESHWAR') ? '400 MW Hydro' : '1,000 MW Hydro'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-3">
            A single upload automatically normalizes and produces <b>three discrete workbooks</b>, one for each hydro generating station.
          </p>
        </div>
      </div>

      {/* Action Buttons & Progress */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onVerify}
            disabled={!selectedFile || isVerifying || isGenerating}
            className="flex items-center justify-center gap-2 bg-[#0b6fa4] hover:bg-[#08557f] active:bg-[#064264] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all shadow-sm hover:shadow cursor-pointer"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying Raw Data...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-3.5 h-3.5" />
                <span>Verify Raw Data</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating || isVerifying}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#147a45] to-[#16834b] hover:from-[#0f6437] hover:to-[#12723f] active:from-[#0b4d2a] active:to-[#0f6437] disabled:opacity-35 disabled:cursor-not-allowed text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all shadow-sm hover:shadow cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating 3 Workbooks...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Generate 3 Uniform Weekwise Excel Files</span>
              </>
            )}
          </button>
        </div>

        {progressPercent > 0 && (
          <div className="text-right text-xs font-mono font-semibold text-slate-600">
            {progressPercent}% Complete
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {progressPercent > 0 && (
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3 shadow-inner">
          <div
            className={`h-full transition-all duration-300 ease-out ${
              progressPercent === 100 ? 'bg-emerald-500' : 'bg-[#0b6fa4]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
};
