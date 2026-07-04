// src/pages/StudentAvailableCourses.js
import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../contexts/AuthContext';

export default function StudentAvailableCourses() {
  const { getToken } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        // refresh header
        axiosInstance.defaults.headers['Authorization'] = `Bearer ${getToken()}`;
        const res = await axiosInstance.get('/courses/courses/');
        setCourses(res.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };
    load();
  }, [getToken]);

  const enroll = async (courseId) => {
    try {
      await axiosInstance.post('/courses/enrollments/', { course: courseId });
      setMessage('✅ Enrolled successfully!');
      // Optionally remove button
      setCourses(cs => cs.filter(c => c.id !== courseId));
    } catch (err) {
      console.error('Enrollment failed:', err);
      setMessage(err.response?.data.detail || '❌ Enrollment failed.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Available Courses</h2>
      {message && <p>{message}</p>}
      {courses.length === 0
        ? <p>No courses available.</p>
        : courses.map(c => (
            <div key={c.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              
            </div>
          ))
      }
    </div>
  );
}
