import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import LmsLoader from '../components/LmsLoader';
import { BookOpen, Video as VideoIcon, CheckCircle2, Brain, ArrowLeft, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

function getEmbedUrl(videoUrl) {
  if (!videoUrl) return null;

  try {
    const url = new URL(videoUrl);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const videoId = url.searchParams.get('v');
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`;
      if (url.pathname.startsWith('/embed/')) return videoUrl;
    }
    if (host === 'vimeo.com' && /^\/\d+$/.test(url.pathname)) {
      return `https://player.vimeo.com/video${url.pathname}`;
    }
  } catch {
    return null;
  }

  return null;
}

export default function LessonViewer() {
  const { id } = useParams();

  const [lesson, setLesson] = useState(null);
  const [quizCount, setQuizCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const lessonRes = await axiosInstance.get(`/api/courses/lessons/${id}/`);
        setLesson(lessonRes.data);
        setIsCompleted(lessonRes.data.progress === 100);

        const quizRes = await axiosInstance.get(`/api/courses/quizzes/?lesson=${id}`);
        setQuizCount((quizRes.data || []).length);
      } catch (err) {
        console.error('Failed to load lesson or quizzes:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return <LmsLoader title="Loading lesson" subtitle="Preparing learning material..." size="lg" />;
  }

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <p>Lesson not found.</p>
      </div>
    );
  }

  const imageSource = lesson.image_url || lesson.image;
  const videoSource = lesson.video_url || lesson.video;
  const embeddedVideoUrl = getEmbedUrl(videoSource);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-8 glass-panel border border-indigo-500/20 shadow-2xl bg-gradient-to-r from-slate-900/95 via-indigo-950/40 to-slate-900/95"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Lesson Module</span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
              {lesson.title}
            </h1>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border flex items-center gap-1 self-start sm:self-auto ${
            isCompleted 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
              : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
          }`}>
            {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
            {isCompleted ? 'Completed' : 'In Progress'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300">Module Status</span>
            <span className={isCompleted ? 'text-emerald-400' : 'text-cyan-400'}>{isCompleted ? '100%' : '0%'}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-indigo-500'
              }`}
              style={{ width: isCompleted ? '100%' : '0%' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Main Lesson Content Container */}
      <div className="space-y-8">
        
        {/* Media Frame (Video or Image) */}
        {videoSource && (
          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 shadow-2xl aspect-video bg-slate-950">
            {embeddedVideoUrl ? (
              <iframe
                src={embeddedVideoUrl}
                title={`${lesson.title} video`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={videoSource} className="w-full h-full object-contain" controls />
            )}
          </div>
        )}

        {imageSource && !videoSource && (
          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 shadow-2xl max-h-[450px]">
            <img src={imageSource} alt={lesson.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Text Notes */}
        <div className="glass-card p-6 sm:p-10 border border-slate-800 rounded-3xl space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <BookOpen className="w-5 h-5 text-indigo-400" /> Lesson Content & Notes
          </h3>

          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            {lesson.content ? (
              lesson.content.split('\n').map((para, i) => (
                para.trim() ? <p key={i}>{para}</p> : null
              ))
            ) : (
              <p className="text-slate-500 italic">No text notes attached to this lesson module.</p>
            )}
          </div>
        </div>

        {/* Quiz CTA Banner */}
        {quizCount > 0 && !lesson.perfect_score_achieved && (
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40">
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" /> Knowledge Check Assessment
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {isCompleted 
                  ? "You passed! Retake the quiz anytime to practice." 
                  : `${quizCount} quiz module${quizCount !== 1 ? 's' : ''} available for this lesson.`}
              </p>
            </div>

            <Link
              to={`/student/quizzes/${id}`}
              className="px-6 py-3 rounded-xl glass-button-primary text-xs font-bold whitespace-nowrap flex items-center gap-2"
            >
              <Brain className="w-4 h-4" /> {isCompleted ? 'Retake Quiz' : 'Take Quiz Now'}
            </Link>
          </div>
        )}

        {/* Perfect Score Badge */}
        {lesson.perfect_score_achieved && (
          <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
            <Award className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Module Mastery Achieved!</h4>
            <p className="text-xs text-slate-300">You scored 100% on the lesson quiz.</p>
          </div>
        )}

      </div>

    </div>
  );
}
