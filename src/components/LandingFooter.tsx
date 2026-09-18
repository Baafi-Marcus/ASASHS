import React from 'react';

interface LandingFooterProps {
    onLoginClick?: () => void;
    onNewsClick?: () => void;
    onStaffClick?: () => void;
    onCalendarClick?: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ 
    onLoginClick, 
    onNewsClick, 
    onStaffClick, 
    onCalendarClick 
}) => {
    return (
        <footer className="bg-gray-950 text-white pt-16 pb-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
                    {/* School Identity */}
                    <div>
                        <div className="flex items-center space-x-3 mb-5">
                            <div className="p-1.5 bg-gray-900 border border-gray-800 rounded-sm">
                                <img 
                                    src="/asashs-logo.png" 
                                    alt="ASASHS Logo" 
                                    className="w-9 h-9 object-contain brightness-150" 
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-base tracking-tight leading-none text-white">ASASHS</h3>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5 tabular-nums">EST. 1991</p>
                            </div>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed mb-6">
                            To ensure every student who passes through our school receives holistic quality education, inculcating Godliness, discipline, and moral uprightness.
                        </p>
                        <div className="flex items-center space-x-2">
                            {[
                                { name: 'Facebook', url: '#facebook' },
                                { name: 'Twitter / X', url: '#twitter' },
                                { name: 'Instagram', url: '#instagram' },
                                { name: 'YouTube', url: '#youtube' }
                            ].map((social) => (
                                <a 
                                    key={social.name} 
                                    href={social.url} 
                                    className="w-8 h-8 rounded-sm bg-gray-900 border border-gray-800 hover:border-school-green-500 hover:bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                                    aria-label={social.name}
                                >
                                    <span>{social.name[0]}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-5 pb-2 border-b border-gray-800">
                            Quick Links
                        </h4>
                        <ul className="space-y-2.5">
                            {[
                                { label: 'About ASASHS', href: '#about' },
                                { label: 'Admissions Process', href: 'https://www.myshsadmission.net/site/schools/ASASHS/' },
                                { label: 'Academic Calendar', onClick: onCalendarClick },
                                { label: 'Student Portal', onClick: onLoginClick },
                                { label: 'Staff Directory', onClick: onStaffClick },
                                { label: 'Latest News & Events', onClick: onNewsClick }
                            ].map((item) => (
                                <li key={item.label}>
                                    {item.onClick ? (
                                        <button 
                                            onClick={item.onClick}
                                            className="text-gray-400 hover:text-school-green-400 text-xs transition-colors flex items-center min-h-[32px]"
                                        >
                                            <span className="text-gray-600 mr-2 text-sm">›</span>
                                            <span>{item.label}</span>
                                        </button>
                                    ) : (
                                        <a 
                                            href={item.href} 
                                            target={item.href?.startsWith('http') ? '_blank' : undefined} 
                                            rel={item.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                                            className="text-gray-400 hover:text-school-green-400 text-xs transition-colors flex items-center min-h-[32px]"
                                        >
                                            <span className="text-gray-600 mr-2 text-sm">›</span>
                                            <span>{item.label}</span>
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Operational Telemetry & Office Hours */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-5 pb-2 border-b border-gray-800">
                            Administration Hours
                        </h4>
                        <ul className="space-y-3 text-xs text-gray-400">
                            <li className="flex justify-between items-center py-1 border-b border-gray-900">
                                <span>Monday – Friday</span>
                                <span className="text-white font-medium tabular-nums">07:30 – 15:30</span>
                            </li>
                            <li className="flex justify-between items-center py-1 border-b border-gray-900">
                                <span>Weekends</span>
                                <span className="text-gray-500 uppercase text-[10px] font-semibold">Closed</span>
                            </li>
                            <li className="flex justify-between items-center py-1">
                                <span>Public Holidays</span>
                                <span className="text-gray-500 uppercase text-[10px] font-semibold">Closed</span>
                            </li>
                            <li className="pt-2 text-[11px] text-gray-500">
                                GES School Code: <span className="font-mono text-gray-300 tabular-nums font-semibold">0021306</span>
                            </li>
                        </ul>
                    </div>

                    {/* Institutional Contact */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-5 pb-2 border-b border-gray-800">
                            Campus Contact
                        </h4>
                        <ul className="space-y-3.5 text-xs">
                            <li className="flex items-start">
                                <svg className="w-4 h-4 text-school-green-400 mt-0.5 mr-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-gray-400 leading-relaxed">
                                    East Akim Municipality<br />
                                    Accra – Kumasi Highway<br />
                                    Eastern Region, Ghana
                                </span>
                            </li>
                            <li className="flex items-center">
                                <svg className="w-4 h-4 text-school-green-400 mr-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-gray-400 tabular-nums">+233 (0) 555 123 456</span>
                            </li>
                            <li className="flex items-center">
                                <svg className="w-4 h-4 text-school-green-400 mr-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-400">info@asashs.edu.gh</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <p>
                        &copy; {new Date().getFullYear()} Akim Asafo Senior High School. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-400 transition-colors">Academic Regulations</a>
                        <a href="#" className="hover:text-gray-400 transition-colors">Staff Portal</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
