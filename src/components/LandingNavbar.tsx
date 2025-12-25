import React, { useState, useEffect } from 'react';

interface LandingNavbarProps {
  onLoginClick: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onLoginClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'About Us', href: '#about' },
    { name: 'Academics', href: '#academics' },
    { name: 'Admissions', href: '#admissions' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white shadow-md py-2'
          : 'bg-transparent py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo Area */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className={`p-1.5 md:p-2 rounded-lg ${isScrolled ? 'bg-school-green-50' : 'bg-white/10 backdrop-blur-sm'}`}>
              <img
                src="/asashs-logo.png"
                alt="ASASHS Logo"
                className="w-8 h-8 md:w-10 md:h-10"
              />
            </div>
            <div className="flex flex-col">
              <h1 className={`text-lg md:text-xl font-bold leading-tight ${isScrolled ? 'text-school-green-800' : 'text-white'}`}>
                ASASHS
              </h1>
              <p className={`text-[10px] md:text-xs tracking-wider hidden sm:block ${isScrolled ? 'text-school-green-600' : 'text-white/90'}`}>
                AKIM ASAFO SENIOR HIGH
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold uppercase tracking-wide transition-colors ${isScrolled
                    ? 'text-gray-600 hover:text-school-green-600'
                    : 'text-white/90 hover:text-white'
                  }`}
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={onLoginClick}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all transform hover:scale-105 ${isScrolled
                  ? 'bg-school-green-600 text-white hover:bg-school-green-700 shadow-md'
                  : 'bg-white text-school-green-700 hover:bg-school-cream-50'
                }`}
            >
              PORTAL LOGIN
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md ${isScrolled ? 'text-gray-800' : 'text-white'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-school-green-600 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLoginClick();
              }}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-school-green-600 bg-school-green-50 hover:bg-school-green-100 mt-4"
            >
              Portal Login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
