import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import StudentSignup from './pages/StudentSignup.jsx';
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import SubAdminDashboard from './pages/SubAdminDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import './styles/App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRouter = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    switch (user.role) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      case 'SUB_ADMIN':
        return <SubAdminDashboard />;
      case 'STUDENT':
        return <StudentDashboard />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/student-signup" element={<StudentSignup />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <>
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRouter />
        </div>
      </Router>
    </AuthProvider>
    </>
  );
}

export default App;