import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function CreateLesson() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    courseId: searchParams.get('courseId') || '', title: '', content: '', order: 1,
    image: null, video: null, imageUrl: '', videoUrl: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState({ courses: true, submitting: false });

  useEffect(() => {
    axiosInstance.get('/api/courses/courses/')
      .then(res => setCourses(res.data))
      .catch(() => setMessage('Failed to load courses.'))
      .finally(() => setLoading(prev => ({ ...prev, courses: false })));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submitting: true }));
    setMessage('');
    const payload = new FormData();
    payload.append('course', formData.courseId);
    payload.append('title', formData.title);
    payload.append('content', formData.content);
    payload.append('order', formData.order);
    if (formData.image) payload.append('image', formData.image);
    if (formData.video) payload.append('video', formData.video);
    if (formData.imageUrl.trim()) payload.append('image_url', formData.imageUrl.trim());
    if (formData.videoUrl.trim()) payload.append('video_url', formData.videoUrl.trim());

    try {
      await axiosInstance.post('/api/courses/lessons/', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Lesson created successfully!');
      setTimeout(() => navigate(`/instructor/manage-lessons/${formData.courseId}`), 1500);
    } catch (error) {
      const errMsg = error.response?.data ? Object.values(error.response.data).flat().join(' ') : 'Failed to create lesson.';
      setMessage(errMsg);
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-8 glass-panel border border-violet-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-violet-950/40 to-slate-900/90"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Content Module
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Upload Lesson 🎬
        </h1>
        <p className="text-slate-400 text-sm">
          Add video links, text modules, and lesson order to your course syllabus.
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
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Course</label>
            <select
              name="courseId"
              required
              value={formData.courseId}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white bg-slate-900 focus:bg-slate-900"
            >
              <option value="" className="bg-slate-900 text-slate-400">Select course...</option>
              {courses.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lesson Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Introduction to React State"
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Order Sequence</label>
              <input
                type="number"
                name="order"
                required
                min={1}
                value={formData.order}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Video Embed URL (YouTube/Vimeo)</label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Text Notes & Material</label>
            <textarea
              rows={5}
              name="content"
              required
              value={formData.content}
              onChange={handleChange}
              placeholder="Write the reading material, instructions, or code snippets for this lesson..."
              className="w-full p-4 rounded-xl glass-input text-sm text-white placeholder-slate-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading.submitting}
            className="w-full py-4 px-4 rounded-xl glass-button-primary text-sm font-bold flex items-center justify-center gap-2 mt-4"
          >
            {loading.submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Publish Lesson'}
          </button>
        </form>

      </div>

    </div>
  );
}

export default CreateLesson;
