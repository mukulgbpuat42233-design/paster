import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OverviewStrip } from './components/OverviewStrip';
import { UploadCard } from './components/UploadCard';
import { VerificationCard } from './components/VerificationCard';
import { PlantOutputsCard } from './components/PlantOutputsCard';
import { RecentFilesCard } from './components/RecentFilesCard';
import { TemplateMappingCard } from './components/TemplateMappingCard';
import { VerificationResult, RecentRunRecord } from './types';
import { PLANTS } from './constants';
import { verifyWorkbook, makePlantWorkbook } from './utils/excel';
import {
  loadHistory,
  saveHistoryItem,
  updateHistoryItemStatus,
  clearHistory,
} from './utils/history';

export function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verified, setVerified] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [history, setHistory] = useState<RecentRunRecord[]>([]);
  const [status, setStatus] = useState<{
    type: 'idle' | 'verifying' | 'success' | 'error';
    message: string;
  }>({
    type: 'idle',
    message: '',
  });

  // Load history from localStorage on initial mount
  useEffect(() => {
    const stored = loadHistory();
    setHistory(stored);
  }, []);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setVerified(null);
    setActiveRecordId(null);
    setProgressPercent(0);
    setStatus({
      type: 'idle',
      message: '',
    });
  };

  const handleVerify = async () => {
    if (!selectedFile) {
      setStatus({
        type: 'error',
        message: 'Please upload the NRPC raw Excel first.',
      });
      return;
    }

    setIsVerifying(true);
    setProgressPercent(20);
    setStatus({
      type: 'verifying',
      message: 'Reading workbook sheets and checking 7-day data across plants...',
    });

    try {
      const result = await verifyWorkbook(selectedFile);
      setVerified(result);
      setProgressPercent(100);

      // Create new history record
      const recordId = `run-${Date.now()}`;
      setActiveRecordId(recordId);

      const newRecord: RecentRunRecord = {
        id: recordId,
        timestamp: Date.now(),
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        dateRange: [result.dates[0], result.dates[6]],
        isoWeek: result.isoWeek,
        status: 'verified',
        checks: result.checks,
        dates: result.dates,
        dataSnapshot: result.data,
      };

      const updatedHistory = saveHistoryItem(newRecord);
      setHistory(updatedHistory);

      setStatus({
        type: 'success',
        message: 'Complete 7-day data found for all 3 plants — every dataset will be normalized to 7 rows × 98 cells (Project + Date + 96 blocks). Ready to generate 3 separate Excel files!',
      });
    } catch (err: any) {
      setVerified(null);
      setActiveRecordId(null);
      setProgressPercent(0);
      setStatus({
        type: 'error',
        message: err?.message || 'Verification failed. Please check the raw Excel file structure.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const generateFilesFromData = async (
    data: Record<string, string[][]>,
    dates: string[],
    isoWeek: { year: number; week: number },
    onProgress?: (pct: number) => void
  ) => {
    for (let i = 0; i < PLANTS.length; i++) {
      const plant = PLANTS[i];
      const blob = await makePlantWorkbook(plant, data, dates);

      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.href = url;
      const weekNum = String(isoWeek.week).padStart(2, '0');
      const plantFileName = plant.replace(/ /g, '_');
      a.download = `THDCIL_Week_${weekNum}_${isoWeek.year}_${plantFileName}_LU_DSM.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 6000);

      const pct = Math.round(((i + 1) / PLANTS.length) * 100);
      if (onProgress) onProgress(pct);
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  };

  const handleGenerate = async () => {
    if (!verified) return;

    setIsGenerating(true);
    setProgressPercent(10);

    try {
      await generateFilesFromData(
        verified.data,
        verified.dates,
        verified.isoWeek,
        (pct) => setProgressPercent(pct)
      );

      // Update history record status to 'generated'
      if (activeRecordId) {
        const updated = updateHistoryItemStatus(activeRecordId, 'generated');
        setHistory(updated);
      }

      setStatus({
        type: 'success',
        message: 'DONE — 3 plantwise Excel files generated — uniform 7-row × 98-column dataset structure, grouped by Week Number.',
      });
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err?.message || 'Generation failed.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadFromHistory = (item: RecentRunRecord) => {
    if (!item.dataSnapshot) {
      setStatus({
        type: 'error',
        message: 'Data snapshot for this session is no longer in browser cache. Please re-upload the original file.',
      });
      return;
    }

    setVerified({
      data: item.dataSnapshot,
      dates: item.dates,
      checks: item.checks,
      isoWeek: item.isoWeek,
    });
    setActiveRecordId(item.id);
    setProgressPercent(100);

    setStatus({
      type: 'success',
      message: `RESTORED FROM HISTORY — Loaded verified dataset for Week ${item.isoWeek.week} (${item.dateRange[0]} to ${item.dateRange[1]}). Ready to generate/download 3 plant files.`,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRedownloadFromHistory = async (item: RecentRunRecord) => {
    if (!item.dataSnapshot) {
      setStatus({
        type: 'error',
        message: 'Data snapshot for this session is no longer in browser cache. Please re-upload the original file.',
      });
      return;
    }

    setIsGenerating(true);
    setProgressPercent(15);
    try {
      await generateFilesFromData(
        item.dataSnapshot,
        item.dates,
        item.isoWeek,
        (pct) => setProgressPercent(pct)
      );

      const updated = updateHistoryItemStatus(item.id, 'generated');
      setHistory(updated);

      setStatus({
        type: 'success',
        message: `DONE — 3 plantwise Excel files re-downloaded for Week ${item.isoWeek.week} (${item.fileName}).`,
      });
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err?.message || 'Re-download generation failed.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handlePlantDownloadSuccess = () => {
    if (activeRecordId) {
      const updated = updateHistoryItemStatus(activeRecordId, 'generated');
      setHistory(updated);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf3f8] text-[#17324d] font-sans antialiased flex flex-col justify-between">
      <div>
        <Header />

        <main className="max-w-[1280px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Top KPI Metrics Banner */}
          <OverviewStrip />

          {/* Primary Upload & Action Card */}
          <UploadCard
            onFileSelect={handleFileSelect}
            onVerify={handleVerify}
            onGenerate={handleGenerate}
            selectedFile={selectedFile}
            isVerifying={isVerifying}
            isGenerating={isGenerating}
            canGenerate={!!verified}
            progressPercent={progressPercent}
          />

          {/* Verification Results Card */}
          <VerificationCard status={status} verified={verified} />

          {/* 3 Plants 3 Excels Output Section with Explicit 8 Parameters and Download Buttons */}
          <PlantOutputsCard
            verified={verified}
            onGenerateSuccess={handlePlantDownloadSuccess}
          />

          {/* Collapsible Recent Files & Activity History */}
          <RecentFilesCard
            history={history}
            onLoadItem={handleLoadFromHistory}
            onRedownloadFiles={handleRedownloadFromHistory}
            onClearHistory={handleClearHistory}
            isGenerating={isGenerating}
          />

          {/* Master Template Architecture & Mapping Card */}
          <TemplateMappingCard />
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/70 backdrop-blur-xs py-5 px-4 text-center text-xs text-slate-500">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>THDC India Limited (THDCIL) — Northern Regional Power Committee (NRPC) Deviation Settlement System</span>
          <span className="font-mono text-[11px] text-slate-400">Tehri HEP • Koteshwar HEP • Tehri PSP (2400 MW)</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
