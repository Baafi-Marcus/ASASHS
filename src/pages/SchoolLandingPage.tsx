import React from 'react';
import { LandingNavbar } from '../components/LandingNavbar';
import { LandingFooter } from '../components/LandingFooter';

interface SchoolLandingPageProps {
    onLoginClick: () => void;
    onNewsClick?: () => void;
}

export const SchoolLandingPage: React.FC<SchoolLandingPageProps> = ({ onLoginClick, onNewsClick }) => {
    return (
        <div className="min-h-screen bg-white font-sans">
            <LandingNavbar onLoginClick={onLoginClick} />

            {/* Hero Section */}
            <section className="relative h-screen min-h-[600px] flex items-center justify-center bg-gray-900 overflow-hidden">
                {/* Background Overlay with Slideshow Effect */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10" />
                    <img
                        src="/hero_school_building.jpg"
                        alt="Akim Asafo Senior High School"
                        className="w-full h-full object-cover scale-105 animate-slow-zoom"
                    />
                </div>

                {/* Hero Content */}
                <div className="relative z-20 text-center text-white px-4 max-w-5xl mx-auto pt-20 md:pt-0 md:mt-[-50px]">
                    <span className="inline-block py-1 px-3 rounded-full bg-school-green-500/80 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-sm border border-white/20 animate-fade-in">
                        Est. 1991 • Center of Excellence
                    </span>
                    <h1 className="text-3xl md:text-7xl font-extrabold mb-6 leading-tight animate-slide-up">
                        Welcome to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-school-green-400 to-yellow-400">
                            Akim Asafo Senior High
                        </span>
                    </h1>
                    <p className="text-base md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto font-light animate-slide-up [animation-delay:200ms]">
                        Providing holistic quality education, inculcating Godliness and moral uprightness for over three decades.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 animate-slide-up [animation-delay:400ms]">
                        <button
                            onClick={() => window.open('https://www.myshsadmission.net/site/schools/ASASHS/', '_blank')}
                            className="px-6 py-3 md:px-8 md:py-4 bg-school-green-600 hover:bg-school-green-700 text-white rounded-full font-bold text-base md:text-lg transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-school-green-500/50"
                        >
                            Explore Admissions
                        </button>
                        <button className="px-6 py-3 md:px-8 md:py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-2 border-white/30 rounded-full font-bold text-base md:text-lg transition-all transform hover:-translate-y-1">
                            Take a Tour
                        </button>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
                    <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>

            {/* Quick Action Cards (Floating overlap) */}
            <section className="relative z-30 mt-[-60px] md:mt-[-80px] px-4 mb-12 md:mb-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {[
                        {
                            title: "Online Admission",
                            desc: "Check your placement and start registration for the new academic year.",
                            icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                            color: "bg-blue-600",
                            action: () => window.open('https://www.myshsadmission.net/site/schools/ASASHS/', '_blank')
                        },
                        {
                            title: "Student Portal",
                            desc: "Access your grades, timetable and resources. Login required.",
                            icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                            color: "bg-school-green-600",
                            action: onLoginClick
                        },
                        {
                            title: "Latest News",
                            desc: "Best Performing SHS Award (2025) & National Debate Winners.",
                            icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
                            color: "bg-yellow-500",
                            action: onNewsClick
                        }
                    ].map((card, idx) => (
                        <div
                            key={idx}
                            onClick={card.action}
                            className={`${card.color} rounded-xl p-4 md:p-8 text-white shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden group`}
                        >
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="flex items-start space-x-4 md:block">
                                <svg className="w-8 h-8 md:w-10 md:h-10 mb-0 md:mb-4 text-white/90 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                                </svg>
                                <div>
                                    <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 leading-tight">{card.title}</h3>
                                    <p className="text-white/85 text-[11px] md:text-sm leading-snug line-clamp-2 md:line-clamp-none">{card.desc}</p>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-6 flex items-center text-[10px] md:text-sm font-bold uppercase tracking-wide">
                                <span>Access Now</span>
                                <svg className="w-3 h-3 md:w-4 md:h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* History & Mission Section */}
            <section className="py-16 px-4 bg-white" id="about">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-school-green-100 rounded-3xl transform rotate-3 scale-95 group-hover:rotate-1 transition-transform"></div>
                        {/* Using a professional placeholder for Headmistress/Principal as specific one wasn't public */}
                        <img
                            src="/headmistress.jpg"
                            alt="Headmistress"
                            className="relative z-10 rounded-3xl shadow-2xl w-full h-72 md:h-[500px] object-cover hover:grayscale-0 transition-all duration-500"
                        />
                        <div className="absolute -bottom-6 -right-6 z-20 bg-white p-6 rounded-xl shadow-xl max-w-xs border-l-4 border-school-green-600">
                            <p className="text-gray-900 font-serif italic text-lg leading-relaxed">
                                "Education is the formation of character and values, not just intellect."
                            </p>
                            <div className="mt-4 flex items-center">
                                <div>
                                    <p className="font-bold text-gray-900">Mrs. Ama Thompson</p>
                                    <p className="text-xs text-school-green-600 uppercase font-bold">Headmistress</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <span className="text-school-green-600 font-bold tracking-wider uppercase text-sm mb-2 block">Our Heritage</span>
                        <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">History of ASASHS</h2>
                        <div className="prose prose-lg text-gray-600 mb-8">
                            <p className="mb-4">
                                Akim Asafo Senior High School was established as a community school on <strong className="text-gray-900">18th February 1991</strong>, under its first Headmaster Mr. Kyere Alexander Kofi. The school started at the present Methodist JHS premises with seven (7) students but was later moved to its present site in 1994. The first student enrolled in the school was Master Karim Ibrahim.
                            </p>
                            <p className="mb-4">
                                In 1996, American Baptist Missionaries visited and adopted the school, renaming it to <em className="text-gray-800">Akim Asafo St. Paul’s Community Secondary School</em>. Following the government's decision to rename all secondary schools, it eventually metamorphosed into its current name, Akim Asafo Senior High School.
                            </p>
                            <p>
                                Situated in the East Akim Municipality of the Eastern Region on the major Accra - Kumasi road, the school is named after the historical town 'Akyem Asafo'.
                            </p>
                        </div>

                        <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                            <img
                                src="/administration.jpg"
                                alt="School Administration"
                                className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                                <h3 className="text-white font-bold text-xl">School Administration</h3>
                                <p className="text-gray-200 text-sm">Dedicated leadership driving excellence.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mission Section */}
                <div className="max-w-7xl mx-auto mt-20 bg-school-cream-50 p-6 md:p-10 rounded-3xl border border-school-cream-200">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
                        <div className="lg:col-span-2">
                            <span className="text-school-green-600 font-bold tracking-wider uppercase text-sm mb-2 block">Our Purpose</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">Mission Statement</h2>
                            <blockquote className="text-xl text-gray-700 italic leading-relaxed mb-6 border-l-4 border-school-green-500 pl-4">
                                "To ensure that every student who has passed through the walls of the school is given a holistic quality education. We seek to inculcate in students Godliness and moral uprightness as well as help bring out the potentials in them for a lifelong personal responsibility..."
                            </blockquote>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                                <img
                                    src="/student_art.jpg"
                                    alt="Student with Artwork"
                                    className="w-full h-48 object-cover object-top transform group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                                <img
                                    src="/students_campus.jpg"
                                    alt="Students on Campus"
                                    className="w-full h-48 object-cover object-top transform group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NSMQ & Sports Highlights Section (Visual Rich) */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-school-green-600 font-bold tracking-wider uppercase text-sm mb-2 block">Beyond The Classroom</span>
                        <h2 className="text-4xl font-bold text-gray-900 font-serif">Excellence in Competitions</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* NSMQ Card */}
                        <div className="relative group overflow-hidden rounded-3xl shadow-lg h-[400px]">
                            <img
                                src="/nsmq_2025.jpg"
                                alt="NSMQ 2025 Regional Qualifiers"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded mb-3 inline-block">NSMQ 2025</span>
                                    <h3 className="text-2xl font-bold text-white mb-2">National Science & Maths Quiz</h3>
                                    <p className="text-gray-300 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        Our brilliant team secured key victories, placing us on the national map for academic excellence in STEM.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Sports Card */}
                        <div className="relative group overflow-hidden rounded-3xl shadow-lg h-[400px]">
                            <img
                                src="/sports_action.jpg"
                                alt="School Sports Action"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">Sports</span>
                                    <h3 className="text-2xl font-bold text-white mb-2">Zonal Handball Champions</h3>
                                    <p className="text-gray-300 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        Dominating the Kukurantumi Zone and qualifying for Super Zonals 2025. Experience the spirit of our champions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Departments Grid */}
            <section className="py-20 px-4 bg-gray-50" id="academics">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-school-green-600 font-bold tracking-wider uppercase text-sm mb-2 block">Academics</span>
                        <h2 className="text-4xl font-bold text-gray-900 font-serif">Academic Departments</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { title: "General Science", icon: "🔬", desc: "Physics, Chemistry, Biology, and Elective Mathematics." },
                            { title: "General Arts", icon: "📚", desc: "Literature, History, Government, Economics, and more." },
                            { title: "Business", icon: "📊", desc: "Accounting, Business Management, Costing, and Economics." },
                            { title: "Visual Arts", icon: "🎨", desc: "GKH, Textiles, Leatherwork, Ceramics, and Sculpture." },
                            { title: "Home Economics", icon: "🍳", desc: "Food & Nutrition, Management in Living, and Clothing & Textiles." },
                            { title: "Agriculture", icon: "🌱", desc: "General Agriculture, Crop Husbandry, and Animal Husbandry." }
                        ].map((dept, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-shadow border-b-4 border-transparent hover:border-school-green-500 group">
                                <div className="text-4xl mb-6 bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {dept.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{dept.title}</h3>
                                <p className="text-gray-600 leading-relaxed mb-4">{dept.desc}</p>
                                <a href="#" className="text-school-green-600 font-bold text-sm hover:text-school-green-800 inline-flex items-center">
                                    Learn More
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Student Life Gallery */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-school-green-600 font-bold tracking-wider uppercase text-sm mb-2 block">Campus Life</span>
                        <h2 className="text-4xl font-bold text-gray-900 font-serif">Student Life at ASASHS</h2>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                            A vibrant community where students learn, grow, and build lifelong friendships.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="rounded-2xl overflow-hidden shadow-lg h-96 group">
                            <img
                                src="/student_portrait.jpg"
                                alt="Student Portrait"
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-lg h-96 group">
                            <img
                                src="/student_group_1.jpg"
                                alt="Student Group with Teacher"
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-lg h-96 group">
                            <img
                                src="/student_group_2.jpg"
                                alt="Students in Corridor"
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats - User Provided */}
            <section className="py-16 bg-school-green-800 text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
                        <div>
                            <p className="text-4xl font-bold mb-1">1991</p>
                            <p className="text-xs uppercase tracking-widest text-school-green-200">Year Founded</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold mb-1">Day/Boarding</p>
                            <p className="text-xs uppercase tracking-widest text-school-green-200">Accommodation</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold mb-1">Public</p>
                            <p className="text-xs uppercase tracking-widest text-school-green-200">School Type</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold mb-1">0021306</p>
                            <p className="text-xs uppercase tracking-widest text-school-green-200">School Code</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 px-4 bg-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <img src="/akim-asafo-senior-high.png" className="w-full h-full object-cover grayscale" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-school-green-900/90 to-gray-900/80"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10 text-white">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 font-serif">Open for 2025/2026 Admissions</h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Join the "Best Performing Senior High School" in the municipality. Experience discipline, academic excellence, and cultural vibrancy.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <button
                            onClick={() => window.open('https://www.myshsadmission.net/site/schools/ASASHS/', '_blank')}
                            className="px-10 py-4 bg-white text-school-green-800 rounded-full font-bold text-lg hover:bg-school-cream-50 transition-colors shadow-lg"
                        >
                            Apply Now
                        </button>
                        <button onClick={onLoginClick} className="px-10 py-4 border-2 border-white/30 backdrop-blur-sm text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
                            Access Student Portal
                        </button>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
};
