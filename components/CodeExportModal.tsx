import React, { useState } from 'react';
import { Question, SyllabusTopic } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customQuestions: Question[];
}

const CodeExportModal: React.FC<Props> = ({ isOpen, onClose, customQuestions }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Format questions as TypeScript object strings
  const generateCode = () => {
    if (customQuestions.length === 0) return "// No custom questions found.";

    const objects = customQuestions.map(q => {
      // Find the key in SyllabusTopic enum that matches the value q.topic
      const topicKey = (Object.keys(SyllabusTopic) as Array<keyof typeof SyllabusTopic>).find(
        key => SyllabusTopic[key] === q.topic
      ) || 'BASIC_IDEAS';

      // Create a string representation of the object
      // We manually construct it to match the data.ts format cleanly
      return `  {
    id: "${q.id}",
    year: "${q.year}",
    paper: "${q.paper}",
    variant: "${q.variant}",
    questionNumber: "${q.questionNumber}",
    topic: SyllabusTopic.${topicKey},
    chapter: "${q.chapter}",
    maxMarks: ${q.maxMarks},
    questionText: ${JSON.stringify(q.questionText)},
    markScheme: \`${q.markScheme.replace(/`/g, '\\`')}\`
  }`;
    });

    return `// Copy and paste these objects into the 'questions' array in data.ts\n\n${objects.join(',\n')},`;
  };

  const codeString = generateCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-xl">
          <div>
             <h2 className="text-xl font-bold text-slate-800">Sync to Vercel</h2>
             <p className="text-sm text-slate-500 mt-1">To make your local questions visible to everyone, copy this code and add it to <code className="bg-slate-100 px-1 rounded text-slate-700">data.ts</code>.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 p-0 overflow-hidden relative group">
           <textarea 
             readOnly
             className="w-full h-full p-6 font-mono text-xs text-slate-300 bg-slate-900 resize-none focus:outline-none"
             value={codeString}
           />
           <button
             onClick={handleCopy}
             className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2"
           >
             {copied ? (
               <>
                 <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                 Copied!
               </>
             ) : (
               <>
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                 Copy Code
               </>
             )}
           </button>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors">
              Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default CodeExportModal;