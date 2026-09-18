import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { getScheduleStatus, getStatusLabel, getStatusColor } from '../../lib/dates';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import {
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

export function AdminExamReports() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<{title: string, dueDate: string} | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExams = useMemo(() => {
    if (!searchQuery.trim()) return exams;
    const q = searchQuery.toLowerCase();
    return exams.filter((e: any) =>
      e.title?.toLowerCase().includes(q) ||
      e.subject_name?.toLowerCase().includes(q) ||
      e.exam_type?.toLowerCase().includes(q)
    );
  }, [exams, searchQuery]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await db.getGeneralExams();
      
      const grouped = data.reduce((acc: any, curr: any) => {
        const key = `${curr.title}_${curr.due_date}`;
        if (!acc[key]) {
          acc[key] = {
            title: curr.title,
            due_date: curr.due_date,
            exam_type: curr.exam_type,
            subject_name: curr.subject_name,
            duration_minutes: curr.duration_minutes,
            has_obj: curr.has_obj,
            has_theory: curr.has_theory,
            classCount: 1
          };
        } else {
          acc[key].classCount += 1;
        }
        return acc;
      }, {});
      
      setExams(Object.values(grouped));
    } catch (error) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (title: string, dueDate: string) => {
    try {
      setReportsLoading(true);
      setSelectedExam({ title, dueDate });
      const data = await db.getExamReports(title, dueDate);
      setReports(data || []);
    } catch (error) {
      toast.error('Failed to load reports for this exam');
    } finally {
      setReportsLoading(false);
    }
  };

  const objAverage = reports.length > 0 
    ? (reports.reduce((acc, r) => acc + (Number(r.obj_score) || 0), 0) / reports.length).toFixed(1)
    : '0.0';
    
  const theoryAverage = reports.length > 0 
    ? (reports.reduce((acc, r) => acc + (Number(r.theory_score) || 0), 0) / reports.length).toFixed(1)
    : '0.0';

  const totalAverage = reports.length > 0 
    ? (reports.reduce((acc, r) => acc + (Number(r.score) || 0), 0) / reports.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {!selectedExam ? (
        <div className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Examination Assessment Reports</h2>
              <p className="text-xs text-gray-500 mt-0.5">Select a scheduled assessment to inspect marks, cohort percentiles, and scores</p>
            </div>
            <div className="relative w-full sm:w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assessments..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-sm text-xs focus:ring-1 focus:ring-school-green-500 focus:border-school-green-500 bg-white"
              />
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {loading ? (
              <LoadingSkeleton variant="card" rows={3} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExams.map((exam, i) => (
                  <div
                    key={i}
                    onClick={() => fetchReports(exam.title, exam.due_date)}
                    className="bg-white border border-gray-200 rounded-md p-4 hover:border-school-green-600 hover:shadow-xs transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-sm text-[11px] font-medium">
                        {exam.exam_type || 'General'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-sm text-[11px] font-semibold ${getStatusColor(exam.due_date, exam.duration_minutes)}`}>
                        {getStatusLabel(exam.due_date, exam.duration_minutes)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{exam.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{exam.subject_name}</p>
                    </div>
                    
                    <div className="flex gap-1.5">
                      {exam.has_obj && <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-sm text-[10px] font-semibold">OBJ</span>}
                      {exam.has_theory && <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-sm text-[10px] font-semibold">Theory</span>}
                    </div>
                    
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <span>Participating Cohorts:</span>
                      <strong className="text-gray-900 tabular-nums">{exam.classCount} classes</strong>
                    </div>
                  </div>
                ))}
                {filteredExams.length === 0 && (
                  <p className="text-xs text-gray-400 col-span-3 text-center py-12">
                    {searchQuery ? 'No examinations match your search criteria.' : 'No general examinations recorded.'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedExam(null)}
                className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-sm hover:bg-gray-100 transition-colors text-xs font-medium text-gray-700 flex items-center gap-1"
              >
                <ArrowLeftIcon className="w-3.5 h-3.5" />
                <span>Return to Assessments</span>
              </button>
              <div>
                <h2 className="text-base font-bold text-gray-900">{selectedExam.title} - Candidate Score Dossier</h2>
                <p className="text-xs text-gray-500 tabular-nums font-mono">
                  Scheduled: {new Date(selectedExam.dueDate).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
              >
                <PrinterIcon className="w-4 h-4 text-gray-500" />
                <span>Print Ledger</span>
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {reportsLoading ? (
              <div className="py-12">
                <LoadingSkeleton variant="table" rows={6} columns={7} />
              </div>
            ) : (
              <>
                {/* Analytics Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-md border border-gray-200 p-4 shadow-xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Submissions</span>
                    <p className="text-2xl font-bold text-school-green-800 mt-1 tabular-nums">{reports.length}</p>
                    <span className="text-[11px] text-gray-400 mt-1 block">Graded and logged candidate scripts</span>
                  </div>
                  <div className="bg-white rounded-md border border-gray-200 p-4 shadow-xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Average OBJ Score</span>
                    <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{objAverage}</p>
                    <span className="text-[11px] text-gray-400 mt-1 block">Objective auto-evaluated mean</span>
                  </div>
                  <div className="bg-white rounded-md border border-gray-200 p-4 shadow-xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Average Theory Score</span>
                    <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{theoryAverage}</p>
                    <span className="text-[11px] text-gray-400 mt-1 block">Written assessment teacher marks</span>
                  </div>
                  <div className="bg-gray-900 rounded-md border border-gray-800 p-4 shadow-xs text-white">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Overall Mean Grade</span>
                    <p className="text-2xl font-bold text-white mt-1 tabular-nums">{totalAverage}</p>
                    <span className="text-[11px] text-gray-400 mt-1 block">Composite score percentage</span>
                  </div>
                </div>

                {/* Candidate Mark Ledger */}
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Admission No.</th>
                          <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Candidate Name</th>
                          <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Class Arm</th>
                          <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">OBJ Mark</th>
                          <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Theory Mark</th>
                          <th className="px-4 py-3 font-semibold text-school-green-800 uppercase tracking-wider text-right">Composite Score</th>
                          <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {reports.map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-4 py-3 font-mono font-medium text-gray-900 tabular-nums">{r.admission_number}</td>
                            <td className="px-4 py-3 font-semibold text-gray-900">{r.surname}, {r.other_names}</td>
                            <td className="px-4 py-3 text-gray-600">{r.class_name}</td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-gray-700">
                              {r.obj_score !== null ? r.obj_score : '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-gray-700">
                              {r.theory_score !== null ? r.theory_score : '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-bold font-mono tabular-nums text-school-green-700">
                              {r.score !== null ? r.score : '—'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-sm ${
                                r.status === 'graded' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}>
                                {r.status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {reports.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-4 py-12 text-center text-xs text-gray-400">
                              No candidate submissions currently recorded for this examination.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
