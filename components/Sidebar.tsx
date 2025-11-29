import React, { useMemo, useState } from 'react';
import { Question, SyllabusTopic, QuestionState } from '../types';
import { SYLLABUS_STRUCTURE, Level } from '../syllabusData';

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
type SortOption = 'syllabus' | 'year' | 'marks';

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
  const [selectedLevel, setSelectedLevel] = useState<Level>('AS');
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>('syllabus');

  // --- Filtering Logic ---
  const filteredQuestions = useMemo(() => {
    const validTopics = new Set(SYLLABUS_STRUCTURE[selectedLevel].topics);
    const lowerQuery = searchQuery.toLowerCase().trim();

    return questions.filter(q => {
      // 1. Level Filter
      if (!validTopics.has(q.topic)) return false;

      // 2. Search Filter
      if (lowerQuery) {
        const textMatch = q.questionText.toLowerCase().includes(lowerQuery);
        const yearMatch = q.year.includes(lowerQuery);
        const paperMatch = q.paper.toLowerCase().includes(lowerQuery);
        const chapterMatch = q.chapter.toLowerCase().includes(lowerQuery);
        if (!textMatch && !yearMatch && !paperMatch && !chapterMatch) return false;
      }

      // 3. Mode Filter
      if (filterMode === 'saved') {
        const state = questionStates[q.id];
        const hasWork = state && (
          (state.generatorEssay && state.generatorEssay.length > 0) || 
          (state.graderEssay && state.graderEssay.length > 0) || 
          (state.realTimeEssay && state.realTimeEssay.length > 0) ||
          (state.clozeData)
        );
        if (!hasWork) return false;
      }
      if (filterMode === 'custom' && !q.id.startsWith('custom-')) return false;

      return true;
    });
  }, [questions, selectedLevel, searchQuery, filterMode, questionStates]);


  // --- Grouping & Sorting Logic ---
  
  // 1. Syllabus View (Nested: Topic -> Chapter -> Questions)
  const syllabusGroups = useMemo(() => {
    if (sortOption !== 'syllabus') return null;

    const groups: Record<string, Record<string, Question[]>> = {};
    
    SYLLABUS_STRUCTURE[selectedLevel].topics.forEach(topic => {
      groups[topic] = {};
    });

    filteredQuestions.forEach(q => {
      if (!groups[q.topic]) groups[q.topic] = {};
      const chapterKey = q.chapter || "General";
      if (!groups[q.topic][chapterKey]) groups[q.topic][chapterKey] = [];
      groups[q.topic][chapterKey].push(q);
    });
    
    return groups;
  }, [filteredQuestions, sortOption, selectedLevel]);

  // 2. Flat List View (Sorted by Year or Marks)
  const flatSortedQuestions = useMemo(() => {
    if (sortOption === 'syllabus') return null;

    return [...filteredQuestions].sort((a, b) => {
      if (sortOption === 'year') {
        // Sort by Year Descending, then by Paper
        if (b.year !== a.year) return b.year.localeCompare(a.year);
        return a.paper.localeCompare(b.paper);
      }
      if (sortOption === 'marks') {
        // Sort by Marks Descending
        return b.maxMarks - a.maxMarks;
      }
      return 0;
    });
  }, [filteredQuestions, sortOption]);


  // Helper: Sort chapters logically (1.2 before 1.10) using numeric sorting
  const getSortedChapters = (chaptersObj: Record<string, Question[]>) => {
    return Object.keys(chaptersObj).sort((a, b) => {
      // Use numeric collation to handle "1.2" vs "1.10" correctly
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
  };

  // Helper: Get ordered topics
  const orderedTopics = SYLLABUS_STRUCTURE[selectedLevel].topics;

  return (
    <div className="w-80 bg-white border-r border-slate-200 h-screen flex flex-col">
      
      {/* --- Top Controls Section --- */}
      <div className="p-4 border-b border-slate-100 bg-white z-20 flex-shrink-0 space-y-3">
        
        {/* Header & Add Button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">CIE Econ Master</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
               Total: <span className="text-blue-600 font-bold">{questions.length}</span> | Visible: <span className="text-blue-600 font-bold">{filteredQuestions.length}</span>
            </p>
          </div>
          <button 
            onClick={onAddQuestionClick}
            className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-sm hover:shadow transition-all"
            title="Add Question"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
                type="text"
                className="block w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
                <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
            )}
        </div>

        {/* AS / A Level Switch */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
           <button
             onClick={() => setSelectedLevel('AS')}
             className={`flex-1 py-1 text-xs font-semibold rounded transition-all ${
               selectedLevel === 'AS' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
             }`}
           >
             AS Level
           </button>
           <button
             onClick={() => setSelectedLevel('A Level')}
             className={`flex-1 py-1 text-xs font-semibold rounded transition-all ${
               selectedLevel === 'A Level' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
             }`}
           >
             A Level
           </button>
        </div>

        {/* Sort Options */}
        <div className="flex gap-2 items-center">
           <span className="text-[10px] font-bold text-slate-400 uppercase">Sort:</span>
           <div className="flex-1 flex gap-1">
             {[
               { id: 'syllabus', label: 'Topic' },
               { id: 'year', label: 'Year' },
               { id: 'marks', label: 'Marks' }
             ].map((opt) => (
               <button
                 key={opt.id}
                 onClick={() => setSortOption(opt.id as SortOption)}
                 className={`flex-1 py-1 text-[10px] font-medium rounded border ${
                   sortOption === opt.id 
                     ? 'bg-blue-50 border-blue-200 text-blue-700' 
                     : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                 }`}
               >
                 {opt.label}
               </button>
             ))}
           </div>
        </div>

        {/* Filter Mode Tabs */}
        <div className="flex border-b border-slate-100">
          {[
             { id: 'all', label: 'All' },
             { id: 'saved', label: 'Work' },
             { id: 'custom', label: 'Added' }
          ].map(f => (
            <button
               key={f.id}
               onClick={() => setFilterMode(f.id as FilterMode)}
               className={`flex-1 pb-2 text-xs font-medium border-b-2 transition-colors ${
                 filterMode === f.id 
                   ? 'border-blue-600 text-blue-600' 
                   : 'border-transparent text-slate-400 hover:text-slate-600'
               }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* --- Question List Section --- */}
      <div className="flex-1 overflow-y-auto custom-scroll py-2 px-3">
        
        {/* SYLLABUS VIEW (Nested) */}
        {sortOption === 'syllabus' && syllabusGroups && (
           <>
             {SYLLABUS_STRUCTURE[selectedLevel].topics.map((topic) => {
               const chapters = syllabusGroups[topic];
               if (!chapters || Object.keys(chapters).length === 0) return null;

               const sortedChapters = getSortedChapters(chapters);

               return (
                 <div key={topic} className="mb-6">
                   <h2 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 sticky top-0 bg-white/95 py-1 z-10">
                     {topic.replace(/^\d+\.\s*/, '')}
                   </h2>
                   
                   {sortedChapters.map((chapter) => {
                     const topicQuestions = chapters[chapter];
                     if (!topicQuestions || topicQuestions.length === 0) return null;

                     return (
                       <div key={chapter} className="mb-3 pl-2 border-l-2 border-slate-100 ml-1">
                         <h3 className="text-[11px] font-bold text-slate-600 mb-2 pl-2" title={chapter}>
                           {chapter.split(' ').slice(0, 1)} <span className="font-normal text-slate-500">{chapter.split(' ').slice(1).join(' ')}</span>
                         </h3>
                         <div className="pl-1">
                           {topicQuestions.map(q => <QuestionCard key={q.id} q={q} />)}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               );
             })}
           </>
        )}

        {/* FLAT VIEW (Year / Marks) */}
        {sortOption !== 'syllabus' && flatSortedQuestions && (
           <div className="space-y-1 mt-2">
              {flatSortedQuestions.map(q => <QuestionCard key={q.id} q={q} />)}
           </div>
        )}

        {/* Empty State */}
        {filteredQuestions.length === 0 && (
           <div className="p-8 text-center text-slate-400 flex flex-col items-center mt-10">
             <svg className="w-8 h-8 mb-2 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             <p className="text-xs font-medium">No questions found</p>
             <p className="text-[10px] text-slate-300 mt-1">Try adjusting filters or search</p>
           </div>
        )}
      </div>

      {/* --- Footer Bulk Actions --- */}
      <div className="p-3 bg-slate-50 border-t border-slate-200">
         {isBatchProcessing && (
            <div className="mb-2">
                <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                    <span>Generating...</span>
                    <span>{batchProgress}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full animate-pulse w-full"></div>
                </div>
            </div>
         )}
         <div className="grid grid-cols-2 gap-2">
             <button
               onClick={onBatchGenerate}
               disabled={isBatchProcessing}
               className="px-2 py-1.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wide rounded shadow-sm hover:bg-slate-50 disabled:opacity-50"
             >
               Auto-Gen All
             </button>
             <button
               onClick={onExportAll}
               disabled={isBatchProcessing}
               className="px-2 py-1.5 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wide rounded shadow-sm hover:bg-slate-700 disabled:opacity-50"
             >
               Export Word
             </button>
         </div>
         <button
            onClick={onOpenCodeExport}
            className="mt-2 w-full text-[10px] text-slate-400 hover:text-blue-600 font-medium flex items-center justify-center gap-1 transition-colors"
         >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m-4-4v12" /></svg>
            Sync Data (Download data.ts)
         </button>
      </div>
    </div>
  );

  function QuestionCard({ q }: { q: Question }) {
    const hasSavedWork = questionStates[q.id] && (
      (questionStates[q.id].generatorEssay && questionStates[q.id].generatorEssay.length > 0) || 
      (questionStates[q.id].graderEssay && questionStates[q.id].graderEssay.length > 0) || 
      (questionStates[q.id].realTimeEssay && questionStates[q.id].realTimeEssay.length > 0) ||
      (questionStates[q.id].clozeData)
    );

    return (
      <div className="relative group mb-2">
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
                {q.year} {q.variant.split('/')[0]}
              </span>
              {hasSavedWork && (
                <span title="Contains saved work" className="text-emerald-500">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                </span>
              )}
              {q.id.startsWith('custom-') && (
                <span title="Custom Question" className="text-purple-400">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                </span>
              )}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${q.maxMarks >= 12 ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'}`}>
              {q.maxMarks}m
            </span>
          </div>
          <p className="line-clamp-2 leading-relaxed text-xs font-medium">{q.questionText}</p>
          {sortOption !== 'syllabus' && (
             <p className="text-[10px] text-slate-400 mt-1 truncate">{q.chapter}</p>
          )}
        </button>

        <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-md p-1 shadow-sm border border-slate-100 pointer-events-none group-hover:pointer-events-auto">
          <button 
            onClick={(e) => { e.stopPropagation(); onEditQuestion(q); }}
            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteQuestion(q.id); }}
            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    );
  }
};

export default Sidebar;