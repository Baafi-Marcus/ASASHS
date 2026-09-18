import React from 'react';
import db from '../../lib/neon';
import { LandingFooter } from '../components/LandingFooter';
import { SchoolHeritageCrest } from '../components/SchoolHeritageCrest';

interface SchoolLandingPageProps {
    onLoginClick: () => void;
    onVoteClick?: () => void;
    onNewsClick?: () => void;
    onStaffClick?: () => void;
    onCalendarClick?: () => void;
    onHomeClick?: () => void;
    onTesterSignup?: () => void;
}

export const SchoolLandingPage: React.FC<SchoolLandingPageProps> = ({ 
    onLoginClick, 
    onVoteClick, 
    onNewsClick,
    onStaffClick,
    onCalendarClick,
    onHomeClick,
}) => {
    const [hasActiveElection, setHasActiveElection] = React.useState(false);

    React.useEffect(() => {
        const checkElections = async () => {
            try {
                const elections = await db.getElections();
                const active = elections.some((e: any) => e.status === 'open');
                setHasActiveElection(active);
            } catch (error) {
                console.error('Failed to check election status');
            }
        };
        checkElections();
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Hero Section */}
            <section className="relative min-h-[640px] md:min-h-[700px] flex items-center justify-center bg-gray-950 overflow-hidden pt-20">
                {/* Background Image with Structural Contrast Filter */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/75 to-gray-950/60 z-10" />
                    <img
                        src="/hero_school_building.jpg"
                        alt="Akim Asafo Senior High School Campus"
                        className="w-full h-full object-cover object-[center_35%]"
                    />
                </div>

                {/* Hero Content */}
                <div className="relative z-20 text-left md:text-center text-white px-4 sm:px-6 max-w-5xl mx-auto py-16">
                    <div className="inline-flex items-center space-x-2 py-1 px-3 rounded-sm bg-black/60 text-[11px] font-semibold tracking-wider uppercase mb-6 border border-white/20 backdrop-blur-sm">
                        <span className="w-2 h-2 bg-school-green-400 rounded-sm"></span>
                        <span className="tabular-nums">Est. 1991</span>
                        <span>•</span>
                        <span>Center of Academic Excellence</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
                        Akim Asafo <br />
                        <span className="text-yellow-400">Senior High School</span>
                    </h1>

                    <p className="text-sm sm:text-lg md:text-xl text-gray-200 mb-10 max-w-2xl md:mx-auto font-normal leading-relaxed">
                        Providing holistic quality education, fostering Godliness, moral uprightness, and disciplined leadership for over three decades.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-start md:justify-center gap-3">
                        {onVoteClick && hasActiveElection && (
                            <button
                                onClick={onVoteClick}
                                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-yellow-950 rounded-sm font-bold text-xs uppercase tracking-wider transition-colors border border-yellow-500/50 shadow-sm flex items-center justify-center space-x-2 min-h-[44px]"
                            >
                                <span className="w-2 h-2 bg-red-600 rounded-sm"></span>
                                <span>Cast Vote in 2025 Elections</span>
                            </button>
                        )}
                        <button
                            onClick={() => window.open('https://www.myshsadmission.net/site/schools/ASASHS/', '_blank')}
                            className="px-6 py-3 bg-school-green-700 hover:bg-school-green-800 text-white rounded-sm font-bold text-xs uppercase tracking-wider transition-colors border border-school-green-600 shadow-sm min-h-[44px] flex items-center justify-center"
                        >
                            Explore Admissions
                        </button>
                        <button
                            onClick={onLoginClick}
                            className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-sm font-bold text-xs uppercase tracking-wider transition-colors border border-gray-200 shadow-sm min-h-[44px] flex items-center justify-center"
                        >
                            Portal Access
                        </button>
                    </div>
                </div>

                {/* Bottom Border Anchor */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-school-green-600 z-20"></div>
            </section>

            {/* Quick Action Cards */}
            <section className="relative z-30 -mt-10 px-4 sm:px-6 mb-16">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                        {
                            title: "Online Admission",
                            desc: "Check placement verification and start registration for the upcoming academic year.",
                            cta: "Access Admission Portal",
                            icon: (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            ),
                            action: () => window.open('https://www.myshsadmission.net/site/schools/ASASHS/', '_blank')
                        },
                        {
                            title: "Student & Staff Portal",
                            desc: "Access individual grades, continuous assessment, exam schedules, and learning materials.",
                            cta: "Log In to Portal",
                            icon: (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            ),
                            action: onLoginClick
                        },
                        {
                            title: "Latest News & Bulletin",
                            desc: "Best Performing SHS Award (2025) and National Debate Competition updates.",
                            cta: "Read School News",
                            icon: (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            ),
                            action: onNewsClick
                        }
                    ].map((card, idx) => (
                        <div
                            key={idx}
                            onClick={card.action}
                            className="bg-white rounded-md border border-gray-200 p-6 shadow-sm hover:border-school-green-600 transition-colors cursor-pointer flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-sm bg-school-green-50 border border-school-green-200 text-school-green-800 flex items-center justify-center mb-4">
                                    {card.icon}
                                </div>
                                <h3 className="text-base font-bold text-gray-900 mb-2">{card.title}</h3>
                                <p className="text-gray-600 text-xs leading-relaxed mb-6">{card.desc}</p>
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-school-green-700">
                                <span>{card.cta}</span>
                                <span className="text-sm">→</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Institutional School Crest & Core Pillars Showcase */}
            <SchoolHeritageCrest onLoginClick={onLoginClick} />

            {/* Heritage & Leadership Section */}
            <section className="py-16 px-4 sm:px-6 bg-white border-b border-gray-200" id="about">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Visual & Quote */}
                    <div className="relative">
                        <div className="rounded-md border border-gray-200 overflow-hidden shadow-sm aspect-[4/3] sm:aspect-[6/5] md:aspect-[4/3] lg:h-[420px]">
                            <img
                                src="/headmistress.jpg"
                                alt="Mrs. Ama Thompson - Headmistress"
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                        <div className="mt-4 p-5 rounded-md border border-gray-200 bg-gray-50 border-l-4 border-l-school-green-700 shadow-sm">
                            <p className="text-gray-800 italic text-sm leading-relaxed">
                                "Education is the formation of character, discipline, and core values, not merely intellectual instruction."
                            </p>
                            <div className="mt-3">
                                <p className="font-bold text-xs text-gray-900 uppercase">Mrs. Ama Thompson</p>
                                <p className="text-[10px] text-school-green-700 uppercase font-semibold">Headmistress, ASASHS</p>
                            </div>
                        </div>
                    </div>

                    {/* Historical Narrative */}
                    <div>
                        <div className="inline-flex items-center space-x-2 py-1 px-2.5 rounded-sm bg-school-green-50 border border-school-green-200 text-[10px] uppercase font-bold text-school-green-800 mb-3">
                            <span>Our Heritage</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-5 tracking-tight">
                            History & Legacy of ASASHS
                        </h2>
                        <div className="text-xs sm:text-sm text-gray-600 space-y-3 leading-relaxed mb-8">
                            <p>
                                Akim Asafo Senior High School was established as a community school on <strong className="text-gray-900 tabular-nums">18th February 1991</strong>, under its first Headmaster Mr. Kyere Alexander Kofi. Starting at the Methodist JHS premises with seven students, the institution moved to its present permanent campus in 1994.
                            </p>
                            <p>
                                In 1996, American Baptist Missionaries adopted the school, providing foundational infrastructure and academic resources. In line with the Ministry of Education standard naming conventions, the school transitioned into its current official name: <strong className="text-gray-900">Akim Asafo Senior High School</strong>.
                            </p>
                            <p>
                                Located in the East Akim Municipality of the Eastern Region along the Accra – Kumasi highway, ASASHS stands as a premier public high school recognized for discipline and academic rigour.
                            </p>
                        </div>

                        <div className="rounded-md border border-gray-200 overflow-hidden shadow-sm relative">
                            <div className="aspect-[16/9] sm:h-52 w-full overflow-hidden">
                                <img
                                    src="/administration.jpg"
                                    alt="ASASHS Administration Block"
                                    className="w-full h-full object-cover object-[center_35%]"
                                />
                            </div>
                            <div className="p-4 bg-gray-50 border-t border-gray-200">
                                <h3 className="font-bold text-xs uppercase tracking-wide text-gray-900">Administration & Governance</h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">Committed leadership overseeing academic delivery and student welfare.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mission Banner */}
                <div className="max-w-7xl mx-auto mt-14 bg-gray-50 p-6 sm:p-8 rounded-md border border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                        <div className="lg:col-span-2">
                            <div className="inline-flex items-center space-x-2 py-0.5 px-2 rounded-sm bg-school-green-100 text-[10px] uppercase font-bold text-school-green-800 mb-2">
                                <span>Institutional Purpose</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">Mission Statement</h3>
                            <blockquote className="text-sm text-gray-700 italic leading-relaxed border-l-2 border-school-green-600 pl-4">
                                "To ensure that every student who has passed through the walls of the school is given a holistic quality education. We seek to inculcate in students Godliness and moral uprightness as well as help bring out the potentials in them for lifelong personal responsibility."
                            </blockquote>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-md border border-gray-200 overflow-hidden aspect-[3/4] sm:aspect-[4/5] sm:h-44">
                                <img src="/student_art.jpg" alt="Student Artwork" className="w-full h-full object-cover object-top" />
                            </div>
                            <div className="rounded-md border border-gray-200 overflow-hidden aspect-[3/4] sm:aspect-[4/5] sm:h-44">
                                <img src="/students_campus.jpg" alt="Students on Campus" className="w-full h-full object-cover object-top" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Competitions & Extracurricular Excellence */}
            <section className="py-16 px-4 sm:px-6 bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center space-x-2 py-1 px-2.5 rounded-sm bg-school-green-100 text-[10px] uppercase font-bold text-school-green-800 mb-2">
                            <span>Beyond The Classroom</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                            Excellence in Competition & Athletics
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* NSMQ Highlight */}
                        <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                            <div className="aspect-[3/2] sm:h-64 overflow-hidden relative">
                                <img
                                    src="/nsmq_2025.jpg"
                                    alt="National Science and Maths Quiz Qualifiers"
                                    className="w-full h-full object-cover object-top"
                                />
                                <div className="absolute top-3 left-3">
                                    <span className="bg-yellow-400 text-yellow-950 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm border border-yellow-500/50">
                                        NSMQ 2025
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex-grow flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">National Science & Maths Quiz Qualifiers</h3>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        Our competitive science squad secured key regional qualifier victories, establishing ASASHS on the national STEM competition map.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
                                    Department of Science & Mathematics
                                </div>
                            </div>
                        </div>

                        {/* Sports Highlight */}
                        <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                            <div className="aspect-[3/2] sm:h-64 overflow-hidden relative">
                                <img
                                    src="/sports_action.jpg"
                                    alt="School Handball and Sports"
                                    className="w-full h-full object-cover object-top"
                                />
                                <div className="absolute top-3 left-3">
                                    <span className="bg-school-green-700 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm border border-school-green-800">
                                        Super Zonals 2025
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex-grow flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Zonal Handball Champions</h3>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        Dominating the Kukurantumi Zone to qualify for the Super Zonals 2025, demonstrating teamwork, tactical discipline, and physical excellence.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
                                    Physical Education & Sports Directorate
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Academic Departments (Clean SVG Icons - No Raw Emojis) */}
            <section className="py-16 px-4 sm:px-6 bg-white border-b border-gray-200" id="academics">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center space-x-2 py-1 px-2.5 rounded-sm bg-school-green-50 border border-school-green-200 text-[10px] uppercase font-bold text-school-green-800 mb-2">
                            <span>Curriculum</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                            Academic Programmes & Departments
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            { 
                                title: "General Science", 
                                desc: "Physics, Chemistry, Biology, and Elective Mathematics preparing students for medicine, engineering, and STEM careers.",
                                icon: (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                )
                            },
                            { 
                                title: "General Arts", 
                                desc: "Literature-in-English, History, Government, Economics, Geography, and Ghanaian Language.",
                                icon: (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                )
                            },
                            { 
                                title: "Business", 
                                desc: "Financial Accounting, Business Management, Cost Accounting, Principles of Costing, and Economics.",
                                icon: (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                )
                            },
                            { 
                                title: "Visual Arts", 
                                desc: "General Knowledge in Art (GKA), Textiles, Leatherwork, Graphic Design, Ceramics, and Sculpture.",
                                icon: (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )
                            },
                            { 
                                title: "Home Economics", 
                                desc: "Food & Nutrition, Management in Living, Clothing & Textiles, and General Knowledge in Art.",
                                icon: (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                )
                            },
                            { 
                                title: "General Agriculture", 
                                desc: "General Agriculture, Crop Husbandry, Animal Husbandry, Chemistry, and Physics foundations.",
                                icon: (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                )
                            }
                        ].map((dept, idx) => (
                            <div 
                                key={idx} 
                                className="bg-white p-6 rounded-md border border-gray-200 shadow-sm hover:border-school-green-600 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-sm bg-school-green-50 border border-school-green-200 text-school-green-800 flex items-center justify-center mb-4">
                                    {dept.icon}
                                </div>
                                <h3 className="text-base font-bold text-gray-900 mb-2">{dept.title}</h3>
                                <p className="text-gray-600 text-xs leading-relaxed">{dept.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Campus Life Visual Gallery */}
            <section className="py-16 px-4 sm:px-6 bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center space-x-2 py-1 px-2.5 rounded-sm bg-school-green-100 text-[10px] uppercase font-bold text-school-green-800 mb-2">
                            <span>Campus Experience</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                            Life at Akim Asafo Senior High
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="rounded-md border border-gray-200 overflow-hidden shadow-sm aspect-[3/4] sm:aspect-[4/3] md:aspect-auto md:h-80">
                            <img
                                src="/student_portrait.jpg"
                                alt="ASASHS Student Leader"
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                        <div className="rounded-md border border-gray-200 overflow-hidden shadow-sm aspect-[4/3] md:aspect-auto md:h-80">
                            <img
                                src="/student_group_1.jpg"
                                alt="Academic Discussion on Campus"
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                        <div className="rounded-md border border-gray-200 overflow-hidden shadow-sm aspect-[3/4] sm:aspect-[4/3] md:aspect-auto md:h-80">
                            <img
                                src="/student_group_2.jpg"
                                alt="Students in Quadrangle"
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Institutional Telemetry & Key Facts */}
            <section className="py-12 bg-school-green-900 text-white border-b border-school-green-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-center">
                        <div className="p-4 rounded-md bg-white/5 border border-white/10 md:border-0 md:bg-transparent">
                            <p className="text-2xl sm:text-4xl font-extrabold tabular-nums mb-1">1991</p>
                            <p className="text-[10px] uppercase tracking-widest text-school-green-200 font-semibold">Year Founded</p>
                        </div>
                        <div className="p-4 rounded-md bg-white/5 border border-white/10 md:border-0 md:bg-transparent">
                            <p className="text-xl sm:text-3xl font-extrabold mb-1">Day & Boarding</p>
                            <p className="text-[10px] uppercase tracking-widest text-school-green-200 font-semibold">Accommodation</p>
                        </div>
                        <div className="p-4 rounded-md bg-white/5 border border-white/10 md:border-0 md:bg-transparent">
                            <p className="text-xl sm:text-3xl font-extrabold mb-1">Public (GES)</p>
                            <p className="text-[10px] uppercase tracking-widest text-school-green-200 font-semibold">School Category</p>
                        </div>
                        <div className="p-4 rounded-md bg-white/5 border border-white/10 md:border-0 md:bg-transparent">
                            <p className="text-2xl sm:text-4xl font-extrabold font-mono tabular-nums mb-1">0021306</p>
                            <p className="text-[10px] uppercase tracking-widest text-school-green-200 font-semibold">GES School Code</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Admissions Banner */}
            <section className="py-20 px-4 sm:px-6 bg-gray-950 text-white relative" id="admissions">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center space-x-2 py-1 px-3 rounded-sm bg-white/10 text-[10px] uppercase tracking-wider font-bold mb-4 border border-white/15">
                        <span>Admissions 2025/2026</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 tracking-tight">
                        Enroll at Akim Asafo Senior High
                    </h2>
                    <p className="text-sm sm:text-base text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed font-normal">
                        Join the municipality's Best Performing Senior High School. Prepare for high academic attainment in a disciplined, supportive environment.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <button
                            onClick={() => window.open('https://www.myshsadmission.net/site/schools/ASASHS/', '_blank')}
                            className="px-6 py-3 bg-school-green-700 hover:bg-school-green-800 text-white rounded-sm font-bold text-xs uppercase tracking-wider transition-colors border border-school-green-600 shadow-sm min-h-[44px]"
                        >
                            Apply via Online Portal
                        </button>
                        <button 
                            onClick={onLoginClick} 
                            className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-sm font-bold text-xs uppercase tracking-wider transition-colors border border-gray-700 min-h-[44px]"
                        >
                            Student & Staff Login
                        </button>
                    </div>
                </div>
            </section>

            {/* Institutional Footer */}
            <LandingFooter 
                onLoginClick={onLoginClick} 
                onNewsClick={onNewsClick} 
                onStaffClick={onStaffClick} 
                onCalendarClick={onCalendarClick} 
            />
        </div>
    );
};
