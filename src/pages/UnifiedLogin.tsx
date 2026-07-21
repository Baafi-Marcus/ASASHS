import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PortalButton } from '../components/PortalButton';

interface UnifiedLoginProps {
  onLogin: (userId: string, password: string) => Promise<void>;
  onHomeRedirect?: () => void;
  onTesterSignup?: () => void;
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

export const UnifiedLogin: React.FC<UnifiedLoginProps> = ({ onLogin, onHomeRedirect }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Rotate gallery slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAMPUS_GALLERY.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning, Scholar';
    if (hour < 17) return 'Good Afternoon, Scholar';
    return 'Good Evening, Scholar';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId.trim() || !password.trim()) {
      toast.error('Please enter both your ID and password');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(userId.trim(), password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col font-sans select-none bg-school-green-950">
      {/* Dynamic Rotating Ken Burns Ken Burns Campus Gallery Slideshow */}
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
              className={`w-full h-full object-cover object-center transform transition-transform duration-[6500ms] ease-out ${
                index === currentSlide ? 'scale-110' : 'scale-100'
              }`}
            />
          </div>
        ))}
        {/* Deep Dual-Layer Emerald & Dark Glass Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-school-green-950/85 via-black/70 to-school-green-900/85 backdrop-blur-[3px] z-20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-school-green-500/10 via-transparent to-transparent z-20"></div>
      </div>

      {/* Header/Logo Bar */}
      <header className="relative z-30 p-6 md:p-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={onHomeRedirect}>
            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl shadow-xl ring-1 ring-white/30 group-hover:bg-white/20 transition-all duration-300">
              <img src="/asashs-logo.png" alt="ASASHS Logo" className="w-11 h-11 rounded-xl object-contain shadow-sm" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">ASASHS</h1>
              <p className="text-[11px] text-amber-400 uppercase tracking-[0.25em] font-extrabold italic">Digital Campus</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold text-gray-200 tracking-wider uppercase">Live Exam Portal</span>
          </div>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="relative z-30 flex-grow flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700 ease-out">
          <div className="bg-white/90 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.6)] border border-white p-8 sm:p-10 relative overflow-hidden transition-all duration-500">
            {/* Top Bar Decoration */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-school-green-600 via-amber-500 to-emerald-600 animate-pulse"></div>

            <div className="text-center mb-8">
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-gradient-to-r from-school-green-100 to-amber-100 text-school-green-900 border border-school-green-300/60 mb-3 shadow-sm animate-bounce duration-1000">
                🏛️ {getGreeting()}
              </span>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2 uppercase bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-school-green-950 to-gray-800">
                Portal Access
              </h2>
              <p className="text-gray-500 font-medium text-xs tracking-wide">Enter your official credentials below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 px-1">User ID / Staff ID</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-school-green-600 group-focus-within:scale-110 transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter your official ID"
                    required
                    className="w-full pl-11 pr-4 py-4 bg-gray-50/90 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-school-green-600 focus:ring-4 focus:ring-school-green-600/10 focus:outline-none transition-all duration-300 font-bold text-gray-900 placeholder-gray-400 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 px-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Secret Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] font-black text-school-green-600 hover:text-school-green-700 uppercase tracking-widest transition-transform active:scale-95"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-school-green-600 group-focus-within:scale-110 transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-4 py-4 bg-gray-50/90 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-school-green-600 focus:ring-4 focus:ring-school-green-600/10 focus:outline-none transition-all duration-300 font-bold text-gray-900 shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-2">
                <PortalButton
                  type="submit"
                  disabled={isLoading}
                  className="w-full justify-center py-5 rounded-2xl bg-gradient-to-r from-school-green-600 via-school-green-700 to-emerald-800 hover:from-school-green-700 hover:to-emerald-900 text-white font-black uppercase tracking-widest shadow-xl shadow-school-green-600/30 ring-2 ring-white/30 transition-all duration-300 hover:-translate-y-1 active:scale-95 relative overflow-hidden group"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Grant Access
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </span>
                  )}
                </PortalButton>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100/80 space-y-2.5">
              <div className="bg-school-green-50/80 rounded-xl p-3 border border-school-green-200/80 text-left flex items-start gap-3">
                <span className="text-lg mt-0.5">📱</span>
                <div>
                  <p className="text-xs font-bold text-school-green-900 leading-snug">
                    Student APK Policy Enforced
                  </p>
                  <p className="text-[11px] text-gray-600 leading-tight mt-0.5">
                    For examination security, Students must access via the official <strong>ASASHS Android APK</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Gallery Carousel Caption & Indicator Bar */}
      <footer className="relative z-30 py-6 px-4 bg-black/40 backdrop-blur-md border-t border-white/10 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-2">
            {CAMPUS_GALLERY.map((slide, idx) => (
              <button
                key={slide.url}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Jump to slide ${idx + 1}`}
                className={`transition-all duration-500 rounded-full ${
                  idx === currentSlide
                    ? 'w-8 h-2.5 bg-amber-400 shadow-md ring-2 ring-white/50'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <div className="text-white/90 text-xs font-bold tracking-wide transition-all duration-500">
            <span className="text-amber-400 font-extrabold uppercase tracking-wider">{CAMPUS_GALLERY[currentSlide].title}</span>
            <span className="mx-2 text-white/40">|</span>
            <span className="text-gray-300 font-medium">{CAMPUS_GALLERY[currentSlide].subtitle}</span>
          </div>

          <p className="text-white/40 text-[9px] uppercase tracking-[0.4em] font-black pt-1">
            &copy; 2025 Akim Asafo Senior High School &bull; Digital Campus &bull; Version 1.0.0
          </p>
        </div>
      </footer>
    </div>
  );
};
