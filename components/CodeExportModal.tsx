
import React, { useState } from 'react';
import { Question, SyllabusTopic } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[]; // Updated to accept all questions
}

const CodeExportModal: React.FC<Props> = ({ isOpen, onClose, questions }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateFullFileContent = () => {
    const questionObjects = questions.map(q => {
      // Find the key in SyllabusTopic enum that matches the value q.topic
      const topicKey = (Object.keys(SyllabusTopic) as Array<keyof typeof SyllabusTopic>).find(
        key => SyllabusTopic[key] === q.topic
      ) || 'BASIC_IDEAS';

      // Create a string representation of the object, matching data.ts format
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
    markScheme: \`${q.markScheme.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`
  }`;
    });

    return `
import { Question, SyllabusTopic } from "./types";

export const questions: Question[] = [
${questionObjects.join(',\n')}
];
`;
  };

  const fileContent = generateFullFileContent();

  const handleDownload = () => {
    const blob = new Blob([fileContent], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.ts';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 bg-white rounded-t-xl">
           <h2 className="text-xl font-bold text-slate-800">Sync Your Changes</h2>
           <p className="text-sm text-slate-500 mt-2">
             You have added custom questions. To save them permanently so everyone can see them on Vercel:
           </p>
           <ol className="list-decimal list-inside text-sm text-slate-600 mt-2 space-y-1">
             <li>Click <strong>Download data.ts</strong> below.</li>
             <li>Replace the existing <code className="bg-slate-100 px-1 rounded text-slate-800 font-mono">data.ts</code> file in your project folder with this new file.</li>
             <li>Push to GitHub to deploy.</li>
           </ol>
        </div>
        
        <div className="flex-1 p-0 overflow-hidden relative group border-b border-slate-100">
           <div className="absolute top-0 left-0 w-full h-8 bg-slate-900 flex items-center px-4 text-xs text-slate-400 font-mono">Preview: data.ts</div>
           <textarea 
             readOnly
             className="w-full h-full pt-10 p-6 font-mono text-xs text-slate-300 bg-slate-900 resize-none focus:outline-none"
             value={fileContent}
           />
        </div>

        <div className="p-4 bg-slate-50 rounded-b-xl flex justify-between items-center">
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700 font-medium text-sm">
              Cancel
            </button>
            <div className="flex gap-3">
                <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button 
                    onClick={handleDownload}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download data.ts
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CodeExportModal;
