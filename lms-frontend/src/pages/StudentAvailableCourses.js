import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function StudentAvailableCourses() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // axiosInstance now automatically attaches the token via interceptor
        const coursesRes = await axiosInstance.get('/api/courses/courses/');
        setCourses(coursesRes.data);

        const enrollmentsRes = await axiosInstance.get('/api/courses/enrollments/');
        setEnrollments(Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setMessage('❌ Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const isEnrolled = (courseId) => {
    return enrollments.some(e => e.course === courseId);
  };

  const enroll = (courseId) => {
    if (isEnrolled(courseId)) {
      setMessage('✅ You are already enrolled.');
    } else {
      navigate(`/student/payments/${courseId}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Available Courses</h2>
      {message && <p>{message}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : courses.length === 0 ? (
        <p>No courses available.</p>
      ) : (
        courses.map(c => (
          <div
            key={c.id}
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '5px'
            }}
          >
            <h3>{c.title}</h3>
            <p>{c.description}</p>
            {isEnrolled(c.id) ? (
              <p style={{ color: 'green' }}>✅ Already Enrolled</p>
            ) : (
              <button onClick={() => enroll(c.id)}>Enroll</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}