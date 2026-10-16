import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-[#073b66] to-[#0b6fa4] text-white px-6 py-4 flex items-center gap-4 shadow-md">
      <div className="w-[52px] h-[52px] rounded-full border-2 border-white flex items-center justify-center font-extrabold text-xs tracking-wider shrink-0 bg-white/10 shadow-inner">
        THDC
      </div>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight m-0">
          THDCIL NRPC DSM – Plantwise Generator
        </h1>
        <div className="text-xs sm:text-sm text-white/90 mt-1">
          EXACT attached template • same spacing • same rows/columns • same formulas &amp; formatting
        </div>
      </div>
    </header>
  );
};
