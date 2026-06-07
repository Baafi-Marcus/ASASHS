const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminTeacherManagement.tsx', 'utf8');

// 1. Replace formData state
code = code.replace(
  /const \[formData, setFormData\] = useState\(\{[\s\S]*?assigned_class_id: '',\s*\}\);/,
  `const [formData, setFormData] = useState({
    staff_id: '',
    title: 'Mr.',
    surname: '',
    other_names: '',
    gender: 'Male',
    department: '',
    position_rank: '',
  });`
);

// 2. Replace handleSubmit
code = code.replace(
  /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?fetchTeachers\(\);\s*\} catch \(error\) \{/m,
  `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const defaultBloatData = {
        dob: '1980-01-01',
        nationality: 'Ghanaian',
        ghana_card_id: 'N/A',
        employment_date: new Date().toISOString().split('T')[0],
        status: 'Active',
        staff_type: 'Permanent',
        personal_phone: '0000000000',
        alt_phone: '',
        personal_email: '',
        residential_address: 'N/A',
        highest_qualification: 'N/A',
        field_of_study: 'N/A',
        institution: 'N/A',
        year_obtained: new Date().getFullYear(),
        other_qualifications: '',
        role: 'Teacher',
        emergency_name: 'N/A',
        emergency_relationship: 'N/A',
        emergency_phone: '0000000000'
      };
      
      const submitData = { ...formData, ...defaultBloatData };
      const result: any = await db.createTeacher(submitData);
      
      if (result && result.teacher_id && result.password) {
        setRegistrationResult({
          teacher_id: result.teacher_id,
          password: result.password
        });
        toast.success('Teacher registered successfully!');
      } else {
        toast.success('Teacher registered successfully!');
      }
      
      setShowForm(false);
      setFormData({
        staff_id: '',
        title: 'Mr.',
        surname: '',
        other_names: '',
        gender: 'Male',
        department: '',
        position_rank: '',
      });
      fetchTeachers();
    } catch (error) {`
);

// 3. Replace renderStepContent
code = code.replace(
  /const renderStepContent = \(\) => \{[\s\S]*?return null;\s*\}\s*\};\s*const renderStepButtons/m,
  `const renderStepContent = () => {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-xl mb-6">
          <h3 className="text-blue-800 font-bold mb-1">Lite Registration Mode</h3>
          <p className="text-blue-600 text-sm">Detailed records are maintained in the main SMS. Please provide the essential details for portal access.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Staff ID</label>
            <input type="text" name="staff_id" value={formData.staff_id} onChange={handleInputChange} className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500" placeholder="Leave empty to auto-generate" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <select name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500">
              <option value="Mr.">Mr.</option><option value="Mrs.">Mrs.</option><option value="Ms.">Ms.</option><option value="Dr.">Dr.</option><option value="Prof.">Prof.</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Surname *</label>
            <input type="text" name="surname" value={formData.surname} onChange={handleInputChange} required className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Other Names *</label>
            <input type="text" name="other_names" value={formData.other_names} onChange={handleInputChange} required className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
            <select name="gender" value={formData.gender} onChange={handleInputChange} required className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500">
              <option value="Male">Male</option><option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
            <select name="department" value={formData.department} onChange={handleInputChange} required className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500">
              <option value="">Select Department</option>
              <option value="Mathematics Department">Mathematics Department</option>
              <option value="Language Department">Language Department</option>
              <option value="Science Department">Science Department</option>
              <option value="Social Studies Department">Social Studies Department</option>
              <option value="Religious Studies Department">Religious Studies Department</option>
              <option value="Business Studies Department">Business Studies Department</option>
              <option value="Technical Skills Department">Technical Skills Department</option>
              <option value="Creative Arts Department">Creative Arts Department</option>
              <option value="Physical Education Department">Physical Education Department</option>
              <option value="Computing Department">Computing Department</option>
              <option value="French Department">French Department</option>
              <option value="Other Department">Other Department</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position/Rank</label>
            <select name="position_rank" value={formData.position_rank} onChange={handleInputChange} className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500">
              <option value="">Select Position</option>
              <option value="Teacher">Teacher</option>
              <option value="Senior Teacher">Senior Teacher</option>
              <option value="Head of Department">Head of Department</option>
              <option value="Deputy Principal">Deputy Principal</option>
              <option value="Principal">Principal</option>
            </select>
          </div>
        </div>
      </div>
    );
  };
  const renderStepButtons`
);

// 4. Replace renderStepIndicator
code = code.replace(
  /const renderStepIndicator = \(\) => \{[\s\S]*?return \([\s\S]*?\}\);\s*\};/m,
  'const renderStepIndicator = () => null;'
);

// 5. Replace renderStepButtons
code = code.replace(
  /const renderStepButtons = \(\) => \{[\s\S]*?return \([\s\S]*?\}\);\s*\};/m,
  `const renderStepButtons = () => (
    <div className="flex justify-end mt-8 border-t pt-4">
      <button type="submit" className="px-6 py-3 bg-school-green-600 text-white rounded-lg font-medium hover:bg-school-green-700">
        Register Teacher
      </button>
    </div>
  );`
);

// 6. Fix Edit Modal mapping
// Right now handleEditTeacher only sets department and position_rank
const handleEditTeacherRegex = /const handleEditTeacher = \(teacher: Teacher\) => \{[\s\S]*?setShowEditModal\(true\);\s*\};/;
const handleEditTeacherReplacement = `const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setEditFormData({
      title: teacher.title || 'Mr.',
      surname: teacher.surname || '',
      other_names: teacher.other_names || '',
      gender: teacher.gender === 'Female' ? 'Female' : 'Male',
      department: teacher.department || '',
      position_rank: teacher.position_rank || '',
    } as any);
    setShowEditModal(true);
  };`;
code = code.replace(handleEditTeacherRegex, handleEditTeacherReplacement);

// 7. Update editFormData state signature
code = code.replace(
  /const \[editFormData, setEditFormData\] = useState\(\{[\s\S]*?position_rank: '',\s*\}\);/,
  `const [editFormData, setEditFormData] = useState({
    title: 'Mr.',
    surname: '',
    other_names: '',
    gender: 'Male',
    department: '',
    position_rank: '',
  });`
);

// 8. Update Edit Modal JSX to include new fields
const editModalRegex = /<form onSubmit=\{handleEditSubmit\}>[\s\S]*?<div className="flex justify-end space-x-2 p-4 border-t border-gray-200">/;
const editModalReplacement = `<form onSubmit={handleEditSubmit}>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <select value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="Mr.">Mr.</option><option value="Mrs.">Mrs.</option><option value="Ms.">Ms.</option><option value="Dr.">Dr.</option><option value="Prof.">Prof.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                  <input type="text" value={editFormData.surname} onChange={(e) => setEditFormData({...editFormData, surname: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Names</label>
                  <input type="text" value={editFormData.other_names} onChange={(e) => setEditFormData({...editFormData, other_names: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select value={editFormData.gender} onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="Male">Male</option><option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <PortalInput
                    label="Department *"
                    type="text"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                    required
                    placeholder="Enter department"
                  />
                </div>
                <div>
                  <PortalInput
                    label="Position Rank *"
                    type="text"
                    value={editFormData.position_rank}
                    onChange={(e) => setEditFormData({...editFormData, position_rank: e.target.value})}
                    required
                    placeholder="Enter position rank"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 p-4 border-t border-gray-200">`;
code = code.replace(editModalRegex, editModalReplacement);


// 9. Fix multi-step visual bar from header (Progress Bar)
const progressBarRegex = /<div className="px-4 py-3 bg-school-cream-50">[\s\S]*?<\/div>[\s\S]*?<\/div>\s*<form onSubmit=\{handleSubmit\}>/;
code = code.replace(progressBarRegex, `<form onSubmit={handleSubmit}>`);

// 10. Hide "Previous" / "Next" buttons in modal bottom
const formButtonsRegex = /<div className="flex justify-between p-4 border-t border-gray-200">[\s\S]*?<\/form>/;
code = code.replace(formButtonsRegex, `</form>`); // Because renderStepButtons now provides the submit button!

fs.writeFileSync('src/pages/admin/AdminTeacherManagement.tsx', code);
console.log('Successfully rewritten AdminTeacherManagement.tsx');
