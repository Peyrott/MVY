import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute.jsx';
import { Toast } from './components/Toast/Toast.jsx';
import { Navbar } from './components/Navbar/Navbar.jsx';
import { Home } from './pages/Home/Home.jsx';
import { Courts } from './pages/Courts/Courts.jsx';
import { CourtDetail } from './pages/CourtDetail/CourtDetail.jsx';
import { Profile } from './pages/Profile/Profile.jsx';
import { Dashboard } from './pages/Dashboard/Dashboard.jsx';
import { BookingSuccess } from './pages/BookingSuccess/BookingSuccess.jsx';
import { NotFound } from './pages/NotFound/NotFound.jsx';
import './styles/global.css';

/**
 * Main App Component
 * Sets up routing and providers
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="app">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courts" element={<Courts />} />
                <Route path="/courts/:id" element={<CourtDetail />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requireOwner>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/booking/success" element={<BookingSuccess />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Toast />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
