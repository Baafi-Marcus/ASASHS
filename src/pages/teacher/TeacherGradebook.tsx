import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface StudentResult {
  id: number;
  student_id: string;
  surname: string;
  other_names: string;
  class_score: number;
  exam_score: number;
  total_score: number;
  grade: string;
  remarks: string;
  academic_year: string;
  semester: number;
  // Add teacher information
  teacher_name?: string;
  teacher_id?: string;
}

interface StudentResultInput {
  id: number | null;
  student_id: string;
  surname: string;
  other_names: string;
  class_score: number;
  exam_score: number;
}

interface TeacherSubject {
  id: number;
  subject_name: string;
  class_name: string;
  form: number;
  stream: string;
  class_id: number;
  subject_id: number;
}

interface TeacherGradebookProps {
  teacherId: number;
}

export const TeacherGradebook: React.FC<TeacherGradebookProps> = ({ teacherId }) => {
  console.log('TeacherGradebook mounted with teacherId:', teacherId);
  const [classResults, setClassResults] = useState<StudentResult[]>([]);
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [semester, setSemester] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingResult, setEditingResult] = useState<StudentResult | null>(null);
  const [teacherName, setTeacherName] = useState('');

  useEffect(() => {
    console.log('useEffect triggered in TeacherGradebook');
    fetchTeacherSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchClassResults();
    }
  }, [selectedClass, selectedSubject, academicYear, semester]);

  const fetchTeacherSubjects = async () => {
    setLoading(true);
    try {
      const subjects = await db.getTeacherSubjects(teacherId);
      console.log('Teacher subjects loaded:', subjects);
      setTeacherSubjects(subjects as TeacherSubject[]);
      
      // Auto-select the first class and subject if available
      if (subjects.length > 0) {
        console.log('Auto-selecting first class and subject:', subjects[0]);
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => {
          setSelectedClass(subjects[0].class_id);
          setSelectedSubject(subjects[0].subject_id);
          
          // Automatically load results for the first class/subject
          setTimeout(() => {
            fetchClassResults();
          }, 100);
        }, 0);
      } else {
        console.log('No subjects found for teacher:', teacherId);
        toast.error('No classes or subjects assigned to this teacher');
      }
    } catch (error) {
      console.error('Failed to fetch teacher subjects:', error);
      toast.error('Failed to load teacher subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassResults = async () => {
    if (!selectedClass || !selectedSubject) return;
    
    console.log('Fetching class results for:', { selectedClass, selectedSubject, academicYear, semester });
    setLoading(true);
    try {
      const results = await db.getClassResults(selectedClass, selectedSubject, academicYear, semester);
      console.log('Class results loaded:', results);
      setClassResults(results as StudentResult[]);
    } catch (error) {
      console.error('Failed to fetch class results:', error);
      toast.error('Failed to load class results');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = async (resultData: any) => {
    try {
      await db.saveStudentResult(resultData);
      toast.success('Result saved successfully!');
      setEditingResult(null);
      fetchClassResults();
    } catch (error) {
      console.error('Failed to save result:', error);
      toast.error('Failed to save result');
    }
  };

  const handleEditResult = (result: StudentResult) => {
    setEditingResult(result);
  };

  const handleDownloadTemplate = () => {
    if (!selectedSubject) {
      toast.error('Please select a subject first');
      return;
    }
    
    // Create template data with student information pre-filled
    let templateData = [];
    
    if (classResults.length > 0) {
      // Use existing student data if available
      templateData = classResults.map(result => ({
        'Student ID': result.student_id,
        'Surname': result.surname,
        'Other Names': result.other_names,
        'Class Score (30%)': '',
        'Exam Score (70%)': ''
      }));
    } else {
      // Create empty template if no student data
      templateData = [
        {
          'Student ID': '',
          'Surname': '',
          'Other Names': '',
          'Class Score (30%)': '',
          'Exam Score (70%)': ''
        }
      ];
    }
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Gradebook_Template');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `gradebook_template_${academicYear}_semester${semester}.xlsx`);
    toast.success('Template downloaded successfully!');
  };

  const handleDownloadExcel = () => {
    if (!selectedSubject) {
      toast.error('Please select a subject first');
      return;
    }
    
    // Convert results to worksheet format
    const worksheetData = classResults.map(result => ({
      'Student ID': result.student_id,
      'Student Name': `${result.surname}, ${result.other_names}`,
      'Class Score (30%)': result.class_score,
      'Exam Score (70%)': result.exam_score,
      'Total Score (100%)': result.total_score,
      'Grade': result.grade,
      'Remarks': result.remarks,
      'Academic Year': academicYear,
      'Semester': semester
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Results_${academicYear}_S${semester}`);
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `class_results_${academicYear}_semester${semester}.xlsx`);
    toast.success('Results exported successfully!');
  };

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedSubject) {
      toast.error('Please select a subject first');
      return;
    }
    
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          toast.error('No data found in the Excel file');
          return;
        }
        
        // Validate required columns
        const firstRow = jsonData[0];
        const requiredColumns = ['Student ID', 'Surname', 'Other Names', 'Class Score (30%)', 'Exam Score (70%)'];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));
        
        if (missingColumns.length > 0) {
          toast.error(`Missing required columns: ${missingColumns.join(', ')}`);
          return;
        }
        
        // Process imported data
        const processedResults: any[] = [];
        
        for (const row of jsonData) {
          const classScore = parseFloat(row['Class Score (30%)']) || 0;
          const examScore = parseFloat(row['Exam Score (70%)']) || 0;
          
          // Validate scores
          if (classScore < 0 || classScore > 30) {
            toast.error(`Invalid class score for student ${row['Student ID']}. Must be between 0 and 30.`);
            continue;
          }
          
          if (examScore < 0 || examScore > 70) {
            toast.error(`Invalid exam score for student ${row['Student ID']}. Must be between 0 and 70.`);
            continue;
          }
          
          // Calculate total score (class score + exam score)
          const totalScore = parseFloat((classScore + examScore).toFixed(1));
          const grade = calculateGrade(totalScore);
          const remarks = getRemark(grade);
          
          // Find existing result for this student if it exists
          const existingResult = classResults.find(r => r.student_id === row['Student ID']);
          
          processedResults.push({
            id: existingResult?.id || null,
            student_id: row['Student ID'],
            surname: row['Surname'],
            other_names: row['Other Names'],
            class_score: classScore,
            exam_score: examScore,
            total_score: totalScore,
            grade: grade,
            remarks: remarks,
            academic_year: academicYear,
            semester: semester,
            class_id: selectedClass,
            subject_id: selectedSubject
          });
        }
        
        // Save all processed results
        for (const result of processedResults) {
          try {
            await db.saveStudentResult(result);
          } catch (error) {
            console.error('Failed to save result:', error);
            toast.error(`Failed to save result for student ${result.student_id}`);
          }
        }
        
        toast.success(`Successfully imported and saved ${processedResults.length} records`);
        fetchClassResults(); // Refresh the results
        
      } catch (error) {
        console.error('Error importing Excel file:', error);
        toast.error('Failed to import Excel file: ' + (error as Error).message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const calculateGrade = (totalScore: number): string => {
    if (totalScore >= 80) return 'A1';
    if (totalScore >= 75) return 'B2';
    if (totalScore >= 70) return 'B3';
    if (totalScore >= 65) return 'C4';
    if (totalScore >= 60) return 'C5';
    if (totalScore >= 55) return 'C6';
    if (totalScore >= 50) return 'D7';
    if (totalScore >= 45) return 'E8';
    return 'F9';
  };

  const getRemark = (grade: string): string => {
    switch (grade) {
      case 'A1': return 'Excellent';
      case 'B2': return 'Very Good';
      case 'B3': return 'Good';
      case 'C4': return 'Credit';
      case 'C5': return 'Credit';
      case 'C6': return 'Credit';
      case 'D7': return 'Pass';
      case 'E8': return 'Weak Pass';
      case 'F9': return 'Fail';
      default: return '';
    }
  };

  const getClassAverage = (): number => {
    if (classResults.length === 0) return 0;
    const total = classResults.reduce((sum, result) => sum + (result.total_score || 0), 0);
    return parseFloat((total / classResults.length).toFixed(1));
  };

  const getPassCount = (): number => {
    return classResults.filter(result => 
      result.grade && !['F9'].includes(result.grade)
    ).length;
  };

  const getFailCount = (): number => {
    return classResults.filter(result => 
      result.grade && ['F9'].includes(result.grade)
    ).length;
  };

  const getTopPerformers = (): StudentResult[] => {
    return [...classResults]
      .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gradebook</h2>
          <p className="text-gray-600">Record and manage student results (Class: 30%, Exam: 70%)</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleDownloadTemplate}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${selectedSubject ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
            disabled={!selectedSubject}
          >
            <span>📋</span>
            <span>Download Template</span>
          </button>
          <button
            onClick={handleDownloadExcel}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${selectedSubject ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
            disabled={!selectedSubject}
          >
            <span>⬇️</span>
            <span>Export Results</span>
          </button>
          <label className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer ${selectedSubject ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}>
            <span>⬆️</span>
            <span>Import Results</span>
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              className="hidden" 
              onChange={handleImportExcel}
              disabled={!selectedSubject}
            />
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
            >
              <option value="">Select Class</option>
              {Array.from(new Set(teacherSubjects.map(s => s.class_id))).map(classId => {
                const classInfo = teacherSubjects.find(s => s.class_id === classId);
                return (
                  <option key={classId} value={classId}>
                    {classInfo?.class_name} (Form {classInfo?.form}{classInfo?.stream})
                  </option>
                );
              })}
            </select>
            {teacherSubjects.length === 0 && (
              <p className="text-sm text-red-500 mt-1">No classes assigned. Please contact administrator.</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={selectedSubject || ''}
              onChange={(e) => setSelectedSubject(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
              disabled={!selectedClass}
            >
              <option value="">Select Subject</option>
              {teacherSubjects
                .filter(s => s.class_id === selectedClass)
                .map(subject => (
                  <option key={subject.id} value={subject.subject_id}>
                    {subject.subject_name}
                  </option>
                ))}
            </select>
            {selectedClass && teacherSubjects.filter(s => s.class_id === selectedClass).length === 0 && (
              <p className="text-sm text-red-500 mt-1">No subjects assigned for this class.</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
            >
              <option value="2024/2025">2024/2025</option>
              <option value="2025/2026">2025/2026</option>
              <option value="2026/2027">2026/2027</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={fetchClassResults}
              className="w-full bg-school-green-600 text-white px-4 py-3 rounded-lg hover:bg-school-green-700 transition-colors"
            >
              Load Results
            </button>
          </div>
        </div>
      </div>

      {/* Analytics */}
      {classResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
            <div className="text-3xl font-bold text-gray-900">
              {getClassAverage()}
            </div>
            <div className="text-gray-600 mt-1">Class Average</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
            <div className="text-3xl font-bold text-green-600">
              {getPassCount()}
            </div>
            <div className="text-gray-600 mt-1">Passes</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
            <div className="text-3xl font-bold text-red-600">
              {getFailCount()}
            </div>
            <div className="text-gray-600 mt-1">Fails</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
            <div className="text-3xl font-bold text-blue-600">
              {classResults.length}
            </div>
            <div className="text-gray-600 mt-1">Total Students</div>
          </div>
        </div>
      )}

      {/* Top Performers */}
      {classResults.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Top 3 Performers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getTopPerformers().map((student, index) => (
              <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-gray-900 mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {student.surname}, {student.other_names}
                    </div>
                    <div className="text-sm text-gray-600">{student.student_id}</div>
                  </div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">
                    {student.total_score?.toFixed(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    student.grade === 'A1' ? 'bg-green-100 text-green-800' :
                    student.grade === 'B2' ? 'bg-blue-100 text-blue-800' :
                    student.grade === 'B3' ? 'bg-blue-100 text-blue-800' :
                    student.grade === 'C4' ? 'bg-yellow-100 text-yellow-800' :
                    student.grade === 'C5' ? 'bg-yellow-100 text-yellow-800' :
                    student.grade === 'C6' ? 'bg-yellow-100 text-yellow-800' :
                    student.grade === 'D7' ? 'bg-orange-100 text-orange-800' :
                    student.grade === 'E8' ? 'bg-red-100 text-red-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {student.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="bg-school-green-600 text-white p-6">
          <h3 className="text-xl font-bold">Class Results</h3>
          <p className="text-school-green-100">
            {classResults.length} students | Classwork: 30% | Exams: 70%
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-school-cream-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Student</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Student ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Class Score (30%)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Exam Score (70%)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Total Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Grade</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Remarks</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-school-cream-200">
              {classResults.length > 0 ? (
                classResults.map((result) => (
                  <tr key={result.id} className="hover:bg-school-cream-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {result.surname}, {result.other_names}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {result.student_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <input
                        type="number"
                        value={result.class_score || ''}
                        onChange={(e) => {
                          const newClassScore = parseFloat(e.target.value) || 0;
                          // Validate class score range (0-30)
                          if (newClassScore < 0 || newClassScore > 30) {
                            toast.error('Class score must be between 0 and 30');
                            return;
                          }
                          
                          const newExamScore = result.exam_score || 0;
                          const newTotalScore = parseFloat((newClassScore + newExamScore).toFixed(1));
                          const newGrade = calculateGrade(newTotalScore);
                          const newRemark = getRemark(newGrade);
                          
                          setClassResults(classResults.map(r => 
                            r.id === result.id 
                              ? {
                                  ...r, 
                                  class_score: newClassScore, 
                                  total_score: newTotalScore, 
                                  grade: newGrade, 
                                  remarks: newRemark
                                } 
                              : r
                          ));
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        min="0"
                        max="30"
                        step="0.1"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <input
                        type="number"
                        value={result.exam_score || ''}
                        onChange={(e) => {
                          const newExamScore = parseFloat(e.target.value) || 0;
                          // Validate exam score range (0-70)
                          if (newExamScore < 0 || newExamScore > 70) {
                            toast.error('Exam score must be between 0 and 70');
                            return;
                          }
                          
                          const newClassScore = result.class_score || 0;
                          const newTotalScore = parseFloat((newClassScore + newExamScore).toFixed(1));
                          const newGrade = calculateGrade(newTotalScore);
                          const newRemark = getRemark(newGrade);
                          
                          setClassResults(classResults.map(r => 
                            r.id === result.id 
                              ? {
                                  ...r, 
                                  exam_score: newExamScore, 
                                  total_score: newTotalScore, 
                                  grade: newGrade, 
                                  remarks: newRemark
                                } 
                              : r
                          ));
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        min="0"
                        max="70"
                        step="0.1"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {result.total_score?.toFixed(1) || '0.0'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.grade === 'A1' ? 'bg-green-100 text-green-800' :
                        result.grade === 'B2' ? 'bg-blue-100 text-blue-800' :
                        result.grade === 'B3' ? 'bg-blue-100 text-blue-800' :
                        result.grade === 'C4' ? 'bg-yellow-100 text-yellow-800' :
                        result.grade === 'C5' ? 'bg-yellow-100 text-yellow-800' :
                        result.grade === 'C6' ? 'bg-yellow-100 text-yellow-800' :
                        result.grade === 'D7' ? 'bg-orange-100 text-orange-800' :
                        result.grade === 'E8' ? 'bg-red-100 text-red-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.grade || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <input
                        type="text"
                        value={result.remarks || ''}
                        onChange={(e) => {
                          setClassResults(classResults.map(r => 
                            r.id === result.id 
                              ? {...r, remarks: e.target.value} 
                              : r
                          ));
                        }}
                        className="w-32 px-2 py-1 border border-gray-300 rounded"
                        placeholder="Remarks"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <button
                        onClick={() => handleSaveResult({
                          ...result,
                          class_id: selectedClass,
                          subject_id: selectedSubject,
                          academic_year: academicYear,
                          semester: semester
                        })}
                        className="text-school-green-600 hover:text-school-green-800 mr-3"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleEditResult(result)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <div className="text-4xl mb-4">📊</div>
                      <p className="text-lg font-medium">No results found</p>
                      <p className="text-sm">Select a class and subject to view results</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={() => {
              // Save all results
              classResults.forEach(result => {
                handleSaveResult({
                  ...result,
                  class_id: selectedClass,
                  subject_id: selectedSubject,
                  academic_year: academicYear,
                  semester: semester
                });
              });
              toast.success('All results saved successfully!');
            }}
            className={`px-6 py-2 rounded-lg transition-colors ${selectedSubject ? 'bg-school-green-600 text-white hover:bg-school-green-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
            disabled={!selectedSubject}
          >
            Save All Results
          </button>
        </div>
      </div>
    </div>
  );
};