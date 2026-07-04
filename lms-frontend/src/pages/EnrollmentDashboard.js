import React, { useEffect, useState } from 'react';
import axios from 'axios';

function EnrollmentDashboard() {
  const [enrollments, setEnrollments] = useState([]); // default to empty array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/student/enrollments/')
      .then(response => {
        // Ensure response data is an array
        if (Array.isArray(response.data)) {
          setEnrollments(response.data);
        } else {
          setEnrollments([]); // fallback if not an array
        }
      })
      .catch(error => {
        console.error('Failed to fetch enrollments:', error);
        setEnrollments([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const pageStyle = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '15px'
  };

  const cardStyle = {
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9'
  };

  return (
    <div style={pageStyle}>
      <div style={titleStyle}>My Enrollments</div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        enrollments.length === 0 ? (
          <div>No enrollments found.</div>
        ) : (
          enrollments.map(enrollment => (
            <div key={enrollment.id} style={cardStyle}>
              <div><strong>Course:</strong> {enrollment.course_title}</div>
              <div><strong>Status:</strong> {enrollment.status}</div>
            </div>
          ))
        )
      )}
    </div>
  );
}

export default EnrollmentDashboard;
