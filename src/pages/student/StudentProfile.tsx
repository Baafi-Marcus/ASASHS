import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { PortalInput } from '../../components/PortalInput';
import { UserAvatar } from '../../components/UserAvatar';

interface Student {
  id: string;
  studentId: string;
  fullName: string;
  className: string;
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
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: student.fullName,
    className: student.className,
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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // In a real implementation, this would save to the database
      toast.success('Profile changes submitted for administration review');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
    toast('Use the password management option in your account settings.', { icon: 'ℹ️' });
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <UserAvatar name={student.fullName} size="xl" status="online" className="ring-2 ring-school-green-700/20" />
          
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">{student.fullName}</h1>
                <p className="text-xs text-school-green-700 font-semibold mt-0.5">Official Student Record</p>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-end">
                <PortalButton
                  size="sm"
                  variant={isEditing ? "secondary" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Contact Info'}
                </PortalButton>
                <PortalButton
                  size="sm"
                  variant="outline"
                  onClick={handleChangePassword}
                >
                  Change Password
                </PortalButton>
              </div>
            </div>
            
            {/* Quick Metadata Strip */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 border border-gray-200/80 rounded-sm p-2.5">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Student ID</span>
                <span className="text-sm font-bold tabular-nums text-gray-900">{student.studentId || student.id}</span>
              </div>
              <div className="bg-gray-50 border border-gray-200/80 rounded-sm p-2.5">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Class</span>
                <span className="text-sm font-bold text-gray-900">{student.className || '-'}</span>
              </div>
              <div className="bg-gray-50 border border-gray-200/80 rounded-sm p-2.5">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Programme</span>
                <span className="text-sm font-bold text-gray-900 truncate block">{student.course || '-'}</span>
              </div>
              <div className="bg-gray-50 border border-gray-200/80 rounded-sm p-2.5">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Form</span>
                <span className="text-sm font-bold tabular-nums text-gray-900">{student.form ? `Form ${student.form}` : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <PortalCard title="Personal Information">
        {isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PortalInput
              label="Full Name"
              type="text"
              value={profileData.fullName}
              onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
            />
            <PortalInput
              label="Date of Birth"
              type="date"
            />
            <PortalInput
              label="Gender"
              as="select"
              defaultValue="Male"
            >
              <option>Male</option>
              <option>Female</option>
            </PortalInput>
            <PortalInput
              label="Nationality"
              type="text"
              defaultValue="Ghanaian"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">Full Name</p>
              <p className="font-medium text-gray-900 mt-1">{student.fullName}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">Date of Birth</p>
              <p className="font-medium text-gray-900 mt-1 tabular-nums">-</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">Gender</p>
              <p className="font-medium text-gray-900 mt-1">-</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">Nationality</p>
              <p className="font-medium text-gray-900 mt-1">Ghanaian</p>
            </div>
          </div>
        )}
      </PortalCard>

      {/* Academic Information */}
      <PortalCard title="Academic Details">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">Class</p>
            <p className="font-medium text-gray-900 mt-1">{student.className || '-'}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">Programme</p>
            <p className="font-medium text-gray-900 mt-1">{student.course || '-'}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">Index Number</p>
            <p className="font-medium text-gray-900 mt-1 tabular-nums">-</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">Form Level</p>
            <p className="font-medium text-gray-900 mt-1 tabular-nums">{student.form ? `Form ${student.form}` : '-'}</p>
          </div>
        </div>
      </PortalCard>

      {/* Contact Information */}
      <PortalCard title="Contact & Address">
        {isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <PortalInput
                label="Residential Address"
                as="textarea"
                rows={2}
                value={profileData.contact.address}
                onChange={(e) => setProfileData({...profileData, contact: {...profileData.contact, address: e.target.value}})}
              />
            </div>
            <PortalInput
              label="Contact Phone"
              type="tel"
              value={profileData.contact.phone}
              onChange={(e) => setProfileData({...profileData, contact: {...profileData.contact, phone: e.target.value}})}
            />
            <PortalInput
              label="Email Address"
              type="email"
              value={profileData.contact.email}
              onChange={(e) => setProfileData({...profileData, contact: {...profileData.contact, email: e.target.value}})}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">Residential Address</p>
              <p className="font-medium text-gray-900 mt-1">{profileData.contact.address || '-'}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">Contact Phone</p>
              <p className="font-medium text-gray-900 mt-1 tabular-nums">{profileData.contact.phone || '-'}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">Email Address</p>
              <p className="font-medium text-gray-900 mt-1">{profileData.contact.email || '-'}</p>
            </div>
          </div>
        )}
      </PortalCard>

      {/* Parent/Guardian Information */}
      <PortalCard title="Parent / Guardian Details">
        {isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PortalInput
              label="Guardian Name"
              type="text"
              value={profileData.guardian.name}
              onChange={(e) => setProfileData({...profileData, guardian: {...profileData.guardian, name: e.target.value}})}
            />
            <PortalInput
              label="Relationship"
              type="text"
              value={profileData.guardian.relationship}
              onChange={(e) => setProfileData({...profileData, guardian: {...profileData.guardian, relationship: e.target.value}})}
            />
            <PortalInput
              label="Emergency Contact Phone"
              type="tel"
              value={profileData.guardian.contact}
              onChange={(e) => setProfileData({...profileData, guardian: {...profileData.guardian, contact: e.target.value}})}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">Guardian Name</p>
              <p className="font-medium text-gray-900 mt-1">{profileData.guardian.name || '-'}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">Relationship</p>
              <p className="font-medium text-gray-900 mt-1">{profileData.guardian.relationship || '-'}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">Emergency Contact</p>
              <p className="font-medium text-gray-900 mt-1 tabular-nums">{profileData.guardian.contact || '-'}</p>
            </div>
          </div>
        )}
      </PortalCard>

      {/* Save Button Bar when editing */}
      {isEditing && (
        <div className="flex justify-end space-x-3 p-4 bg-white rounded-md border border-gray-200">
          <PortalButton
            onClick={() => setIsEditing(false)}
            variant="outline"
            size="sm"
            disabled={isSaving}
          >
            Cancel
          </PortalButton>
          <PortalButton
            onClick={handleSave}
            variant="primary"
            size="sm"
            loading={isSaving}
            loadingText="Saving Changes..."
          >
            Save Changes
          </PortalButton>
        </div>
      )}
    </div>
  );
};