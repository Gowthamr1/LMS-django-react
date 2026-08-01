import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { PlusCircle, Trash2, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function CreateQuiz() {
  const [lessons, setLessons] = useState([]);
  const [lessonId, setLessonId] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', choices: { a: '', b: '', c: '', d: '' }, correctAnswer: 'A' },
  ]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axiosInstance.get('/api/courses/lessons/')
      .then(res => setLessons(res.data))
      .catch(err => console.error('Failed to load lessons:', err));
  }, []);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    if (field === 'choices') updated[index].choices = { ...updated[index].choices, ...value };
    else updated[index][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    if (questions.length < 100)
      setQuestions([...questions, { questionText: '', choices: { a: '', b: '', c: '', d: '' }, correctAnswer: 'A' }]);
  };

  const removeQuestion = (idx) => {
    if (questions.length > 1) setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const quizRes = await axiosInstance.post('/api/courses/quizzes/', { lesson: lessonId, title: quizTitle });
      const quizId = quizRes.data.id;
      for (const q of questions) {
        await axiosInstance.post('/api/courses/questions/', {
          quiz: quizId, text: q.questionText,
          choice_a: q.choices.a, choice_b: q.choices.b,
          choice_c: q.choices.c, choice_d: q.choices.d,
          correct_answer: q.correctAnswer,
        });
      }
      setMessage(`Quiz and ${questions.length} question(s) created successfully!`);
      setLessonId(''); setQuizTitle('');
      setQuestions([{ questionText: '', choices: { a: '', b: '', c: '', d: '' }, correctAnswer: 'A' }]);
    } catch (err) {
      setMessage('Failed to create quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-8 glass-panel border border-indigo-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Assessment Builder
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Create Lesson Quiz 🧠
        </h1>
        <p className="text-slate-400 text-sm">
          Build multiple choice question modules to evaluate student knowledge.
        </p>
      </motion.div>

      {/* Form Card */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        
        {message && (
          <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
            message.includes('successfully') 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}>
            {message.includes('successfully') ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Lesson</label>
              <select
                required
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white bg-slate-900 focus:bg-slate-900"
              >
                <option value="" className="bg-slate-900 text-slate-400">Select lesson...</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id} className="bg-slate-900 text-white">{l.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quiz Title</label>
              <input
                type="text"
                required
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="e.g. Chapter 1 Mastery Check"
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Dynamic Questions Builder */}
          <div className="space-y-6 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Questions List</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-bold flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>

            {questions.map((q, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Question #{idx + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="p-1 text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    required
                    value={q.questionText}
                    onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)}
                    placeholder="Enter question text..."
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
                  />
                </div>

                {/* Choices A, B, C, D */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['a', 'b', 'c', 'd'].map(key => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-[10px] text-slate-300">
                        {key.toUpperCase()}
                      </span>
                      <input
                        type="text"
                        required
                        value={q.choices[key]}
                        onChange={(e) => handleQuestionChange(idx, 'choices', { [key]: e.target.value })}
                        placeholder={`Option ${key.toUpperCase()}`}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Correct Answer Choice</label>
                  <select
                    value={q.correctAnswer}
                    onChange={(e) => handleQuestionChange(idx, 'correctAnswer', e.target.value)}
                    className="w-44 px-3 py-2 rounded-xl glass-input text-xs text-white bg-slate-900"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-4 rounded-xl glass-button-primary text-sm font-bold flex items-center justify-center gap-2 mt-4"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Quiz & Questions'}
          </button>
        </form>

      </div>

    </div>
  );
}

export default CreateQuiz;