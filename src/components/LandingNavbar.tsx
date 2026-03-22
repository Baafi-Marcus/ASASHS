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
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
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
        // Increased timeout to ensure landing page components handle mounting
        setTimeout(() => {
          const element = document.getElementById(href.substring(1));
          if (element) {
            const offset = 80; // Navbar height offset
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 200);
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
        { name: 'Courses', href: '#academics' }
      ]
    },
    { 
      name: 'Admissions', 
      dropdown: [
        { name: 'Online Admission', href: 'https://www.myshsadmission.net/site/schools/ASASHS/' },
        { name: 'Requirements', href: '#admissions' }
      ]
    },
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
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className={`p-1.5 md:p-2 rounded-lg ${isScrolled ? 'bg-school-green-50' : 'bg-white/10 backdrop-blur-sm'}`}>
              <img
                src="/asashs-logo.png"
                alt="ASASHS Logo"
                className="w-8 h-8 md:w-10 md:h-10"
              />
            </div>
            <div className="flex flex-col text-left">
              <h1 className={`text-lg md:text-xl font-bold leading-tight ${isScrolled ? 'text-school-green-800' : 'text-white'}`}>
                ASASHS
              </h1>
              <p className={`text-[10px] md:text-xs tracking-wider hidden sm:block ${isScrolled ? 'text-school-green-600' : 'text-white/90'}`}>
                AKIM ASAFO SENIOR HIGH
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div 
                key={link.name} 
                className="relative group h-full flex items-center"
                onMouseEnter={() => link.dropdown && setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {link.onClick ? (
                  <button
                    onClick={link.onClick}
                    className={`text-sm font-semibold uppercase tracking-wide transition-colors ${isScrolled
                        ? 'text-gray-600 hover:text-school-green-600'
                        : 'text-white/90 hover:text-white'
                      }`}
                  >
                    {link.name}
                  </button>
                ) : link.href ? (
                  <a
                    href={link.href}
                    onClick={(e) => handleAnchorClick(e, link.href!)}
                    className={`text-sm font-semibold uppercase tracking-wide transition-colors ${isScrolled
                        ? 'text-gray-600 hover:text-school-green-600'
                        : 'text-white/90 hover:text-white'
                      }`}
                  >
                    {link.name}
                  </a>
                ) : (
                  <div className="flex items-center cursor-default">
                    <span className={`text-sm font-semibold uppercase tracking-wide transition-colors ${isScrolled
                        ? 'text-gray-600 hover:text-school-green-600'
                        : 'text-white/90 hover:text-white'
                      }`}>
                      {link.name}
                    </span>
                    {link.dropdown && (
                      <svg className={`w-4 h-4 ml-1 transition-transform ${activeDropdown === link.name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                )}

                {/* Dropdown Menu */}
                {link.dropdown && activeDropdown === link.name && (
                  <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                    <div className="pt-2"> {/* Tiny buffer space */}
                      {link.dropdown.map((subItem: any) => (
                        subItem.onClick ? (
                          <button
                            key={subItem.name}
                            onClick={() => {
                              subItem.onClick?.();
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-school-green-600 hover:bg-school-green-50 transition-colors flex items-center uppercase tracking-tight"
                          >
                            {subItem.name}
                          </button>
                        ) : (
                          <a
                            key={subItem.name}
                            href={subItem.href}
                            target={subItem.href?.startsWith('http') ? '_blank' : undefined}
                            onClick={(e) => handleAnchorClick(e, subItem.href!)}
                            className="block px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-school-green-600 hover:bg-school-green-50 transition-colors uppercase tracking-tight"
                          >
                            {subItem.name}
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {onVoteClick && (
              <button
                onClick={onVoteClick}
                className="px-6 py-2 rounded-full font-bold text-sm bg-yellow-500 text-black hover:bg-yellow-400 transition-all transform hover:scale-105 shadow-md flex items-center space-x-2 animate-pulse"
              >
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span>VOTE NOW</span>
              </button>
            )}
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
              <div key={link.name}>
                {link.dropdown ? (
                  <>
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                      className="w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-school-green-600 hover:bg-gray-50"
                    >
                      <span>{link.name}</span>
                      <svg className={`w-5 h-5 transition-transform ${activeDropdown === link.name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {activeDropdown === link.name && (
                      <div className="pl-4 py-1 space-y-1 bg-gray-50/50 rounded-lg mb-2">
                        {link.dropdown.map((subItem: any) => (
                          subItem.onClick ? (
                            <button
                              key={subItem.name}
                              onClick={() => {
                                subItem.onClick?.();
                                setIsMobileMenuOpen(false);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left block px-3 py-2 rounded-md text-sm font-black text-gray-600 hover:text-school-green-600 uppercase tracking-tighter"
                            >
                              {subItem.name}
                            </button>
                          ) : (
                            <a
                              key={subItem.name}
                              href={subItem.href}
                              target={subItem.href?.startsWith('http') ? '_blank' : undefined}
                              onClick={(e) => {
                                handleAnchorClick(e, subItem.href!);
                                setIsMobileMenuOpen(false);
                              }}
                              className="block px-3 py-2 rounded-md text-sm font-black text-gray-600 hover:text-school-green-600 uppercase tracking-tighter"
                            >
                              {subItem.name}
                            </a>
                          )
                        ))}
                      </div>
                    )}
                  </>
                ) : link.onClick ? (
                  <button
                    onClick={() => {
                      link.onClick?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-school-green-600 hover:bg-gray-50"
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
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-school-green-600 hover:bg-gray-50"
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
                className="w-full text-left block px-3 py-3 rounded-md text-base font-bold text-black bg-yellow-500 hover:bg-yellow-400 mt-2 flex items-center justify-between"
              >
                <span>Student Voting 2025</span>
                <div className="flex items-center space-x-2">
                   <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                   <span className="text-[10px] uppercase font-black">Live</span>
                </div>
              </button>
            )}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLoginClick();
              }}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-school-green-600 bg-school-green-50 hover:bg-school-green-100 mt-2"
            >
              Portal Login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
