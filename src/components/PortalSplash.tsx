import React, { useState, useEffect } from 'react';
import { PortalButton } from './PortalButton';

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
    title: 'National Science & Maths Quiz',
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
    title: 'Sports & Athletics Champions',
    subtitle: 'Building Character, Teamwork and Discipline'
  }
];

export const PortalSplash: React.FC<PortalSplashProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Twitter/X style launch sequence state
  const [logoState, setLogoState] = useState<'normal' | 'squeeze' | 'zoom' | 'done'>('normal');

  useEffect(() => {
    // Phase 1: Hold centered logo
    const squeezeTimer = setTimeout(() => {
      setLogoState('squeeze');
    }, 450);

    // Phase 2: Twitter/X style massive scale-out explosion
    const zoomTimer = setTimeout(() => {
      setLogoState('zoom');
    }, 650);

    // Phase 3: Reveal complete, remove white overlay
    const doneTimer = setTimeout(() => {
      setLogoState('done');
    }, 1150);

    return () => {
      clearTimeout(squeezeTimer);
      clearTimeout(zoomTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  // Rotate school image slideshow every 4.5 seconds
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAMPUS_GALLERY.length);
    }, 4500);
    return () => clearInterval(slideTimer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between font-sans select-none bg-black overflow-hidden text-white">
      {/* ========================================================= */}
      {/* TWITTER / X STYLE INITIAL LAUNCH ANIMATION (WHITE SCREEN) */}
      {/* ========================================================= */}
      {logoState !== 'done' && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-white pointer-events-none transition-opacity duration-300 ${
            logoState === 'zoom' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div
            className={`transform transition-all duration-500 ease-out flex flex-col items-center ${
              logoState === 'normal'
                ? 'scale-100 opacity-100'
                : logoState === 'squeeze'
                ? 'scale-90 opacity-100 duration-200 ease-in'
                : 'scale-[32] opacity-0 duration-500 ease-[cubic-bezier(0.7,0,0.3,1)]'
            }`}
          >
            <img
              src="/asashs-logo.png"
              alt="ASASHS Crest"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-md"
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN ENTRANCE: REAL SCHOOL IMAGES KEN BURNS SLIDESHOW    */}
      {/* ========================================================= */}
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
              className={`w-full h-full object-cover object-center transform transition-transform duration-[6000ms] ease-out ${
                index === currentSlide ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>
        ))}
        {/* Subtle dark backdrop overlay for extreme legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/80 z-20" />
      </div>

      {/* Top Bar Header */}
      <header className="relative z-30 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-sm border border-white/15 shadow-sm">
          <div className="p-1 bg-school-green-950 border border-school-green-800 rounded-sm">
            <img src="/asashs-logo.png" alt="ASASHS Crest" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold tracking-tight leading-none text-white">AKIM ASAFO SHS</h1>
            <p className="text-[10px] text-yellow-400 uppercase tracking-widest font-semibold mt-0.5 tabular-nums">
              Official Student Portal
            </p>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="min-h-[44px] px-4 py-2 rounded-sm bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-colors text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-sm"
        >
          <span>Skip to Login</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </header>

      {/* Center Hero Banner */}
      <main className="relative z-30 flex-grow flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-sm text-xs font-semibold tracking-wider uppercase bg-school-green-950/80 text-school-green-300 border border-school-green-800 backdrop-blur-md">
          <span>{getGreeting()}, Scholar</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Akim Asafo Senior High School
        </h2>
        
        <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
          Providing holistic quality education, inculcating Godliness, discipline, and moral uprightness for over three decades.
        </p>
      </main>

      {/* Bottom Controls & Action Bar */}
      <footer className="relative z-30 w-full p-6 bg-gradient-to-t from-black via-black/85 to-transparent border-t border-white/10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Gallery Info & Indicators */}
          <div className="flex flex-col items-center sm:items-start space-y-2">
            <div className="flex items-center gap-1.5">
              {CAMPUS_GALLERY.map((slide, idx) => (
                <button
                  key={slide.url}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-sm transition-all duration-300 ${
                    idx === currentSlide
                      ? 'w-6 bg-yellow-400'
                      : 'w-1.5 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
            <div className="text-white text-xs text-center sm:text-left">
              <span className="text-yellow-400 font-semibold uppercase tracking-wider">
                {CAMPUS_GALLERY[currentSlide].title}
              </span>
              <span className="mx-2 text-white/30">•</span>
              <span className="text-gray-300 font-normal">{CAMPUS_GALLERY[currentSlide].subtitle}</span>
            </div>
          </div>

          {/* Enter Portal Action Button */}
          <PortalButton
            onClick={onComplete}
            variant="primary"
            className="w-full sm:w-auto min-h-[44px] px-8 text-xs uppercase tracking-wider font-bold shadow-lg"
          >
            Enter Student Portal
          </PortalButton>
        </div>
      </footer>
    </div>
  );
};
