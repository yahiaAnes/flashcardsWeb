import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { GenerateFlashcards } from './pages/GenerateFlashcards';
import { LessonsList } from './pages/LessonsList';
import { FlashcardsView } from './pages/FlashcardsView';
//import { Pricing } from './pages/Pricing';
import { Profile } from './pages/Profile';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/';

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/lessons"
          element={
            <PrivateRoute>
              <LessonsList />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-flashcards"
          element={
            <PrivateRoute>
              <GenerateFlashcards />
            </PrivateRoute>
          }
        />
        <Route
          path="/flashcards/:lessonId"
          element={
            <PrivateRoute>
              <FlashcardsView />
            </PrivateRoute>
          }
        />
        {/* <Route
          path="/pricing"
          element={
            <PrivateRoute>
              <Pricing />
            </PrivateRoute>
          }
        /> */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;