import React, { useState } from 'react';
import { LandingFooter } from '../components/LandingFooter';

interface NewsEventsPageProps {
    onLoginClick: () => void;
    onStaffClick?: () => void;
    onCalendarClick?: () => void;
    onHomeClick?: () => void;
}

export const NewsEventsPage: React.FC<NewsEventsPageProps> = ({ 
    onLoginClick,
    onStaffClick,
    onCalendarClick,
    onHomeClick
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const newsArticles = [
        {
            id: 1,
            title: "ASASHS Wins Best Performing SHS Award",
            category: "Award",
            date: "December 20, 2025",
            image: "/award_ceremony.jpg",
            excerpt: "Akim Asafo Senior High School has been recognized as the Best Performing Senior High School at the municipal education awards, honoring academic achievement and instructional excellence.",
            externalLink: null,
            badgeClass: "bg-yellow-50 text-yellow-900 border-yellow-300"
        },
        {
            id: 2,
            title: "National Debate & Quiz Competition Success",
            category: "Academic",
            date: "November 14, 2025",
            image: "/nsmq_2025.jpg",
            excerpt: "ASASHS students secured 2nd place in Debate and 3rd place in Quiz at the 29th National Inter-SHS Competition, continuing a tradition of critical inquiry.",
            externalLink: null,
            badgeClass: "bg-blue-50 text-blue-900 border-blue-200"
        },
        {
            id: 3,
            title: "NSMQ 2025 Regional Qualifiers Advance",
            category: "Academic",
            date: "October 08, 2025",
            image: "/nsmq_2024.jpg",
            excerpt: "The school STEM team qualifies for the National Science and Maths Quiz preliminary stages, demonstrating problem-solving aptitude in physics and biology.",
            externalLink: null,
            badgeClass: "bg-blue-50 text-blue-900 border-blue-200"
        },
        {
            id: 4,
            title: "Zonal Handball Champions 2025",
            category: "Sports",
            date: "September 24, 2025",
            image: "/sports_team_field.jpg",
            excerpt: "ASASHS athletes take the championship trophy in the Kukurantumi Zone, securing qualification for the Super Zonals tournament.",
            externalLink: null,
            badgeClass: "bg-emerald-50 text-emerald-900 border-emerald-200"
        },
        {
            id: 5,
            title: "34th Anniversary Celebrations Announced",
            category: "Milestone",
            date: "April 12, 2025",
            image: "/administration.jpg",
            excerpt: "School management and the alumni association announce activities commemorating over three decades of community empowerment and education.",
            externalLink: null,
            badgeClass: "bg-purple-50 text-purple-900 border-purple-200"
        },
        {
            id: 6,
            title: "EPI Alumni Educational Pathways Support Initiative",
            category: "Community",
            date: "May 12, 2024",
            image: "/student_group_1.jpg",
            excerpt: "Alumni network donates laptops and modern textbooks to the institutional ICT laboratory and library to support digital literacy.",
            externalLink: "https://www.educationalpathwaysinternational.org/2024/05/12/epi-alumni-continue-to-support-rural-akim-asafo-senior-high-school/",
            badgeClass: "bg-amber-50 text-amber-900 border-amber-200"
        },
        {
            id: 7,
            title: "Tourism & Heritage Club Rejuvenation",
            category: "Extracurricular",
            date: "August 22, 2024",
            image: "/student_group_2.jpg",
            excerpt: "The Tourism Society of Ghana partners with the school administration to expand student field expeditions and ecological studies.",
            externalLink: null,
            badgeClass: "bg-teal-50 text-teal-900 border-teal-200"
        },
        {
            id: 8,
            title: "Admissions Open for 2025/2026 Academic Session",
            category: "Admissions",
            date: "January 15, 2025",
            image: "/hero_school_building.jpg",
            excerpt: "Placement verification and online enrollment are open for BECE candidates placed in ASASHS across all academic tracks.",
            externalLink: "https://www.myshsadmission.net/site/schools/ASASHS/",
            badgeClass: "bg-indigo-50 text-indigo-900 border-indigo-200"
        }
    ];

    const categories = ['All', 'Award', 'Academic', 'Sports', 'Community', 'Milestone', 'Extracurricular', 'Admissions'];

    const filteredArticles = selectedCategory === 'All'
        ? newsArticles
        : newsArticles.filter(article => article.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Page Header */}
            <section className="bg-gray-950 text-white pt-28 pb-16 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="inline-flex items-center space-x-2 py-1 px-2.5 rounded-sm bg-school-green-950 border border-school-green-800 text-[10px] uppercase font-bold text-school-green-300 mb-3">
                        <span>Official Dispatches</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
                        News & Communiqués
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-300 max-w-2xl">
                        Official announcements, competition dispatches, student achievements, and administrative updates from Akim Asafo Senior High School.
                    </p>
                </div>
            </section>

            {/* Category Filter Bar */}
            <section className="bg-white border-b border-gray-200 sticky top-12 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors min-h-[36px] ${
                                    selectedCategory === category
                                        ? 'bg-school-green-700 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* News Editorial Grid */}
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Featured Article */}
                    {filteredArticles.length > 0 && (
                        <div className="mb-10">
                            <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
                                <div className="lg:col-span-7 h-64 lg:h-96 relative">
                                    <img
                                        src={filteredArticles[0].image}
                                        alt={filteredArticles[0].title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border shadow-sm ${filteredArticles[0].badgeClass}`}>
                                            {filteredArticles[0].category}
                                        </span>
                                    </div>
                                </div>
                                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                                    <div>
                                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2 tabular-nums">
                                            {filteredArticles[0].date}
                                        </span>
                                        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-3 tracking-tight leading-snug">
                                            {filteredArticles[0].title}
                                        </h2>
                                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                                            {filteredArticles[0].excerpt}
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        {filteredArticles[0].externalLink ? (
                                            <a
                                                href={filteredArticles[0].externalLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-xs font-bold text-school-green-700 hover:text-school-green-900 uppercase tracking-wider"
                                            >
                                                <span>Read Full Source Report</span>
                                                <span className="ml-1 text-sm">→</span>
                                            </a>
                                        ) : (
                                            <span className="text-[11px] text-gray-400 uppercase font-semibold">Institutional Dispatch</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Secondary Articles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArticles.slice(1).map((article) => (
                            <div 
                                key={article.id} 
                                className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between hover:border-school-green-600 transition-colors"
                            >
                                <div>
                                    <div className="relative h-48 overflow-hidden border-b border-gray-100">
                                        <img
                                            src={article.image}
                                            alt={article.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2.5 left-2.5">
                                            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border shadow-sm ${article.badgeClass}`}>
                                                {article.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5 tabular-nums">
                                            {article.date}
                                        </span>
                                        <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug">
                                            {article.title}
                                        </h3>
                                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                                            {article.excerpt}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-5 pt-0">
                                    <div className="pt-3 border-t border-gray-100">
                                        {article.externalLink ? (
                                            <a
                                                href={article.externalLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-xs font-bold text-school-green-700 hover:text-school-green-900 uppercase tracking-wider"
                                            >
                                                <span>Read Article</span>
                                                <span className="ml-1 text-sm">→</span>
                                            </a>
                                        ) : (
                                            <span className="text-[10px] text-gray-400 uppercase font-semibold">ASASHS Press Office</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Admissions Banner */}
            <section className="py-14 bg-gray-950 text-white border-t border-gray-800">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
                    <h2 className="text-xl sm:text-2xl font-bold mb-3 tracking-tight">
                        Enroll at Akim Asafo Senior High School
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mb-6 max-w-xl mx-auto leading-relaxed">
                        Join the municipality's premier secondary school. Applications and placement confirmations are processed through the official admission portal.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <button
                            onClick={() => window.open('https://www.myshsadmission.net/site/schools/ASASHS/', '_blank')}
                            className="px-5 py-2.5 bg-school-green-700 hover:bg-school-green-800 text-white rounded-sm font-bold text-xs uppercase tracking-wider transition-colors border border-school-green-600 shadow-sm min-h-[44px]"
                        >
                            Open Admission Portal
                        </button>
                        <button
                            onClick={onLoginClick}
                            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-sm font-bold text-xs uppercase tracking-wider transition-colors border border-gray-700 min-h-[44px]"
                        >
                            Access Student Portal
                        </button>
                    </div>
                </div>
            </section>

            {/* Institutional Footer */}
            <LandingFooter 
                onLoginClick={onLoginClick} 
                onNewsClick={() => {}} 
                onStaffClick={onStaffClick} 
                onCalendarClick={onCalendarClick} 
            />
        </div>
    );
};
