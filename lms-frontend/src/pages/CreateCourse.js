import React, { useState } from 'react';
import axiosInstance from '../axiosInstance';
import { Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function CreateCourse() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('6 Weeks');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    } else {
      setImageFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('duration', duration);
    formData.append('difficulty', difficulty);
    if (imageUrl.trim()) formData.append('external_image_url', imageUrl.trim());
    if (imageFile) formData.append('image', imageFile);

    try {
      await axiosInstance.post('/api/courses/courses/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Course created successfully!');
      setTitle(''); setDescription(''); setPrice(''); setDuration('6 Weeks'); setDifficulty('Beginner'); setImageUrl(''); setImageFile(null);
    } catch (error) {
      let msg = 'Failed to create course.';
      if (error.response?.status === 401) msg = 'Unauthorized. Please login again.';
      else if (error.response?.data) msg = Object.values(error.response.data).flat().join(' ');
      setMessage(msg);
    } finally {
      setIsSubmitting(false);
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
          <Sparkles className="w-3.5 h-3.5" /> Curriculum Creator
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Create New Course 📘
        </h1>
        <p className="text-slate-400 text-sm">
          Publish a new course, set pricing, duration, difficulty, and cover media.
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Course Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Full-Stack Web Development"
              className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive summary of what students will learn..."
              className="w-full p-4 rounded-xl glass-input text-sm text-white placeholder-slate-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00 (Free)"
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white bg-slate-900 focus:bg-slate-900"
              >
                <option value="2 Weeks" className="bg-slate-900 text-white">2 Weeks</option>
                <option value="4 Weeks" className="bg-slate-900 text-white">4 Weeks</option>
                <option value="6 Weeks" className="bg-slate-900 text-white">6 Weeks</option>
                <option value="8 Weeks" className="bg-slate-900 text-white">8 Weeks</option>
                <option value="12 Weeks" className="bg-slate-900 text-white">12 Weeks</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white bg-slate-900 focus:bg-slate-900"
              >
                <option value="Beginner" className="bg-slate-900 text-white">Beginner</option>
                <option value="Intermediate" className="bg-slate-900 text-white">Intermediate</option>
                <option value="Advanced" className="bg-slate-900 text-white">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">External Image URL (Optional)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Upload Cover File (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/30 file:text-indigo-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-4 rounded-xl glass-button-primary text-sm font-bold flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Course'}
          </button>
        </form>

      </div>

    </div>
  );
}

export default CreateCourse;
