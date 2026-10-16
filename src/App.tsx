import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadCard } from './components/UploadCard';
import { VerificationCard } from './components/VerificationCard';
import { TemplateMappingCard } from './components/TemplateMappingCard';
import { VerificationResult } from './types';
import { PLANTS } from './constants';
import { verifyWorkbook, makePlantWorkbook } from './utils/excel';

export function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verified, setVerified] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [status, setStatus] = useState<{
    type: 'idle' | 'verifying' | 'success' | 'error';
    message: string;
  }>({
    type: 'idle',
    message: '',
  });

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setVerified(null);
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
    setProgressPercent(15);
    setStatus({
      type: 'verifying',
      message: 'Reading sheets and checking datasets...',
    });

    try {
      const result = await verifyWorkbook(selectedFile);
      setVerified(result);
      setProgressPercent(100);
      setStatus({
        type: 'success',
        message: 'Complete 7-day data found for all 3 plants — every dataset will be normalized to 7 rows × 98 cells (Project + Date + 96 blocks).',
      });
    } catch (err: any) {
      setVerified(null);
      setProgressPercent(0);
      setStatus({
        type: 'error',
        message: err?.message || 'Verification failed. Please check the raw Excel file structure.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGenerate = async () => {
    if (!verified) return;

    setIsGenerating(true);
    setProgressPercent(5);

    try {
      for (let i = 0; i < PLANTS.length; i++) {
        const plant = PLANTS[i];
        const blob = await makePlantWorkbook(plant, verified.data, verified.dates);

        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url;
        const weekNum = String(verified.isoWeek.week).padStart(2, '0');
        const plantFileName = plant.replace(/ /g, '_');
        a.download = `THDCIL_Week_${weekNum}_${verified.isoWeek.year}_${plantFileName}_LU_DSM.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => URL.revokeObjectURL(url), 6000);

        const pct = Math.round(((i + 1) / PLANTS.length) * 100);
        setProgressPercent(pct);
        await new Promise((resolve) => setTimeout(resolve, 250));
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

  return (
    <div className="min-h-screen bg-[#eef3f8] text-[#17324d] font-sans">
      <Header />

      <main className="max-w-[1200px] mx-auto py-6 px-4 sm:px-6">
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

        <VerificationCard status={status} verified={verified} />

        <TemplateMappingCard />
      </main>
    </div>
  );
}

export default App;
