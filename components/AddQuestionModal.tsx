
import React, { useState, useEffect } from 'react';
import { Question, SyllabusTopic } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
  initialQuestion?: Question | null;
}

const AddQuestionModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialQuestion }) => {
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

  // Populate form when opening in Edit mode
  useEffect(() => {
    if (isOpen && initialQuestion) {
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
    } else if (isOpen && !initialQuestion) {
      setFormData(defaultState);
    }
  }, [isOpen, initialQuestion]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const questionToSave: Question = {
      id: initialQuestion ? initialQuestion.id : `custom-${Date.now()}`, // Keep ID if editing, new ID if adding
      ...formData,
      variant: formData.variant
    };
    onSave(questionToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {initialQuestion ? 'Edit Question' : 'Add Custom Question'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Year</label>
              <input type="text" required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full p-2 border border-slate-200 rounded-md" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paper Code</label>
              <input type="text" required value={formData.paper} onChange={e => setFormData({...formData, paper: e.target.value})} className="w-full p-2 border border-slate-200 rounded-md" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Variant</label>
              <select value={formData.variant} onChange={e => setFormData({...formData, variant: e.target.value as "Feb/March" | "May/June" | "Oct/Nov"})} className="w-full p-2 border border-slate-200 rounded-md">
                <option>Feb/March</option>
                <option>May/June</option>
                <option>Oct/Nov</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Topic Section</label>
              <select value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value as SyllabusTopic})} className="w-full p-2 border border-slate-200 rounded-md">
                {Object.values(SyllabusTopic).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chapter / Sub-topic</label>
              <input type="text" placeholder="e.g. 1.1 Scarcity" required value={formData.chapter} onChange={e => setFormData({...formData, chapter: e.target.value})} className="w-full p-2 border border-slate-200 rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Question No.</label>
              <input type="text" placeholder="e.g. 2(a)" required value={formData.questionNumber} onChange={e => setFormData({...formData, questionNumber: e.target.value})} className="w-full p-2 border border-slate-200 rounded-md" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Marks</label>
              <input type="number" required value={formData.maxMarks} onChange={e => setFormData({...formData, maxMarks: parseInt(e.target.value)})} className="w-full p-2 border border-slate-200 rounded-md" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Question Text</label>
            <textarea required rows={3} value={formData.questionText} onChange={e => setFormData({...formData, questionText: e.target.value})} className="w-full p-2 border border-slate-200 rounded-md" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mark Scheme Content</label>
            <textarea required rows={6} placeholder="Paste the relevant mark scheme guidance here..." value={formData.markScheme} onChange={e => setFormData({...formData, markScheme: e.target.value})} className="w-full p-2 border border-slate-200 rounded-md font-mono text-xs" />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
              {initialQuestion ? 'Save Changes' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionModal;
