import React, { useEffect, useState } from 'react';
import { StudentForm } from '../../components/StudentForm';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2 } from 'lucide-react';

interface Programme {
  id: number;
  name: string;
}

interface Class {
  id: number;
  class_name: string;
  form: number;
  stream: string | null;
}

interface Student {
  id: number;
  full_name: string;
  email: string;
  programme_id: number;
  class_id: number;
  created_at: string;
}

export function AdminStudentRegistration() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch programmes
      const { data: programmesData, error: programmeError } = await supabase.from('programmes').select('*');
      if (programmeError) throw programmeError;
      if (programmesData) setProgrammes(programmesData);

      // Fetch classes
      const { data: classesData, error: classesError } = await supabase.from('classes_view').select('*');
      if (classesError) throw classesError;
      if (classesData) setClasses(classesData);

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, full_name, email, programme_id, class_id, created_at')
        .order('created_at', { ascending: false });
      if (studentsError) throw studentsError;
      if (studentsData) setStudents(studentsData);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">Error: {error}</p>;
  }

  if (!showForm) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Student Management</CardTitle>
          <CardDescription>Register new students or manage existing ones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={() => setShowForm(true)} className="w-full">
            Register New Student
          </Button>

          {/* Student List */}
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Programme</th>
                  <th className="px-4 py-2 text-left">Class</th>
                  <th className="px-4 py-2 text-left">Registered</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.id} className="border-t">
                      <td className="px-4 py-2">{student.full_name}</td>
                      <td className="px-4 py-2">{student.email}</td>
                      <td className="px-4 py-2">
                        {programmes.find((p) => p.id === student.programme_id)?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-2">
                        {classes.find((c) => c.id === student.class_id)?.class_name || 'N/A'}
                      </td>
                      <td className="px-4 py-2">{new Date(student.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No students registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <StudentForm
      programmes={programmes}
      classes={classes}
      onSuccess={() => {
        setShowForm(false);
        fetchData(); // refresh student list after registration
      }}
    />
  );
}
