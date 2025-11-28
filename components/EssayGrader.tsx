
import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { gradeEssay } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface Props {
  question: Question;
  savedInput: string;
  savedFeedback: string;
  onSave: (input: string, feedback: string) => void;
}

const EssayGrader: React.FC<Props> = ({ question, savedInput, savedFeedback, onSave }) => {
  const [input, setInput] = useState(savedInput);
  const [feedback, setFeedback] = useState(savedFeedback);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput(savedInput);
    setFeedback(savedFeedback);
    // We don't persist images in local state for now to avoid memory bloat in simple demo
  }, [savedInput, savedFeedback, question.id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGrade = async () => {
    if (!input.trim() && !image) return;
    setLoading(true);
    const result = await gradeEssay(question, input, image || undefined);
    setFeedback(result);
    onSave(input, result); // Note: Image isn't saved to parent state in this version
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    onSave(newValue, feedback);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const content = `Question: ${question.questionText}\n\nMy Essay:\n${input}\n\n-------------------\n\nExaminer Feedback:\n${feedback}`;
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `graded_essay_${question.year}_${question.questionNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
      {/* Input Side */}
      <div className="flex flex-col h-full">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-3">
             <h3 className="text-sm font-semibold text-slate-700">Your Answer</h3>
             {(input || feedback) && (
               <button 
                 onClick={handleDownload}
                 className="text-slate-400 hover:text-blue-600 transition-colors"
                 title="Download Result"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               </button>
             )}
          </div>
          <p className="text-sm text-slate-500 mb-4 font-medium leading-relaxed border-b border-slate-100 pb-3">
            {question.questionText}
          </p>
          
          {image ? (
            <div className="relative flex-1 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden mb-4">
              <img src={image} alt="Uploaded essay" className="w-full h-full object-contain" />
              <button 
                onClick={() => { setImage(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ) : (
            <textarea
              className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-serif text-lg leading-relaxed text-slate-800 placeholder-slate-400"
              placeholder="Type your essay here OR upload a photo of your handwritten work..."
              value={input}
              onChange={handleChange}
            />
          )}

          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center">
               <input 
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 ref={fileInputRef}
                 onChange={handleImageUpload}
               />
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="text-slate-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1 transition-colors"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 Upload Photo
               </button>
            </div>
            <button
              onClick={handleGrade}
              disabled={loading || (!input.trim() && !image)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Marking...
                </>
              ) : (
                "Grade Essay"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Side */}
      <div className="flex flex-col h-full overflow-hidden">
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full overflow-y-auto custom-scroll ${!feedback ? 'flex items-center justify-center' : ''}`}>
          {!feedback ? (
            <div className="text-center text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p>Submit your essay (text or image) to receive detailed feedback</p>
            </div>
          ) : (
            <div className="prose prose-sm prose-slate max-w-none">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Examiner Feedback</h3>
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EssayGrader;
