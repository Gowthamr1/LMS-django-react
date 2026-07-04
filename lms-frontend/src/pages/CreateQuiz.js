import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';

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
      setMessage(`✅ Quiz and ${questions.length} question${questions.length !== 1 ? 's' : ''} created!`);
      setLessonId(''); setQuizTitle('');
      setQuestions([{ questionText: '', choices: { a: '', b: '', c: '', d: '' }, correctAnswer: 'A' }]);
    } catch (err) {
      setMessage('❌ Failed to create quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.heading}>🧠 Create New Quiz</h1>
        <p style={styles.subheading}>Build assessments for your students</p>
      </div>

      {message && (
        <div style={{ ...styles.alert, ...(message.startsWith('✅') ? styles.alertSuccess : styles.alertError) }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Quiz Info */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Quiz Details</h2>
          <div style={styles.group}>
            <label style={styles.label}>Select Lesson</label>
            <select value={lessonId} onChange={e => setLessonId(e.target.value)} required style={styles.input}>
              <option value="">— Select a Lesson —</option>
              {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Quiz Title</label>
            <input value={quizTitle} onChange={e => setQuizTitle(e.target.value)}
              required style={styles.input} placeholder="e.g. Chapter 1 Assessment" />
          </div>
        </div>

        {/* Questions */}
        {questions.map((q, idx) => (
          <div key={idx} style={styles.questionCard}>
            <div style={styles.questionHeader}>
              <span style={styles.questionNum}>Question {idx + 1}</span>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(idx)} style={styles.removeBtn}>✕ Remove</button>
              )}
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Question Text</label>
              <textarea value={q.questionText}
                onChange={e => handleQuestionChange(idx, 'questionText', e.target.value)}
                required style={{ ...styles.input, height: '90px', resize: 'vertical' }}
                placeholder="Enter your question here..." />
            </div>

            <div style={styles.choicesGrid}>
              {['a', 'b', 'c', 'd'].map(choice => (
                <div key={choice}>
                  <label style={styles.label}>Option {choice.toUpperCase()}</label>
                  <input value={q.choices[choice]}
                    onChange={e => handleQuestionChange(idx, 'choices', { [choice]: e.target.value })}
                    required style={styles.input} placeholder={`Option ${choice.toUpperCase()}`} />
                </div>
              ))}
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Correct Answer</label>
              <div style={styles.answerRow}>
                {['A', 'B', 'C', 'D'].map(ans => (
                  <button key={ans} type="button"
                    onClick={() => handleQuestionChange(idx, 'correctAnswer', ans)}
                    style={{
                      ...styles.answerBtn,
                      ...(q.correctAnswer === ans ? styles.answerBtnActive : {}),
                    }}>
                    {ans}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Actions */}
        <div style={styles.actions}>
          <button type="button" onClick={addQuestion} disabled={questions.length >= 100} style={styles.addBtn}>
            ➕ Add Question ({questions.length}/100)
          </button>
          <button type="submit" disabled={submitting} style={{ ...styles.submitBtn, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Publishing...' : '🚀 Publish Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '800px', margin: '0 auto', padding: '2rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f8fafc', minHeight: '100vh',
  },
  header: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    borderRadius: '16px', padding: '2rem', marginBottom: '2rem', color: 'white',
  },
  heading: { fontSize: '2rem', fontWeight: '700', margin: 0 },
  subheading: { opacity: 0.85, margin: '0.4rem 0 0', fontSize: '1rem' },
  card: { backgroundColor: 'white', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: '0 0 1.25rem' },
  questionCard: {
    backgroundColor: 'white', borderRadius: '14px', padding: '1.75rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1.25rem',
    borderLeft: '4px solid #3b82f6',
  },
  questionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  questionNum: { fontSize: '1rem', fontWeight: '700', color: '#3b82f6' },
  removeBtn: { background: 'none', border: '1px solid #fca5a5', color: '#ef4444', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  group: { marginBottom: '1.25rem' },
  label: { display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.4rem', fontSize: '0.9rem' },
  input: {
    width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0',
    borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', fontFamily: 'inherit',
  },
  choicesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' },
  answerRow: { display: 'flex', gap: '0.75rem' },
  answerBtn: {
    flex: 1, padding: '0.65rem', border: '2px solid #e2e8f0', borderRadius: '8px',
    backgroundColor: 'white', color: '#374151', fontWeight: '700', cursor: 'pointer', fontSize: '1rem',
  },
  answerBtnActive: { borderColor: '#3b82f6', backgroundColor: '#eff6ff', color: '#3b82f6' },
  actions: { display: 'flex', gap: '1rem', justifyContent: 'space-between', marginTop: '0.5rem' },
  addBtn: {
    padding: '0.75rem 1.5rem', backgroundColor: '#eff6ff', color: '#3b82f6',
    border: '2px solid #bfdbfe', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem',
  },
  submitBtn: {
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem',
  },
  alert: { padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '500' },
  alertSuccess: { backgroundColor: '#dcfce7', color: '#166534' },
  alertError: { backgroundColor: '#fee2e2', color: '#991b1b' },
};

export default CreateQuiz;