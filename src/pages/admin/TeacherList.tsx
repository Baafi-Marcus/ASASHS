import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

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

    if (teacher) {
      // update teacher
      const { error } = await supabase
        .from("teachers")
        .update({
          staff_id: staffId,
          surname,
          other_names: otherNames,
          gender,
          email,
          qualification,
          subject,
        })
        .eq("id", teacher.id);

      if (!error && onSuccess) onSuccess();
    } else {
      // insert teacher
      const { error } = await supabase.from("teachers").insert([
        {
          staff_id: staffId,
          surname,
          other_names: otherNames,
          gender,
          email,
          qualification,
          subject,
        },
      ]);

      if (!error && onSuccess) onSuccess();
    }

    setLoading(false);
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>{teacher ? "Edit Teacher" : "Add Teacher"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Staff ID */}
          <div>
            <Label>Staff ID</Label>
            <Input value={staffId} onChange={(e) => setStaffId(e.target.value)} required />
          </div>

          {/* Surname */}
          <div>
            <Label>Surname</Label>
            <Input value={surname} onChange={(e) => setSurname(e.target.value)} required />
          </div>

          {/* Other Names */}
          <div>
            <Label>Other Names</Label>
            <Input value={otherNames} onChange={(e) => setOtherNames(e.target.value)} required />
          </div>

          {/* Gender */}
          <div>
            <Label>Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          {/* Qualification */}
          <div>
            <Label>Qualification</Label>
            <Input value={qualification} onChange={(e) => setQualification(e.target.value)} required />
          </div>

          {/* Subject */}
          <div>
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>

          {/* Submit */}
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : teacher ? "Update Teacher" : "Add Teacher"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
