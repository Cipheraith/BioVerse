import React from 'react';
import {
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import LumaChatbot from './Luma';
import DispatchMap from './DispatchMap';
import SymptomTrends from './SymptomTrends';
import RoleSelection from './RoleSelection';
import PatientDetail from './PatientDetail';
import AddAppointmentForm from './AddAppointmentForm';
import AppointmentList from './AppointmentList';
import PatientList from './PatientList';
import { AnimatePresence } from 'framer-motion';
import Login from './Login';
import Register from './Register';
import ProtectedRoute from './ProtectedRoute';
import LandingPage from './LandingPage';
import AboutPage from './AboutPage';
import ApiDocsPage from './ApiDocsPage';
import ContactPage from './ContactPage';
import SupportPage from './SupportPage';
import PrivacyPage from './PrivacyPage';
import DocsPage from './DocsPage';
import SRHPage from './SRHPage';
import SettingsPage from './pages/SettingsPage';
import TelemedicineDashboard from './pages/TelemedicineDashboard';
import VideoCall from './components/VideoCall';
import HealthTwinsPage from './pages/HealthTwinsPage';
import ResponsiveLayout from './components/layout/ResponsiveLayout';
import ResponsiveDashboard from './components/dashboard/ResponsiveDashboard';
import PrescriptionForm from './components/prescriptions/PrescriptionForm';
import PatientPrescriptions from './components/prescriptions/PatientPrescriptions';
import PharmacyPrescriptions from './components/prescriptions/PharmacyPrescriptions';


const App: React.FC = () => {
  const location = useLocation();
  const publicRoutes = ['/', '/login', '/register', '/about', '/docs', '/contact', '/support', '/privacy', '/api'];

  // Public routes without navigation
  if (publicRoutes.includes(location.pathname)) {
    return (
      <ResponsiveLayout showNavigation={false} particleCount={15}>
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
      </ResponsiveLayout>
    );
  }

  // Protected routes with navigation
  return (
    <ResponsiveLayout showNavigation={true}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Dashboard Route - Role-based dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'moh', 'health_worker', 'patient', 'ambulance_driver', 'pharmacy']} />}>
            <Route path="/dashboard" element={<ResponsiveDashboard />} />
          </Route>

          {/* Patient-specific routes */}
          <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
            <Route path="/luma" element={<LumaChatbot />} />
            <Route path="/prescriptions/my" element={<PatientPrescriptions />} />
          </Route>

          {/* Public health routes */}
          <Route path="/srh" element={<SRHPage />} />

          {/* Telemedicine Routes */}
          <Route element={<ProtectedRoute allowedRoles={['health_worker', 'doctor', 'patient', 'admin']} />}>
            <Route path="/telemedicine" element={<TelemedicineDashboard />} />
            <Route path="/telemedicine/video-call/:consultationId" element={<VideoCall consultationId={1} patientId={1} doctorId={2} userType="doctor" />} />
          </Route>

          {/* Emergency services routes */}
          <Route element={<ProtectedRoute allowedRoles={['ambulance_driver', 'moh', 'admin']} />}>
            <Route path="/dispatch-map" element={<DispatchMap />} />
          </Route>

          {/* Analytics and reporting routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'moh']} />}>
            <Route path="/symptom-trends" element={<SymptomTrends />} />
            <Route path="/analytics" element={<SymptomTrends />} />
          </Route>

          {/* Patient management routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'health_worker', 'moh']} />}>
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/appointments" element={<AppointmentList />} />
            <Route path="/appointments/add" element={<AddAppointmentForm />} />
          </Route>

          {/* Role selection and settings */}
          <Route path="/roles" element={<RoleSelection />} />
          <Route element={<ProtectedRoute allowedRoles={['admin', 'moh', 'health_worker', 'patient', 'ambulance_driver', 'pharmacy']} />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Health Twins Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'moh', 'health_worker', 'patient']} />}>
            <Route path="/health-twins" element={<HealthTwinsPage />} />
            <Route path="/health-twin" element={<HealthTwinsPage />} />
          </Route>

          {/* Patient Health Records */}
          <Route element={<ProtectedRoute allowedRoles={['patient', 'health_worker', 'admin']} />}>
            <Route path="/health-records" element={<div className="p-6"><h1 className="text-2xl font-bold text-dark-text">Health Records</h1><p className="text-dark-muted">Your medical history and records will be displayed here.</p></div>} />
          </Route>

          {/* Symptom Checker */}
          <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
            <Route path="/symptoms" element={<LumaChatbot />} />
          </Route>

          {/* Prescription Routes */}
          <Route element={<ProtectedRoute allowedRoles={['doctor', 'admin']} />}>
            <Route path="/prescriptions/create" element={<PrescriptionForm />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['pharmacy', 'ambulance_driver', 'admin', 'moh']} />}>
            <Route path="/prescriptions/manage" element={<PharmacyPrescriptions />} />
          </Route>

          {/* Additional role-specific routes */}
          <Route element={<ProtectedRoute allowedRoles={['pharmacy']} />}>
            <Route path="/inventory" element={<div>Pharmacy Inventory</div>} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['moh']} />}>
            <Route path="/population-health" element={<div>Population Health</div>} />
            <Route path="/disease-surveillance" element={<div>Disease Surveillance</div>} />
            <Route path="/health-facilities" element={<div>Health Facilities</div>} />
          </Route>
        </Routes>
      </AnimatePresence>
    </ResponsiveLayout>
  );
};

export default App;

