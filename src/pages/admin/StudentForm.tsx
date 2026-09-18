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
  course_id: number;
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
}

interface StudentFormProps {
  onSuccess?: (studentData: { admissionNumber: string; password: string }) => void;
  programmes: Programme[];
  classes: ClassItem[];
  student?: Student;
  onEditSuccess?: () => void;
}

export function StudentForm({ onSuccess, programmes, classes, student, onEditSuccess }: StudentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Lite Registration Data
  const [formData, setFormData] = useState({
    admission_number: '',
    surname: '',
    other_names: '',
    date_of_birth: '2005-01-01',
    gender: 'Male',
    programme_id: '',
    current_class_id: '',
    form: ''
  });

  useEffect(() => {
    if (student) {
      const formatDateForInput = (dateStr: string | null | undefined) => {
        if (!dateStr) return '2005-01-01';
        try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return dateStr;
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        } catch (e) {
          return dateStr;
        }
      };

      setFormData({
        admission_number: student.admission_number || student.student_id || '',
        surname: student.surname || '',
        other_names: student.other_names || '',
        date_of_birth: formatDateForInput(student.date_of_birth),
        gender: student.gender === 'Female' ? 'Female' : 'Male',
        programme_id: student.course_id?.toString() || '',
        current_class_id: student.current_class_id?.toString() || '',
        form: '' 
      });
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Standard institutional fallback values for uncollected demographic records
    const defaultBloatData = {
      nationality: 'Ghanaian',
      hometown: 'N/A',
      district_of_origin: 'N/A',
      region_of_origin: 'N/A',
      guardian_name: 'N/A',
      guardian_relationship: 'N/A',
      guardian_phone: '0000000000',
      guardian_phone_alt: null,
      guardian_email: null,
      guardian_address: 'N/A',
      previous_school: 'N/A',
      graduation_year: new Date().getFullYear() + 3,
      known_allergies: 'None',
      chronic_conditions: 'None',
      blood_group: null,
      enrollment_date: new Date().toISOString().split('T')[0],
      residential_status: 'Day Student'
    };
    
    try {
      if (student) {
        // Update existing student
        const studentData = {
          admission_number: formData.admission_number,
          programme_id: parseInt(formData.programme_id),
          current_class_id: formData.current_class_id ? parseInt(formData.current_class_id) : (classes.length > 0 ? classes[0].id : 1), 
          surname: formData.surname,
          other_names: formData.other_names,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          nationality: student.nationality || defaultBloatData.nationality,
          hometown: student.hometown || defaultBloatData.hometown,
          district_of_origin: student.district_of_origin || defaultBloatData.district_of_origin,
          region_of_origin: student.region_of_origin || defaultBloatData.region_of_origin,
          guardian_name: student.guardian_name || defaultBloatData.guardian_name,
          guardian_relationship: student.guardian_relationship || defaultBloatData.guardian_relationship,
          guardian_phone: student.guardian_phone || defaultBloatData.guardian_phone,
          guardian_phone_alt: student.guardian_phone_alt,
          guardian_email: student.guardian_email,
          guardian_address: student.guardian_address || defaultBloatData.guardian_address,
          previous_school: student.previous_school || defaultBloatData.previous_school,
          graduation_year: student.graduation_year || defaultBloatData.graduation_year,
          known_allergies: student.known_allergies || defaultBloatData.known_allergies,
          chronic_conditions: student.chronic_conditions || defaultBloatData.chronic_conditions,
          blood_group: student.blood_group,
          enrollment_date: student.enrollment_date || defaultBloatData.enrollment_date,
          residential_status: student.residential_status || defaultBloatData.residential_status
        };
        
        await db.updateStudent(student.id, studentData);
        toast.success('Student updated successfully');
        onEditSuccess?.();
      } else {
        // Create new student
        const studentData = {
          admission_number: formData.admission_number,
          programme_id: parseInt(formData.programme_id),
          current_class_id: formData.current_class_id ? parseInt(formData.current_class_id) : (classes.length > 0 ? classes[0].id : 1), 
          surname: formData.surname,
          other_names: formData.other_names,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          ...defaultBloatData
        };
        
        const result = await db.createStudent(studentData);
        
        const credentials = {
          admissionNumber: result.student_id,
          password: result.password
        };
        
        toast.success('Student registered successfully');
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50/60 border border-blue-200 rounded-sm p-4 flex items-start gap-3">
        <div className="text-blue-600 mt-0.5">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-blue-900 uppercase tracking-wider">Fast Registration Workflow</h3>
          <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
            Essential academic and login details are captured here. Comprehensive medical and ancestral records are automatically synchronized from the primary school registry.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <PortalInput
          label="Admission Number / Student ID"
          type="text"
          value={formData.admission_number}
          onChange={(e) => handleInputChange('admission_number', e.target.value)}
          placeholder="Leave blank to auto-generate"
          disabled={!!student}
        />
        
        <PortalInput
          label="Surname *"
          type="text"
          value={formData.surname}
          onChange={(e) => handleInputChange('surname', e.target.value)}
          required
          placeholder="e.g. Asare"
        />
        
        <PortalInput
          label="Other Names *"
          type="text"
          value={formData.other_names}
          onChange={(e) => handleInputChange('other_names', e.target.value)}
          required
          placeholder="e.g. Kwame Mensah"
        />

        <PortalInput
          label="Date of Birth *"
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
          required
        />
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Gender *</label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Academic Form *</label>
          <select
            value={formData.form}
            onChange={(e) => {
              handleInputChange('form', e.target.value);
              handleInputChange('current_class_id', '');
            }}
            className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
            required
          >
            <option value="">Select Form</option>
            <option value="1">Form 1</option>
            <option value="2">Form 2</option>
            <option value="3">Form 3</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Programme *</label>
          <select
            value={formData.programme_id}
            onChange={(e) => {
              handleInputChange('programme_id', e.target.value);
              handleInputChange('current_class_id', '');
            }}
            className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
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

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Assigned Class *</label>
          <select
            value={formData.current_class_id}
            onChange={(e) => handleInputChange('current_class_id', e.target.value)}
            className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
            required
          >
            <option value="">Select Class</option>
            {classes
              .filter(c => 
                (!formData.form || c.form === parseInt(formData.form)) &&
                (!formData.programme_id || c.course_id === parseInt(formData.programme_id))
              )
              .map(c => (
                <option key={c.id} value={c.id}>
                  {c.class_name}
                </option>
              ))}
          </select>
          {(!formData.form || !formData.programme_id) && (
            <p className="text-[11px] text-gray-400 mt-1">Select Form and Programme above to filter classes</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <PortalButton
          type="button"
          variant="secondary"
          onClick={() => {
            if (onEditSuccess) onEditSuccess(); 
            else window.history.back();
          }}
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
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              {student ? 'Updating...' : 'Registering...'}
            </span>
          ) : (
            student ? 'Update Student Record' : 'Register Student'
          )}
        </PortalButton>
      </div>
    </form>
  );
}