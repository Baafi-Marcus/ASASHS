import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalInput } from '../../components/PortalInput';
import { PortalButton } from '../../components/PortalButton';

// ---------- Types ----------
interface Programme {
  id: number;
  name: string;
}

interface ClassItem {
  id: number;
  class_name: string;
  form: number;
  stream: string | null;
}

interface Student {
  id: number;
  student_id: string;
  admission_number: string;
  surname: string;
  other_names: string;
  date_of_birth: string;
  gender: string;
  course_id: number;
  current_class_id: number;
  nationality: string;
  hometown: string;
  district_of_origin: string;
  region_of_origin: string;
  guardian_name: string;
  guardian_relationship: string;
  guardian_phone: string;
  guardian_phone_alt: string | null;
  guardian_email: string | null;
  guardian_address: string;
  previous_school: string;
  graduation_year: number;
  known_allergies: string;
  chronic_conditions: string;
  blood_group: string | null;
  enrollment_date: string;
  residential_status: string;
  house_preference: string | null;
}

interface StudentFormProps {
  onSuccess?: (studentData: { admissionNumber: string; password: string }) => void;
  programmes: Programme[];
  classes: ClassItem[];
  student?: Student; // Optional student prop for editing
  onEditSuccess?: () => void; // Callback for edit success
}

export function StudentForm({ onSuccess, programmes, classes, student, onEditSuccess }: StudentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    admission_number: '',
    surname: '',
    other_names: '',
    date_of_birth: '',
    gender: '',
    programme_id: '',
    form: '',
    // Additional fields for full student details
    nationality: 'Ghanaian',
    hometown: '',
    district_of_origin: '',
    region_of_origin: '',
    guardian_name: '',
    guardian_relationship: '',
    guardian_phone: '',
    guardian_phone_alt: '',
    guardian_email: '',
    guardian_address: '',
    previous_school: '',
    graduation_year: new Date().getFullYear(),
    known_allergies: 'None',
    chronic_conditions: 'None',
    blood_group: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    residential_status: 'Day Student',
    house_preference: ''
  });

  useEffect(() => {
    // If student prop is provided, populate the form with student data
    if (student) {
      setFormData({
        admission_number: student.admission_number || '',
        surname: student.surname || '',
        other_names: student.other_names || '',
        date_of_birth: student.date_of_birth || '',
        gender: student.gender || '',
        programme_id: student.course_id?.toString() || '',
        form: '', // This would need to be derived from class information
        nationality: student.nationality || 'Ghanaian',
        hometown: student.hometown || '',
        district_of_origin: student.district_of_origin || '',
        region_of_origin: student.region_of_origin || '',
        guardian_name: student.guardian_name || '',
        guardian_relationship: student.guardian_relationship || '',
        guardian_phone: student.guardian_phone || '',
        guardian_phone_alt: student.guardian_phone_alt || '',
        guardian_email: student.guardian_email || '',
        guardian_address: student.guardian_address || '',
        previous_school: student.previous_school || '',
        graduation_year: student.graduation_year || new Date().getFullYear(),
        known_allergies: student.known_allergies || 'None',
        chronic_conditions: student.chronic_conditions || 'None',
        blood_group: student.blood_group || '',
        enrollment_date: student.enrollment_date || new Date().toISOString().split('T')[0],
        residential_status: student.residential_status || 'Day Student',
        house_preference: student.house_preference || ''
      });
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (student) {
        // Update existing student
        const studentData = {
          admission_number: formData.admission_number,
          programme_id: parseInt(formData.programme_id),
          current_class_id: 1, // Default class, should be calculated based on programme and form
          surname: formData.surname,
          other_names: formData.other_names,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          nationality: formData.nationality,
          hometown: formData.hometown,
          district_of_origin: formData.district_of_origin,
          region_of_origin: formData.region_of_origin,
          guardian_name: formData.guardian_name,
          guardian_relationship: formData.guardian_relationship,
          guardian_phone: formData.guardian_phone,
          guardian_phone_alt: formData.guardian_phone_alt || null,
          guardian_email: formData.guardian_email || null,
          guardian_address: formData.guardian_address,
          previous_school: formData.previous_school,
          graduation_year: formData.graduation_year,
          known_allergies: formData.known_allergies,
          chronic_conditions: formData.chronic_conditions,
          blood_group: formData.blood_group || null,
          enrollment_date: formData.enrollment_date,
          residential_status: formData.residential_status,
          house_preference: formData.house_preference || null
        };
        
        await db.updateStudent(student.id, studentData);
        toast.success('Student updated successfully!');
        onEditSuccess?.();
      } else {
        // Create new student
        const studentData = {
          admission_number: formData.admission_number,
          programme_id: parseInt(formData.programme_id),
          current_class_id: 1, // Default class, should be calculated based on programme and form
          surname: formData.surname,
          other_names: formData.other_names,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          nationality: formData.nationality,
          hometown: formData.hometown,
          district_of_origin: formData.district_of_origin,
          region_of_origin: formData.region_of_origin,
          guardian_name: formData.guardian_name,
          guardian_relationship: formData.guardian_relationship,
          guardian_phone: formData.guardian_phone,
          guardian_phone_alt: formData.guardian_phone_alt || null,
          guardian_email: formData.guardian_email || null,
          guardian_address: formData.guardian_address,
          previous_school: formData.previous_school,
          graduation_year: formData.graduation_year,
          known_allergies: formData.known_allergies,
          chronic_conditions: formData.chronic_conditions,
          blood_group: formData.blood_group || null,
          enrollment_date: formData.enrollment_date,
          residential_status: formData.residential_status,
          house_preference: formData.house_preference || null
        };
        
        // Save to database
        const result = await db.createStudent(studentData);
        
        // Generate credentials (in production, implement proper password generation)
        const credentials = {
          admissionNumber: formData.admission_number,
          password: 'temp123' // TODO: Generate secure password
        };
        
        toast.success('Student registered successfully!');
        onSuccess?.(credentials);
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast.error(error.message || 'Failed to register student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PortalInput
          label="Admission Number"
          type="text"
          value={formData.admission_number}
          onChange={(e) => handleInputChange('admission_number', e.target.value)}
          required
          placeholder="Enter admission number"
        />
        
        <PortalInput
          label="Surname"
          type="text"
          value={formData.surname}
          onChange={(e) => handleInputChange('surname', e.target.value)}
          required
          placeholder="Enter surname"
        />
        
        <PortalInput
          label="Other Names"
          type="text"
          value={formData.other_names}
          onChange={(e) => handleInputChange('other_names', e.target.value)}
          required
          placeholder="Enter other names"
        />
        
        <PortalInput
          label="Date of Birth"
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Programme</label>
          <select
            value={formData.programme_id}
            onChange={(e) => handleInputChange('programme_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
            required
          >
            <option value="">Select Programme</option>
            {programmes.map(programme => (
              <option key={programme.id} value={programme.id}>
                {programme.name}
              </option>
            ))}
          </select>
        </div>
        
        <PortalInput
          label="Nationality"
          type="text"
          value={formData.nationality}
          onChange={(e) => handleInputChange('nationality', e.target.value)}
          required
          placeholder="Enter nationality"
        />
        
        <PortalInput
          label="Hometown"
          type="text"
          value={formData.hometown}
          onChange={(e) => handleInputChange('hometown', e.target.value)}
          required
          placeholder="Enter hometown"
        />
      </div>

      {/* Guardian Information */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Guardian Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PortalInput
            label="Guardian Name"
            type="text"
            value={formData.guardian_name}
            onChange={(e) => handleInputChange('guardian_name', e.target.value)}
            required
            placeholder="Enter guardian name"
          />
          
          <PortalInput
            label="Relationship to Student"
            type="text"
            value={formData.guardian_relationship}
            onChange={(e) => handleInputChange('guardian_relationship', e.target.value)}
            required
            placeholder="e.g., Father, Mother, Uncle"
          />
          
          <PortalInput
            label="Guardian Phone"
            type="tel"
            value={formData.guardian_phone}
            onChange={(e) => handleInputChange('guardian_phone', e.target.value)}
            required
            placeholder="Enter phone number"
          />
          
          <PortalInput
            label="Guardian Alternative Phone"
            type="tel"
            value={formData.guardian_phone_alt}
            onChange={(e) => handleInputChange('guardian_phone_alt', e.target.value)}
            placeholder="Enter alternative phone number"
          />
          
          <PortalInput
            label="Guardian Email"
            type="email"
            value={formData.guardian_email}
            onChange={(e) => handleInputChange('guardian_email', e.target.value)}
            placeholder="Enter email address"
          />
          
          <div className="md:col-span-2">
            <PortalInput
              label="Guardian Address"
              as="textarea"
              rows={3}
              value={formData.guardian_address}
              onChange={(e) => handleInputChange('guardian_address', e.target.value)}
              required
              placeholder="Enter full address"
            />
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PortalInput
            label="Known Allergies"
            type="text"
            value={formData.known_allergies}
            onChange={(e) => handleInputChange('known_allergies', e.target.value)}
            placeholder="Enter known allergies"
          />
          
          <PortalInput
            label="Chronic Conditions"
            type="text"
            value={formData.chronic_conditions}
            onChange={(e) => handleInputChange('chronic_conditions', e.target.value)}
            placeholder="Enter chronic conditions"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
            <select
              value={formData.blood_group}
              onChange={(e) => handleInputChange('blood_group', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PortalInput
            label="Previous School"
            type="text"
            value={formData.previous_school}
            onChange={(e) => handleInputChange('previous_school', e.target.value)}
            placeholder="Enter previous school"
          />
          
          <PortalInput
            label="Graduation Year"
            type="number"
            value={formData.graduation_year}
            onChange={(e) => handleInputChange('graduation_year', e.target.value)}
            placeholder="Enter graduation year"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Residential Status</label>
            <select
              value={formData.residential_status}
              onChange={(e) => handleInputChange('residential_status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
            >
              <option value="Day Student">Day Student</option>
              <option value="Boarding Student">Boarding Student</option>
            </select>
          </div>
          
          <PortalInput
            label="House Preference"
            type="text"
            value={formData.house_preference}
            onChange={(e) => handleInputChange('house_preference', e.target.value)}
            placeholder="Enter house preference"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        <PortalButton
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          Cancel
        </PortalButton>
        <PortalButton
          type="submit"
          disabled={isSubmitting}
          variant="primary"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              {student ? 'Updating...' : 'Registering...'}
            </>
          ) : (
            student ? 'Update Student' : 'Register Student'
          )}
        </PortalButton>
      </div>
    </form>
  );
}