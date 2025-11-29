
import React, { useState, useEffect } from 'react';
import { Question, ClozeBlank, ClozeFeedback } from '../types';
import { generateClozeExercise, evaluateClozeAnswers, generateModelAnswer } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface Props {
  question: Question;
  modelEssay: string; // The base essay
  clozeData?: { textWithBlanks: string; blanks: ClozeBlank[] };
  userAnswers?: Record<number, string>;
  feedback?: Record<number, ClozeFeedback>;
  onSaveData: (data: { 
    textWithBlanks: string; 
    blanks: ClozeBlank[] 
  }) => void;
  onSaveProgress: (answers: Record<number, string>, feedback?: Record<number, ClozeFeedback>) => void;
  onModelEssayGenerated: (essay: string) => void;
}

const EssayImprover: React.FC<Props> = ({ 
  question, 
  modelEssay, 
  clozeData, 
  userAnswers = {}, 
  feedback,
  onSaveData, 
  onSaveProgress,
  onModelEssayGenerated
}) => {
  const [answers, setAnswers] = useState<Record<number, string>>(userAnswers);
  const [loading, setLoading] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  // Sync state if props change (e.g. switching questions)
  useEffect(() => {
    setAnswers(userAnswers || {});
  }, [userAnswers, question.id]);

  const handleGenerateCloze = async () => {
    setLoading(true);
    let baseEssay = modelEssay;

    // If no model essay exists yet, generate it first
    if (!baseEssay) {
      baseEssay = await generateModelAnswer(question);
      onModelEssayGenerated(baseEssay);
    }

    // Generate Cloze
    const result = await generateClozeExercise(baseEssay);
    if (result) {
      onSaveData(result);
      // Reset answers/feedback for new exercise
      onSaveProgress({}, undefined);
      setAnswers({});
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!clozeData) return;
    setIsGrading(true);
    const result = await evaluateClozeAnswers(clozeData.blanks, answers);
    if (result) {
      onSaveProgress(answers, result);
    }
    setIsGrading(false);
  };

  const handleAnswerChange = (id: number, value: string) => {
    const newAnswers = { ...answers, [id]: value };
    setAnswers(newAnswers);
    // Don't save to persistent storage on every keystroke to avoid lag, 
    // but in a real app you might debunk this. Here we rely on the Check button or unmount.
    // For safety, let's just update parent state.
    onSaveProgress(newAnswers, feedback);
  };

  // Parse the textWithBlanks to render inputs
  const renderClozeText = () => {
    if (!clozeData) return null;

    const parts = clozeData.textWithBlanks.split(/(\[BLANK_\d+\])/g);

    return (
      <div className="leading-loose text-lg text-slate-800 font-serif whitespace-pre-wrap">
        {parts.map((part, index) => {
          const match = part.match(/\[BLANK_(\d+)\]/);
          if (match) {
            const id = parseInt(match[1]);
            const blank = clozeData.blanks.find(b => b.id === id);
            const fb = feedback?.[id];
            
            let borderColor = "border-slate-300";
            let bgColor = "bg-slate-50";
            
            if (fb) {
                if (fb.score >= 4) { borderColor = "border-green-500"; bgColor = "bg-green-50"; }
                else if (fb.score >= 2) { borderColor = "border-amber-400"; bgColor = "bg-amber-50"; }
                else { borderColor = "border-red-400"; bgColor = "bg-red-50"; }
            }

            return (
              <span key={index} className="inline-block mx-1 align-middle relative group my-1">
                <input
                  type="text"
                  value={answers[id] || ""}
                  onChange={(e) => handleAnswerChange(id, e.target.value)}
                  placeholder={`(${blank?.hint || '...'})`}
                  className={`min-w-[120px] max-w-[300px] border-b-2 ${borderColor} ${bgColor} px-1 py-0.5 outline-none focus:border-blue-500 transition-colors text-center text-base font-sans font-medium text-slate-700`}
                />
                {fb && (
                  <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white rounded-lg shadow-xl border border-slate-200 text-xs font-sans text-left hidden group-hover:block animate-fade-in">
                    <div className="font-bold mb-1 flex justify-between">
                        <span className={fb.score >= 4 ? "text-green-600" : "text-amber-600"}>Score: {fb.score}/5</span>
                    </div>
                    <p className="text-slate-600 mb-2">{fb.comment}</p>
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Original:</div>
                    <div className="text-slate-800 italic">{blank?.original}</div>
                  </div>
                )}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div>
             <h2 className="text-lg font-bold text-slate-800">Logic Chain Trainer</h2>
             <p className="text-sm text-slate-500 mt-1">Fill in the blanks to practice economic reasoning chains. {question.maxMarks} Marks.</p>
          </div>
          <div className="flex gap-2">
            {!clozeData ? (
               <button
                onClick={handleGenerateCloze}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {loading ? "Preparing..." : "Create Exercise"}
              </button>
            ) : (
                <button
                onClick={handleGenerateCloze} // Regenerate
                disabled={loading}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium py-2 px-4 rounded-lg transition-colors shadow-sm text-sm"
              >
                Reset / New
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scroll p-8">
            {!clozeData ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    </div>
                    <p className="text-center max-w-sm">Click "Create Exercise" to transform the model answer into a training exercise where you practice connecting economic concepts.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {renderClozeText()}
                </div>
            )}
        </div>

        {/* Footer */}
        {clozeData && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <div className="text-xs text-slate-500">
                   {feedback ? (
                       <span className="text-emerald-600 font-medium">Grading Complete. Hover over blanks for feedback.</span>
                   ) : (
                       <span>Fill in all blanks before checking.</span>
                   )}
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isGrading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                    {isGrading ? "Checking..." : "Check Answers"}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default EssayImprover;
