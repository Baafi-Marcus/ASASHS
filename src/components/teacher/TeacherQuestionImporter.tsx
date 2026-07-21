import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { MathText } from '../MathText';

export interface ImporterQuestion {
  id?: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'theory';
  points: number;
  imageDataUrl?: string;
  diagramDescription?: string;
  options?: { option_text: string; is_correct: boolean }[];
  correct_answers?: string[];
}

interface TeacherQuestionImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImportQuestions: (questions: ImporterQuestion[]) => void;
}

const GHANAIAN_SYMBOLS = ['ɔ', 'ɛ', 'ŋ', 'Ɔ', 'Ɛ', 'Ŋ'];
const STEM_SYMBOLS = ['α', 'β', 'θ', 'Ω', 'π', '√', '±', '≤', '≥', '°', 'Δ', '×', '÷', '∫', '∑', '∞', '≈', '≠'];

export function TeacherQuestionImporter({ isOpen, onClose, onImportQuestions }: TeacherQuestionImporterProps) {
  const [activeTab, setActiveTab] = useState<'smart_text' | 'csv_import' | 'review'>('smart_text');
  const [rawText, setRawText] = useState('');
  const [csvText, setCsvText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState<ImporterQuestion[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  // Insert symbol at cursor in textarea
  const insertSymbol = (symbol: string) => {
    if (activeTab === 'smart_text' && textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newText = rawText.substring(0, start) + symbol + rawText.substring(end);
      setRawText(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + symbol.length;
          textareaRef.current.focus();
        }
      }, 10);
    } else {
      setRawText(prev => prev + symbol);
    }
  };

  // Heuristic Smart Text-to-Question Parser
  const handleParseSmartText = () => {
    if (!rawText.trim()) {
      toast.error('Please paste or type some question text first!');
      return;
    }

    const lines = rawText.split(/\r?\n/);
    const questions: ImporterQuestion[] = [];
    let currentQ: ImporterQuestion | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Check if line starts with question number e.g. "1. What is..." or "Question 1:"
      const qMatch = line.match(/^(?:Question\s*)?(\d+)[\.\)\:]\s*(.+)/i);
      if (qMatch) {
        if (currentQ) questions.push(currentQ);

        let qText = qMatch[2];
        let points = 1;

        // Check for points e.g. "[2 points]" or "(3 marks)"
        const ptsMatch = qText.match(/\[(\d+)\s*(?:points?|marks?)\]|\((\d+)\s*(?:points?|marks?)\)/i);
        if (ptsMatch) {
          points = parseInt(ptsMatch[1] || ptsMatch[2]) || 1;
          qText = qText.replace(/\[\d+\s*(?:points?|marks?)\]|\(\d+\s*(?:points?|marks?)\)/i, '').trim();
        }

        currentQ = {
          question_text: qText,
          question_type: 'multiple_choice',
          points,
          options: []
        };
        continue;
      }

      // Check if line is an option e.g. "A) Accra" or "A. Accra *"
      const optMatch = line.match(/^([A-E])[\.\)\-\:]\s*(.+)/i);
      if (optMatch && currentQ) {
        let optText = optMatch[2].trim();
        let isCorrect = false;

        if (/\*$/.test(optText) || /\(Correct\)$/i.test(optText) || /\[x\]$/i.test(optText)) {
          isCorrect = true;
          optText = optText.replace(/\*$|\(Correct\)$|\[x\]$/i, '').trim();
        }

        currentQ.options = currentQ.options || [];
        currentQ.options.push({ option_text: optText, is_correct: isCorrect });
        continue;
      }

      // Check if line specifies answer key e.g. "Answer: B" or "Ans: B"
      const ansMatch = line.match(/^(?:Answer|Ans|Key)\s*[\:\=]\s*([A-E])/i);
      if (ansMatch && currentQ && currentQ.options) {
        const letterIdx = ansMatch[1].toUpperCase().charCodeAt(0) - 65;
        if (currentQ.options[letterIdx]) {
          currentQ.options[letterIdx].is_correct = true;
        }
        continue;
      }

      // Otherwise append to current question text
      if (currentQ) {
        if (currentQ.options && currentQ.options.length > 0) {
          // If options started, maybe append to last option
          const lastOpt = currentQ.options[currentQ.options.length - 1];
          lastOpt.option_text += ' ' + line;
        } else {
          currentQ.question_text += ' ' + line;
        }
      }
    }

    if (currentQ) questions.push(currentQ);

    // Auto-detect question type if no options
    questions.forEach(q => {
      if (!q.options || q.options.length === 0) {
        q.question_type = 'short_answer';
      } else if (q.options.length === 2 && (q.options[0].option_text.toLowerCase() === 'true' || q.options[0].option_text.toLowerCase() === 'false')) {
        q.question_type = 'true_false';
      }
    });

    if (questions.length === 0) {
      toast.error('Could not detect numbered questions (e.g. "1. What is..."). Check your format.');
      return;
    }

    setParsedQuestions(questions);
    setActiveTab('review');
    toast.success(`Parsed ${questions.length} question(s) successfully!`);
  };

  // CSV Template download
  const downloadCsvTemplate = () => {
    const headers = [
      'Question Number',
      'Question Text',
      'Question Type (multiple_choice/short_answer/theory)',
      'Points',
      'Option A',
      'Option B',
      'Option C',
      'Option D',
      'Correct Option (A/B/C/D)',
      'Diagram Image URL',
      'Diagram Description'
    ];
    const sampleRows = [
      ['1', 'What is the capital city of Ghana?', 'multiple_choice', '2', 'Kumasi', 'Accra', 'Tamale', 'Cape Coast', 'B', '', ''],
      ['2', 'Find the value of ɔ + 5 = 15', 'multiple_choice', '1', '5', '10', '15', '20', 'B', '', ''],
      ['3', 'Explain the process of photosynthesis.', 'theory', '5', '', '', '', '', '', 'https://example.com/diagram.png', 'Plant leaf structure']
    ];
    const csvContent = [headers.join(','), ...sampleRows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'asashs_question_bank_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded CSV template!');
  };

  // CSV Upload Parser
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvText(text);
        parseCsvText(text);
      }
    };
    reader.readAsText(file);
  };

  const parseCsvText = (textToParse: string) => {
    const lines = textToParse.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      toast.error('CSV file appears empty or only has headers.');
      return;
    }

    const questions: ImporterQuestion[] = [];
    // Simple CSV row parser handling quotes
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
      const cleanRow = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
      
      const qText = cleanRow[1] || `Question ${i}`;
      const qTypeRaw = (cleanRow[2] || 'multiple_choice').toLowerCase();
      const points = parseInt(cleanRow[3]) || 1;
      const optA = cleanRow[4];
      const optB = cleanRow[5];
      const optC = cleanRow[6];
      const optD = cleanRow[7];
      const correctLetter = (cleanRow[8] || 'A').toUpperCase().trim();
      const diagramUrl = cleanRow[9] || '';
      const diagramDesc = cleanRow[10] || '';

      const qType = (qTypeRaw === 'theory' || qTypeRaw === 'short_answer' || qTypeRaw === 'true_false') ? qTypeRaw : 'multiple_choice';

      const options: { option_text: string; is_correct: boolean }[] = [];
      if (qType === 'multiple_choice' || qType === 'true_false') {
        if (optA) options.push({ option_text: optA, is_correct: correctLetter === 'A' || correctLetter === 'OPT A' });
        if (optB) options.push({ option_text: optB, is_correct: correctLetter === 'B' || correctLetter === 'OPT B' });
        if (optC) options.push({ option_text: optC, is_correct: correctLetter === 'C' || correctLetter === 'OPT C' });
        if (optD) options.push({ option_text: optD, is_correct: correctLetter === 'D' || correctLetter === 'OPT D' });
      }

      questions.push({
        question_text: qText,
        question_type: qType,
        points,
        imageDataUrl: diagramUrl || undefined,
        diagramDescription: diagramDesc || undefined,
        options
      });
    }

    setParsedQuestions(questions);
    setActiveTab('review');
    toast.success(`Parsed ${questions.length} question(s) from CSV!`);
  };

  const handleUpdateQuestion = (idx: number, updated: ImporterQuestion) => {
    const next = [...parsedQuestions];
    next[idx] = updated;
    setParsedQuestions(next);
  };

  const handleDeleteQuestion = (idx: number) => {
    setParsedQuestions(parsedQuestions.filter((_, i) => i !== idx));
  };

  const handleAddNewQuestion = () => {
    setParsedQuestions([
      ...parsedQuestions,
      {
        question_text: 'New Question Text',
        question_type: 'multiple_choice',
        points: 1,
        options: [
          { option_text: 'Option A', is_correct: true },
          { option_text: 'Option B', is_correct: false },
          { option_text: 'Option C', is_correct: false },
          { option_text: 'Option D', is_correct: false }
        ]
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-fade-in border border-gray-100">
        
        {/* HEADER */}
        <div className="bg-gray-900 text-white p-6 px-8 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <h2 className="text-xl font-black tracking-wide">AI Assessment Studio & Smart Question Importer</h2>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Extract questions from past papers, insert Ghanaian language diacritics (`ɔ, ɛ, ŋ`), or import bulk CSV spreadsheets.
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center font-bold text-lg transition">
            ✕
          </button>
        </div>

        {/* TABS NAV */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-8 shrink-0">
          <button
            onClick={() => setActiveTab('smart_text')}
            className={`py-4 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 ${activeTab === 'smart_text' ? 'border-school-green-600 text-school-green-700 bg-white shadow-sm' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <span>📝 Smart Text & Past Paper Parser</span>
          </button>
          <button
            onClick={() => setActiveTab('csv_import')}
            className={`py-4 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 ${activeTab === 'csv_import' ? 'border-school-green-600 text-school-green-700 bg-white shadow-sm' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <span>📊 Bulk CSV Spreadsheet Import</span>
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`py-4 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 ${activeTab === 'review' ? 'border-school-green-600 text-school-green-700 bg-white shadow-sm' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <span>🛠️ Review & Diagram Grid ({parsedQuestions.length})</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* TAB 1: SMART TEXT PARSER */}
          {activeTab === 'smart_text' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* SYMBOL QUICK INSERT PALETTE */}
              <div className="bg-purple-50/60 border border-purple-200 p-4 rounded-2xl shadow-sm">
                <div className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>🔤 Ghanaian Languages & STEM Symbol Quick-Insert Palette (Click symbol to insert at cursor)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 border-r border-purple-200 pr-3">
                    <span className="text-[10px] font-bold text-purple-600 mr-1">Twi/Ga:</span>
                    {GHANAIAN_SYMBOLS.map(sym => (
                      <button
                        key={sym}
                        onClick={() => insertSymbol(sym)}
                        className="w-8 h-8 rounded-lg bg-white border border-purple-300 font-bold text-base hover:bg-purple-600 hover:text-white transition shadow-sm"
                        title={`Insert ${sym}`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] font-bold text-purple-600 mr-1">STEM:</span>
                    {STEM_SYMBOLS.map(sym => (
                      <button
                        key={sym}
                        onClick={() => insertSymbol(sym)}
                        className="w-8 h-8 rounded-lg bg-white border border-purple-300 font-bold text-sm hover:bg-purple-600 hover:text-white transition shadow-sm"
                        title={`Insert ${sym}`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* TEXTAREA FOR PAST PAPERS */}
              <div>
                <label className="text-sm font-bold text-gray-800 block mb-2">
                  Paste Exam Questions (from Word, Past Papers, or Scanned OCR):
                </label>
                <textarea
                  ref={textareaRef}
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  rows={12}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-school-green-600 focus:bg-white outline-none font-mono text-sm leading-relaxed"
                  placeholder={`Example:\n1. What is the capital of Ghana? [2 points]\nA) Kumasi\nB) Accra (Correct)\nC) Tamale\nD) Cape Coast\n\n2. Find the value of ɔ + 5 if ɔ = 10\nA. 12\nB. 15 *\nC. 20\nD. 25`}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Use `A) option` or `A. option`. Indicate correct answers with `*`, `(Correct)`, `[x]`, or add a line `Answer: B`.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleParseSmartText}
                  className="px-8 py-4 bg-school-green-600 hover:bg-school-green-700 text-white font-black rounded-2xl shadow-xl transition flex items-center gap-2 text-base"
                >
                  <span>⚡ Parse Questions into Grid →</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CSV IMPORT */}
          {activeTab === 'csv_import' && (
            <div className="space-y-8 max-w-3xl mx-auto py-6">
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-3xl flex items-start gap-4">
                <div className="text-3xl">📥</div>
                <div>
                  <h4 className="font-bold text-blue-900 text-base">Bulk Spreadsheet Template</h4>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    Build 50 to 100 questions offline using Microsoft Excel, Google Sheets, or Numbers. Download our official CSV template below, fill in your questions and options, and upload it back here.
                  </p>
                  <button
                    onClick={downloadCsvTemplate}
                    className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2"
                  >
                    <span>⬇️ Download Sample CSV Template</span>
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 hover:border-school-green-500 rounded-3xl p-10 text-center bg-gray-50/50 transition">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                  id="csvUploadInput"
                />
                <label htmlFor="csvUploadInput" className="cursor-pointer block">
                  <div className="w-16 h-16 bg-school-green-100 text-school-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    📊
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">Upload CSV Question Bank</h4>
                  <p className="text-xs text-gray-500 mt-1">Click to select your `.csv` file or drag and drop</p>
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-2 uppercase">Or paste CSV raw text here:</label>
                <textarea
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  rows={6}
                  className="w-full p-3 bg-gray-50 border rounded-xl font-mono text-xs outline-none focus:border-school-green-500"
                  placeholder="Question Number,Question Text,Question Type,Points,Option A,..."
                />
                {csvText && (
                  <button
                    onClick={() => parseCsvText(csvText)}
                    className="mt-3 px-6 py-2.5 bg-school-green-600 text-white font-bold text-xs rounded-xl hover:bg-school-green-700 transition"
                  >
                    Parse Pasted CSV
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: REVIEW & DIAGRAM GRID */}
          {activeTab === 'review' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border">
                <div>
                  <h3 className="font-bold text-gray-800 text-base">Question Review Grid ({parsedQuestions.length} Questions)</h3>
                  <p className="text-xs text-gray-500">Check option correctness, add diagram image URLs, or adjust point allocations.</p>
                </div>
                <button
                  onClick={handleAddNewQuestion}
                  className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <span>+ Add Blank Question</span>
                </button>
              </div>

              {parsedQuestions.length === 0 ? (
                <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed">
                  <p className="text-gray-400 font-medium">No questions parsed yet. Go to Smart Text or CSV Import tabs to start!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {parsedQuestions.map((q, idx) => (
                    <div key={idx} className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm space-y-4 hover:border-gray-200 transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-school-green-600 text-white font-black rounded-xl flex items-center justify-center text-sm shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Question Stem & Options</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={q.question_type}
                            onChange={e => handleUpdateQuestion(idx, { ...q, question_type: e.target.value as any })}
                            className="text-xs border rounded-lg px-2.5 py-1.5 font-bold bg-gray-50"
                          >
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="true_false">True / False</option>
                            <option value="short_answer">Short Answer</option>
                            <option value="theory">Theory on Paper</option>
                          </select>
                          <div className="flex items-center gap-1 bg-gray-50 border rounded-lg px-2 py-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Points:</span>
                            <input
                              type="number"
                              value={q.points || 1}
                              onChange={e => handleUpdateQuestion(idx, { ...q, points: parseInt(e.target.value) || 1 })}
                              className="w-10 text-xs font-bold bg-transparent text-center outline-none"
                            />
                          </div>
                          <button
                            onClick={() => handleDeleteQuestion(idx)}
                            className="text-gray-400 hover:text-red-600 text-sm font-bold px-2 py-1"
                            title="Delete question"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Question Text Input */}
                      <input
                        type="text"
                        value={q.question_text}
                        onChange={e => handleUpdateQuestion(idx, { ...q, question_text: e.target.value })}
                        className="w-full p-3 bg-gray-50 border rounded-xl font-bold text-gray-900 focus:bg-white outline-none"
                        placeholder="Question stem..."
                      />
                      {q.question_text && (
                        <div className="text-xs text-gray-600 pl-2">
                          <MathText text={q.question_text} />
                        </div>
                      )}

                      {/* Options Grid */}
                      {(q.question_type === 'multiple_choice' || q.question_type === 'true_false') && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4 border-l-2 border-school-green-100">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className={`flex items-center gap-2 p-2.5 rounded-xl border ${opt.is_correct ? 'bg-school-green-50 border-school-green-300' : 'bg-gray-50 border-gray-200'}`}>
                              <button
                                type="button"
                                onClick={() => {
                                  const newOpts = q.options!.map((o, i) => ({ ...o, is_correct: i === optIdx }));
                                  handleUpdateQuestion(idx, { ...q, options: newOpts });
                                }}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold text-[10px] shrink-0 ${opt.is_correct ? 'bg-school-green-600 border-school-green-600 text-white' : 'border-gray-300 text-gray-400'}`}
                              >
                                {opt.is_correct ? '✓' : String.fromCharCode(65 + optIdx)}
                              </button>
                              <input
                                type="text"
                                value={opt.option_text}
                                onChange={e => {
                                  const newOpts = [...q.options!];
                                  newOpts[optIdx].option_text = e.target.value;
                                  handleUpdateQuestion(idx, { ...q, options: newOpts });
                                }}
                                className="flex-1 bg-transparent text-xs font-medium outline-none"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Diagram Image Attachment helper */}
                      <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-3 items-center">
                        <div className="flex-1 w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">🖼️ Diagram Image URL (optional):</span>
                            <input
                              type="text"
                              value={q.imageDataUrl || ''}
                              onChange={e => handleUpdateQuestion(idx, { ...q, imageDataUrl: e.target.value || undefined })}
                              className="flex-1 text-xs border rounded-lg px-2.5 py-1.5 font-mono bg-gray-50"
                              placeholder="https://example.com/diagram.png"
                            />
                          </div>
                        </div>
                        {q.imageDataUrl && (
                          <div className="flex items-center gap-2">
                            <img src={q.imageDataUrl} alt="Preview" className="h-10 w-10 object-cover rounded border" />
                            <input
                              type="text"
                              value={q.diagramDescription || ''}
                              onChange={e => handleUpdateQuestion(idx, { ...q, diagramDescription: e.target.value || undefined })}
                              className="text-xs border rounded-lg px-2.5 py-1 bg-gray-50"
                              placeholder="Diagram caption / description..."
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 px-8 flex justify-between items-center shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (parsedQuestions.length === 0) {
                toast.error('No questions to import!');
                return;
              }
              onImportQuestions(parsedQuestions);
              onClose();
              toast.success(`Imported ${parsedQuestions.length} questions into Assessment!`);
            }}
            disabled={parsedQuestions.length === 0}
            className="px-8 py-3 bg-school-green-600 hover:bg-school-green-700 text-white font-black rounded-xl shadow-xl transition disabled:opacity-50 text-sm flex items-center gap-2"
          >
            <span>✅ Import {parsedQuestions.length} Questions to Assessment Builder</span>
          </button>
        </div>

      </div>
    </div>
  );
}
