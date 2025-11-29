
import React, { useMemo, useState } from 'react';
import { Question, SyllabusTopic, QuestionState } from '../types';

interface SidebarProps {
  questions: Question[];
  onSelectQuestion: (q: Question) => void;
  selectedQuestionId: string | null;
  onAddQuestionClick: () => void;
  onDeleteQuestion: (id: string) => void;
  onEditQuestion: (q: Question) => void;
  questionStates: Record<string, QuestionState>;
  onExportAll: () => void;
  onBatchGenerate: () => void;
  onOpenCodeExport: () => void;
  isBatchProcessing: boolean;
  batchProgress: string;
}

type FilterMode = 'all' | 'saved' | 'custom';

const Sidebar: React.FC<SidebarProps> = ({ 
  questions, 
  onSelectQuestion, 
  selectedQuestionId, 
  onAddQuestionClick,
  onDeleteQuestion,
  onEditQuestion,
  questionStates,
  onExportAll,
  onBatchGenerate,
  onOpenCodeExport,
  isBatchProcessing,
  batchProgress
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  // Group questions by topic, then by chapter
  const groupedQuestions = useMemo(() => {
    // First filter the questions based on the selected mode
    const filtered = questions.filter(q => {
      if (filterMode === 'saved') {
        const state = questionStates[q.id];
        // Check if any work has been done
        return state && (
          (state.generatorEssay && state.generatorEssay.length > 0) || 
          (state.graderEssay && state.graderEssay.length > 0) || 
          (state.realTimeEssay && state.realTimeEssay.length > 0) ||
          (state.clozeData)
        );
      }
      if (filterMode === 'custom') {
        return q.id.startsWith('custom-');
      }
      return true;
    });

    const groups: Record<string, Record<string, Question[]>> = {};
    
    // Initialize topics in order from the Enum to preserve syllabus order
    Object.values(SyllabusTopic).forEach(topic => {
      groups[topic] = {};
    });

    filtered.forEach(q => {
      // Ensure topic exists (handle edge case where data.ts might have a typo or new topic)
      if (!groups[q.topic]) groups[q.topic] = {};
      
      const chapterKey = q.chapter || "General / Uncategorized";
      
      if (!groups[q.topic][chapterKey]) {
          groups[q.topic][chapterKey] = [];
      }
      groups[q.topic][chapterKey].push(q);
    });
    
    return groups;
  }, [questions, filterMode, questionStates]);

  return (
    <div className="w-80 bg-white border-r border-slate-200 h-screen flex flex-col">
      <div className="p-5 border-b border-slate-100 bg-white z-20 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">CIE Econ Master</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
               {questions.length} Questions Loaded
            </p>
          </div>
          <button 
            onClick={onAddQuestionClick}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            title="Add Custom Question"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex bg-slate-100 p-1 rounded-lg grid grid-cols-3 gap-1">
          <button
            onClick={() => setFilterMode('all')}
            className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
              filterMode === 'all' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
            title="Show All Questions"
          >
            All
          </button>
          <button
            onClick={() => setFilterMode('saved')}
            className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
              filterMode === 'saved' 
                ? 'bg-white text-emerald-600 shadow-sm' 
                : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-200/50'
            }`}
            title="Show My Saved Work"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            Work
          </button>
          <button
            onClick={() => setFilterMode('custom')}
            className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
              filterMode === 'custom' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-slate-500 hover:text-purple-600 hover:bg-slate-200/50'
            }`}
            title="Show My Custom Questions"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Added
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scroll py-2">
        {Object.entries(groupedQuestions).map(([topic, chapters]) => {
           // Only render topics that have questions after filtering
           const hasQuestions = Object.values(chapters).some(arr => arr.length > 0);
           if (!hasQuestions) return null;

           return (
            <div key={topic} className="mb-6 px-4">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1 sticky top-0 bg-white/95 backdrop-blur-sm py-1 z-10">
                {topic}
              </h2>
              
              {Object.entries(chapters).map(([chapter, topicQuestions]) => (
                 topicQuestions.length > 0 && (
                  <div key={chapter} className="mb-4 pl-2 border-l-2 border-slate-100 ml-1 hover:border-slate-300 transition-colors">
                    <h3 className="text-xs font-semibold text-slate-700 mb-2 truncate pl-2" title={chapter}>
                      {chapter}
                    </h3>
                    <div className="space-y-1 pl-1">
                      {topicQuestions.map((q) => {
                        const hasSavedWork = questionStates[q.id] && (
                          (questionStates[q.id].generatorEssay && questionStates[q.id].generatorEssay.length > 0) || 
                          (questionStates[q.id].graderEssay && questionStates[q.id].graderEssay.length > 0) || 
                          (questionStates[q.id].realTimeEssay && questionStates[q.id].realTimeEssay.length > 0) ||
                          (questionStates[q.id].clozeData)
                        );

                        return (
                          <div key={q.id} className="relative group">
                            <button
                              onClick={() => onSelectQuestion(q)}
                              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 border shadow-sm ${
                                selectedQuestionId === q.id
                                  ? "bg-blue-50 border-blue-200 text-blue-800 ring-1 ring-blue-200"
                                  : "bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:text-blue-700"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 flex items-center gap-1.5">
                                  <span className="bg-slate-100 px-1.5 rounded text-slate-500">
                                    {q.variant?.split('/')[0]} '{q.year?.slice(2)}
                                  </span>
                                  {hasSavedWork && (
                                    <span title="Contains saved work" className="text-emerald-500 flex items-center">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                                    </span>
                                  )}
                                  {q.id.startsWith('custom-') && (
                                    <span title="Custom Question" className="text-purple-400">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                    </span>
                                  )}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${q.maxMarks === 12 ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'}`}>
                                  {q.maxMarks}m
                                </span>
                              </div>
                              <p className="line-clamp-2 leading-relaxed text-xs font-medium">{q.questionText}</p>
                            </button>

                            {/* Edit/Delete Actions - visible on hover */}
                            <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-md p-1 shadow-sm border border-slate-100">
                              <button 
                                onClick={(e) => { e.stopPropagation(); onEditQuestion(q); }}
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit Question"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteQuestion(q.id); }}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete Question"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                 )
              ))}
            </div>
           );
        })}
        
        {/* Empty State Message */}
        {Object.keys(groupedQuestions).length === 0 && (
           <div className="p-8 text-center text-slate-400">
             <p className="text-sm">No questions found.</p>
           </div>
        )}
      </div>

      {/* Bulk Actions Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
         {isBatchProcessing && (
            <div className="mb-2">
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Batch Generating...</span>
                    <span>{batchProgress}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full animate-pulse w-full"></div>
                </div>
            </div>
         )}
         <div className="grid grid-cols-2 gap-2">
             <button
               onClick={onBatchGenerate}
               disabled={isBatchProcessing}
               className="px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50"
               title="Generate Model Essays & Cloze Exercises for all missing questions"
             >
               {isBatchProcessing ? "Generating..." : "Auto-Generate All"}
             </button>
             <button
               onClick={onExportAll}
               disabled={isBatchProcessing}
               className="px-3 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center gap-1"
             >
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               Export
             </button>
         </div>
         <button
            onClick={onOpenCodeExport}
            className="mt-1 w-full text-[10px] text-slate-400 hover:text-blue-600 font-medium flex items-center justify-center gap-1 py-1 transition-colors"
         >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m-4-4v12" /></svg>
            Sync Data (Download data.ts)
         </button>
      </div>
    </div>
  );
};

export default Sidebar;
