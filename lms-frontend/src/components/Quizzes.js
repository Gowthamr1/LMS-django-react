import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

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

  if (loading) return (
    <div style={styles.loadingPage}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading quiz...</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <Link to={`/lesson/${lessonId}`} style={styles.backLink}>← Back to lesson</Link>
      <h2 style={styles.quizSectionTitle}>🧠 Knowledge Check</h2>

      {quizzes.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>No quizzes for this lesson yet.</p>
        </div>
      ) : (
        quizzes.map(quiz => {
          const total = quiz.questions.length;
          const score = scores[quiz.id];
          const isPerfect = submitted[quiz.id] && score === total;
          const passed = submitted[quiz.id] && total > 0 && (score / total) >= 0.7;

          return (
            <div key={quiz.id} style={styles.quizCard}>
              <div style={styles.quizHeader}>
                <h3 style={styles.quizTitle}>{quiz.title}</h3>
                {submitted[quiz.id] && (
                  <div style={{
                    ...styles.scoreBadge,
                    backgroundColor: isPerfect ? '#22c55e' : passed ? '#06b6d4' : '#f87171',
                  }}>
                    {isPerfect ? '🏆' : '📊'} {score}/{total}
                  </div>
                )}
              </div>

              {quiz.questions.map((q, qi) => (
                <div key={q.id} style={styles.questionCard}>
                  <p style={styles.questionText}>
                    <span style={styles.questionNum}>Q{qi + 1}.</span> {q.text}
                  </p>
                  <div style={styles.optionsGrid}>
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const isCorrect = q.correct_answer === opt;
                      const isSelected = answers[quiz.id]?.[q.id] === opt;
                      const showAnswer = submitted[quiz.id];
                      return (
                        <label key={opt} style={{
                          ...styles.optionLabel,
                          ...(isSelected && !showAnswer ? styles.optionSelected : {}),
                          ...(showAnswer && isCorrect ? styles.optionCorrect : {}),
                          ...(showAnswer && isSelected && !isCorrect ? styles.optionWrong : {}),
                          cursor: submitted[quiz.id] ? 'default' : 'pointer',
                        }}>
                          <input type="radio"
                            name={`quiz-${quiz.id}-q-${q.id}`}
                            value={opt}
                            checked={isSelected}
                            onChange={() => handleAnswer(quiz.id, q.id, opt)}
                            disabled={submitted[quiz.id]}
                            style={{ display: 'none' }}
                          />
                          <span style={styles.optionLetter}>{opt}</span>
                          <span>{q[`choice_${opt.toLowerCase()}`]}</span>
                          {showAnswer && isCorrect && <span style={styles.checkIcon}>✔️</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!submitted[quiz.id] ? (
                <button style={styles.submitQuizBtn} onClick={() => handleSubmitQuiz(quiz)}>
                  Submit Quiz 🚀
                </button>
              ) : (
                <div style={styles.resultArea}>
                  {/* Result message */}
                  <div style={{
                    ...styles.resultBox,
                    ...(isPerfect ? styles.resultPerfect : passed ? styles.resultPass : styles.resultFail)
                  }}>
                    {isPerfect
                      ? '🎉 Perfect score! You aced this quiz.'
                      : passed
                        ? '✅ Passed! (70%+) — Lesson marked complete.'
                        : '📖 You need 70%+ to pass. Review and try again!'}
                  </div>

                  {/* ✅ Try Again only shown when NOT perfect score */}
                  {!isPerfect && (
                    <button style={styles.tryAgainBtn} onClick={() => handleTryAgain(quiz.id)}>
                      ↻ Try Again
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '900px', margin: '0 auto', padding: '2rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f8fafc', minHeight: '100vh',
  },
  backLink: {
    display: 'inline-block', marginBottom: '1.25rem', color: '#3b82f6',
    fontWeight: '700', textDecoration: 'none', fontSize: '0.95rem',
  },
  quizSectionTitle: {
    fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: '0 0 1.25rem',
  },
  emptyBox: {
    backgroundColor: 'white', borderRadius: '14px', padding: '2.5rem',
    textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  },
  emptyText: { color: '#64748b', fontSize: '1rem', margin: 0 },
  quizCard: {
    backgroundColor: 'white', borderRadius: '14px', padding: '1.75rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1.5rem',
  },
  quizHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem',
  },
  quizTitle: { fontSize: '1.15rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  scoreBadge: {
    color: 'white', padding: '0.35rem 1rem',
    borderRadius: '20px', fontSize: '0.875rem', fontWeight: '700',
  },
  questionCard: {
    borderLeft: '4px solid #e0f2fe', padding: '1rem 1.25rem',
    marginBottom: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '8px',
  },
  questionText: { fontSize: '1rem', color: '#1e293b', marginBottom: '0.75rem' },
  questionNum: { fontWeight: '800', color: '#06b6d4', marginRight: '0.4rem' },
  optionsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem',
  },
  optionLabel: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.85rem 1rem', borderRadius: '8px',
    backgroundColor: 'white', border: '2px solid #e2e8f0',
  },
  optionSelected: { borderColor: '#06b6d4', backgroundColor: '#ecfeff' },
  optionCorrect: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  optionWrong: { borderColor: '#f87171', backgroundColor: '#fff5f5' },
  optionLetter: {
    width: '28px', height: '28px', borderRadius: '50%',
    backgroundColor: '#e0f2fe', color: '#0369a1',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '800', fontSize: '0.85rem', flexShrink: 0,
  },
  checkIcon: { marginLeft: 'auto', color: '#22c55e' },
  submitQuizBtn: {
    padding: '0.85rem 2rem',
    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    color: 'white', border: 'none', borderRadius: '8px',
    fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
  },
  resultArea: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  resultBox: {
    padding: '1rem 1.5rem', borderRadius: '8px', fontWeight: '600', fontSize: '1rem',
  },
  resultPerfect: { backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
  resultPass: { backgroundColor: '#eff6ff', color: '#1d4ed8' },
  resultFail: { backgroundColor: '#fff7ed', color: '#9a3412' },
  tryAgainBtn: {
    padding: '0.75rem 1.75rem', backgroundColor: 'white',
    color: '#3b82f6', border: '2px solid #3b82f6',
    borderRadius: '8px', fontSize: '0.95rem',
    fontWeight: '700', cursor: 'pointer', alignSelf: 'flex-start',
  },
  loadingPage: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc',
  },
  spinner: {
    width: '48px', height: '48px', border: '5px solid #e2e8f0',
    borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  loadingText: { color: '#64748b', fontSize: '1.1rem', fontStyle: 'italic' },
};

export default Quizzes;