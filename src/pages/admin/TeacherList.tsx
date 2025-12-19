import React, { useState } from "react";
import toast from 'react-hot-toast';

interface TeacherFormProps {
  onSuccess?: () => void;
  teacher?: any; // if passed → edit mode
}

export function TeacherForm({ onSuccess, teacher }: TeacherFormProps) {
  const [staffId, setStaffId] = useState(teacher?.staff_id || "");
  const [surname, setSurname] = useState(teacher?.surname || "");
  const [otherNames, setOtherNames] = useState(teacher?.other_names || "");
  const [gender, setGender] = useState(teacher?.gender || "");
  const [email, setEmail] = useState(teacher?.email || "");
  const [qualification, setQualification] = useState(teacher?.qualification || "");
  const [subject, setSubject] = useState(teacher?.subject || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with actual database calls
      console.log('Teacher data to be saved:', {
        staff_id: staffId,
        surname,
        other_names: otherNames,
        gender,
        email,
        qualification,
        subject,
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(teacher ? 'Teacher updated successfully!' : 'Teacher added successfully!');
      onSuccess?.();
      
    } catch (error) {
      toast.error('Failed to save teacher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-lg shadow border">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">{teacher ? "Edit Teacher" : "Add Teacher"}</h2>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Staff ID */}
          <div>
            <label className="block text-sm font-medium mb-1">Staff ID *</label>
            <input 
              type="text"
              value={staffId} 
              onChange={(e) => setStaffId(e.target.value)} 
              required 
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Surname */}
          <div>
            <label className="block text-sm font-medium mb-1">Surname *</label>
            <input 
              type="text"
              value={surname} 
              onChange={(e) => setSurname(e.target.value)} 
              required 
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Other Names */}
          <div>
            <label className="block text-sm font-medium mb-1">Other Names *</label>
            <input 
              type="text"
              value={otherNames} 
              onChange={(e) => setOtherNames(e.target.value)} 
              required 
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium mb-1">Gender *</label>
            <select 
              value={gender} 
              onChange={(e) => setGender(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Qualification */}
          <div>
            <label className="block text-sm font-medium mb-1">Qualification *</label>
            <input 
              type="text"
              value={qualification} 
              onChange={(e) => setQualification(e.target.value)} 
              required 
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium mb-1">Subject *</label>
            <input 
              type="text"
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              required 
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Saving..." : teacher ? "Update Teacher" : "Add Teacher"}
          </button>
        </form>
      </div>
    </div>
  );
}
