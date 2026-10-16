import React from 'react';
import { Zap, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="relative bg-gradient-to-r from-[#06243f] via-[#093c66] to-[#0a5285] text-white shadow-lg border-b border-white/10">
      {/* Decorative subtle ambient highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-5 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 border border-white/20 backdrop-blur-md flex flex-col items-center justify-center shadow-inner shrink-0 text-center">
              <span className="font-black text-sm tracking-widest text-sky-200">THDC</span>
              <span className="text-[9px] font-bold text-white/70 tracking-tighter uppercase">INDIA</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-300" />
                  Northern Regional Power Committee (NRPC)
                </span>
                <span className="text-white/40">·</span>
                <span className="text-[11px] font-medium text-white/70 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  CERC DSM Compliant
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                THDCIL NRPC DSM — Uniform Plantwise Generator
              </h1>
              <p className="text-xs sm:text-[13px] text-sky-100/80 mt-1 max-w-2xl font-normal leading-relaxed">
                Automated 7-day weekwise Excel processor for Tehri Hydro Complex • Preserves original template formulas, styles &amp; 96-block DSM structure
              </p>
            </div>
          </div>

          {/* Plant indicator chips */}
          <div className="hidden lg:flex flex-col items-end gap-1.5 text-right shrink-0">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-white/60">
              Active Plant Stations (2,400 MW)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs text-[11px] font-medium text-white border border-white/10">
                Tehri HEP (1000 MW)
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs text-[11px] font-medium text-white border border-white/10">
                Koteshwar (400 MW)
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs text-[11px] font-medium text-white border border-white/10">
                Tehri PSP (1000 MW)
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
