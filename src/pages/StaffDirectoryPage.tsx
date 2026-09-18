import React, { useState } from 'react';
import { LandingFooter } from '../components/LandingFooter';

interface StaffMember {
    name: string;
    role: string;
    department: 'Administration' | 'Science' | 'Arts' | 'Business';
    image: string;
    bio: string;
}

interface StaffDirectoryPageProps {
    onLoginClick: () => void;
    onNewsClick?: () => void;
    onCalendarClick?: () => void;
    onHomeClick?: () => void;
}

export const StaffDirectoryPage: React.FC<StaffDirectoryPageProps> = ({ 
    onLoginClick, 
    onNewsClick, 
    onCalendarClick, 
    onHomeClick 
}) => {
    const [selectedDepartment, setSelectedDepartment] = useState<string>('All');

    const staff: StaffMember[] = [
        {
            name: "Mr. Ebenezer Baafi",
            role: "Headmaster",
            department: "Administration",
            image: "/administration.jpg",
            bio: "Leading ASASHS with over two decades of experience in secondary educational administration and institutional development."
        },
        {
            name: "Mrs. Sarah Mensah",
            role: "Assistant Headmistress (Academic)",
            department: "Administration",
            image: "/teacher_1.jpg",
            bio: "Overseeing curriculum compliance, assessment integrity, teacher lesson delivery, and academic record management."
        },
        {
            name: "Mr. Kwaku Owusu",
            role: "Head of Science Department",
            department: "Science",
            image: "/teacher_2.jpg",
            bio: "Coordinating STEM instructional delivery, laboratory sessions, and regional NSMQ preparation initiatives."
        },
        {
            name: "Ms. Ama Serwaa",
            role: "Head of Arts Department",
            department: "Arts",
            image: "/teacher_3.jpg",
            bio: "Directing the humanities faculty, literary societies, debating competitions, and cultural heritage initiatives."
        }
    ];

    const departments = ['All', 'Administration', 'Science', 'Arts'];

    const filteredStaff = selectedDepartment === 'All'
        ? staff
        : staff.filter(m => m.department === selectedDepartment);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Page Header */}
            <section className="bg-gray-950 text-white pt-28 pb-16 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="inline-flex items-center space-x-2 py-1 px-2.5 rounded-sm bg-school-green-950 border border-school-green-800 text-[10px] uppercase font-bold text-school-green-300 mb-3">
                        <span>Faculty & Administration</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
                        Staff Directory
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-300 max-w-2xl">
                        Meet the leadership, heads of department, and educators driving academic attainment and student character at Akim Asafo Senior High School.
                    </p>
                </div>
            </section>

            {/* Department Filter Bar */}
            <section className="bg-white border-b border-gray-200 sticky top-12 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center space-x-1.5 overflow-x-auto">
                        {departments.map((dept) => (
                            <button
                                key={dept}
                                onClick={() => setSelectedDepartment(dept)}
                                className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors min-h-[36px] ${
                                    selectedDepartment === dept
                                        ? 'bg-school-green-700 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Staff Grid */}
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredStaff.map((member, index) => (
                            <div 
                                key={index} 
                                className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between hover:border-school-green-600 transition-colors"
                            >
                                <div>
                                    <div className="h-60 overflow-hidden border-b border-gray-100 bg-gray-100">
                                        <img 
                                            src={member.image} 
                                            alt={member.name} 
                                            className="w-full h-full object-cover object-top" 
                                        />
                                    </div>
                                    <div className="p-5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border border-school-green-200 bg-school-green-50 text-school-green-800 inline-block mb-2.5">
                                            {member.department}
                                        </span>
                                        <h3 className="text-base font-bold text-gray-900 mb-1">
                                            {member.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-semibold mb-3">
                                            {member.role}
                                        </p>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            {member.bio}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-5 pt-0">
                                    <div className="pt-3 border-t border-gray-100 text-[11px] text-school-green-700 font-semibold uppercase tracking-wider">
                                        ASASHS Staff Roster
                                    </div>
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
                onStaffClick={() => {}} 
                onCalendarClick={onCalendarClick} 
            />
        </div>
    );
};
