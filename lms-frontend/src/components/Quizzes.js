import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import LmsLoader from './LmsLoader';
import { Brain, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

function Quizzes() {
  const { lessonId } = useParams();

  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosInstance.get(`/api/courses/quizzes/?lesson=${lessonId}`)
      .then(res => setQuizzes(res.data || []))
      .catch(err => console.error('Failed to load quizzes:', err))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleAnswer = (quizId, questionId, choice) => {
    setAnswers(prev => ({
      ...prev,
      [quizId]: { ...prev[quizId], [questionId]: choice }
    }));
  };

  const handleSubmitQuiz = async (quiz) => {
    const ans = answers[quiz.id] || {};
    let correct = 0;
    quiz.questions.forEach(q => {
      if (ans[q.id] === q.correct_answer) correct++;
    });

    try {
      await axiosInstance.post('/api/courses/attempts/', { quiz: quiz.id, score: correct });
      setScores(prev => ({ ...prev, [quiz.id]: correct }));
      setSubmitted(prev => ({ ...prev, [quiz.id]: true }));
    } catch (err) {
      console.error('Failed to submit quiz attempt:', err.response?.data || err);
    }
  };

  const handleTryAgain = (quizId) => {
    setAnswers(prev => ({ ...prev, [quizId]: {} }));
    setSubmitted(prev => ({ ...prev, [quizId]: false }));
    setScores(prev => {
      const next = { ...prev };
      delete next[quizId];
      return next;
    });
  };

  if (loading) {
    return <LmsLoader title="Loading quiz" subtitle="Preparing your knowledge assessment..." size="lg" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      <Link
        to={`/lesson/${lessonId}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Lesson
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-8 glass-panel border border-indigo-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Knowledge Assessment
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Lesson Quiz 🧠
        </h1>
        <p className="text-slate-400 text-sm">
          Test your understanding of this module. Scoring 100% unlocks course completion.
        </p>
      </motion.div>

      {quizzes.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto my-8 border border-slate-800">
          <Brain className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Quizzes for this Lesson</h2>
          <p className="text-slate-400 text-sm mb-6">
            This lesson is text/video based. You can directly proceed with your learning.
          </p>
          <Link to={`/lesson/${lessonId}`} className="px-5 py-2.5 rounded-xl glass-button-primary text-xs font-bold">
            Return to Lesson
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {quizzes.map(quiz => {
            const isSubbed = submitted[quiz.id];
            const score = scores[quiz.id];
            const totalQs = quiz.questions?.length || 0;
            const isPerfect = isSubbed && score === totalQs;

            return (
              <div key={quiz.id} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
                    <p className="text-xs text-slate-400 mt-1">{totalQs} Multiple Choice Questions</p>
                  </div>

                  {isSubbed && (
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                      isPerfect 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      Score: {score} / {totalQs}
                    </span>
                  )}
                </div>

                {/* Questions */}
                <div className="space-y-6">
                  {quiz.questions.map((q, idx) => {
                    const selected = answers[quiz.id]?.[q.id];
                    const isCorrect = isSubbed && selected === q.correct_answer;

                    return (
                      <div key={q.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                        <p className="text-sm font-bold text-white flex items-start gap-2">
                          <span className="text-indigo-400 font-mono">Q{idx + 1}.</span>
                          <span>{q.text}</span>
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {['A', 'B', 'C', 'D'].map(choiceKey => {
                            const choiceText = q[`choice_${choiceKey.toLowerCase()}`];
                            const isThisSelected = selected === choiceKey;

                            let btnStyle = "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700";
                            if (isThisSelected) btnStyle = "bg-indigo-600/30 border-indigo-500 text-white font-bold";
                            if (isSubbed && choiceKey === q.correct_answer) btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";

                            return (
                              <button
                                key={choiceKey}
                                type="button"
                                disabled={isSubbed}
                                onClick={() => handleAnswer(quiz.id, q.id, choiceKey)}
                                className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center gap-2 ${btnStyle}`}
                              >
                                <span className="w-5 h-5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0">
                                  {choiceKey}
                                </span>
                                <span>{choiceText}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Submit / Retry Actions */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  {!isSubbed ? (
                    <button
                      type="button"
                      onClick={() => handleSubmitQuiz(quiz)}
                      className="w-full py-3.5 px-4 rounded-xl glass-button-primary text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Submit Quiz Attempt
                    </button>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xs text-slate-300">
                        {isPerfect ? '🎉 Perfect score! Lesson completed.' : 'You scored under 100%. You can try again.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleTryAgain(quiz.id)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Retake Quiz
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default Quizzes;
