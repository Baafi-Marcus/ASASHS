import React from 'react';

interface SchoolHeritageCrestProps {
  onLoginClick: () => void;
  onAdmissionsClick?: () => void;
}

export const SchoolHeritageCrest: React.FC<SchoolHeritageCrestProps> = ({
  onLoginClick,
  onAdmissionsClick = () => window.open('https://www.myshsadmission.net/site/schools/ASASHS/', '_blank'),
}) => {
  return (
    <section className="relative bg-gradient-to-b from-gray-950 via-[#062414] to-gray-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-y border-emerald-900/40" id="heraldry">
      {/* Subtle Background Glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-72 h-72 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 py-1 px-3 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[11px] uppercase tracking-widest font-semibold text-emerald-400 mb-4 shadow-sm backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span>Institutional Heraldry & Values</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            The Seal of <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500">
              Akim Asafo Senior High School
            </span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Embodying over three decades of holistic education, spiritual foundation, and unwavering discipline. Explore the symbolic pillars that guide every scholar at ASASHS.
          </p>
        </div>

        {/* Heraldic Crest Showcase Centerpiece */}
        <div className="relative mb-14 sm:mb-20 max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-emerald-950/70 via-black/60 to-emerald-950/80 rounded-2xl border border-emerald-500/30 p-6 sm:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden">
            {/* Ambient Corner Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-tr-full pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-10 text-center md:text-left">
              {/* Crest Badge */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-2xl bg-gradient-to-br from-yellow-400/20 via-emerald-900/50 to-black p-3 border-2 border-yellow-400/40 shadow-xl flex items-center justify-center relative group">
                  <div className="absolute inset-0 rounded-2xl bg-yellow-400/10 blur-md group-hover:bg-yellow-400/20 transition-all duration-300" />
                  <img
                    src="/asashs-logo.png"
                    alt="Akim Asafo Senior High School Crest"
                    className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md whitespace-nowrap border border-yellow-500">
                  Est. 1991
                </div>
              </div>

              {/* Heraldic Description */}
              <div className="flex-grow space-y-3">
                <div className="inline-flex items-center space-x-2 text-[11px] uppercase font-bold tracking-wider text-yellow-400">
                  <span>School Crest & Motto</span>
                  <span>•</span>
                  <span>GES School Code: 0021306</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  "Knowledge, Godliness & Service"
                </h3>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                  The heraldic shield unites the sacred symbols of our mission: the <strong className="text-yellow-300">Open Book</strong> representing broad academic intellect, the <strong className="text-yellow-300">Torch</strong> symbolizing character and Godliness, and the <strong className="text-yellow-300">Golden Laurel</strong> signifying triumphs in municipal athletics, debate, and science competitions.
                </p>

                <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-sm text-[11px] text-emerald-300 font-medium">
                    East Akim Municipality
                  </span>
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-sm text-[11px] text-yellow-300 font-medium">
                    Day & Boarding
                  </span>
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-sm text-[11px] text-gray-300 font-medium">
                    Eastern Region, Ghana
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The 3 Core Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {/* Pillar 1: Scholarship */}
          <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-emerald-500/50 rounded-xl p-6 sm:p-7 transition-all duration-200 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-inner">
                  {/* Book SVG */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-sm border border-emerald-800/60">
                  Pillar 01
                </span>
              </div>

              <h4 className="text-lg font-bold text-white mb-2 tracking-tight">The Book of Scholarship</h4>
              <p className="text-xs text-gray-300 leading-relaxed mb-6">
                Rigorous instructional delivery across 6 accredited tracks: General Science, General Arts, Business, Visual Arts, Home Economics, and General Agriculture.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-emerald-400">
              <span>GES Standardized</span>
              <span className="tabular-nums">6 Tracks</span>
            </div>
          </div>

          {/* Pillar 2: Character */}
          <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-yellow-500/50 rounded-xl p-6 sm:p-7 transition-all duration-200 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-lg bg-yellow-950/80 border border-yellow-500/40 text-yellow-400 flex items-center justify-center shadow-inner">
                  {/* Torch / Flame SVG */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-yellow-400 bg-yellow-950/60 px-2.5 py-1 rounded-sm border border-yellow-800/60">
                  Pillar 02
                </span>
              </div>

              <h4 className="text-lg font-bold text-white mb-2 tracking-tight">The Torch of Integrity</h4>
              <p className="text-xs text-gray-300 leading-relaxed mb-6">
                Nurturing Godliness, personal discipline, and lifelong moral uprightness. Equipping each student with character that endures long past graduation.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-yellow-400">
              <span>Moral Rectitude</span>
              <span>Civic Leadership</span>
            </div>
          </div>

          {/* Pillar 3: Victory */}
          <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-amber-500/50 rounded-xl p-6 sm:p-7 transition-all duration-200 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
                  {/* Laurel / Trophy SVG */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-sm border border-amber-800/60">
                  Pillar 03
                </span>
              </div>

              <h4 className="text-lg font-bold text-white mb-2 tracking-tight">The Laurel of Victory</h4>
              <p className="text-xs text-gray-300 leading-relaxed mb-6">
                Championship distinction across athletics and academics: Super Zonals 2025 Handball Champions, NSMQ Regional Qualifiers, and Best Performing SHS Award.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-amber-400">
              <span>Best Performing SHS</span>
              <span className="tabular-nums">2025</span>
            </div>
          </div>
        </div>

        {/* Institutional Telemetry Strip */}
        <div className="mb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 sm:p-5 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums mb-1">1991</p>
              <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">Year Established</p>
            </div>
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 sm:p-5 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-yellow-400 mb-1">#1 Best</p>
              <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">Municipal Ranking</p>
            </div>
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 sm:p-5 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-white mb-1">6 Tracks</p>
              <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">Academic Departments</p>
            </div>
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 sm:p-5 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums mb-1">0021306</p>
              <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">GES Code</p>
            </div>
          </div>
        </div>

        {/* Direct Action Gateway */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md sm:max-w-none mx-auto">
            <button
              onClick={onAdmissionsClick}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-yellow-950 rounded-sm font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md min-h-[48px] flex items-center justify-center"
            >
              Apply via Online Admission Portal
            </button>
            <button
              onClick={onLoginClick}
              className="w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-sm font-bold text-xs uppercase tracking-wider transition-all duration-200 border border-white/20 min-h-[48px] flex items-center justify-center"
            >
              Student & Staff Portal Login
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
