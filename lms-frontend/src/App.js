import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
// eslint-disable-next-line
import LessonViewer from './pages/LessonViewer';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';

import CreateCourse from './pages/CreateCourse';
import CreateLesson from './pages/CreateLesson';
import ManageCourses from './pages/ManageCourses';
import InstructorEnrollments from './pages/InstructorEnrollments';
import InstructorReviews from './pages/InstructorReviews';
import CreateQuiz from './pages/CreateQuiz';
import InstructorProfile from './pages/InstructorProfile';
import ManageLessons from './pages/ManageLessons';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminCourseApproval from './pages/AdminCourseApproval';
import AdminStats from './pages/AdminStats';
import AdminPermissions from './pages/AdminPermissions';
import AdminManageReviews from './pages/AdminManageReviews';
import BrowseCourses from './pages/BrowseCourses';
import StudentEnrollments from './pages/StudentEnrollments';
import StudentLessons from './pages/StudentLessons';
import StudentProgress from './pages/StudentProgress';
import MyCourses from './pages/MyCourses';
import PaymentPage from './pages/PaymentPage';
// eslint-disable-next-line
import Quizzes from './components/Quizzes';
import Reviews from './components/Reviews';
import Profile from './components/Profile';
import StudentAvailableCourses from './pages/StudentAvailableCourses';
import PaymentsPage from './pages/PaymentsPage';
import HomePage from './pages/HomePage';
import ServerWakeup from './components/ServerWakeup';






// Role-based dashboards
import StudentDashboard from './dashboards/student/StudentDashboard';
import InstructorDashboard from './dashboards/instructor/InstructorDashboard';
// eslint-disable-next-line
import AdminDashboard from './dashboards/admin/AdminDashboard';

function AppWrapper() {
  // eslint-disable-next-line
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);


  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  return (
    <>
      {<Navbar user={user} onLogout={handleLogout} />}
      <ServerWakeup />

      <Routes>
        <Route path="/" element={<HomePage />} />

        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/instructor/catalog" element={<ProtectedRoute><CourseCatalog /></ProtectedRoute>} />
        <Route path="/instructor/profile" element={<ProtectedRoute><InstructorProfile /></ProtectedRoute>} />


        <Route path="/admin/users" element={<ProtectedRoute><AdminUserManagement /></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute><AdminCourseApproval /></ProtectedRoute>} />
        <Route path="/admin/stats" element={<ProtectedRoute><AdminStats /></ProtectedRoute>} />
        <Route path="/admin/permissions" element={<ProtectedRoute><AdminPermissions /></ProtectedRoute>} />
        <Route path="/admin/manage-reviews" element={<ProtectedRoute><AdminManageReviews /></ProtectedRoute>} />
        <Route path="/admin/create-course" element={<ProtectedRoute><CreateCourse /></ProtectedRoute>} />
        <Route path="/admin/create-lesson" element={<ProtectedRoute><CreateLesson /></ProtectedRoute>} />






        <Route path="/instructor/create-course" element={<ProtectedRoute><CreateCourse /></ProtectedRoute>} />
        <Route path="/instructor/create-lesson" element={<ProtectedRoute><CreateLesson /></ProtectedRoute>} />
        <Route path="/instructor/my-courses" element={<ProtectedRoute><ManageCourses /></ProtectedRoute>} />
        <Route path="/instructor/enrollments" element={<ProtectedRoute><InstructorEnrollments /></ProtectedRoute>} />
        <Route path="/instructor/reviews" element={<ProtectedRoute><InstructorReviews /></ProtectedRoute>} />
        <Route path="/instructor/quiz" element={<ProtectedRoute><CreateQuiz /></ProtectedRoute>} />
        <Route path="/instructor/manage-lessons/:courseId" element={<ProtectedRoute><ManageLessons /></ProtectedRoute>} />
        <Route path="/instructor/catalog" element={<ProtectedRoute><CourseCatalog /></ProtectedRoute>} />



        {/* Public route for available courses (for students) */}
        <Route path="/student/catalog" element={<ProtectedRoute><CourseCatalog /></ProtectedRoute>} />
        <Route path="/student/browse" element={<ProtectedRoute><BrowseCourses /></ProtectedRoute>} />
        <Route path="/student/enrollment" element={<ProtectedRoute><StudentEnrollments /></ProtectedRoute>} />
        <Route path="/student/lessons" element={<ProtectedRoute><StudentLessons /></ProtectedRoute>} />
        <Route path="/student/progress" element={<ProtectedRoute><StudentProgress /></ProtectedRoute>} />
        <Route path="/student/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
        <Route path="/student/catalog" element={<ProtectedRoute><CourseCatalog /></ProtectedRoute>} />
        <Route path="/student/payments/:courseId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/student/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />

        <Route path="/student/quizzes/:lessonId" element={<ProtectedRoute><Quizzes /></ProtectedRoute>}/>

        <Route path="/student/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route
  path="/student/courses"
  element={<ProtectedRoute><StudentAvailableCourses/></ProtectedRoute>}
/>




        {/* General course-related routes */}
        <Route path="/courses" element={<ProtectedRoute><CourseCatalog /></ProtectedRoute>} />
        <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
        <Route path="/lesson/:id" element={<ProtectedRoute><LessonViewer /></ProtectedRoute>} />

        {/* Admin area */}
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* Instructor dashboard */}
        <Route path="/instructor/dashboard" element={<ProtectedRoute><InstructorDashboard /></ProtectedRoute>} />

        {/* Student dashboard */}
        <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />

        {/* Catch-all route */}
        <Route path="*" element={<h2 style={{ padding: '20px', textAlign: 'center' }}>404 - Page Not Found</h2>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppWrapper />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
