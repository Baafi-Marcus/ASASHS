import React, { useState, useEffect } from 'react';

interface PortalSplashProps {
  onComplete: () => void;
}

const CAMPUS_GALLERY = [
  {
    url: '/hero_school_building.jpg',
    title: 'ASASHS Administration & Main Campus',
    subtitle: 'Excellence, Integrity & Academic Leadership'
  },
  {
    url: '/students_campus.jpg',
    title: 'Vibrant Campus Life & Community',
    subtitle: 'Empowering the Next Generation of Scholars'
  },
  {
    url: '/nsmq_2025.jpg',
    title: 'National Science & Maths Champions',
    subtitle: 'Leading Innovation and STEM Education'
  },
  {
    url: '/award_ceremony.jpg',
    title: 'Excellence & Academic Awards',
    subtitle: 'Celebrating Outstanding Student Achievement'
  },
  {
    url: '/student_group_1.jpg',
    title: 'Collaborative Learning & Study Groups',
    subtitle: 'Fostering Unity and Peer Support'
  },
  {
    url: '/sports_action.jpg',
    title: 'Sports & Athletics Excellence',
    subtitle: 'Building Character, Teamwork and Discipline'
  }
];

export const PortalSplash: React.FC<PortalSplashProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  // Rotate gallery slide every 3.5 seconds during intro
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAMPUS_GALLERY.length);
    }, 3500);
    return () => clearInterval(slideTimer);
  }, []);

  // Progress bar over 4.5 seconds for automatic transition
  useEffect(() => {
    const duration = 4500;
    const interval = 50;
    const step = (interval / duration) * 100;
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          clearInterval(progressTimer);
          setTimeout(() => onComplete(), 200);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(progressTimer);
  }, [onComplete]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning, Scholar';
    if (hour < 17) return 'Good Afternoon, Scholar';
    return 'Good Evening, Scholar';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between font-sans select-none bg-school-green-950 overflow-hidden animate-in fade-in duration-500">
      {/* Dynamic Ken Burns Ken Burns Campus Gallery Slideshow Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {CAMPUS_GALLERY.map((slide, index) => (
          <div
            key={slide.url}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.url}
              alt={slide.title}
              className={`w-full h-full object-cover object-center transform transition-transform duration-[4000ms] ease-out ${
                index === currentSlide ? 'scale-110' : 'scale-100'
              }`}
            />
          </div>
        ))}
        {/* Rich Dual-Layer Emerald & Dark Glass Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-school-green-950/85 via-black/65 to-school-green-900/85 backdrop-blur-[2px] z-20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-school-green-500/15 via-transparent to-black/40 z-20"></div>
      </div>

      {/* Top Bar Logo */}
      <header className="relative z-30 w-full p-6 md:p-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl ring-1 ring-white/30 shadow-lg">
            <img src="/asashs-logo.png" alt="ASASHS Crest" className="w-10 h-10 rounded-xl object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">ASASHS</h1>
            <p className="text-[10px] text-amber-400 uppercase tracking-[0.25em] font-extrabold italic">Digital Campus</p>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="text-xs font-bold px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all uppercase tracking-wider"
        >
          Skip Intro →
        </button>
      </header>

      {/* Centered Glass Splash Welcome Card */}
      <main className="relative z-30 flex-grow flex items-center justify-center p-6 w-full max-w-md">
        <div className="w-full bg-white/95 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.6)] border border-white/80 p-8 sm:p-10 text-center relative overflow-hidden animate-in zoom-in-95 duration-700">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-school-green-600 via-amber-500 to-emerald-600 animate-pulse"></div>

          <div className="mx-auto w-24 h-24 mb-6 bg-gradient-to-br from-school-green-50 to-amber-50 p-4 rounded-3xl shadow-xl ring-2 ring-school-green-600/20 flex items-center justify-center transform hover:rotate-3 transition-transform">
            <img src="/asashs-logo.png" alt="School Crest" className="w-full h-full object-contain" />
          </div>

          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-school-green-100 text-school-green-900 border border-school-green-300 mb-4 shadow-sm">
            🏛️ {getGreeting()}
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase leading-tight mb-2">
            Akim Asafo SHS
          </h2>
          <p className="text-xs font-extrabold text-school-green-700 uppercase tracking-widest mb-6">
            Digital Examination Portal
          </p>

          <p className="text-xs text-gray-500 font-medium mb-8 leading-relaxed">
            Welcome to the official offline-synchronized tablet portal. Preparing system environment...
          </p>

          {/* Interactive Enter Button & Progress Bar */}
          <div className="space-y-4">
            <button
              onClick={onComplete}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-school-green-600 via-school-green-700 to-emerald-800 hover:from-school-green-700 text-white font-black uppercase tracking-widest shadow-lg shadow-school-green-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>Enter Portal</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>

            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-school-green-600 h-full transition-all duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </main>

      {/* Gallery Carousel Caption Bar */}
      <footer className="relative z-30 w-full py-5 px-4 bg-black/50 backdrop-blur-md border-t border-white/10 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-2">
            {CAMPUS_GALLERY.map((slide, idx) => (
              <button
                key={slide.url}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Show slide ${idx + 1}`}
                className={`transition-all duration-500 rounded-full ${
                  idx === currentSlide
                    ? 'w-7 h-2 bg-amber-400 shadow-md ring-1 ring-white'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <div className="text-white/90 text-xs font-bold tracking-wide transition-all duration-500">
            <span className="text-amber-400 font-extrabold uppercase tracking-wider">{CAMPUS_GALLERY[currentSlide].title}</span>
            <span className="mx-2 text-white/40">|</span>
            <span className="text-gray-300 font-medium">{CAMPUS_GALLERY[currentSlide].subtitle}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
