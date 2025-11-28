
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import EssayGenerator from './components/EssayGenerator';
import EssayGrader from './components/EssayGrader';
import RealTimeWriter from './components/RealTimeWriter';
import AddQuestionModal from './components/AddQuestionModal';
import { Question, AppMode, QuestionState } from './types';
import { questions as initialQuestions } from './data';

const STORAGE_KEY_QUESTIONS = 'cie_economics_questions_v1';
const STORAGE_KEY_WORK = 'cie_economics_work_v1';

const App: React.FC = () => {
  // Initialize questions from Local Storage or fall back to default data
  const [allQuestions, setAllQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_QUESTIONS);
    return saved ? JSON.parse(saved) : initialQuestions;
  });

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [mode, setMode] = useState<AppMode>(AppMode.GENERATOR);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  
  // Store state for each question (essays, feedback) - Initialize from Local Storage
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WORK);
    return saved ? JSON.parse(saved) : {};
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(allQuestions));
  }, [allQuestions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WORK, JSON.stringify(questionStates));
  }, [questionStates]);

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

  // Handle adding or updating a question
  const handleSaveQuestion = (question: Question) => {
    if (questionToEdit) {
      // Update existing
      setAllQuestions(prev => prev.map(q => q.id === question.id ? question : q));
      
      // If currently selected question is updated, update selection state
      if (selectedQuestion?.id === question.id) {
        setSelectedQuestion(question);
      }
    } else {
      // Create new
      setAllQuestions(prev => [...prev, question]);
      setSelectedQuestion(question);
    }
    setQuestionToEdit(null);
    setIsModalOpen(false);
  };

  // Handle deleting a question
  const handleDeleteQuestion = (id: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setAllQuestions(prev => prev.filter(q => q.id !== id));
      if (selectedQuestion?.id === id) {
        setSelectedQuestion(null);
      }
      // Clean up work state for deleted question
      const newStates = { ...questionStates };
      delete newStates[id];
      setQuestionStates(newStates);
    }
  };

  // Open modal for editing
  const handleEditClick = (question: Question) => {
    setQuestionToEdit(question);
    setIsModalOpen(true);
  };

  // Open modal for adding (reset edit state)
  const handleAddClick = () => {
    setQuestionToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar 
        questions={allQuestions}
        onSelectQuestion={setSelectedQuestion} 
        selectedQuestionId={selectedQuestion?.id || null}
        onAddQuestionClick={handleAddClick}
        onDeleteQuestion={handleDeleteQuestion}
        onEditQuestion={handleEditClick}
        questionStates={questionStates}
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
              <p className="max-w-md text-center mb-6">Select a question from the syllabus topics on the left, or add your own question to start generating answers, grading essays, or practicing in real-time.</p>
              <p className="text-sm text-slate-400">Your questions and essays are automatically saved.</p>
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
    </div>
  );
};

export default App;
