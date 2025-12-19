import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { PortalInput } from '../../components/PortalInput';

interface Student {
  id: string;
  studentId: string;
  fullName: string;
  className: string;
  house: string;
  form: number;
  course: string;
  profilePicture?: string;
}

interface StudentProfileProps {
  student: Student;
  onLogout: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ student }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: student.fullName,
    className: student.className,
    house: student.house,
    course: student.course,
    contact: {
      address: '',
      phone: '',
      email: ''
    },
    guardian: {
      name: '',
      relationship: '',
      contact: ''
    }
  });

  const handleSave = () => {
    // In a real implementation, this would save to the database
    toast.success('Profile updated successfully! Changes will be reviewed by admin.');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    // In a real implementation, this would open a password change modal
    toast.success('Password change feature will be implemented soon.');
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <PortalCard>
        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
          <div className="bg-school-green-100 rounded-full p-2">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 flex items-center justify-center">
              <span className="text-4xl text-school-green-600 font-bold">
                {student.fullName.charAt(0)}
              </span>
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{student.fullName}</h1>
            <p className="text-school-green-600 text-lg">Student Profile</p>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-school-cream-100 rounded-xl p-3">
                <div className="text-sm text-gray-600">Student ID</div>
                <div className="text-lg font-bold">{student.studentId}</div>
              </div>
              <div className="bg-school-cream-100 rounded-xl p-3">
                <div className="text-sm text-gray-600">Class</div>
                <div className="text-lg font-bold">{student.className}</div>
              </div>
              <div className="bg-school-cream-100 rounded-xl p-3">
                <div className="text-sm text-gray-600">House</div>
                <div className="text-lg font-bold">{student.house}</div>
              </div>
              <div className="bg-school-cream-100 rounded-xl p-3">
                <div className="text-sm text-gray-600">Course</div>
                <div className="text-lg font-bold">{student.course}</div>
              </div>
            </div>
          </div>
        </div>
      </PortalCard>

      {/* Profile Actions */}
      <PortalCard>
        <div className="flex flex-wrap gap-4">
          <PortalButton
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "secondary" : "primary"}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </PortalButton>
          
          <PortalButton
            onClick={handleChangePassword}
            variant="outline"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Change Password
          </PortalButton>
        </div>
      </PortalCard>

      {/* Personal Information */}
      <PortalCard title="Personal Information">
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <PortalInput
                label="Full Name"
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
              />
            </div>
            
            <div>
              <PortalInput
                label="Date of Birth"
                type="date"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            
            <div>
              <PortalInput
                label="Nationality"
                type="text"
                defaultValue="Ghanaian"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{student.fullName}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">-</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium">-</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Nationality</p>
              <p className="font-medium">Ghanaian</p>
            </div>
          </div>
        )}
      </PortalCard>

      {/* Academic Information */}
      <PortalCard title="Academic Information">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Class</p>
            <p className="font-medium">{student.className}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Programme</p>
            <p className="font-medium">{student.course}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">House</p>
            <p className="font-medium">{student.house}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Index Number</p>
            <p className="font-medium">-</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Form</p>
            <p className="font-medium">{student.form}</p>
          </div>
        </div>
      </PortalCard>

      {/* Contact Information */}
      <PortalCard title="Contact Information">
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <PortalInput
                label="Address"
                as="textarea"
                rows={3}
                value={profileData.contact.address}
                onChange={(e) => setProfileData({...profileData, contact: {...profileData.contact, address: e.target.value}})}
              />
            </div>
            
            <div>
              <PortalInput
                label="Phone"
                type="tel"
                value={profileData.contact.phone}
                onChange={(e) => setProfileData({...profileData, contact: {...profileData.contact, phone: e.target.value}})}
              />
            </div>
            
            <div>
              <PortalInput
                label="Email"
                type="email"
                value={profileData.contact.email}
                onChange={(e) => setProfileData({...profileData, contact: {...profileData.contact, email: e.target.value}})}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{profileData.contact.address || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{profileData.contact.phone || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{profileData.contact.email || 'Not provided'}</p>
            </div>
          </div>
        )}
      </PortalCard>

      {/* Parent/Guardian Information */}
      <PortalCard title="Parent/Guardian Information">
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <PortalInput
                label="Name"
                type="text"
                value={profileData.guardian.name}
                onChange={(e) => setProfileData({...profileData, guardian: {...profileData.guardian, name: e.target.value}})}
              />
            </div>
            
            <div>
              <PortalInput
                label="Relationship"
                type="text"
                value={profileData.guardian.relationship}
                onChange={(e) => setProfileData({...profileData, guardian: {...profileData.guardian, relationship: e.target.value}})}
              />
            </div>
            
            <div>
              <PortalInput
                label="Contact"
                type="text"
                value={profileData.guardian.contact}
                onChange={(e) => setProfileData({...profileData, guardian: {...profileData.guardian, contact: e.target.value}})}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{profileData.guardian.name || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Relationship</p>
              <p className="font-medium">{profileData.guardian.relationship || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Contact</p>
              <p className="font-medium">{profileData.guardian.contact || 'Not provided'}</p>
            </div>
          </div>
        )}
      </PortalCard>

      {/* Save Button when editing */}
      {isEditing && (
        <PortalCard>
          <div className="flex justify-end space-x-4">
            <PortalButton
              onClick={() => setIsEditing(false)}
              variant="secondary"
            >
              Cancel
            </PortalButton>
            <PortalButton
              onClick={handleSave}
              variant="primary"
            >
              Save Changes
            </PortalButton>
          </div>
        </PortalCard>
      )}
    </div>
  );
};