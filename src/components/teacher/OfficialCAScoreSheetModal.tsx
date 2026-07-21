import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface OfficialCAScoreSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: any;
  submissions: any[];
}

interface DynamicColumn {
  id: string;
  name: string;
  weight: number;
  is_auto_obj: boolean;
}

interface CASheetRow {
  id: string | number;
  studentNumber: string;
  fullName: string;
  scores: Record<string, string>; // columnId -> raw score
  isVerified: boolean;
  pinCheck: string;
  totalScore: string;
}

export const OfficialCAScoreSheetModal: React.FC<OfficialCAScoreSheetModalProps> = ({
  isOpen,
  onClose,
  exam,
  submissions
}) => {
  const [columns, setColumns] = useState<DynamicColumn[]>([]);
  const [rows, setRows] = useState<CASheetRow[]>([]);

  const maxScore = Number(exam?.max_score) || 100;

  useEffect(() => {
    if (isOpen && exam) {
      // 1. Determine dynamic columns
      let cols: DynamicColumn[] = [];
      try {
        if (exam.ca_columns_json) {
          cols = typeof exam.ca_columns_json === 'string' 
            ? JSON.parse(exam.ca_columns_json) 
            : exam.ca_columns_json;
        }
      } catch (e) {
        cols = [];
      }

      if (!cols || cols.length === 0) {
        const objW = Number(exam.ca_weight_obj) ?? 40;
        const thW = Number(exam.ca_weight_theory) ?? 60;
        cols = [
          { id: 'col_obj', name: 'Auto-Graded Objective (APK)', weight: objW, is_auto_obj: true },
          { id: 'col_theory', name: 'Manual Written Theory', weight: thW, is_auto_obj: false }
        ];
      }
      setColumns(cols);

      // 2. Initialize pre-filled rows
      if (submissions && submissions.length > 0) {
        const initialRows = submissions.map((sub, idx) => {
          const objNum = sub.obj_score !== null && sub.obj_score !== undefined ? Number(sub.obj_score) : null;
          const theoryNum = sub.theory_score !== null && sub.theory_score !== undefined ? Number(sub.theory_score) : null;

          const scoresMap: Record<string, string> = {};
          let totalWeighted = 0;

          cols.forEach(col => {
            if (col.is_auto_obj) {
              scoresMap[col.id] = objNum !== null ? String(objNum) : '';
              if (objNum !== null) {
                totalWeighted += (objNum / maxScore) * col.weight;
              }
            } else {
              // For main theory column, prefill with theory_score if available
              if (col.id === 'col_theory' && theoryNum !== null) {
                scoresMap[col.id] = String(theoryNum);
                totalWeighted += (theoryNum / maxScore) * col.weight;
              } else {
                scoresMap[col.id] = '';
              }
            }
          });

          return {
            id: sub.submission_id || sub.student_id || idx,
            studentNumber: String(sub.admission_number || sub.student_id || `STU-${idx + 1}`),
            fullName: `${sub.surname || ''}, ${sub.other_names || ''}`.replace(/^, /, '').trim() || `Student ${idx + 1}`,
            scores: scoresMap,
            isVerified: false,
            pinCheck: 'VERIFIED [  ]',
            totalScore: totalWeighted > 0 ? totalWeighted.toFixed(1) : ''
          };
        });
        setRows(initialRows);
      } else {
        setRows([]);
      }
    }
  }, [isOpen, exam, submissions, maxScore]);

  if (!isOpen || !exam) return null;

  const calculateTotal = (scoresMap: Record<string, string>, cols: DynamicColumn[]) => {
    let total = 0;
    let hasAnyScore = false;
    cols.forEach(col => {
      const val = parseFloat(scoresMap[col.id]);
      if (!isNaN(val)) {
        hasAnyScore = true;
        total += (val / maxScore) * col.weight;
      }
    });
    return hasAnyScore ? total.toFixed(1) : '';
  };

  const handleScoreChange = (rowIndex: number, colId: string, value: string) => {
    const updated = [...rows];
    const row = { ...updated[rowIndex] };
    const newScores = { ...row.scores, [colId]: value };
    row.scores = newScores;
    row.totalScore = calculateTotal(newScores, columns);
    updated[rowIndex] = row;
    setRows(updated);
  };

  const handleRowTextChange = (rowIndex: number, field: 'studentNumber' | 'fullName', value: string) => {
    const updated = [...rows];
    updated[rowIndex] = { ...updated[rowIndex], [field]: value };
    setRows(updated);
  };

  const handleToggleVerifyRow = (rowIndex: number) => {
    const updated = [...rows];
    const newStatus = !updated[rowIndex].isVerified;
    updated[rowIndex].isVerified = newStatus;
    updated[rowIndex].pinCheck = newStatus ? 'VERIFIED [ ✓ ]' : 'VERIFIED [  ]';
    setRows(updated);
  };

  const handleVerifyAllPINs = () => {
    const updated = rows.map(r => ({
      ...r,
      isVerified: true,
      pinCheck: 'VERIFIED [ ✓ ]'
    }));
    setRows(updated);
    toast.success('✓ All student Attendance PINs & physical booklets marked as verified!');
  };

  const handleAddRow = () => {
    const newIndex = rows.length + 1;
    const scoresMap: Record<string, string> = {};
    columns.forEach(c => scoresMap[c.id] = '');
    setRows([
      ...rows,
      {
        id: `custom-${Date.now()}`,
        studentNumber: `STU-${newIndex}`,
        fullName: '',
        scores: scoresMap,
        isVerified: false,
        pinCheck: 'VERIFIED [  ]',
        totalScore: ''
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setRows(rows.filter((_, idx) => idx !== index));
  };

  const handleExportCSV = () => {
    if (rows.length === 0) {
      toast.error('No student rows to export.');
      return;
    }

    const colHeaders = columns.map(c => `${c.name} (${c.weight}%)`);
    const headers = [
      'Student Number',
      'Student Full Name',
      ...colHeaders,
      'Attendance PIN Check',
      'Final Total Percentage (100%)'
    ];

    const csvRows = rows.map(r => [
      `"${r.studentNumber}"`,
      `"${r.fullName}"`,
      ...columns.map(c => r.scores[c.id] || ''),
      `"${r.pinCheck}"`,
      r.totalScore || ''
    ]);

    const csvContent = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Official_CA_ScoreSheet_${exam.title.replace(/\s+/g, '_')}_${exam.class_name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Edited CA Score Sheet exported as CSV!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ca-printable-sheet, #ca-printable-sheet * {
            visibility: visible;
          }
          #ca-printable-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white;
            color: black;
          }
          .no-print {
            display: none !important;
          }
          input {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            font-weight: bold !important;
            color: black !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        {/* Modal Header */}
        <div className="bg-school-green-700 text-white p-6 flex justify-between items-center shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <span className="text-2xl">🏛️</span>
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Official Continuous Assessment (CA) Score Sheet Studio</h2>
              <p className="text-xs text-school-green-100 font-medium">
                Columns dynamically generated from the Continuous Assessment template schema. Bulk verify PINs & live edit scores.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Toolbar & Action Controls */}
        <div className="p-5 bg-school-green-50/60 border-b border-school-green-100 flex flex-wrap items-center justify-between gap-4 shrink-0 no-print">
          <div className="flex flex-wrap items-center gap-2">
            {columns.map(c => (
              <span key={c.id} className={`px-2.5 py-1 text-white rounded-full text-xs font-black uppercase tracking-wider ${c.is_auto_obj ? 'bg-school-green-600' : 'bg-purple-600'}`}>
                {c.name}: {c.weight}%
              </span>
            ))}
            <span className="px-2.5 py-1 bg-gray-800 text-white rounded-full text-xs font-bold">
              Rows: {rows.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleVerifyAllPINs}
              className="flex items-center px-3.5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-xs transition shadow-sm"
              title="Verify all student attendance PINs and physical booklets instantly"
            >
              ✓ Verify All PINs at Once
            </button>
            <button
              onClick={handleAddRow}
              className="flex items-center px-3 py-2 bg-white text-school-green-700 border border-school-green-300 rounded-xl hover:bg-school-green-50 font-bold text-xs transition shadow-sm"
            >
              + Add Student Row
            </button>
            {exam.ca_pdf_url && (
              <a 
                href={exam.ca_pdf_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center px-3.5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-xs transition shadow-sm"
              >
                📥 View Admin CA Template PDF
              </a>
            )}
            <button
              onClick={handleExportCSV}
              className="flex items-center px-4 py-2 bg-school-green-600 text-white rounded-xl hover:bg-school-green-700 font-bold text-xs transition shadow-sm"
            >
              Download Edited CSV Sheet
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-black font-bold text-xs transition shadow-sm"
            >
              🖨️ Print Sheet (PDF)
            </button>
          </div>
        </div>

        {/* Printable & Editable Score Sheet Table Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white" id="ca-printable-sheet">
          <div className="space-y-6 max-w-6xl mx-auto border-2 border-gray-800 p-8 rounded-2xl bg-white shadow-sm">
            {/* School Header Box */}
            <div className="text-center pb-6 border-b-2 border-gray-800 space-y-1">
              <h1 className="text-2xl font-black uppercase tracking-wider text-gray-900">
                AKIM ASAFO SENIOR HIGH SCHOOL
              </h1>
              <h2 className="text-base font-bold uppercase text-school-green-800 tracking-wide">
                OFFICIAL CONTINUOUS ASSESSMENT & EXAMINATION GRADING SHEET
              </h2>
              <p className="text-xs text-gray-600 italic">
                Ghana Education Service (GES) Standards • Dynamic Columns from Continuous Assessment Sheet Schema
              </p>
            </div>

            {/* Exam & Subject Information Table */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-300 text-xs">
              <div>
                <span className="font-bold text-gray-500 uppercase block">Examination Title:</span>
                <span className="font-black text-gray-900 text-sm">{exam.title}</span>
              </div>
              <div>
                <span className="font-bold text-gray-500 uppercase block">Subject / Department:</span>
                <span className="font-black text-gray-900 text-sm">{exam.subject_name}</span>
              </div>
              <div>
                <span className="font-bold text-gray-500 uppercase block">Target Class:</span>
                <span className="font-black text-gray-900 text-sm">{exam.class_name}</span>
              </div>
              <div>
                <span className="font-bold text-gray-500 uppercase block">Dynamic Columns Check:</span>
                <span className="font-bold text-green-700">{columns.length} Section Headers Created</span>
              </div>
            </div>

            {/* Admin Policy / Instructions */}
            {exam.ca_instructions && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900">
                <strong>🏛️ Official Grading Instructions:</strong> {exam.ca_instructions}
              </div>
            )}

            {/* Dynamic Columns Editable Students Score Sheet Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-800 text-xs text-left">
                <thead>
                  <tr className="bg-gray-100 font-black text-gray-800 border-b border-gray-800 uppercase text-[11px]">
                    <th className="border border-gray-800 px-2 py-2.5 w-10 text-center">#</th>
                    <th className="border border-gray-800 px-3 py-2.5 min-w-[120px]">Student Number</th>
                    <th className="border border-gray-800 px-3 py-2.5 min-w-[170px]">Student Full Name</th>
                    {columns.map(col => (
                      <th 
                        key={col.id} 
                        className={`border border-gray-800 px-2.5 py-2.5 text-center min-w-[110px] ${
                          col.is_auto_obj ? 'bg-green-50/80 text-green-900' : 'bg-purple-50/80 text-purple-900'
                        }`}
                      >
                        <div className="font-black">{col.name}</div>
                        <div className="text-[10px] opacity-75">Weight: {col.weight}%</div>
                      </th>
                    ))}
                    <th className="border border-gray-800 px-3 py-2.5 text-center bg-amber-50 text-amber-900 min-w-[140px]">
                      Attendance PIN Check
                    </th>
                    <th className="border border-gray-800 px-2.5 py-2.5 text-center font-black bg-gray-50 min-w-[90px]">
                      Final Total (%)
                    </th>
                    <th className="border border-gray-800 px-2 py-2.5 text-center w-10 no-print">Del</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.id} className="border-b border-gray-600 hover:bg-gray-50 transition">
                      <td className="border border-gray-600 px-2 py-2 text-center font-bold text-gray-500">{idx + 1}</td>
                      <td className="border border-gray-600 px-2 py-1.5">
                        <input
                          type="text"
                          value={row.studentNumber}
                          onChange={(e) => handleRowTextChange(idx, 'studentNumber', e.target.value)}
                          className="w-full font-mono font-bold text-gray-800 bg-transparent border-0 focus:ring-1 focus:ring-school-green-500 rounded px-1 py-1 text-xs"
                          placeholder="STU-001"
                        />
                      </td>
                      <td className="border border-gray-600 px-2 py-1.5">
                        <input
                          type="text"
                          value={row.fullName}
                          onChange={(e) => handleRowTextChange(idx, 'fullName', e.target.value)}
                          className="w-full font-bold text-gray-900 bg-transparent border-0 focus:ring-1 focus:ring-school-green-500 rounded px-1 py-1 text-xs"
                          placeholder="Student Name"
                        />
                      </td>
                      
                      {columns.map(col => (
                        <td 
                          key={col.id} 
                          className={`border border-gray-600 px-2 py-1.5 ${
                            col.is_auto_obj ? 'bg-green-50/30' : 'bg-purple-50/20'
                          }`}
                        >
                          <input
                            type="number"
                            value={row.scores[col.id] || ''}
                            onChange={(e) => handleScoreChange(idx, col.id, e.target.value)}
                            className={`w-full text-center font-bold bg-transparent border-0 focus:ring-1 rounded px-1 py-1 text-xs ${
                              col.is_auto_obj ? 'text-green-800 focus:ring-green-500' : 'text-purple-900 focus:ring-purple-500 font-mono'
                            }`}
                            placeholder={col.is_auto_obj ? '-' : '............'}
                          />
                        </td>
                      ))}

                      {/* Attendance PIN Check / Verification */}
                      <td className="border border-gray-600 px-2 py-1.5 text-center bg-amber-50/40">
                        <button
                          type="button"
                          onClick={() => handleToggleVerifyRow(idx)}
                          className={`w-full px-2 py-1 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            row.isVerified 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm' 
                              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          <span>{row.isVerified ? '✓ VERIFIED' : '☐ PENDING PIN'}</span>
                        </button>
                      </td>

                      <td className="border border-gray-600 px-2 py-1.5 bg-gray-50 text-center font-black text-gray-900 text-sm">
                        {row.totalScore ? `${row.totalScore}%` : '-'}
                      </td>
                      <td className="border border-gray-600 px-2 py-1.5 text-center no-print">
                        <button
                          onClick={() => handleRemoveRow(idx)}
                          className="p-1 text-red-400 hover:text-red-600 transition"
                          title="Remove row"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={columns.length + 5} className="text-center py-8 text-gray-500 italic">
                        No student enrollments found. Click "+ Add Student Row" above to create rows manually.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Official Signatures Block */}
            <div className="pt-8 border-t-2 border-gray-800 grid grid-cols-2 gap-8 text-xs font-bold text-gray-800">
              <div className="space-y-4">
                <p className="uppercase font-black text-gray-600 text-[10px]">Submitted By Subject Teacher:</p>
                <div className="pt-6 border-b border-gray-800"></div>
                <div className="flex justify-between text-[11px]">
                  <span>Name & Signature</span>
                  <span>Date</span>
                </div>
              </div>
              <div className="space-y-4">
                <p className="uppercase font-black text-gray-600 text-[10px]">Verified By Head of Academic / Invigilator:</p>
                <div className="pt-6 border-b border-gray-800"></div>
                <div className="flex justify-between text-[11px]">
                  <span>Name & Signature</span>
                  <span>Date</span>
                </div>
              </div>
            </div>

            {/* Footer timestamp */}
            <div className="text-[10px] text-gray-400 text-center pt-2 italic">
              Generated by ASASHS Digital Examination Center on {new Date().toLocaleDateString()} • Dynamic Assessment Sheet
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
