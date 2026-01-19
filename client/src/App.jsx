import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import PostLostItem from './pages/PostLostItem';
import LostFoundFeed from './pages/LostFoundFeed';
import LostFoundDetails from './pages/LostFoundDetails';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<div className="container"><h1>Welcome to UIU Social Network</h1><p>Connect with your campus.</p></div>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lost-found"
            element={
              <ProtectedRoute>
                <LostFoundFeed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lost-found/new"
            element={
              <ProtectedRoute>
                <PostLostItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lost-found/:id"
            element={
              <ProtectedRoute>
                <LostFoundDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
