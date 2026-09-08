import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './hooks/useAuth';
import Layout from './layouts/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import SkillDetailPage from './pages/SkillDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import ProfilePage from './pages/ProfilePage';
import MatchingPage from './pages/MatchingPage';
import RequestsPage from './pages/RequestsPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/" element={<Layout><LandingPage /></Layout>} />
      <Route path="/marketplace" element={<Layout><MarketplacePage /></Layout>} />
      <Route path="/skills/:id" element={<Layout><SkillDetailPage /></Layout>} />

      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/skills/create" element={<ProtectedRoute><Layout><CreateListingPage /></Layout></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
      <Route path="/matching" element={<ProtectedRoute><Layout><MatchingPage /></Layout></ProtectedRoute>} />
      <Route path="/requests" element={<ProtectedRoute><Layout><RequestsPage /></Layout></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Layout><MessagesPage /></Layout></ProtectedRoute>} />
      <Route path="/messages/:conversationId" element={<ProtectedRoute><Layout><MessagesPage /></Layout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Layout><NotificationsPage /></Layout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Layout><AdminPage /></Layout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
