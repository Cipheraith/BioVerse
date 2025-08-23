import React from 'react';
import {
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import LumaChatbot from './Luma';
import DispatchMap from './DispatchMap';
import SymptomTrends from './SymptomTrends';
import Dashboard from './Dashboard';
import RoleSelection from './RoleSelection';
import PatientDetail from './PatientDetail';
import AddAppointmentForm from './AddAppointmentForm';
import AppointmentList from './AppointmentList';
import PatientList from './PatientList';
import { AnimatePresence } from 'framer-motion';
import MainLayout from './MainLayout';
import Login from './Login';
import Register from './Register';
import ProtectedRoute from './ProtectedRoute';
import LandingPage from './LandingPage';
import AboutPage from './AboutPage'; // Import AboutPage
import ApiDocsPage from './ApiDocsPage';
import ContactPage from './ContactPage';
import SupportPage from './SupportPage';
import PrivacyPage from './PrivacyPage';
import DocsPage from './DocsPage';
import SRHPage from './SRHPage';
import SettingsPage from './pages/SettingsPage';
import TelemedicineDashboard from './pages/TelemedicineDashboard';
import VideoCall from './components/VideoCall';


const App: React.FC = () => {
  const location = useLocation();
  const noLayoutRoutes = ['/', '/login', '/register', '/about', '/docs', '/contact', '/support', '/privacy', '/api']; // Add public routes

  if (noLayoutRoutes.includes(location.pathname)) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/api" element={<ApiDocsPage />} />
        </Routes>
      </AnimatePresence>
    );
  }

  return (
    <MainLayout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'moh', 'health_worker', 'patient', 'ambulance_driver', 'pharmacy']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
            <Route path="/luma" element={<LumaChatbot />} />
          </Route>
          <Route path="/srh" element={<SRHPage />} />
          
          {/* Telemedicine Routes */}
          <Route element={<ProtectedRoute allowedRoles={['health_worker', 'doctor', 'patient', 'admin']} />}>
            <Route path="/telemedicine" element={<TelemedicineDashboard />} />
            <Route path="/telemedicine/video-call/:consultationId" element={<VideoCall consultationId={1} patientId={1} doctorId={2} userType="doctor" />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['ambulance_driver', 'moh']} />}>
            <Route path="/dispatch-map" element={<DispatchMap />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin', 'moh']} />}>
            <Route path="/symptom-trends" element={<SymptomTrends />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin', 'health_worker', 'moh']} />}>
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/appointments" element={<AppointmentList />} />
            <Route path="/appointments/add" element={<AddAppointmentForm />} />
          </Route>
          {/* RoleSelection is now just a redirector, no specific role needed to access it */}
          <Route path="/roles" element={<RoleSelection />} />
          <Route element={<ProtectedRoute allowedRoles={['admin', 'moh', 'health_worker', 'patient', 'ambulance_driver', 'pharmacy']} />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </MainLayout>
  );
};

export default App;
