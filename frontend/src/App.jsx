import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import NoticeBoard from './pages/NoticeBoard';
import Marks from './pages/Marks';
import LeaveRequests from './pages/LeaveRequests';
import Assignments from './pages/Assignments';
import Navbar from './components/Navbar';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
        {user && <Navbar />}
        <div className="flex-1 p-4 md:p-8">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/student'} />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/student" />} />
            
            <Route element={<ProtectedRoute roles={['student']} />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/notices" element={<NoticeBoard />} />
              <Route path="/marks" element={<Marks />} />
              <Route path="/leave" element={<LeaveRequests />} />
              <Route path="/assignments" element={<Assignments />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/attendance" element={<Attendance />} />
              <Route path="/admin/notices" element={<NoticeBoard />} />
              <Route path="/admin/marks" element={<Marks />} />
              <Route path="/admin/leave" element={<LeaveRequests />} />
              <Route path="/admin/assignments" element={<Assignments />} />
            </Route>

            <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/student') : '/login'} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
