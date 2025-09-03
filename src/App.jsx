import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';

// Auth
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AuthCallback from './components/Auth/AuthCallback';
import ProfileSettings from './components/Auth/ProfileSettings';

// Dashboard / Protected
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Profiles
import ProfileList from './components/Profile/ProfileList';
import ProfileForm from './components/Profile/ProfileForm';

// Reminders
import RemindersList from './components/Reminders/RemindersList';
import ReminderForm from './components/Reminders/ReminderForm';

// Metrics / Eye Tests
import PrescriptionForm from './components/Metrics/PrescriptionForm';
import PrescriptionHistory from './components/Metrics/PrescriptionHistory';
import VisualAcuityTest from './components/Metrics/VisualAcuityTest';
import SymptomsTracker from './components/Metrics/SymptomsTracker';
import EyePressureForm from './components/Metrics/PressureTracker';
import MetricsCharts from './components/Metrics/MetricsCharts';

// Sharing
import PDFExport from './components/Sharing/PDFExport';

// Landing / Legal
import LandingSection from './components/FrontPage/Inicio';
import LegalPage from './components/FrontPage/Legal';
import PrivacyPage from './components/FrontPage/Privacy';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingSection />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />

              {/* Protected Routes under /dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profiles"
                element={
                  <ProtectedRoute>
                    <ProfileList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profiles/new"
                element={
                  <ProtectedRoute>
                    <ProfileForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profiles/:profileId/edit"
                element={
                  <ProtectedRoute>
                    <ProfileForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reminders"
                element={
                  <ProtectedRoute>
                    <RemindersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reminders/new"
                element={
                  <ProtectedRoute>
                    <ReminderForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reminders/:reminderId/edit"
                element={
                  <ProtectedRoute>
                    <ReminderForm />
                  </ProtectedRoute>
                }
              />
              {/* Metrics / Eye Tests */}
              <Route
                path="/profiles/:profileId/prescriptions"
                element={
                  <ProtectedRoute>
                    <PrescriptionHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profiles/:profileId/prescriptions/new"
                element={
                  <ProtectedRoute>
                    <PrescriptionForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profiles/:profileId/prescriptions/:prescriptionId/edit"
                element={
                  <ProtectedRoute>
                    <PrescriptionForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profiles/:profileId/visual-test/new"
                element={
                  <ProtectedRoute>
                    <VisualAcuityTest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profiles/:profileId/visual-test/:testId/edit"
                element={
                  <ProtectedRoute>
                    <VisualAcuityTest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profiles/:profileId/symptoms/new"
                element={
                  <ProtectedRoute>
                    <SymptomsTracker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profiles/:profileId/symptoms/:symptomId/edit"
                element={
                  <ProtectedRoute>
                    <SymptomsTracker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profiles/:profileId/eye-pressure/new"
                element={
                  <ProtectedRoute>
                    <EyePressureForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profiles/:profileId/metrics"
                element={
                  <ProtectedRoute>
                    <MetricsCharts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profiles/:profileId/share"
                element={
                  <ProtectedRoute>
                    <PDFExport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <ProfileSettings />
                  </ProtectedRoute>
                }
              />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
