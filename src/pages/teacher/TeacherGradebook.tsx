import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { UserAvatar } from '../../components/UserAvatar';

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
  teacher_name?: string;
  teacher_id?: string;
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
  const [classResults, setClassResults] = useState<StudentResult[]>([]);
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [semester, setSemester] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [gradingWeights, setGradingWeights] = useState({ classScore: 30, examScore: 70 });

  useEffect(() => {
    fetchTeacherSubjects();
    fetchGradingWeights();
  }, []);

  const fetchGradingWeights = async () => {
    try {
      const weights = await db.getGradingWeights();
      setGradingWeights(weights);
    } catch (error) {
      console.error('Failed to fetch grading weights:', error);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchClassResults();
    }
  }, [selectedClass, selectedSubject, academicYear, semester]);

  const fetchTeacherSubjects = async () => {
    setLoading(true);
    try {
      const subjects = await db.getTeacherSubjects(teacherId);
      setTeacherSubjects(subjects as TeacherSubject[]);
      
      if (subjects.length > 0) {
        setSelectedClass(subjects[0].class_id);
        setSelectedSubject(subjects[0].subject_id);
      } else {
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
    
    setLoading(true);
    try {
      const results = await db.getClassResults(selectedClass, selectedSubject, academicYear, semester);
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
      toast.success('Result saved successfully');
      fetchClassResults();
    } catch (error) {
      console.error('Failed to save result:', error);
      toast.error('Failed to save result');
    }
  };

  const handleSaveAll = async () => {
    if (!selectedClass || !selectedSubject) return;
    setSavingAll(true);
    try {
      for (const result of classResults) {
        await db.saveStudentResult({
          ...result,
          class_id: selectedClass,
          subject_id: selectedSubject,
          academic_year: academicYear,
          semester: semester
        });
      }
      toast.success('All student grades saved successfully');
      fetchClassResults();
    } catch (error) {
      console.error('Failed to save all results:', error);
      toast.error('Failed to save some results');
    } finally {
      setSavingAll(false);
    }
  };

  const handleDownloadTemplate = () => {
    if (!selectedSubject) {
      toast.error('Please select a subject first');
      return;
    }
    
    let templateData = [];
    if (classResults.length > 0) {
      templateData = classResults.map(result => ({
        'Student ID': result.student_id,
        'Surname': result.surname,
        'Other Names': result.other_names,
        [`Class Score (${gradingWeights.classScore}%)`]: '',
        [`Exam Score (${gradingWeights.examScore}%)`]: '',
        'Remarks': ''
      }));
    } else {
      templateData = [
        {
          'Student ID': 'STU2026001',
          'Surname': 'Mensah',
          'Other Names': 'Kwame',
          [`Class Score (${gradingWeights.classScore}%)`]: 24.5,
          [`Exam Score (${gradingWeights.examScore}%)`]: 58.0,
          'Remarks': 'Excellent work'
        }
      ];
    }
    
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Grade Template');
    const selectedSub = teacherSubjects.find(s => s.subject_id === selectedSubject);
    const filename = `${selectedSub?.class_name || 'Class'}_${selectedSub?.subject_name || 'Subject'}_Template.xlsx`;
    XLSX.writeFile(wb, filename);
    toast.success('Template downloaded');
  };

  const handleDownloadExcel = () => {
    if (classResults.length === 0) {
      toast.error('No results to export');
      return;
    }
    const exportData = classResults.map(r => ({
      'Student ID': r.student_id,
      'Surname': r.surname,
      'Other Names': r.other_names,
      [`Class Score (${gradingWeights.classScore}%)`]: r.class_score || 0,
      [`Exam Score (${gradingWeights.examScore}%)`]: r.exam_score || 0,
      'Total Score': r.total_score || 0,
      'Grade': r.grade || '-',
      'Remarks': r.remarks || ''
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    const selectedSub = teacherSubjects.find(s => s.subject_id === selectedSubject);
    const filename = `${selectedSub?.class_name || 'Class'}_${selectedSub?.subject_name || 'Subject'}_Grades.xlsx`;
    XLSX.writeFile(wb, filename);
    toast.success('Results exported');
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        if (jsonData.length === 0) {
          toast.error('Import file contains no data');
          return;
        }

        const classScoreCol = Object.keys(jsonData[0]).find(k => k.includes('Class Score')) || 'Class Score';
        const examScoreCol = Object.keys(jsonData[0]).find(k => k.includes('Exam Score')) || 'Exam Score';

        let count = 0;
        for (const row of jsonData) {
          const classScore = parseFloat(row[classScoreCol]) || 0;
          const examScore = parseFloat(row[examScoreCol]) || 0;
          const totalScore = parseFloat((classScore + examScore).toFixed(1));
          const grade = calculateGrade(totalScore);
          const remarks = getRemark(grade);
          const existingResult = classResults.find(r => r.student_id === row['Student ID']);

          await db.saveStudentResult({
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
          count++;
        }
        toast.success(`Imported and saved ${count} records`);
        fetchClassResults();
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import file');
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
      case 'C4':
      case 'C5':
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
    return classResults.filter(result => result.grade && result.grade !== 'F9').length;
  };

  const getFailCount = (): number => {
    return classResults.filter(result => result.grade === 'F9').length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Academic Gradebook</h2>
          <p className="text-xs text-gray-500 tabular-nums">
            Continuous Assessment ({gradingWeights.classScore}%) + Terminal Examination ({gradingWeights.examScore}%)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PortalButton
            variant="secondary"
            onClick={handleDownloadTemplate}
            disabled={!selectedSubject}
            className="text-xs !min-h-[36px] !py-1"
          >
            Template (.xlsx)
          </PortalButton>
          <PortalButton
            variant="secondary"
            onClick={handleDownloadExcel}
            disabled={!selectedSubject || classResults.length === 0}
            className="text-xs !min-h-[36px] !py-1"
          >
            Export Sheet
          </PortalButton>
          <label className={`min-h-[36px] px-3 py-1 rounded-sm text-xs font-semibold border inline-flex items-center cursor-pointer transition ${
            selectedSubject
              ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
          }`}>
            <span>Import Grades</span>
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

      {/* Filters Bar */}
      <PortalCard className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Class</label>
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(parseInt(e.target.value))}
              className="w-full min-h-[44px] px-3 py-2 bg-white border border-gray-300 rounded-sm text-xs font-medium text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
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
          </div>
          
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Subject</label>
            <select
              value={selectedSubject || ''}
              onChange={(e) => setSelectedSubject(parseInt(e.target.value))}
              className="w-full min-h-[44px] px-3 py-2 bg-white border border-gray-300 rounded-sm text-xs font-medium text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
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
          </div>
          
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Academic Year</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 bg-white border border-gray-300 rounded-sm text-xs font-medium text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600 tabular-nums"
            >
              <option value="2024/2025">2024/2025</option>
              <option value="2025/2026">2025/2026</option>
              <option value="2026/2027">2026/2027</option>
            </select>
          </div>
          
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(parseInt(e.target.value))}
              className="w-full min-h-[44px] px-3 py-2 bg-white border border-gray-300 rounded-sm text-xs font-medium text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <PortalButton
              variant="primary"
              onClick={fetchClassResults}
              loading={loading}
              loadingText="Loading..."
              className="w-full !min-h-[44px]"
            >
              Load Roster
            </PortalButton>
          </div>
        </div>
      </PortalCard>

      {/* Analytics Row */}
      {classResults.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <PortalCard className="p-4">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Class Average</span>
            <div className="text-2xl font-bold text-gray-900 tabular-nums">{getClassAverage()}%</div>
          </PortalCard>
          <PortalCard className="p-4">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Passing Students</span>
            <div className="text-2xl font-bold text-school-green-700 tabular-nums">{getPassCount()}</div>
          </PortalCard>
          <PortalCard className="p-4">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Needs Improvement</span>
            <div className="text-2xl font-bold text-red-600 tabular-nums">{getFailCount()}</div>
          </PortalCard>
          <PortalCard className="p-4">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Total Enrolled</span>
            <div className="text-2xl font-bold text-gray-900 tabular-nums">{classResults.length}</div>
          </PortalCard>
        </div>
      )}

      {/* Results Table */}
      <PortalCard className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Student Assessment Matrix</h3>
            <p className="text-xs text-gray-500 tabular-nums">
              Classwork ({gradingWeights.classScore}%) • Exam ({gradingWeights.examScore}%) • Total (100%)
            </p>
          </div>
          <PortalButton
            variant="primary"
            onClick={handleSaveAll}
            loading={savingAll}
            loadingText="Saving all grades..."
            disabled={!selectedSubject || classResults.length === 0}
            className="text-xs !min-h-[36px] !py-1"
          >
            Save All Grades
          </PortalButton>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student ID</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Class Score ({gradingWeights.classScore}%)</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Exam Score ({gradingWeights.examScore}%)</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Total</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Grade</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Remarks</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {classResults.length > 0 ? (
                classResults.map((result) => {
                  const fullName = `${result.surname}, ${result.other_names}`;
                  return (
                    <tr key={result.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar name={fullName} size="sm" />
                          <span className="text-xs font-semibold text-gray-900">{fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs font-mono font-medium text-gray-600 tabular-nums">
                        {result.student_id}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <input
                          type="number"
                          value={result.class_score || ''}
                          onChange={(e) => {
                            const newClassScore = parseFloat(e.target.value) || 0;
                            if (newClassScore < 0 || newClassScore > gradingWeights.classScore) {
                              toast.error(`Class score must be between 0 and ${gradingWeights.classScore}`);
                              return;
                            }
                            const newExamScore = result.exam_score || 0;
                            const newTotalScore = parseFloat((newClassScore + newExamScore).toFixed(1));
                            const newGrade = calculateGrade(newTotalScore);
                            const newRemark = getRemark(newGrade);
                            setClassResults(classResults.map(r => 
                              r.id === result.id 
                                ? { ...r, class_score: newClassScore, total_score: newTotalScore, grade: newGrade, remarks: newRemark } 
                                : r
                            ));
                          }}
                          className="w-16 px-2 py-1 bg-white border border-gray-300 rounded-sm text-xs text-right font-mono tabular-nums font-semibold focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600 outline-none"
                          min="0"
                          max={gradingWeights.classScore}
                          step="0.1"
                        />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <input
                          type="number"
                          value={result.exam_score || ''}
                          onChange={(e) => {
                            const newExamScore = parseFloat(e.target.value) || 0;
                            if (newExamScore < 0 || newExamScore > gradingWeights.examScore) {
                              toast.error(`Exam score must be between 0 and ${gradingWeights.examScore}`);
                              return;
                            }
                            const newClassScore = result.class_score || 0;
                            const newTotalScore = parseFloat((newClassScore + newExamScore).toFixed(1));
                            const newGrade = calculateGrade(newTotalScore);
                            const newRemark = getRemark(newGrade);
                            setClassResults(classResults.map(r => 
                              r.id === result.id 
                                ? { ...r, exam_score: newExamScore, total_score: newTotalScore, grade: newGrade, remarks: newRemark } 
                                : r
                            ));
                          }}
                          className="w-16 px-2 py-1 bg-white border border-gray-300 rounded-sm text-xs text-right font-mono tabular-nums font-semibold focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600 outline-none"
                          min="0"
                          max={gradingWeights.examScore}
                          step="0.1"
                        />
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-xs text-gray-900 tabular-nums">
                        {result.total_score ? result.total_score.toFixed(1) : '-'}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-sm text-[11px] font-bold border tabular-nums ${
                          result.grade === 'A1' ? 'bg-school-green-50 text-school-green-800 border-school-green-200' :
                          result.grade?.startsWith('B') ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          result.grade?.startsWith('C') ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          result.grade === 'D7' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                          result.grade === 'E8' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                          result.grade === 'F9' ? 'bg-red-50 text-red-800 border-red-200' :
                          'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                          {result.grade || '-'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <input
                          type="text"
                          value={result.remarks || ''}
                          onChange={(e) => {
                            setClassResults(classResults.map(r => 
                              r.id === result.id ? { ...r, remarks: e.target.value } : r
                            ));
                          }}
                          className="w-28 px-2 py-1 bg-white border border-gray-300 rounded-sm text-xs focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600 outline-none"
                          placeholder="Remarks"
                        />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleSaveResult({
                            ...result,
                            class_id: selectedClass,
                            subject_id: selectedSubject,
                            academic_year: academicYear,
                            semester: semester
                          })}
                          className="min-h-[32px] px-2.5 py-1 rounded-sm text-xs font-semibold text-school-green-700 hover:bg-school-green-50 border border-school-green-200 transition"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-xs">
                    No results recorded for this subject and term. Select a class and subject above to view or enter scores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PortalCard>
    </div>
  );
};