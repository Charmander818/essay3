
import React, { useState, useEffect, useRef } from 'react';
import { Question, ClozeBlank, ClozeFeedback } from '../types';
import { generateClozeExercise, evaluateClozeAnswers, generateModelAnswer } from '../services/geminiService';

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

type Mode = 'initial' | 'ai_generating' | 'manual_creating' | 'practice';

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
  const [mode, setMode] = useState<Mode>(clozeData ? 'practice' : 'initial');
  const [isGrading, setIsGrading] = useState(false);

  // Manual Creation State
  const [manualText, setManualText] = useState("");
  const [manualBlanks, setManualBlanks] = useState<ClozeBlank[]>([]);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [customHint, setCustomHint] = useState("");

  // Sync state if props change
  useEffect(() => {
    setAnswers(userAnswers || {});
    if (clozeData) setMode('practice');
  }, [userAnswers, question.id, clozeData]);

  // Initialize manual text when entering creation mode
  useEffect(() => {
    if (modelEssay && !manualText) {
        setManualText(modelEssay);
    }
  }, [modelEssay]);

  const ensureModelEssay = async (): Promise<string> => {
    if (modelEssay) return modelEssay;
    const essay = await generateModelAnswer(question);
    onModelEssayGenerated(essay);
    setManualText(essay);
    return essay;
  };

  const handleGenerateAICloze = async () => {
    setMode('ai_generating');
    const baseEssay = await ensureModelEssay();

    const result = await generateClozeExercise(baseEssay);
    if (result) {
      onSaveData(result);
      onSaveProgress({}, undefined);
      setAnswers({});
      setMode('practice');
    } else {
        setMode('initial');
        alert("AI generation failed. Please try again or use manual mode.");
    }
  };

  const startManualCreation = async () => {
    setMode('ai_generating');
    const baseEssay = await ensureModelEssay();
    setManualText(baseEssay);
    setManualBlanks([]);
    setMode('manual_creating');
  };

  const handleTextSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    if (target.selectionStart !== target.selectionEnd) {
        setSelectionStart(target.selectionStart);
        setSelectionEnd(target.selectionEnd);
    } else {
        setSelectionStart(null);
        setSelectionEnd(null);
    }
  };

  const applyManualMask = () => {
      if (selectionStart === null || selectionEnd === null) return;

      const textToMask = manualText.substring(selectionStart, selectionEnd);
      if (!textToMask.trim()) return;

      const newId = manualBlanks.length + 1;
      const placeholder = `[BLANK_${newId}]`;

      // Insert placeholder into text
      const newText = manualText.substring(0, selectionStart) + placeholder + manualText.substring(selectionEnd);
      
      // Add blank to list
      const newBlank: ClozeBlank = {
          id: newId,
          original: textToMask,
          hint: customHint || "Missing phrase"
      };

      setManualText(newText);
      setManualBlanks([...manualBlanks, newBlank]);
      
      // Reset selection
      setSelectionStart(null);
      setSelectionEnd(null);
      setCustomHint("");
  };

  const finishManualCreation = () => {
      if (manualBlanks.length === 0) {
          alert("Please mask at least one word or phrase.");
          return;
      }
      onSaveData({
          textWithBlanks: manualText,
          blanks: manualBlanks
      });
      onSaveProgress({}, undefined);
      setAnswers({});
      setMode('practice');
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
  };

  const handleReset = () => {
      if(confirm("This will clear the current exercise. Continue?")) {
          setMode('initial');
          onSaveData({ textWithBlanks: '', blanks: [] }); // Clear data
          setManualBlanks([]);
          setSelectionStart(null);
          setAnswers({});
          onSaveProgress({}, undefined);
      }
  };

  // Renderers

  const renderPracticeMode = () => {
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

  const renderManualCreationMode = () => {
      return (
          <div className="flex flex-col h-full">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                  <p className="font-bold mb-1">Instructions:</p>
                  <ul className="list-disc list-inside space-y-1">
                      <li>Highlight any word or phrase in the text box below.</li>
                      <li>Click <strong>"Mask Selected Text"</strong> to turn it into a blank.</li>
                      <li>When finished, click <strong>"Start Exercise"</strong>.</li>
                  </ul>
              </div>

              <div className="flex-1 relative mb-4">
                  <textarea 
                      ref={textareaRef}
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)} // Allow editing base text if needed
                      onSelect={handleTextSelect}
                      className="w-full h-full p-6 border border-slate-300 rounded-xl resize-none font-serif text-lg leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
              </div>

              <div className="flex items-end gap-4 bg-white p-4 border-t border-slate-100">
                  <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hint (Optional)</label>
                      <input 
                          type="text" 
                          value={customHint} 
                          onChange={(e) => setCustomHint(e.target.value)}
                          placeholder="e.g. Key Term"
                          className="w-full p-2 border border-slate-300 rounded text-sm"
                      />
                  </div>
                  <button 
                      onClick={applyManualMask}
                      disabled={selectionStart === null}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-10"
                  >
                      Mask Selection
                  </button>
                  <div className="w-px h-10 bg-slate-200 mx-2"></div>
                  <button 
                      onClick={finishManualCreation}
                      disabled={manualBlanks.length === 0}
                      className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg shadow-lg hover:bg-emerald-700 disabled:opacity-50 h-10"
                  >
                      Start Exercise ({manualBlanks.length})
                  </button>
              </div>
          </div>
      );
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
          <div>
             <h2 className="text-lg font-bold text-slate-800">Logic Chain Trainer</h2>
             <p className="text-sm text-slate-500 mt-1">
                 {mode === 'manual_creating' ? "Highlight text to mask it." : "Fill in the blanks to complete the logic."}
             </p>
          </div>
          {mode === 'practice' && (
             <button onClick={handleReset} className="text-sm text-slate-400 hover:text-red-600 underline">Start Over</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll p-8">
            {mode === 'initial' && (
                <div className="h-full flex flex-col items-center justify-center space-y-8">
                     <div className="text-center max-w-md">
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">Choose Exercise Type</h3>
                        <p className="text-slate-500">You can let AI generate a challenge for you, or create one yourself by selecting key words from the model essay.</p>
                     </div>
                     <div className="flex gap-4">
                         <button onClick={handleGenerateAICloze} className="flex flex-col items-center p-6 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-colors w-48">
                             <span className="text-3xl mb-2">🤖</span>
                             <span className="font-bold text-indigo-700">AI Generated</span>
                             <span className="text-xs text-indigo-500 mt-1">Automatic masking</span>
                         </button>
                         <button onClick={startManualCreation} className="flex flex-col items-center p-6 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors w-48">
                             <span className="text-3xl mb-2">👆</span>
                             <span className="font-bold text-emerald-700">Manual Selection</span>
                             <span className="text-xs text-emerald-500 mt-1">You choose the blanks</span>
                         </button>
                     </div>
                </div>
            )}

            {mode === 'ai_generating' && (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>Generating Content...</p>
                 </div>
            )}

            {mode === 'manual_creating' && renderManualCreationMode()}

            {mode === 'practice' && renderPracticeMode()}
        </div>

        {mode === 'practice' && (
             <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={isGrading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50"
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
