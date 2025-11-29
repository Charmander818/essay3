import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import EssayGenerator from './components/EssayGenerator';
import EssayGrader from './components/EssayGrader';
import RealTimeWriter from './components/RealTimeWriter';
import EssayImprover from './components/EssayImprover';
import AddQuestionModal from './components/AddQuestionModal';
import CodeExportModal from './components/CodeExportModal';
import { Question, AppMode, QuestionState } from './types';
import { questions as initialQuestions } from './data';
import { generateModelAnswer, generateClozeExercise } from './services/geminiService';

const STORAGE_KEY_CUSTOM_QUESTIONS = 'cie_econ_custom_questions_v2';
const STORAGE_KEY_WORK = 'cie_economics_work_v1';
const SESSION_KEY_AUTH = 'cie_econ_auth_session';

// Basic protection.
const APP_PASSWORD = "kittymoni"; 

const App: React.FC = () => {
  // --- Authentication State ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_KEY_AUTH) === 'true';
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  // --- Application State ---
  const [customQuestions, setCustomQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_QUESTIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const allQuestions = useMemo(() => {
    const staticIds = new Set(initialQuestions.map(q => q.id));
    const uniqueCustom = customQuestions.filter(q => !staticIds.has(q.id));
    return [...initialQuestions, ...uniqueCustom];
  }, [customQuestions]);

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [mode, setMode] = useState<AppMode>(AppMode.GENERATOR);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCodeExportOpen, setIsCodeExportOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WORK);
    return saved ? JSON.parse(saved) : {};
  });

  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState("");

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOM_QUESTIONS, JSON.stringify(customQuestions));
  }, [customQuestions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WORK, JSON.stringify(questionStates));
  }, [questionStates]);

  // --- Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem(SESSION_KEY_AUTH, 'true');
      setAuthError("");
    } else {
      setAuthError("Incorrect password");
    }
  };

  const getQuestionState = (id: string): QuestionState => {
    return questionStates[id] || {
      generatorEssay: "",
      graderEssay: "",
      graderFeedback: "",
      realTimeEssay: ""
    };
  };

  const updateQuestionState = (id: string, updates: Partial<QuestionState>) => {
    setQuestionStates(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {
          generatorEssay: "",
          graderEssay: "",
          graderFeedback: "",
          realTimeEssay: ""
        }),
        ...updates
      }
    }));
  };

  const handleSaveQuestion = (question: Question) => {
    if (questionToEdit) {
      if (question.id.startsWith('custom-')) {
          setCustomQuestions(prev => prev.map(q => q.id === question.id ? question : q));
      } else {
          alert("Note: You are editing a standard question locally. This change is saved in your browser but won't affect the official list unless exported.");
          setCustomQuestions(prev => {
              return [...prev.filter(q => q.id !== question.id), question];
          });
      }

      if (selectedQuestion?.id === question.id) {
        setSelectedQuestion(question);
      }
    } else {
      setCustomQuestions(prev => [...prev, question]);
      setSelectedQuestion(question);
    }
    setQuestionToEdit(null);
    setIsModalOpen(false);
  };

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setCustomQuestions(prev => prev.filter(q => q.id !== id));
      if (selectedQuestion?.id === id) {
        setSelectedQuestion(null);
      }
    }
  };

  const handleBatchGenerate = async () => {
    if (isBatchProcessing) return;
    if (!window.confirm("This will automatically generate Model Essays and Cloze Exercises for all questions that don't have them yet. This process may take several minutes due to AI rate limits. Continue?")) return;

    setIsBatchProcessing(true);
    let count = 0;
    const total = allQuestions.length;

    for (const q of allQuestions) {
        count++;
        setBatchProgress(`${count} / ${total}`);
        
        const state: QuestionState = questionStates[q.id] || {
            generatorEssay: "",
            graderEssay: "",
            graderFeedback: "",
            realTimeEssay: ""
        };
        let essay = state.generatorEssay;

        if (!essay) {
            try {
                essay = await generateModelAnswer(q);
                await new Promise(r => setTimeout(r, 4000));
            } catch (e) {
                console.error(`Failed to generate essay for ${q.id}`, e);
                continue;
            }
        }

        let clozeData = state.clozeData;
        if (essay && !clozeData) {
            try {
                const result = await generateClozeExercise(essay);
                if (result) clozeData = result;
                await new Promise(r => setTimeout(r, 4000));
            } catch (e) {
                console.error(`Failed to generate cloze for ${q.id}`, e);
            }
        }

        updateQuestionState(q.id, { 
            generatorEssay: essay,
            clozeData: clozeData
        });
    }

    setIsBatchProcessing(false);
    setBatchProgress("");
    alert("Batch generation complete!");
  };

  const handleExportAll = () => {
    const dateStr = new Date().toLocaleDateString();
    let htmlBody = `
        <h1 style="color:#2E74B5; font-size:24pt; font-family: Calibri, sans-serif;">CIE A Level Economics (9708) - Study Bank</h1>
        <p style="font-family: Calibri, sans-serif;"><strong>Export Date:</strong> ${dateStr}</p>
        <p style="font-family: Calibri, sans-serif;"><strong>Total Questions:</strong> ${allQuestions.length}</p>
        <hr/>
    `;

    const sortedQuestions = [...allQuestions].sort((a, b) => {
        if (a.topic !== b.topic) return a.topic.localeCompare(b.topic);
        return a.chapter.localeCompare(b.chapter);
    });

    sortedQuestions.forEach((q, index) => {
        const state: QuestionState = questionStates[q.id] || {
            generatorEssay: "",
            graderEssay: "",
            graderFeedback: "",
            realTimeEssay: ""
        };
        
        htmlBody += `
            <div style="margin-bottom: 30px; padding-bottom: 20px;">
                <h2 style="color:#1F4E79; font-size:16pt; margin-top:20px; font-family: Calibri, sans-serif;">${index + 1}. ${q.topic} - ${q.chapter}</h2>
                <div style="background-color:#f9f9f9; padding:10px; border:1px solid #ddd; font-family: Calibri, sans-serif;">
                    <strong>${q.paper} ${q.variant} ${q.year} (${q.maxMarks} Marks)</strong><br/>
                    <em>${q.questionText}</em>
                </div>
        `;

        if (state.generatorEssay) {
            let formattedEssay = state.generatorEssay
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n\n/g, '<br/><br/>')
                .replace(/\n/g, '<br/>');
            
            htmlBody += `
                <h3 style="color:#2E74B5; border-bottom: 1px solid #ccc; font-family: Calibri, sans-serif;">Model Answer</h3>
                <div style="font-family: Calibri, sans-serif;">${formattedEssay}</div>
            `;
        } else {
            htmlBody += `<p style="color:#999; font-family: Calibri, sans-serif;"><em>(No model answer generated)</em></p>`;
        }

        if (state.clozeData) {
            htmlBody += `<h3 style="color:#2E74B5; border-bottom: 1px solid #ccc; margin-top: 20px; font-family: Calibri, sans-serif;">Logic Chain Exercise</h3>`;
            htmlBody += `<p style="font-family: Calibri, sans-serif;"><em>Instructions: Fill in the blanks to complete the logical chain.</em></p>`;
            
            let clozeText = state.clozeData.textWithBlanks;
            state.clozeData.blanks.forEach(b => {
                clozeText = clozeText.replace(
                    `[BLANK_${b.id}]`, 
                    `<span style="color:#C00000; font-weight:bold; text-decoration:underline;">[__________]</span> (Hint: ${b.hint})`
                );
            });
            
            clozeText = clozeText.replace(/\n/g, '<br/>');
            
            htmlBody += `<div style="font-family: Calibri, sans-serif; line-height:1.5;">${clozeText}</div>`;
            
            htmlBody += `
                <div style="margin-top:15px; background-color:#fffdf0; padding:10px; border:1px dashed #e6b800; font-family: Calibri, sans-serif;">
                    <strong>Answer Key:</strong><br/>
                    <ul style="margin:0; padding-left:20px;">
            `;
            state.clozeData.blanks.forEach(b => {
                htmlBody += `<li><strong>${b.id}:</strong> ${b.original}</li>`;
            });
            htmlBody += `</ul></div>`;
        }
        
        htmlBody += `<br/><hr/></div>`;
    });

    const fullHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="utf-8">
            <title>Economics Export</title>
            <style>
                body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; }
            </style>
        </head>
        <body>${htmlBody}</body>
        </html>
    `;

    const blob = new Blob([fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CIE_Economics_Master_Bank_${new Date().toISOString().slice(0,10)}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Login Screen ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">CIE Economics Master</h1>
            <p className="text-slate-500 mt-2 text-sm">Protected Access</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Password</label>
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter access code"
                autoFocus
              />
            </div>
            
            {authError && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-100">
                {authError}
              </div>
            )}
            
            <button 
              type="submit" 
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.98]"
            >
              Unlock Access
            </button>
          </form>
          
          <p className="text-center mt-6 text-xs text-slate-400">
            Authorized personnel only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar 
        questions={allQuestions}
        onSelectQuestion={setSelectedQuestion} 
        selectedQuestionId={selectedQuestion?.id || null}
        onAddQuestionClick={() => { setQuestionToEdit(null); setIsModalOpen(true); }}
        onDeleteQuestion={handleDeleteQuestion}
        onEditQuestion={(q) => { setQuestionToEdit(q); setIsModalOpen(true); }}
        questionStates={questionStates}
        onExportAll={handleExportAll}
        onBatchGenerate={handleBatchGenerate}
        isBatchProcessing={isBatchProcessing}
        batchProgress={batchProgress}
        onOpenCodeExport={() => setIsCodeExportOpen(true)}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            {selectedQuestion ? (
              <div>
                 <h2 className="text-lg font-bold text-slate-800">{selectedQuestion.paper} - {selectedQuestion.variant} {selectedQuestion.year}</h2>
                 <p className="text-sm text-slate-500">{selectedQuestion.topic} - {selectedQuestion.questionNumber}</p>
              </div>
            ) : (
              <p className="text-slate-400 italic">Select a question from the sidebar</p>
            )}
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            {Object.values(AppMode).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === m 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scroll">
          {selectedQuestion ? (
            <>
              {mode === AppMode.GENERATOR && (
                <EssayGenerator 
                  question={selectedQuestion} 
                  savedEssay={getQuestionState(selectedQuestion.id).generatorEssay}
                  onSave={(essay) => updateQuestionState(selectedQuestion.id, { generatorEssay: essay })}
                />
              )}
              {mode === AppMode.IMPROVER && (
                <EssayImprover 
                   question={selectedQuestion}
                   modelEssay={getQuestionState(selectedQuestion.id).generatorEssay}
                   clozeData={getQuestionState(selectedQuestion.id).clozeData}
                   userAnswers={getQuestionState(selectedQuestion.id).clozeUserAnswers}
                   feedback={getQuestionState(selectedQuestion.id).clozeFeedback}
                   onSaveData={(data) => updateQuestionState(selectedQuestion.id, { clozeData: data })}
                   onSaveProgress={(answers, fb) => updateQuestionState(selectedQuestion.id, { clozeUserAnswers: answers, clozeFeedback: fb })}
                   onModelEssayGenerated={(essay) => updateQuestionState(selectedQuestion.id, { generatorEssay: essay })}
                />
              )}
              {mode === AppMode.GRADER && (
                <EssayGrader 
                  question={selectedQuestion} 
                  savedInput={getQuestionState(selectedQuestion.id).graderEssay}
                  savedFeedback={getQuestionState(selectedQuestion.id).graderFeedback}
                  onSave={(input, feedback) => updateQuestionState(selectedQuestion.id, { graderEssay: input, graderFeedback: feedback })}
                />
              )}
              {mode === AppMode.COACH && (
                <RealTimeWriter 
                  question={selectedQuestion} 
                  savedText={getQuestionState(selectedQuestion.id).realTimeEssay}
                  onSave={(text) => updateQuestionState(selectedQuestion.id, { realTimeEssay: text })}
                />
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <svg className="w-24 h-24 mb-6 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-xl font-semibold text-slate-600 mb-2">Welcome to Essay Master</h3>
              <p className="max-w-md text-center mb-6">Select a question from the sidebar to start.</p>
              <p className="text-sm text-slate-400">Your questions and essays are automatically saved locally.</p>
            </div>
          )}
        </div>
      </main>

      <AddQuestionModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setQuestionToEdit(null); }} 
        onSave={handleSaveQuestion}
        initialQuestion={questionToEdit}
      />

      <CodeExportModal
         isOpen={isCodeExportOpen}
         onClose={() => setIsCodeExportOpen(false)}
         questions={allQuestions}
      />
    </div>
  );
};

export default App;