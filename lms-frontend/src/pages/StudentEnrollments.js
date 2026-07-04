import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';

function StudentEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/courses/enrollments/')
      .then(res => {
        setEnrollments(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error('Failed to fetch enrollments:', err);
        setEnrollments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Your Enrolled Courses</h2>
      {loading ? (
        <p>Loading...</p>
      ) : enrollments.length === 0 ? (
        <p>You are not enrolled in any courses.</p>
      ) : (
        <ul>
          {enrollments.map(enroll => (
            <li key={enroll.id}>
              <strong>Course:</strong> {enroll.course_title} | 
              <strong> Status:</strong> {enroll.completed ? 'Completed' : 'In Progress'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StudentEnrollments;
