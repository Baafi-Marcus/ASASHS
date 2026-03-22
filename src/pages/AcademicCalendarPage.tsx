import React from 'react';
import { LandingNavbar } from '../components/LandingNavbar';
import { LandingFooter } from '../components/LandingFooter';

interface CalendarEvent {
    date: string;
    title: string;
    category: 'Academic' | 'Holiday' | 'Event';
}

interface AcademicCalendarPageProps {
    onLoginClick: () => void;
    onNewsClick?: () => void;
    onStaffClick?: () => void;
}

export const AcademicCalendarPage: React.FC<AcademicCalendarPageProps> = ({ 
    onLoginClick,
    onNewsClick,
    onStaffClick
}) => {
    const events: CalendarEvent[] = [
        { date: "May 15, 2025", title: "First Semester Resumption", category: "Academic" },
        { date: "June 10, 2025", title: "Mid-Term Break", category: "Academic" },
        { date: "July 01, 2025", title: "Republic Day", category: "Holiday" },
        { date: "August 12, 2025", title: "Final Examinations Begin", category: "Academic" },
        { date: "August 28, 2025", title: "Vacation", category: "Holiday" }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <LandingNavbar onLoginClick={onLoginClick} />
            
            <section className="relative h-[300px] flex items-center justify-center overflow-hidden text-white">
                <div className="absolute inset-0 bg-school-green-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase">Academic Calendar</h1>
                    <p className="text-xl text-school-green-100">Plan ahead for the 2024/2025 academic year.</p>
                </div>
            </section>

            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="p-8 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Key Dates</h2>
                            <span className="px-4 py-1.5 bg-school-green-100 text-school-green-800 rounded-full text-xs font-black uppercase">2024/2025 Session</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {events.map((event, index) => (
                                <div key={index} className="p-8 flex items-center justify-between hover:bg-school-green-50 transition-colors">
                                    <div className="flex items-center space-x-6">
                                        <div className="bg-white w-16 h-16 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">{event.date.split(' ')[0]}</span>
                                            <span className="text-xl font-black text-gray-900">{event.date.split(' ')[1].replace(',', '')}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                event.category === 'Academic' ? 'text-blue-600' : 
                                                event.category === 'Holiday' ? 'text-red-500' : 'text-amber-500'
                                            }`}>{event.category}</span>
                                        </div>
                                    </div>
                                    <div className="hidden md:block">
                                        <span className="text-sm font-medium text-gray-400">{event.date.split(', ')[1]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <LandingFooter 
                onLoginClick={onLoginClick} 
                onNewsClick={onNewsClick}
                onStaffClick={onStaffClick}
                onCalendarClick={() => {}} // Already on calendar page
            />
        </div>
    );
};
