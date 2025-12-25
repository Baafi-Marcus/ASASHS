import React from 'react';

export const LandingFooter: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* School Info */}
                    <div>
                        <div className="flex items-center space-x-3 mb-6">
                            <img src="/asashs-logo.png" alt="ASASHS Logo" className="w-12 h-12 grayscale brightness-200" />
                            <div>
                                <h3 className="font-bold text-lg">ASASHS</h3>
                                <p className="text-xs text-gray-400">EST. 1991</p>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            To ensure that every student who has passed through the walls of the school is given a holistic quality education, inculcating Godliness and moral uprightness.
                        </p>
                        <div className="flex space-x-4">
                            {[
                                { name: 'Facebook', url: '#facebook', color: 'hover:bg-[#1877F2]' },
                                { name: 'Twitter', url: '#twitter', color: 'hover:bg-[#1DA1F2]' },
                                { name: 'Instagram', url: '#instagram', color: 'hover:bg-[#E4405F]' },
                                { name: 'YouTube', url: '#youtube', color: 'hover:bg-[#FF0000]' }
                            ].map((social) => (
                                <a key={social.name} href={social.url} className={`w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center ${social.color} transition-colors group`}>
                                    <span className="sr-only">{social.name}</span>
                                    <div className="w-4 h-4 bg-gray-400 group-hover:bg-white transition-colors rounded-sm"></div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 border-b border-gray-700 pb-2 inline-block">Quick Links</h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'About Our School', href: '#' },
                                { label: 'Admissions Process', href: 'https://www.myshsadmission.net/site/schools/ASASHS/' },
                                { label: 'Academic Calendar', href: '#' },
                                { label: 'Student Portal', href: '#' },
                                { label: 'Staff Directory', href: '#' },
                                { label: 'Gallery', href: '#' }
                            ].map((item) => (
                                <li key={item.label}>
                                    <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} className="text-gray-400 hover:text-school-green-400 text-sm transition-colors flex items-center">
                                        <span className="mr-2">›</span> {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Opening Hours */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 border-b border-gray-700 pb-2 inline-block">Office Hours</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex justify-between">
                                <span>Monday - Friday</span>
                                <span className="text-white">7:30 AM - 3:30 PM</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Weekends</span>
                                <span className="text-white">Closed</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Public Holidays</span>
                                <span className="text-white">Closed</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 border-b border-gray-700 pb-2 inline-block">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-school-green-500 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-gray-400 text-sm">
                                    East Akim Municipality<br />
                                    Accra - Kumasi Road<br />
                                    Eastern Region, Ghana
                                </span>
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-school-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-gray-400 text-sm">+233 (0) 555 123 456</span>
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-school-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-400 text-sm">info@asashs.edu.gh</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Akim Asafo Senior High School. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-gray-500 hover:text-white text-sm">Privacy Policy</a>
                        <a href="#" className="text-gray-500 hover:text-white text-sm">Terms of Use</a>
                        <a href="#" className="text-gray-500 hover:text-white text-sm">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
