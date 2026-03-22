import React from 'react';
import { LandingNavbar } from '../components/LandingNavbar';
import { LandingFooter } from '../components/LandingFooter';

interface StaffMember {
    name: string;
    role: string;
    department: string;
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
    const staff: StaffMember[] = [
        {
            name: "Mr. Ebenezer Baafi",
            role: "Headmaster",
            department: "Administration",
            image: "/administration.jpg",
            bio: "Leading ASASHS with over 20 years of experience in educational management."
        },
        {
            name: "Mrs. Sarah Mensah",
            role: "Assistant Headmistress (Academic)",
            department: "Administration",
            image: "/teacher_1.jpg",
            bio: "Ensuring high academic standards and student performance."
        },
        {
            name: "Mr. Kwaku Owusu",
            role: "Head of Science Department",
            department: "Science",
            image: "/teacher_2.jpg",
            bio: "Coordinating STEM excellence and NSMQ preparations."
        },
        {
            name: "Ms. Ama Serwaa",
            role: "Head of Arts Department",
            department: "Arts",
            image: "/teacher_3.jpg",
            bio: "Promoting creative arts and cultural heritage."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="relative h-[300px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-school-green-900">
                    <div className="absolute inset-0 bg-gradient-to-r from-school-green-900 to-black/50"></div>
                </div>
                <div className="relative z-10 text-center text-white px-4">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter">Staff Directory</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">Meet the dedicated team shaping the future at ASASHS.</p>
                </div>
            </section>

            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {staff.map((member, index) => (
                            <div key={index} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
                                <div className="h-64 overflow-hidden">
                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-school-green-600 mb-2 block">{member.department}</span>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                                    <p className="text-sm text-gray-500 font-medium mb-4">{member.role}</p>
                                    <p className="text-xs text-gray-400 leading-relaxed">{member.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <LandingFooter 
                onLoginClick={onLoginClick} 
                onNewsClick={onNewsClick}
                onStaffClick={() => {}} // Already on staff page
                onCalendarClick={onCalendarClick}
            />
        </div>
    );
};
