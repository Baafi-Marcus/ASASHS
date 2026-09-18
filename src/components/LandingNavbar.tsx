import React, { useState, useEffect } from 'react';

interface LandingNavbarProps {
  onLoginClick: () => void;
  onVoteClick?: () => void;
  onStaffClick?: () => void;
  onCalendarClick?: () => void;
  onNewsClick?: () => void;
  onHomeClick?: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ 
  onLoginClick, 
  onVoteClick,
  onStaffClick,
  onCalendarClick,
  onNewsClick,
  onHomeClick
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    if (onHomeClick) {
      onHomeClick();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      if (onHomeClick) {
        e.preventDefault();
        onHomeClick();
        setTimeout(() => {
          const element = document.getElementById(href.substring(1));
          if (element) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 150);
      }
    }
  };

  const navLinks = [
    { name: 'Home', onClick: onHomeClick },
    { name: 'About Us', href: '#about' },
    { 
      name: 'Academics', 
      dropdown: [
        { name: 'Academic Calendar', onClick: onCalendarClick },
        { name: 'Staff Directory', onClick: onStaffClick },
        { name: 'Latest News', onClick: onNewsClick },
        { name: 'Academic Courses', href: '#academics' }
      ]
    },
    { 
      name: 'Admissions', 
      dropdown: [
        { name: 'Online Admission Portal', href: 'https://www.myshsadmission.net/site/schools/ASASHS/' },
        { name: 'Admission Requirements', href: '#admissions' }
      ]
    },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm py-2.5'
          : 'bg-transparent py-4 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo & Identity */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-school-green-600 rounded-sm"
          >
            <div className={`p-1.5 rounded-sm border ${
              isScrolled 
                ? 'bg-school-green-50 border-school-green-200' 
                : 'bg-white/10 backdrop-blur-sm border-white/20'
            }`}>
              <img
                src="/asashs-logo.png"
                alt="ASASHS Logo"
                className="w-7 h-7 md:w-8 md:h-8 object-contain"
              />
            </div>
            <div>
              <span className={`block text-base md:text-lg font-bold tracking-tight leading-none ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                ASASHS
              </span>
              <span className={`block text-[10px] tracking-wider uppercase font-semibold mt-0.5 ${
                isScrolled ? 'text-school-green-700' : 'text-gray-200'
              }`}>
                Akim Asafo Senior High
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <div 
                key={link.name} 
                className="relative h-full flex items-center"
                onMouseEnter={() => link.dropdown && setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {link.onClick ? (
                  <button
                    onClick={link.onClick}
                    className={`text-xs font-semibold uppercase tracking-wider py-2 px-1 border-b-2 border-transparent transition-colors focus-visible:outline-none ${
                      isScrolled
                        ? 'text-gray-700 hover:text-school-green-800 hover:border-school-green-600'
                        : 'text-gray-100 hover:text-white hover:border-white'
                    }`}
                  >
                    {link.name}
                  </button>
                ) : link.href ? (
                  <a
                    href={link.href}
                    onClick={(e) => handleAnchorClick(e, link.href!)}
                    className={`text-xs font-semibold uppercase tracking-wider py-2 px-1 border-b-2 border-transparent transition-colors focus-visible:outline-none ${
                      isScrolled
                        ? 'text-gray-700 hover:text-school-green-800 hover:border-school-green-600'
                        : 'text-gray-100 hover:text-white hover:border-white'
                    }`}
                  >
                    {link.name}
                  </a>
                ) : (
                  <button
                    className={`flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider py-2 px-1 border-b-2 border-transparent transition-colors focus-visible:outline-none ${
                      isScrolled
                        ? 'text-gray-700 hover:text-school-green-800 hover:border-school-green-600'
                        : 'text-gray-100 hover:text-white hover:border-white'
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.dropdown && (
                      <svg 
                        className={`w-3.5 h-3.5 transition-transform ${activeDropdown === link.name ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                )}

                {/* Dropdown Menu Panel */}
                {link.dropdown && activeDropdown === link.name && (
                  <div className="absolute top-full left-0 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1.5 mt-1 z-50 animate-in fade-in duration-150">
                    {link.dropdown.map((subItem: any) => (
                      subItem.onClick ? (
                        <button
                          key={subItem.name}
                          onClick={() => {
                            subItem.onClick?.();
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-700 hover:text-school-green-900 hover:bg-school-green-50 rounded-sm mx-0 transition-colors flex items-center justify-between"
                        >
                          <span>{subItem.name}</span>
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                        <a
                          key={subItem.name}
                          href={subItem.href}
                          target={subItem.href?.startsWith('http') ? '_blank' : undefined}
                          rel={subItem.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                          onClick={(e) => {
                            handleAnchorClick(e, subItem.href!);
                            setActiveDropdown(null);
                          }}
                          className="block px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-700 hover:text-school-green-900 hover:bg-school-green-50 rounded-sm mx-0 transition-colors"
                        >
                          {subItem.name}
                        </a>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Voting CTA */}
            {onVoteClick && (
              <button
                onClick={onVoteClick}
                className="px-3.5 py-2 rounded-sm font-bold text-xs uppercase tracking-wider bg-yellow-400 text-yellow-950 hover:bg-yellow-300 border border-yellow-500/50 shadow-sm flex items-center space-x-2 transition-colors min-h-[40px]"
              >
                <span className="w-2 h-2 bg-red-600 rounded-sm"></span>
                <span>Vote Online</span>
              </button>
            )}

            {/* Portal Login Button */}
            <button
              onClick={onLoginClick}
              className={`px-4 py-2 rounded-sm font-bold text-xs uppercase tracking-wider border transition-colors min-h-[40px] flex items-center justify-center ${
                isScrolled
                  ? 'bg-school-green-700 text-white hover:bg-school-green-800 border-school-green-800 shadow-sm'
                  : 'bg-white text-school-green-900 hover:bg-gray-100 border-white/40 shadow-sm'
              }`}
            >
              Portal Login
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-sm border transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                isScrolled 
                  ? 'text-gray-800 border-gray-200 hover:bg-gray-50' 
                  : 'text-white border-white/20 hover:bg-white/10'
              }`}
              aria-label="Toggle navigation menu"
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

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-xl absolute w-full left-0 top-full px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <div key={link.name} className="border-b border-gray-100 last:border-0 pb-1">
              {link.dropdown ? (
                <div>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                    className="w-full flex justify-between items-center px-3 py-2.5 rounded-sm text-sm font-bold uppercase tracking-wider text-gray-800 hover:bg-gray-50 min-h-[44px]"
                  >
                    <span>{link.name}</span>
                    <svg 
                      className={`w-4 h-4 text-gray-500 transition-transform ${activeDropdown === link.name ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeDropdown === link.name && (
                    <div className="pl-4 py-1.5 space-y-1 bg-gray-50 rounded-sm mb-2 border-l-2 border-school-green-600">
                      {link.dropdown.map((subItem: any) => (
                        subItem.onClick ? (
                          <button
                            key={subItem.name}
                            onClick={() => {
                              subItem.onClick?.();
                              setIsMobileMenuOpen(false);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left block px-3 py-2 text-xs font-semibold text-gray-700 hover:text-school-green-800 uppercase tracking-wide min-h-[44px] flex items-center"
                          >
                            {subItem.name}
                          </button>
                        ) : (
                          <a
                            key={subItem.name}
                            href={subItem.href}
                            target={subItem.href?.startsWith('http') ? '_blank' : undefined}
                            rel={subItem.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                            onClick={(e) => {
                              handleAnchorClick(e, subItem.href!);
                              setIsMobileMenuOpen(false);
                            }}
                            className="block px-3 py-2 text-xs font-semibold text-gray-700 hover:text-school-green-800 uppercase tracking-wide min-h-[44px] flex items-center"
                          >
                            {subItem.name}
                          </a>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ) : link.onClick ? (
                <button
                  onClick={() => {
                    link.onClick?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2.5 rounded-sm text-sm font-bold uppercase tracking-wider text-gray-800 hover:bg-gray-50 min-h-[44px] flex items-center"
                >
                  {link.name}
                </button>
              ) : (
                <a
                  href={link.href}
                  onClick={(e) => {
                    handleAnchorClick(e, link.href!);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block px-3 py-2.5 rounded-sm text-sm font-bold uppercase tracking-wider text-gray-800 hover:bg-gray-50 min-h-[44px] flex items-center"
                >
                  {link.name}
                </a>
              )}
            </div>
          ))}

          {onVoteClick && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onVoteClick();
              }}
              className="w-full px-4 py-3 rounded-sm font-bold text-xs uppercase tracking-wider text-yellow-950 bg-yellow-400 hover:bg-yellow-300 border border-yellow-500/50 mt-2 flex items-center justify-between min-h-[44px]"
            >
              <span>Student Voting 2025</span>
              <span className="px-2 py-0.5 bg-yellow-950 text-yellow-300 rounded-sm text-[10px] font-bold uppercase">Live</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onLoginClick();
            }}
            className="w-full px-4 py-3 rounded-sm font-bold text-xs uppercase tracking-wider text-white bg-school-green-700 hover:bg-school-green-800 border border-school-green-800 mt-2 min-h-[44px] flex items-center justify-center"
          >
            Portal Login
          </button>
        </div>
      )}
    </nav>
  );
};
