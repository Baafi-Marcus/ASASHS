import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { aiService, ExtractedQuestion } from '../lib/aiService';
import { extractTextFromFile } from '../lib/fileParser';

interface SmartExamBuilderProps {
  onComplete: (questions: ExtractedQuestion[]) => void;
  onCancel: () => void;
}

export function SmartExamBuilder({ onComplete, onCancel }: SmartExamBuilderProps) {
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [questions, setQuestions] = useState<ExtractedQuestion[] | null>(null);

  const handleExtract = async () => {
    if (!rawText.trim()) return toast.error('Please enter exam text first');
    setIsProcessing(true);
    try {
      const extracted = await aiService.extractQuestions(rawText);
      setQuestions(extracted);
      toast.success(`Successfully extracted ${extracted.length} questions!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to extract questions');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (!questions || questions.length === 0) return toast.error('No questions to save');
    onComplete(questions);
  };

  if (questions) {
    return (
      <div className="bg-white rounded-2xl border p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Review Extracted Questions</h3>
          <div className="space-x-3">
            <button onClick={() => setQuestions(null)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Start Over</button>
            <button onClick={handleSave} className="px-4 py-2 text-white bg-school-green-600 rounded-lg hover:bg-school-green-700 font-bold">Save Exam Structure</button>
          </div>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
          {questions.map((q, i) => (
            <div key={i} className="p-4 border rounded-xl bg-gray-50">
              <div className="flex gap-4 mb-3">
                <span className="font-bold text-gray-500 w-8">Q{i + 1}.</span>
                <input 
                  type="text" 
                  value={q.question_text} 
                  onChange={e => {
                    const newQ = [...questions];
                    newQ[i].question_text = e.target.value;
                    setQuestions(newQ);
                  }}
                  className="flex-1 px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-school-green-500" 
                />
              </div>
              
              <div className="ml-12 grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-gray-500 block mb-1">Type</label>
                  <select 
                    value={q.question_type}
                    onChange={e => {
                      const newQ = [...questions];
                      newQ[i].question_type = e.target.value as any;
                      setQuestions(newQ);
                    }}
                    className="w-full px-3 py-2 border rounded text-sm"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True / False</option>
                    <option value="short_answer">Short Answer / Fill-in</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-gray-500 block mb-1">Points</label>
                  <input 
                    type="number" 
                    value={q.points || 1} 
                    onChange={e => {
                      const newQ = [...questions];
                      newQ[i].points = parseInt(e.target.value) || 1;
                      setQuestions(newQ);
                    }}
                    className="w-full px-3 py-2 border rounded text-sm" 
                  />
                </div>
              </div>

              {/* Options mapping for MCQ / TF */}
              {(q.question_type === 'multiple_choice' || q.question_type === 'true_false') && q.options && (
                <div className="ml-12 mt-4 space-y-2">
                  <label className="text-xs font-bold text-gray-500 block">Options (Check the correct answer)</label>
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={opt.is_correct} 
                        onChange={e => {
                          const newQ = [...questions];
                          // If it's single choice, we might want to uncheck others, but checkbox allows multiple correct if needed
                          newQ[i].options![optIndex].is_correct = e.target.checked;
                          setQuestions(newQ);
                        }}
                        className="w-4 h-4 text-school-green-600"
                      />
                      <input 
                        type="text" 
                        value={opt.option_text} 
                        onChange={e => {
                          const newQ = [...questions];
                          newQ[i].options![optIndex].option_text = e.target.value;
                          setQuestions(newQ);
                        }}
                        className="flex-1 px-3 py-1 border rounded text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Short Answer mapping */}
              {q.question_type === 'short_answer' && (
                <div className="ml-12 mt-4 space-y-2">
                  <label className="text-xs font-bold text-gray-500 block">Correct Answers (Comma separated)</label>
                  <input 
                    type="text" 
                    value={q.correct_answers?.join(', ') || ''} 
                    onChange={e => {
                      const newQ = [...questions];
                      newQ[i].correct_answers = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setQuestions(newQ);
                    }}
                    placeholder="e.g. Paris, paris, PARIS"
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold">Smart Exam Builder (AI)</h3>
          <p className="text-sm text-gray-500">Paste raw exam text (questions, options, answers). The AI will automatically structure it.</p>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">Upload Exam File (PDF, DOCX, TXT)</label>
          <input 
            type="file" 
            accept=".pdf,.docx,.txt"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setIsProcessing(true);
              try {
                const text = await extractTextFromFile(file);
                setRawText(text);
                toast.success('File loaded successfully! Review the text below.');
              } catch (err: any) {
                toast.error(err.message || 'Failed to parse file');
              } finally {
                setIsProcessing(false);
              }
            }}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-school-green-50 file:text-school-green-700 hover:file:bg-school-green-100 cursor-pointer"
          />
        </div>

        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder="1. What is the capital of France?\nA) London\nB) Paris\nC) Berlin\nAnswer: B\n\n2. The earth is flat.\nTrue or False?"
          className="w-full h-64 p-4 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-school-green-500 transition mb-6 font-mono text-sm resize-none"
        />

      <div className="flex justify-end gap-4">
        <button onClick={onCancel} className="px-6 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Cancel</button>
        <button 
          onClick={handleExtract} 
          disabled={isProcessing || !rawText.trim()}
          className="px-6 py-3 font-bold text-white bg-gradient-to-r from-school-green-600 to-emerald-500 rounded-xl hover:from-school-green-700 hover:to-emerald-600 transition flex items-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
          ) : (
            <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Extract with AI</>
          )}
        </button>
      </div>
    </div>
  );
}
