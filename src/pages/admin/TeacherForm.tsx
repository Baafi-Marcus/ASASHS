import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabaseClient"

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
    subjects: [] as string[],
    assigned_classes: [] as string[],
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
      // Insert into teachers table
      const { data: teacher, error: teacherError } = await supabase
        .from("teachers")
        .insert([
          {
            staff_id: formData.staff_id,
            title: formData.title,
            surname: formData.surname,
            other_names: formData.other_names,
            dob: formData.dob,
            gender: formData.gender,
            nationality: formData.nationality,
            ghana_card_id: formData.ghana_card_id,
            employment_date: formData.employment_date,
            department: formData.department,
            status: formData.status,
            position_rank: formData.position_rank,
            staff_type: formData.staff_type,
            personal_phone: formData.personal_phone,
            alt_phone: formData.alt_phone,
            personal_email: formData.personal_email,
            residential_address: formData.residential_address,
            highest_qualification: formData.highest_qualification,
            field_of_study: formData.field_of_study,
            institution: formData.institution,
            year_obtained: formData.year_obtained,
            other_qualifications: formData.other_qualifications,
            role: formData.role,
            emergency_name: formData.emergency_name,
            emergency_relationship: formData.emergency_relationship,
            emergency_phone: formData.emergency_phone,
          },
        ])
        .select()
        .single()

      if (teacherError) throw teacherError

      // Insert into teacher_qualifications
      if (formData.highest_qualification) {
        await supabase.from("teacher_qualifications").insert([
          {
            teacher_id: teacher.id,
            qualification: formData.highest_qualification,
            field_of_study: formData.field_of_study,
            institution: formData.institution,
            year_obtained: formData.year_obtained,
          },
        ])
      }

      // Insert into teacher_assignments
      if (formData.subjects.length > 0) {
        const assignments = formData.subjects.map((subject: string) => ({
          teacher_id: teacher.id,
          programme: formData.programme,
          subject,
          class_assigned: formData.assigned_classes.join(", "),
        }))
        await supabase.from("teacher_assignments").insert(assignments)
      }

      onSuccess?.()
      setFormData({ ...formData, staff_id: "" }) // reset
    } catch (err) {
      console.error("Error saving teacher:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      {/* SECTION 1: Personal Information */}
      <div className="border p-4 rounded-lg">
        <h2 className="font-bold mb-2">Personal Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Staff ID</Label>
            <Input value={formData.staff_id} onChange={e => handleChange("staff_id", e.target.value)} required />
          </div>
          <div>
            <Label>Title</Label>
            <Select onValueChange={v => handleChange("title", v)}>
              <SelectTrigger><SelectValue placeholder="Select title" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr.">Mr.</SelectItem>
                <SelectItem value="Mrs.">Mrs.</SelectItem>
                <SelectItem value="Miss">Miss</SelectItem>
                <SelectItem value="Dr.">Dr.</SelectItem>
                <SelectItem value="Prof.">Prof.</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Surname</Label>
            <Input value={formData.surname} onChange={e => handleChange("surname", e.target.value)} required />
          </div>
          <div>
            <Label>Other Names</Label>
            <Input value={formData.other_names} onChange={e => handleChange("other_names", e.target.value)} required />
          </div>
          <div>
            <Label>Date of Birth</Label>
            <Input type="date" value={formData.dob} onChange={e => handleChange("dob", e.target.value)} required />
          </div>
          <div>
            <Label>Gender</Label>
            <Select onValueChange={v => handleChange("gender", v)}>
              <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nationality</Label>
            <Input value={formData.nationality} onChange={e => handleChange("nationality", e.target.value)} />
          </div>
          <div>
            <Label>Ghana Card ID</Label>
            <Input value={formData.ghana_card_id} onChange={e => handleChange("ghana_card_id", e.target.value)} />
          </div>
        </div>
      </div>

      {/* SECTION 2: Employment */}
      <div className="border p-4 rounded-lg">
        <h2 className="font-bold mb-2">Employment & Professional</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Employment Date</Label>
            <Input type="date" value={formData.employment_date} onChange={e => handleChange("employment_date", e.target.value)} required />
          </div>
          <div>
            <Label>Department</Label>
            <Select onValueChange={v => handleChange("department", v)}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Arts">Arts</SelectItem>
                <SelectItem value="Administration">Administration</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select onValueChange={v => handleChange("status", v)}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-Time">Full-Time</SelectItem>
                <SelectItem value="Part-Time">Part-Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Position/Rank</Label>
            <Select onValueChange={v => handleChange("position_rank", v)}>
              <SelectTrigger><SelectValue placeholder="Select rank" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Teacher">Teacher</SelectItem>
                <SelectItem value="Senior Teacher">Senior Teacher</SelectItem>
                <SelectItem value="Head of Department">Head of Department</SelectItem>
                <SelectItem value="Assistant Headmaster">Assistant Headmaster</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* SECTION 3: Contact */}
      <div className="border p-4 rounded-lg">
        <h2 className="font-bold mb-2">Contact Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Personal Phone</Label>
            <Input value={formData.personal_phone} onChange={e => handleChange("personal_phone", e.target.value)} required />
          </div>
          <div>
            <Label>Alternative Phone</Label>
            <Input value={formData.alt_phone} onChange={e => handleChange("alt_phone", e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={formData.personal_email} onChange={e => handleChange("personal_email", e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label>Residential Address</Label>
            <Textarea value={formData.residential_address} onChange={e => handleChange("residential_address", e.target.value)} required />
          </div>
        </div>
      </div>

      {/* SECTION 4: Academic Qualifications */}
      <div className="border p-4 rounded-lg">
        <h2 className="font-bold mb-2">Academic Qualifications</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Highest Qualification</Label>
            <Select onValueChange={v => handleChange("highest_qualification", v)}>
              <SelectTrigger><SelectValue placeholder="Select qualification" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PhD">PhD</SelectItem>
                <SelectItem value="MPhil">MPhil</SelectItem>
                <SelectItem value="MSc">MSc</SelectItem>
                <SelectItem value="BEd">BEd</SelectItem>
                <SelectItem value="BSc">BSc</SelectItem>
                <SelectItem value="Diploma">Diploma</SelectItem>
                <SelectItem value="Certificate">Certificate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Field of Study</Label>
            <Input value={formData.field_of_study} onChange={e => handleChange("field_of_study", e.target.value)} />
          </div>
          <div>
            <Label>Institution</Label>
            <Input value={formData.institution} onChange={e => handleChange("institution", e.target.value)} />
          </div>
          <div>
            <Label>Year Obtained</Label>
            <Input type="number" value={formData.year_obtained} onChange={e => handleChange("year_obtained", e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label>Other Qualifications</Label>
            <Textarea value={formData.other_qualifications} onChange={e => handleChange("other_qualifications", e.target.value)} />
          </div>
        </div>
      </div>

      {/* SECTION 5: Subjects Assigned */}
      <div className="border p-4 rounded-lg">
        <h2 className="font-bold mb-2">Subjects Assigned</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Programme</Label>
            <Input value={formData.programme} onChange={e => handleChange("programme", e.target.value)} />
          </div>
          <div>
            <Label>Subjects (comma separated)</Label>
            <Input value={formData.subjects} onChange={e => handleChange("subjects", e.target.value.split(","))} />
          </div>
          <div>
            <Label>Assigned Classes (comma separated)</Label>
            <Input value={formData.assigned_classes} onChange={e => handleChange("assigned_classes", e.target.value.split(","))} />
          </div>
        </div>
      </div>

      {/* SECTION 6: System Access */}
      <div className="border p-4 rounded-lg">
        <h2 className="font-bold mb-2">System Access</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Role</Label>
            <Select onValueChange={v => handleChange("role", v)}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="hod">Head of Department</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* SECTION 7: Emergency Contact */}
      <div className="border p-4 rounded-lg">
        <h2 className="font-bold mb-2">Emergency Contact</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <Input value={formData.emergency_name} onChange={e => handleChange("emergency_name", e.target.value)} required />
          </div>
          <div>
            <Label>Relationship</Label>
            <Input value={formData.emergency_relationship} onChange={e => handleChange("emergency_relationship", e.target.value)} required />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={formData.emergency_phone} onChange={e => handleChange("emergency_phone", e.target.value)} required />
          </div>
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Teacher"}
      </Button>
    </form>
  )
}

export default TeacherForm
