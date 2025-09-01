import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AuthCallback from './components/Auth/AuthCallback';
import Dashboard from './components/Dashboard/Dashboard';
import ProfileList from './components/Profile/ProfileList';
import ProfileForm from './components/Profile/ProfileForm';
import RemindersList from './components/Reminders/RemindersList';
import ReminderForm from './components/Reminders/ReminderForm';
import PrescriptionForm from './components/Metrics/PrescriptionForm';
import PrescriptionHistory from './components/Metrics/PrescriptionHistory';
import VisualAcuityTest from './components/Metrics/VisualAcuityTest';
import SymptomsTracker from './components/Metrics/SymptomsTracker';
import MetricsCharts from './components/Metrics/MetricsCharts';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import EyePressureForm from './components/Metrics/PressureTracker';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Profile Routes */}
              <Route path="/profiles" element={
                <ProtectedRoute>
                  <ProfileList />
                </ProtectedRoute>
              } />
              <Route path="/profiles/new" element={
                <ProtectedRoute>
                  <ProfileForm />
                </ProtectedRoute>
              } />
              <Route path="/profiles/:profileId/edit" element={
                <ProtectedRoute>
                  <ProfileForm />
                </ProtectedRoute>
              } />
              
              {/* Reminder Routes */}
              <Route path="/reminders" element={
                <ProtectedRoute>
                  <RemindersList />
                </ProtectedRoute>
              } />
              <Route path="/reminders/new" element={
                <ProtectedRoute>
                  <ReminderForm />
                </ProtectedRoute>
              } />
              <Route path="/reminders/:reminderId/edit" element={
                <ProtectedRoute>
                  <ReminderForm />
                </ProtectedRoute>
              } />
              
              {/* Eye Metrics Routes */}
              <Route path="/profiles/:profileId/prescriptions" element={
                <ProtectedRoute>
                  <PrescriptionHistory />
                </ProtectedRoute>
              } />
              <Route path="/profiles/:profileId/prescriptions/new" element={
                <ProtectedRoute>
                  <PrescriptionForm />
                </ProtectedRoute>
              } />
              <Route path="/profiles/:profileId/prescriptions/:prescriptionId/edit" element={
                <ProtectedRoute>
                  <PrescriptionForm />
                </ProtectedRoute>
              } />     
              <Route path="/profiles/:profileId/visual-test/new" element={
                <ProtectedRoute>
                  <VisualAcuityTest />
                </ProtectedRoute>
              } />
              <Route path="/profiles/:profileId/visual-test/:testId/edit" element={
                <ProtectedRoute>
                  <VisualAcuityTest />
                </ProtectedRoute>
              } />
              <Route path="/profiles/:profileId/symptoms/new" element={
                <ProtectedRoute>
                  <SymptomsTracker />
                </ProtectedRoute>
              } />
              <Route path="/profiles/:profileId/symptoms/:symptomId/edit" element={
                <ProtectedRoute>
                  <SymptomsTracker />
                </ProtectedRoute>
              } />
               <Route path="/profiles/:profileId/eye-pressure/new" element={
                <ProtectedRoute>
                  <EyePressureForm />
                </ProtectedRoute>
              } />
              <Route path="/profiles/:profileId/metrics" element={
                <ProtectedRoute>
                  <MetricsCharts />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;