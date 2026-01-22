import ResourceHub from './pages/ResourceHub';
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
import MyLostFoundPosts from './pages/MyLostFoundPosts';
import EditLostFoundPost from './pages/EditLostFoundPost';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import CreateMarketplaceListing from './pages/CreateMarketplaceListing';
import { SettingsProvider } from './context/SettingsContext';
import Marketplace from './pages/Marketplace';
import MarketplaceDetails from './pages/MarketplaceDetails';
import MyMarketplaceListings from './pages/MyMarketplaceListings';
import ManageMarketplaceCategories from './pages/admin/ManageMarketplaceCategories';
import AdminResourceUpload from './pages/admin/AdminResourceUpload';
import ManageResourceRequests from './pages/admin/ManageResourceRequests';
import ManageCourses from './pages/admin/ManageCourses';
import AdminSettings from './pages/admin/AdminSettings';
import SectionIssueDashboard from './pages/SectionIssue/SectionIssueDashboard';
import PostExchangeRequest from './pages/SectionIssue/PostExchangeRequest';
import SectionExchangeFeed from './pages/SectionIssue/SectionExchangeFeed';
import PostNewSectionRequest from './pages/SectionIssue/PostNewSectionRequest';
import SectionRequestsFeed from './pages/SectionIssue/SectionRequestsFeed';
import ModerationDashboard from './pages/SectionIssue/ModerationDashboard';
import PostGeneralIssue from './pages/PostGeneralIssue';
import PostCanteenFeedback from './pages/PostCanteenFeedback';
import FeedbackDashboard from './pages/Feedback/FeedbackDashboard';
import FeedbackModeration from './pages/Feedback/FeedbackModeration';
import Messages from './pages/Messages/Messages';

console.log("App.jsx module loaded");

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
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

            {/* Lost & Found Routes */}
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
            <Route
              path="/lost-found/my-posts"
              element={
                <ProtectedRoute>
                  <MyLostFoundPosts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lost-found/edit/:id"
              element={
                <ProtectedRoute>
                  <EditLostFoundPost />
                </ProtectedRoute>
              }
            />

            {/* Marketplace Routes */}
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace/create"
              element={
                <ProtectedRoute>
                  <CreateMarketplaceListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace/my-listings"
              element={
                <ProtectedRoute>
                  <MyMarketplaceListings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace/edit/:id"
              element={
                <ProtectedRoute>
                  <CreateMarketplaceListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace/:id"
              element={
                <ProtectedRoute>
                  <MarketplaceDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/marketplace-categories"
              element={
                <ProtectedRoute>
                  <ManageMarketplaceCategories />
                </ProtectedRoute>
              }
            />

            {/* ResourceHub Routes */}
            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <ResourceHub />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/resources/upload"
              element={
                <ProtectedRoute>
                  <AdminResourceUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/resources/requests"
              element={
                <ProtectedRoute>
                  <ManageResourceRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute>
                  <ManageCourses />
                </ProtectedRoute>
              }
            />

            {/* Admin Settings Route */}
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />

            {/* Section Issue Routes */}
            <Route
              path="/section-issue"
              element={
                <ProtectedRoute>
                  <SectionIssueDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/section-issue/post"
              element={
                <ProtectedRoute>
                  <PostExchangeRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/section-issue/exchange-feed"
              element={
                <ProtectedRoute>
                  <SectionExchangeFeed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/section-issue/new-section"
              element={
                <ProtectedRoute>
                  <PostNewSectionRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/section-issue/requests"
              element={
                <ProtectedRoute>
                  <SectionRequestsFeed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/section-issue/moderation"
              element={
                <ProtectedRoute>
                  <ModerationDashboard />
                </ProtectedRoute>
              }
            />

            {/* Feedback Routes */}
            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <FeedbackDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback/general"
              element={
                <ProtectedRoute>
                  <PostGeneralIssue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback/canteen"
              element={
                <ProtectedRoute>
                  <PostCanteenFeedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback/moderation"
              element={
                <ProtectedRoute>
                  <FeedbackModeration />
                </ProtectedRoute>
              }
            />

            {/* Messages Routes */}
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
