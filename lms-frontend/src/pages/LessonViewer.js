import React, { useEffect, useState } from 'react';
// eslint-disable-next-line
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

export default function LessonViewer() {
  const { id } = useParams();

  const [lesson, setLesson] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [marking, setMarking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const lessonRes = await axiosInstance.get(`/api/courses/lessons/${id}/`);
        setLesson(lessonRes.data);
        // lesson.progress returns 0 or 100 from LessonSerializer.get_progress
        setIsCompleted(lessonRes.data.progress === 100);

        const quizRes = await axiosInstance.get(`/api/courses/quizzes/?lesson=${id}`);
        setQuizzes(quizRes.data);
      } catch (err) {
        console.error('Failed to load lesson or quizzes:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

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
      // Quiz submission auto-creates a LessonCompletion on the backend
      setIsCompleted(true);
    } catch (err) {
      console.error('Failed to submit quiz attempt:', err.response?.data || err);
    }
  };

  const handleMarkComplete = async () => {
    setMarking(true);
    try {
      await axiosInstance.post(`/api/courses/lessons/${id}/complete/`);
      setIsCompleted(true);
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
    } finally {
      setMarking(false);
    }
  };

  if (loading) return (
    <div style={styles.loadingPage}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading lesson...</p>
    </div>
  );

  if (!lesson) return (
    <div style={styles.loadingPage}>
      <p style={styles.loadingText}>Lesson not found.</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.lessonTitle}>{lesson.title}</h1>
          {isCompleted ? (
            <div style={styles.completedBadge}>✅ Completed</div>
          ) : (
            <button
              onClick={handleMarkComplete}
              disabled={marking}
              style={styles.markCompleteBtn}
            >
              {marking ? 'Saving...' : '✓ Mark as Complete'}
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div style={styles.progressRow}>
          <span style={styles.progressLabel}>Lesson Progress</span>
          <div style={styles.progressTrack}>
            <div style={{
              ...styles.progressFill,
              width: isCompleted ? '100%' : '0%',
              backgroundColor: isCompleted ? '#22c55e' : '#06b6d4',
            }}></div>
          </div>
          <span style={styles.progressPct}>{isCompleted ? '100%' : '0%'}</span>
        </div>
      </div>

      {/* Content */}
      <div style={styles.contentArea}>
        {/* Image */}
        {lesson.image && (
          <div style={styles.mediaBox}>
            <img src={lesson.image} alt={lesson.title} style={styles.lessonImage} />
          </div>
        )}

        {/* Video */}
        {lesson.video && (
          <div style={styles.mediaBox}>
            <video src={lesson.video} style={styles.videoPlayer} controls />
          </div>
        )}

        {/* Text Content */}
        <div style={styles.contentCard}>
          <h3 style={styles.contentHeading}>📝 Lesson Content</h3>
          <div style={styles.contentBody}>
            {lesson.content.split('\n').map((para, i) => (
              para.trim() ? <p key={i} style={styles.para}>{para}</p> : null
            ))}
          </div>
        </div>

        {/* Mark complete CTA if no quizzes */}
        {quizzes.length === 0 && !isCompleted && (
          <div style={styles.completeCta}>
            <p style={styles.ctaText}>Finished reading? Mark this lesson as complete to track your progress.</p>
            <button onClick={handleMarkComplete} disabled={marking} style={styles.ctaBtn}>
              {marking ? 'Saving...' : '✓ Mark as Complete'}
            </button>
          </div>
        )}

        {isCompleted && quizzes.length === 0 && (
          <div style={styles.completedBox}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
            <p style={styles.completedText}>You've completed this lesson!</p>
          </div>
        )}
      </div>

      {/* Quizzes */}
      {quizzes.length > 0 && (
        <div style={styles.quizSection}>
          <h2 style={styles.quizSectionTitle}>🧠 Knowledge Check</h2>
          {quizzes.map(quiz => (
            <div key={quiz.id} style={styles.quizCard}>
              <div style={styles.quizHeader}>
                <h3 style={styles.quizTitle}>{quiz.title}</h3>
                {submitted[quiz.id] && (
                  <div style={styles.scoreBadge}>
                    🏆 {scores[quiz.id]}/{quiz.questions.length}
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
                <div style={{
                  ...styles.resultBox,
                  ...(scores[quiz.id] >= quiz.questions.length / 2 ? styles.resultPass : styles.resultFail)
                }}>
                  {scores[quiz.id] >= quiz.questions.length / 2
                    ? '🎉 Great job! You passed!'
                    : '📖 Good effort! Review the lesson and try again.'}
                </div>
              )}
            </div>
          ))}
        </div>
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
  header: {
    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    borderRadius: '16px', padding: '2rem', marginBottom: '2rem', color: 'white',
  },
  headerTop: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem',
  },
  lessonTitle: { fontSize: '1.75rem', fontWeight: '700', margin: 0, flex: 1 },
  completedBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1.25rem',
    borderRadius: '20px', fontWeight: '700', fontSize: '0.95rem', flexShrink: 0,
  },
  markCompleteBtn: {
    backgroundColor: 'white', color: '#3b82f6', border: 'none',
    padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: '700',
    cursor: 'pointer', fontSize: '0.9rem', flexShrink: 0,
  },
  progressRow: {
    display: 'flex', alignItems: 'center', gap: '1rem',
  },
  progressLabel: { fontSize: '0.85rem', opacity: 0.85, whiteSpace: 'nowrap' },
  progressTrack: {
    flex: 1, height: '8px', backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: '4px', overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: '4px', transition: 'width 0.6s ease' },
  progressPct: { fontSize: '0.85rem', fontWeight: '700', opacity: 0.9, minWidth: '36px', textAlign: 'right' },
  contentArea: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  mediaBox: {
    borderRadius: '14px', overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  },
  lessonImage: { width: '100%', height: 'auto', display: 'block' },
  videoPlayer: { width: '100%', height: '420px', display: 'block', backgroundColor: '#000' },
  contentCard: {
    backgroundColor: 'white', borderRadius: '14px', padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  },
  contentHeading: {
    fontSize: '1.2rem', fontWeight: '700', color: '#1e293b',
    margin: '0 0 1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f1f5f9',
  },
  contentBody: {},
  para: { color: '#475569', lineHeight: 1.75, fontSize: '1rem', marginBottom: '1rem' },
  completeCta: {
    backgroundColor: 'white', borderRadius: '14px', padding: '1.75rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', textAlign: 'center',
  },
  ctaText: { color: '#64748b', marginBottom: '1rem', fontSize: '1rem' },
  ctaBtn: {
    padding: '0.8rem 2rem',
    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    color: 'white', border: 'none', borderRadius: '8px',
    fontWeight: '700', cursor: 'pointer', fontSize: '1rem',
  },
  completedBox: {
    backgroundColor: '#f0fdf4', borderRadius: '14px', padding: '2rem',
    textAlign: 'center', border: '1px solid #bbf7d0',
  },
  completedText: { color: '#166534', fontWeight: '700', fontSize: '1.1rem', margin: 0 },
  quizSection: { marginTop: '1rem' },
  quizSectionTitle: {
    fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: '0 0 1.25rem',
  },
  quizCard: {
    backgroundColor: 'white', borderRadius: '14px', padding: '1.75rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1.5rem',
  },
  quizHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem',
  },
  quizTitle: { fontSize: '1.15rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  scoreBadge: {
    backgroundColor: '#06b6d4', color: 'white',
    padding: '0.35rem 1rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '700',
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
  resultBox: {
    padding: '1rem 1.5rem', borderRadius: '8px', fontWeight: '600', fontSize: '1rem',
  },
  resultPass: { backgroundColor: '#f0fdf4', color: '#166534' },
  resultFail: { backgroundColor: '#eff6ff', color: '#1d4ed8' },
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