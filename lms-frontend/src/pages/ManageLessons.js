import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import LmsLoader from '../components/LmsLoader';
import { Video, PlusCircle, Pencil, Trash2, Check, ArrowLeft, Sparkles, Brain, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function ManageLessons() {
  const { courseId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingLesson, setEditingLesson] = useState(null);
  const [editData, setEditData] = useState({ title: '', content: '', order: 1, image_url: '', video_url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          axiosInstance.get(`/api/courses/courses/${courseId}/`),
          axiosInstance.get(`/api/courses/lessons/?course=${courseId}`),
        ]);
        setCourseTitle(courseRes.data.title);
        setLessons(lessonsRes.data);
      } catch (err) {
        console.error('Failed to load lessons:', err);
        setError(err.response?.data?.detail || 'Unable to load this course or its lessons.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const startEditing = (lesson) => {
    setEditingLesson(lesson);
    setEditData({
      title: lesson.title,
      content: lesson.content || '',
      order: lesson.order,
      image_url: lesson.image_url || '',
      video_url: lesson.video_url || '',
    });
  };

  const saveLesson = async (event) => {
    event.preventDefault();
    if (!editingLesson) return;
    setSaving(true);
    setError('');
    try {
      const response = await axiosInstance.patch(`/api/courses/lessons/${editingLesson.id}/`, editData);
      setLessons(current => current.map(lesson => lesson.id === response.data.id ? response.data : lesson));
      setEditingLesson(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to update this lesson.');
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson permanently?')) return;
    try {
      await axiosInstance.delete(`/api/courses/lessons/${lessonId}/`);
      setLessons(current => current.filter(lesson => lesson.id !== lessonId));
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete this lesson.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      <Link
        to="/instructor/my-courses"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Courses
      </Link>

      {/* Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-violet-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-violet-950/40 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Module Management
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            {courseTitle || 'Course Lessons'}
          </h1>
          <p className="text-slate-400 text-sm">
            Reorder, edit, or delete lesson modules for this course.
          </p>
        </div>

        <Link
          to={`/instructor/create-lesson?courseId=${courseId}`}
          className="px-5 py-2.5 rounded-xl glass-button-primary text-sm font-semibold inline-flex items-center gap-2 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Add Lesson
        </Link>
      </motion.div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <LmsLoader title="Loading lessons" subtitle="Fetching course modules..." size="lg" />
      ) : lessons.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto my-12 border border-slate-800">
          <Video className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Lessons in this Course</h2>
          <p className="text-slate-400 text-sm mb-6">Add your first video or text lesson!</p>
          <Link
            to={`/instructor/create-lesson?courseId=${courseId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-button-primary text-sm font-semibold"
          >
            <PlusCircle className="w-4 h-4" /> Add First Lesson
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => {
            const isEditingThis = editingLesson?.id === lesson.id;

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 border border-slate-800/80 hover:border-violet-500/40 transition-all space-y-4"
              >
                {isEditingThis ? (
                  <form onSubmit={saveLesson} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                        <input
                          type="text"
                          required
                          value={editData.title}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Order</label>
                        <input
                          type="number"
                          required
                          value={editData.order}
                          onChange={(e) => setEditData({ ...editData, order: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white text-center"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Video URL</label>
                      <input
                        type="url"
                        value={editData.video_url}
                        onChange={(e) => setEditData({ ...editData, video_url: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Content Notes</label>
                      <textarea
                        rows={3}
                        value={editData.content}
                        onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                        className="w-full p-3 rounded-xl glass-input text-xs text-white resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 rounded-xl glass-button-primary text-xs font-bold flex items-center gap-1.5"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Save Changes</>}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingLesson(null)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 font-mono font-bold flex items-center justify-center text-xs">
                        #{lesson.order}
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white mb-1">{lesson.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-1">{lesson.content || 'No text notes.'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Link
                        to={`/instructor/quiz?lessonId=${lesson.id}`}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-bold flex items-center gap-1"
                      >
                        <Brain className="w-3.5 h-3.5" /> Quizzes
                      </Link>

                      <button
                        onClick={() => startEditing(lesson)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                        title="Edit Lesson"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteLesson(lesson.id)}
                        className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                        title="Delete Lesson"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default ManageLessons;
