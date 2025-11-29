import React, { useState, useEffect } from 'react';
import { Question, SyllabusTopic } from '../types';
import { SYLLABUS_STRUCTURE, Level } from '../syllabusData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
  initialQuestion?: Question | null;
}

const AddQuestionModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialQuestion }) => {
  const [level, setLevel] = useState<Level>("AS");
  
  const defaultState = {
    year: new Date().getFullYear().toString(),
    paper: '9708/22',
    variant: 'May/June' as "Feb/March" | "May/June" | "Oct/Nov",
    questionNumber: '',
    topic: SyllabusTopic.BASIC_IDEAS,
    chapter: '',
    maxMarks: 8,
    questionText: '',
    markScheme: ''
  };

  const [formData, setFormData] = useState(defaultState);

  // Initialize form
  useEffect(() => {
    if (isOpen) {
      if (initialQuestion) {
        // Detect level based on topic
        // Use type assertion to avoid indexing errors
        const alTopics: SyllabusTopic[] = SYLLABUS_STRUCTURE["A Level"].topics;
        const isAL = alTopics.includes(initialQuestion.topic);
        setLevel(isAL ? "A Level" : "AS");
        
        setFormData({
          year: initialQuestion.year,
          paper: initialQuestion.paper,
          variant: initialQuestion.variant,
          questionNumber: initialQuestion.questionNumber,
          topic: initialQuestion.topic,
          chapter: initialQuestion.chapter,
          maxMarks: initialQuestion.maxMarks,
          questionText: initialQuestion.questionText,
          markScheme: initialQuestion.markScheme
        });
      } else {
        setFormData(defaultState);
        setLevel("AS");
      }
    }
  }, [isOpen, initialQuestion]);

  // Handle Level Change -> Reset Topic and Chapter
  const handleLevelChange = (newLevel: Level) => {
    setLevel(newLevel);
    const availableTopics = SYLLABUS_STRUCTURE[newLevel].topics;
    const defaultTopic = availableTopics[0];
    
    // Cast chapters to Record<string, string[]> to allow indexing with any SyllabusTopic
    const chaptersMap = SYLLABUS_STRUCTURE[newLevel].chapters as Record<string, string[]>;
    const defaultChapters = chaptersMap[defaultTopic] || [];
    
    setFormData(prev => ({
      ...prev,
      topic: defaultTopic,
      chapter: defaultChapters[0] || ''
    }));
  };

  // Handle Topic Change -> Reset Chapter
  const handleTopicChange = (newTopic: SyllabusTopic) => {
    const chaptersMap = SYLLABUS_STRUCTURE[level].chapters as Record<string, string[]>;
    const defaultChapters = chaptersMap[newTopic] || [];
    setFormData(prev => ({
      ...prev,
      topic: newTopic,
      chapter: defaultChapters[0] || ''
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const questionToSave: Question = {
      id: initialQuestion ? initialQuestion.id : `custom-${Date.now()}`,
      ...formData,
      variant: formData.variant
    };
    onSave(questionToSave);
    onClose();
  };

  const currentTopics = SYLLABUS_STRUCTURE[level].topics;
  const chaptersMap = SYLLABUS_STRUCTURE[level].chapters as Record<string, string[]>;
  const currentChapters = chaptersMap[formData.topic] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {initialQuestion ? 'Edit Question' : 'Add Custom Question'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">Select syllabus level to populate topics</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Level Switcher */}
          <div className="flex justify-center mb-2">
            <div className="bg-slate-100 p-1 rounded-lg flex">
              <button
                type="button"
                onClick={() => handleLevelChange("AS")}
                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                  level === "AS" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                AS Level (Topic 1-6)
              </button>
              <button
                type="button"
                onClick={() => handleLevelChange("A Level")}
                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                  level === "A Level" ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                A Level (Topic 7-11)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Year</label>
              <input type="text" required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paper Code</label>
              <input type="text" required value={formData.paper} onChange={e => setFormData({...formData, paper: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Variant</label>
              <select value={formData.variant} onChange={e => setFormData({...formData, variant: e.target.value as any})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                <option>Feb/March</option>
                <option>May/June</option>
                <option>Oct/Nov</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Topic Section ({level})</label>
              <select 
                value={formData.topic} 
                onChange={e => handleTopicChange(e.target.value as SyllabusTopic)} 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              >
                {currentTopics.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chapter / Sub-topic</label>
              <select
                value={formData.chapter}
                onChange={e => setFormData({...formData, chapter: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              >
                 <option value="" disabled>Select a chapter...</option>
                 {currentChapters.map((c: string) => (
                   <option key={c} value={c}>{c}</option>
                 ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Question No.</label>
              <input type="text" placeholder="e.g. 2(a)" required value={formData.questionNumber} onChange={e => setFormData({...formData, questionNumber: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Marks</label>
              <input type="number" required value={formData.maxMarks} onChange={e => setFormData({...formData, maxMarks: parseInt(e.target.value)})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Question Text</label>
            <textarea required rows={3} value={formData.questionText} onChange={e => setFormData({...formData, questionText: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mark Scheme Content</label>
            <textarea required rows={5} placeholder="Paste the relevant mark scheme guidance here..." value={formData.markScheme} onChange={e => setFormData({...formData, markScheme: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              {initialQuestion ? 'Save Changes' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionModal;