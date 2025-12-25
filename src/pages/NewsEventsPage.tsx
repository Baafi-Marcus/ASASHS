import React, { useState } from 'react';
import { LandingNavbar } from '../components/LandingNavbar';
import { LandingFooter } from '../components/LandingFooter';

interface NewsEventsPageProps {
    onLoginClick: () => void;
}

export const NewsEventsPage: React.FC<NewsEventsPageProps> = ({ onLoginClick }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const newsArticles = [
        {
            id: 1,
            title: "ASASHS Wins Best Performing SHS Award",
            category: "Award",
            date: "December 20, 2025",
            image: "/award_ceremony.jpg",
            excerpt: "Akim Asafo Senior High School has been honored as the Best Performing Senior High School at the Akosua Agyeiwaa Memorial Municipal Teachers' Awards ceremony.",
            externalLink: null,
            color: "from-yellow-400 to-yellow-600"
        },
        {
            id: 2,
            title: "National Debate & Quiz Competition Success",
            category: "Academic",
            date: "2025",
            image: "/nsmq_2025.jpg",
            excerpt: "ASASHS students secured impressive 2nd place in Debate and 3rd place in Quiz at the 29th National Inter-SHS Competition.",
            externalLink: null,
            color: "from-blue-400 to-blue-600"
        },
        {
            id: 3,
            title: "NSMQ 2025 Regional Qualifiers",
            category: "Academic",
            date: "2025",
            image: "/nsmq_2024.jpg",
            excerpt: "ASASHS team qualifies for the National Science and Maths Quiz, showcasing excellence in STEM education.",
            externalLink: null,
            color: "from-purple-400 to-purple-600"
        },
        {
            id: 4,
            title: "Zonal Handball Champions 2025",
            category: "Sports",
            date: "2025",
            image: "/sports_team_field.jpg",
            excerpt: "ASASHS dominates the Kukurantumi Zone and qualifies for Super Zonals 2025.",
            externalLink: null,
            color: "from-green-400 to-green-600"
        },
        {
            id: 5,
            title: "25th Anniversary Celebration",
            category: "Milestone",
            date: "April 12, 2025",
            image: "/administration.jpg",
            excerpt: "ASASHS celebrates 25 years of academic excellence and community impact.",
            externalLink: null,
            color: "from-pink-400 to-pink-600"
        },
        {
            id: 6,
            title: "EPI Alumni Continue to Support Rural Akim Asafo SHS",
            category: "Community",
            date: "May 12, 2024",
            image: "/student_group_1.jpg",
            excerpt: "Educational Pathways International alumni donated seven laptops and comprehensive collection of textbooks, continuing their tradition of giving back.",
            externalLink: "https://www.educationalpathwaysinternational.org/2024/05/12/epi-alumni-continue-to-support-rural-akim-asafo-senior-high-school/",
            color: "from-indigo-400 to-indigo-600"
        },
        {
            id: 7,
            title: "Tourism Club Rejuvenation Initiative",
            category: "Extracurricular",
            date: "August 22, 2024",
            image: "/student_group_2.jpg",
            excerpt: "Tourism Society of Ghana partners with ASASHS to revitalize the school's Tourism Club.",
            externalLink: null,
            color: "from-teal-400 to-teal-600"
        },
        {
            id: 8,
            title: "Admissions Open for 2025/2026 Academic Year",
            category: "Admissions",
            date: "2025/2026",
            image: "/hero_school_building.jpg",
            excerpt: "Applications now being accepted for the new academic year. Join the Best Performing SHS in the municipality!",
            externalLink: "https://www.myshsadmission.net/site/schools/ASASHS/",
            color: "from-orange-400 to-orange-600"
        }
    ];

    const categories = ['All', 'Award', 'Academic', 'Sports', 'Community', 'Milestone', 'Extracurricular', 'Admissions'];

    const filteredArticles = selectedCategory === 'All'
        ? newsArticles
        : newsArticles.filter(article => article.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <LandingNavbar onLoginClick={onLoginClick} />

            {/* Hero Section with Background Image */}
            <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="/news_hero.jpg"
                        alt="ASASHS Students"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-school-green-900/70 via-school-green-800/60 to-black/50"></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <span className="inline-block py-2 px-4 rounded-full bg-white/20 text-white text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-sm border border-white/30 animate-fade-in">
                        Latest Updates & Achievements
                    </span>
                    <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 leading-tight animate-slide-up">
                        News & Events
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed animate-slide-up [animation-delay:200ms]">
                        Celebrating excellence, achievements, and milestones from the ASASHS community
                    </p>
                </div>
            </section>

            {/* Category Filter */}
            <section className="py-8 bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-wrap gap-3 justify-center">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${selectedCategory === category
                                    ? 'bg-school-green-600 text-white shadow-lg scale-105'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* News Grid - Redesigned Layout */}
            <section className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Featured Article (First Article - Larger) */}
                    {filteredArticles.length > 0 && (
                        <div className="mb-12">
                            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 group">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                                    <div className="relative h-96 lg:h-auto overflow-hidden">
                                        <img
                                            src={filteredArticles[0].image}
                                            alt={filteredArticles[0].title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className={`absolute top-4 left-4 bg-gradient-to-r ${filteredArticles[0].color} text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg`}>
                                            {filteredArticles[0].category}
                                        </div>
                                    </div>
                                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                                        <span className="text-gray-500 text-sm font-medium mb-3">{filteredArticles[0].date}</span>
                                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 group-hover:text-school-green-600 transition-colors">
                                            {filteredArticles[0].title}
                                        </h2>
                                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                            {filteredArticles[0].excerpt}
                                        </p>
                                        {filteredArticles[0].externalLink ? (
                                            <a
                                                href={filteredArticles[0].externalLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-school-green-600 font-bold text-lg hover:text-school-green-800 group/link"
                                            >
                                                Read Full Article
                                                <svg className="w-5 h-5 ml-2 group-hover/link:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">Full article coming soon</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Remaining Articles - Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArticles.slice(1).map((article) => (
                            <div key={article.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col">
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className={`absolute top-3 left-3 bg-gradient-to-r ${article.color} text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg`}>
                                        {article.category}
                                    </div>
                                </div>
                                <div className="p-5 md:p-6 flex flex-col flex-grow">
                                    <span className="text-gray-500 text-[10px] md:text-xs font-medium mb-2">{article.date}</span>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 group-hover:text-school-green-600 transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
                                        {article.excerpt}
                                    </p>
                                    {article.externalLink ? (
                                        <a
                                            href={article.externalLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-school-green-600 font-bold text-xs md:text-sm hover:text-school-green-800 group/link mt-auto"
                                        >
                                            Read More
                                            <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 text-[10px] italic mt-auto">Coming soon</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-gradient-to-r from-school-green-800 to-school-green-900 text-white">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Community of Excellence</h2>
                    <p className="text-xl text-gray-200 mb-8">
                        Be part of the Best Performing SHS in the East Akim Municipality
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => window.open('https://www.myshsadmission.net/site/schools/ASASHS/', '_blank')}
                            className="px-8 py-4 bg-white text-school-green-800 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            Apply for Admission
                        </button>
                        <button
                            onClick={onLoginClick}
                            className="px-8 py-4 border-2 border-white/30 backdrop-blur-sm text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors"
                        >
                            Student Portal
                        </button>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
};
