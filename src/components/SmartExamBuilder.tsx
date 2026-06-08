import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { aiService, ExtractedQuestion } from '../lib/aiService';
import { extractTextFromFile, extractImagesFromPdf } from '../lib/fileParser';
import { MathText } from './MathText';

interface SmartExamBuilderProps {
  onComplete: (questions: ExtractedQuestion[]) => void;
  onCancel: () => void;
}

export function SmartExamBuilder({ onComplete, onCancel }: SmartExamBuilderProps) {
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [questions, setQuestions] = useState<ExtractedQuestion[] | null>(null);
  const [useVision, setUseVision] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    try {
      if (useVision && file.type === 'application/pdf') {
        toast.loading('Rendering PDF pages for AI analysis...', { id: 'vision' });
        const arrayBuffer = await file.arrayBuffer();
        const images = await extractImagesFromPdf(arrayBuffer);
        toast.loading(`Analyzing ${images.length} page(s) with AI vision...`, { id: 'vision' });
        const extracted = await aiService.extractQuestionsFromImages(images);
        setQuestions(extracted);
        toast.success(`Extracted ${extracted.length} questions via vision AI!`, { id: 'vision' });
      } else {
        toast.loading('Extracting text from file...', { id: 'extract' });
        const text = await extractTextFromFile(file);
        setRawText(text);
        toast.success('Text extracted! Click "Extract Questions" to continue.', { id: 'extract' });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to process file', { id: 'vision' });
    } finally {
      setIsProcessing(false);
    }
  };

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
    const groups: { pageKey: number; questions: ExtractedQuestion[]; startIndex: number }[] = [];
    let currentPage = -2;
    let startIdx = 0;
    questions.forEach((q, i) => {
      const pageKey = q.pageIndex ?? -1;
      if (pageKey !== currentPage) {
        if (currentPage !== -2) groups[groups.length - 1].questions = questions.slice(startIdx, i);
        currentPage = pageKey;
        startIdx = i;
        groups.push({ pageKey, questions: [], startIndex: i });
      }
    });
    if (groups.length > 0) groups[groups.length - 1].questions = questions.slice(startIdx);

    return (
      <div className="bg-white rounded-2xl border p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Review Extracted Questions</h3>
          <div className="space-x-3">
            <button onClick={() => setQuestions(null)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Start Over</button>
            <button onClick={handleSave} className="px-4 py-2 text-white bg-school-green-600 rounded-lg hover:bg-school-green-700 font-bold">Save Exam Structure</button>
          </div>
        </div>

        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4">
          {groups.map(group => (
            <div key={group.pageKey}>
              {group.questions[0]?.imageDataUrl && (
                <div className="mb-4">
                  <img
                    src={group.questions[0].imageDataUrl}
                    alt={`Page ${group.pageKey + 1}`}
                    className="w-full max-w-lg rounded-xl border cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => window.open(group.questions[0].imageDataUrl, '_blank')}
                  />
                  <p className="text-xs text-gray-400 mt-1">Page {group.pageKey >= 0 ? group.pageKey + 1 : 'Unknown'} — click to expand</p>
                </div>
              )}
              <div className="space-y-4">
                {group.questions.map((q, offset) => {
                  const gi = group.startIndex + offset;
                  return (
                    <div key={gi} className="p-4 border rounded-xl bg-gray-50">
                      <div className="flex gap-4 mb-3">
                        <span className="font-bold text-gray-500 w-8 shrink-0">Q{gi + 1}.</span>
                        <input
                          type="text"
                          value={q.question_text}
                          onChange={e => { const nq = [...questions]; nq[gi].question_text = e.target.value; setQuestions(nq); }}
                          className="flex-1 px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-school-green-500 font-mono text-sm"
                        />
                      </div>
                      <div className="ml-12 mb-2">
                        <MathText text={q.question_text} className="text-sm text-gray-600 italic block" />
                      </div>

                      {q.diagramDescription && (
                        <div className="ml-12 mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-gray-700">
                          <span className="font-bold text-yellow-700">Diagram description:</span> {q.diagramDescription}
                        </div>
                      )}

                      <div className="ml-12 grid grid-cols-2 gap-4 mb-4">
                        <div className="col-span-2 sm:col-span-1">
                          <label className="text-xs font-bold text-gray-500 block mb-1">Type</label>
                          <select
                            value={q.question_type}
                            onChange={e => { const nq = [...questions]; nq[gi].question_type = e.target.value as any; setQuestions(nq); }}
                            className="w-full px-3 py-2 border rounded text-sm"
                          >
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="true_false">True / False</option>
                            <option value="short_answer">Short Answer / Fill-in</option>
                          </select>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="text-xs font-bold text-gray-500 block mb-1">Marks</label>
                          <input
                            type="number"
                            value={q.points || 1}
                            onChange={e => { const nq = [...questions]; nq[gi].points = parseInt(e.target.value) || 1; setQuestions(nq); }}
                            className="w-full px-3 py-2 border rounded text-sm"
                          />
                        </div>
                      </div>

                      {(q.question_type === 'multiple_choice' || q.question_type === 'true_false') && q.options && (
                        <div className="ml-12 space-y-2">
                          <label className="text-xs font-bold text-gray-500 block">Options (Check the correct answer)</label>
                          {q.options.map((opt, optIndex) => (
                            <div key={optIndex}>
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={opt.is_correct}
                                  onChange={e => { const nq = [...questions]; nq[gi].options![optIndex].is_correct = e.target.checked; setQuestions(nq); }}
                                  className="w-4 h-4 text-school-green-600 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={opt.option_text}
                                  onChange={e => { const nq = [...questions]; nq[gi].options![optIndex].option_text = e.target.value; setQuestions(nq); }}
                                  className="flex-1 px-3 py-1 border rounded text-sm font-mono"
                                />
                              </div>
                              {opt.option_text && /\$\$/.test(opt.option_text) && (
                                <div className="ml-9 mt-1 text-sm text-gray-500">
                                  <MathText text={opt.option_text} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {q.question_type === 'short_answer' && (
                        <div className="ml-12 mt-4">
                          <label className="text-xs font-bold text-gray-500 block">Correct Answers</label>
                          <p className="text-sm text-gray-700 mt-1">{q.correct_answers?.join(', ') || '(not set)'}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Smart Exam Builder</h3>
        <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
          <input
            type="checkbox"
            id="useVision"
            checked={useVision}
            onChange={e => setUseVision(e.target.checked)}
            className="w-4 h-4 text-school-green-600"
          />
          <label htmlFor="useVision" className="text-sm font-medium text-blue-900">
            Use Vision AI (better for math, matrices, diagrams, and symbols)
          </label>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-school-green-400 transition-colors">
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
            id="fileUpload"
            disabled={isProcessing}
          />
          <label htmlFor="fileUpload" className="cursor-pointer block">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600 font-medium">
              {isProcessing ? 'Processing...' : 'Click to upload a PDF, DOCX, or TXT file'}
            </p>
            {fileName && <p className="text-xs text-gray-400 mt-1">{fileName}</p>}
          </label>
        </div>

        {!useVision && (
          <>
            <div className="text-center text-sm text-gray-400">- OR -</div>

            <div>
              <label className="text-xs font-bold text-gray-500 block mb-2">Paste exam text directly</label>
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-school-green-500 outline-none resize-y"
                placeholder="Paste your exam questions here..."
              />
            </div>

            <button
              onClick={handleExtract}
              disabled={isProcessing || !rawText.trim()}
              className="w-full px-6 py-3 bg-school-green-600 text-white rounded-xl font-bold hover:bg-school-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isProcessing ? 'Extracting...' : 'Extract Questions'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
