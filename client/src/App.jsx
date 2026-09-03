import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import EventInfo from './pages/EventInfo';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import ScrollToTop from './components/ScrollToTop';
import GlobalTooltip from './components/GlobalTooltip';
import ChatbotWidget from './components/ChatbotWidget';

// Route Guard for authenticated users
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Route Guard for specific roles (Admin, Judge, Participant)
function RoleRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function MainLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isDashboardPage = ['/judge', '/admin', '/dashboard'].includes(location.pathname);

  useEffect(() => {
    if (isDashboardPage) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isDashboardPage]);

  return (
    <div className={`flex flex-col w-full max-w-full transition-colors duration-300 ${
      isDashboardPage
        ? 'h-screen max-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950'
        : 'min-h-screen overflow-x-hidden ' + (isLanding ? '' : 'bg-slate-50 dark:bg-slate-950')
    }`}>
      <ScrollToTop />
      <GlobalTooltip />
      <Navbar />
      <main className={`w-full max-w-full ${isLanding ? '' : 'pt-16'} ${
        isDashboardPage ? 'flex-1 h-[calc(100vh-4rem)] overflow-hidden' : 'flex-grow overflow-x-hidden'
      }`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/info" element={<EventInfo />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />


          {/* Protected Routes (Any logged-in user) */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Participant Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['Participant']}>
                  <Dashboard />
                </RoleRoute>
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </RoleRoute>
              </ProtectedRoute>
            } 
          />

          {/* Judge Routes */}
          <Route 
            path="/judge" 
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['Judge', 'Admin']}>
                  <JudgeDashboard />
                </RoleRoute>
              </ProtectedRoute>
            } 
          />

          {/* Catch-all redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!['/judge', '/admin', '/dashboard'].includes(location.pathname) && <Footer />}
      <ChatbotWidget />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <EventProvider>
            <MainLayout />
          </EventProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
