import React, { useState } from 'react';
import { LandingFooter } from '../components/LandingFooter';

interface CalendarEvent {
    date: string;
    day: string;
    month: string;
    year: string;
    title: string;
    category: 'Academic' | 'Holiday' | 'Event';
    desc?: string;
}

interface AcademicCalendarPageProps {
    onLoginClick: () => void;
    onNewsClick?: () => void;
    onStaffClick?: () => void;
    onHomeClick?: () => void;
}

export const AcademicCalendarPage: React.FC<AcademicCalendarPageProps> = ({ 
    onLoginClick,
    onNewsClick,
    onStaffClick,
    onHomeClick
}) => {
    const [filter, setFilter] = useState<'All' | 'Academic' | 'Holiday' | 'Event'>('All');

    const events: CalendarEvent[] = [
        { 
            date: "May 15, 2025", 
            day: "15", 
            month: "MAY", 
            year: "2025", 
            title: "First Semester Resumption", 
            category: "Academic",
            desc: "Reporting of all boarding and day students for the start of the first academic term."
        },
        { 
            date: "June 10, 2025", 
            day: "10", 
            month: "JUN", 
            year: "2025", 
            title: "Mid-Term Assessment & Break", 
            category: "Academic",
            desc: "Continuous Assessment Tests (CAT-1) conclude followed by a four-day mid-term recess."
        },
        { 
            date: "July 01, 2025", 
            day: "01", 
            month: "JUL", 
            year: "2025", 
            title: "Republic Day", 
            category: "Holiday",
            desc: "Statutory national holiday observed across all academic departments."
        },
        { 
            date: "August 12, 2025", 
            day: "12", 
            month: "AUG", 
            year: "2025", 
            title: "End of Semester Examinations Begin", 
            category: "Academic",
            desc: "Official hall-scheduled terminal examinations for SHS 1, 2, and 3 candidates."
        },
        { 
            date: "August 28, 2025", 
            day: "28", 
            month: "AUG", 
            year: "2025", 
            title: "Official Vacation & Student Departure", 
            category: "Holiday",
            desc: "End-of-term closing assemblies, report card release, and boarding house closure."
        }
    ];

    const filteredEvents = filter === 'All' ? events : events.filter(e => e.category === filter);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Page Header */}
            <section className="bg-gray-950 text-white pt-28 pb-16 border-b border-gray-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="inline-flex items-center space-x-2 py-1 px-2.5 rounded-sm bg-school-green-950 border border-school-green-800 text-[10px] uppercase font-bold text-school-green-300 mb-3">
                        <span>Official Schedule</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
                        Academic Calendar
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-300">
                        Official semester timeline, continuous assessment schedules, and statutory breaks for the 2024/2025 academic session.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <main className="flex-grow py-12 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Control / Filter Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex items-center space-x-1.5 p-1 bg-white border border-gray-200 rounded-md">
                            {(['All', 'Academic', 'Holiday'] as const).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors ${
                                        filter === cat
                                            ? 'bg-school-green-700 text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Session: <span className="text-gray-900 font-bold tabular-nums">2024/2025</span>
                        </span>
                    </div>

                    {/* Events Table Container */}
                    <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-200">
                        {filteredEvents.map((event, index) => (
                            <div 
                                key={index} 
                                className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/75 transition-colors"
                            >
                                <div className="flex items-start space-x-4">
                                    {/* Date Stamp Tile */}
                                    <div className="w-14 h-14 rounded-sm border border-gray-200 bg-gray-50 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">
                                            {event.month}
                                        </span>
                                        <span className="text-xl font-extrabold text-gray-900 tabular-nums leading-tight mt-0.5">
                                            {event.day}
                                        </span>
                                    </div>

                                    {/* Event Details */}
                                    <div>
                                        <div className="flex items-center space-x-2.5 mb-1">
                                            <h3 className="text-sm sm:text-base font-bold text-gray-900">
                                                {event.title}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${
                                                event.category === 'Academic' 
                                                    ? 'bg-blue-50 text-blue-800 border-blue-200' 
                                                    : event.category === 'Holiday'
                                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                            }`}>
                                                {event.category}
                                            </span>
                                        </div>
                                        {event.desc && (
                                            <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
                                                {event.desc}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="sm:text-right shrink-0">
                                    <span className="text-xs font-mono font-semibold text-gray-400 tabular-nums">
                                        {event.year}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Institutional Footer */}
            <LandingFooter 
                onLoginClick={onLoginClick} 
                onNewsClick={onNewsClick} 
                onStaffClick={onStaffClick} 
                onCalendarClick={() => {}} 
            />
        </div>
    );
};
