import React, { useState } from "react"
import toast from 'react-hot-toast';
import { PortalInput } from '../../components/PortalInput';
import { PortalButton } from '../../components/PortalButton';

// Types
interface TeacherFormProps {
  onSuccess?: () => void
}

const TeacherForm: React.FC<TeacherFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<any>({
    staff_id: "",
    title: "",
    surname: "",
    other_names: "",
    dob: "",
    gender: "",
    nationality: "Ghanaian",
    ghana_card_id: "",
    employment_date: "",
    department: "",
    status: "",
    position_rank: "",
    staff_type: "Teaching Staff",
    personal_phone: "",
    alt_phone: "",
    personal_email: "",
    residential_address: "",
    highest_qualification: "",
    field_of_study: "",
    institution: "",
    year_obtained: "",
    other_qualifications: "",
    programme: "",
    subjects: "",
    assigned_classes: "",
    role: "teacher",
    emergency_name: "",
    emergency_relationship: "",
    emergency_phone: "",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Replace with actual database calls
      console.log('Teacher form data to be saved:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Teacher saved successfully!');
      onSuccess?.()
      
      // Reset form
      setFormData({ ...formData, staff_id: "" })
    } catch (err) {
      console.error("Error saving teacher:", err)
      toast.error('Failed to save teacher');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow border border-school-cream-200">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Teacher Registration Form</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Personal Information */}
        <div className="border border-school-cream-200 p-4 rounded-lg">
          <h2 className="font-bold mb-4 text-gray-900">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PortalInput
              label="Staff ID *"
              type="text"
              value={formData.staff_id} 
              onChange={(e) => handleChange("staff_id", e.target.value)} 
              required
              placeholder="Enter staff ID"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <select 
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
              >
                <option value="">Select title</option>
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Miss">Miss</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
              </select>
            </div>
            
            <PortalInput
              label="Surname *"
              type="text"
              value={formData.surname} 
              onChange={(e) => handleChange("surname", e.target.value)} 
              required
              placeholder="Enter surname"
            />
            
            <PortalInput
              label="Other Names *"
              type="text"
              value={formData.other_names} 
              onChange={(e) => handleChange("other_names", e.target.value)} 
              required
              placeholder="Enter other names"
            />
            
            <PortalInput
              label="Date of Birth *"
              type="date"
              value={formData.dob} 
              onChange={(e) => handleChange("dob", e.target.value)} 
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select 
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
              >
                <option value="">Select gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Employment */}
        <div className="border border-school-cream-200 p-4 rounded-lg">
          <h2 className="font-bold mb-4 text-gray-900">Employment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PortalInput
              label="Employment Date *"
              type="date"
              value={formData.employment_date} 
              onChange={(e) => handleChange("employment_date", e.target.value)} 
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select 
                value={formData.department}
                onChange={(e) => handleChange("department", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
              >
                <option value="">Select department</option>
                <option value="Science">Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Arts">Arts</option>
                <option value="Administration">Administration</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: Contact */}
        <div className="border border-school-cream-200 p-4 rounded-lg">
          <h2 className="font-bold mb-4 text-gray-900">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PortalInput
              label="Personal Phone *"
              type="tel"
              value={formData.personal_phone} 
              onChange={(e) => handleChange("personal_phone", e.target.value)} 
              required
              placeholder="Enter phone number"
            />
            
            <PortalInput
              label="Alternative Phone"
              type="tel"
              value={formData.alt_phone} 
              onChange={(e) => handleChange("alt_phone", e.target.value)}
              placeholder="Enter alternative phone number"
            />
            
            <PortalInput
              label="Personal Email"
              type="email"
              value={formData.personal_email} 
              onChange={(e) => handleChange("personal_email", e.target.value)}
              placeholder="Enter email address"
            />
            
            <div className="md:col-span-2">
              <PortalInput
                label="Residential Address"
                as="textarea"
                rows={3}
                value={formData.residential_address} 
                onChange={(e) => handleChange("residential_address", e.target.value)}
                placeholder="Enter full address"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Emergency Contact */}
        <div className="border border-school-cream-200 p-4 rounded-lg">
          <h2 className="font-bold mb-4 text-gray-900">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PortalInput
              label="Emergency Contact Name"
              type="text"
              value={formData.emergency_name} 
              onChange={(e) => handleChange("emergency_name", e.target.value)}
              placeholder="Enter emergency contact name"
            />
            
            <PortalInput
              label="Relationship"
              type="text"
              value={formData.emergency_relationship} 
              onChange={(e) => handleChange("emergency_relationship", e.target.value)}
              placeholder="e.g., Spouse, Parent, Sibling"
            />
            
            <PortalInput
              label="Emergency Phone"
              type="tel"
              value={formData.emergency_phone} 
              onChange={(e) => handleChange("emergency_phone", e.target.value)}
              placeholder="Enter emergency phone number"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <PortalButton
            type="button"
            variant="secondary"
            onClick={() => window.history.back()}
            disabled={loading}
          >
            Cancel
          </PortalButton>
          <PortalButton
            type="submit"
            disabled={loading}
            variant="primary"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Teacher'
            )}
          </PortalButton>
        </div>
      </form>
    </div>
  )
}

export default TeacherForm