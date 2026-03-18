import React from 'react';
import {
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from './MainLayout';
import Login from './Login';
import Register from './Register';
import ProtectedRoute from './ProtectedRoute';
import ModernLandingPage from './components/modern/ModernLandingPage';
import AboutPage from './AboutPage';
import ApiDocsPage from './ApiDocsPage';
import ContactPage from './ContactPage';
import SupportPage from './SupportPage';
import PrivacyPage from './PrivacyPage';
import DocsPage from './DocsPage';
import SettingsPage from './pages/SettingsPage';
import CoordinationDashboard from './pages/CoordinationDashboard';
import OverviewDashboard from './pages/OverviewDashboard';
import FacilitiesPage from './pages/FacilitiesPage';
import StockOverviewPage from './pages/StockOverviewPage';
import DHIS2SyncPage from './pages/DHIS2SyncPage';
import FacilityMapPage from './pages/FacilityMapPage';
import OutbreakAlertsPage from './pages/OutbreakAlertsPage';
import EmergencyLogisticsPage from './pages/EmergencyLogisticsPage';
import MoHNationalDashboard from './pages/MoHNationalDashboard';
import DistrictOfficerDashboard from './pages/DistrictOfficerDashboard';
import FacilityManagerDashboard from './pages/FacilityManagerDashboard';
import HealthWorkerDashboardPage from './pages/HealthWorkerDashboardPage';

const allRoles = ['admin', 'moh', 'health_worker', 'facility_manager', 'logistics_coordinator', 'dhis2_admin'];

const App: React.FC = () => {
  const location = useLocation();
  const noLayoutRoutes = ['/', '/login', '/register', '/about', '/docs', '/contact', '/support', '/privacy', '/api'];

  if (noLayoutRoutes.includes(location.pathname)) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<ModernLandingPage />} />
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
          {/* Dashboard / Overview */}
          <Route element={<ProtectedRoute allowedRoles={allRoles} />}>
            <Route path="/dashboard" element={<OverviewDashboard />} />
          </Route>

          {/* Coordination */}
          <Route element={<ProtectedRoute allowedRoles={allRoles} />}>
            <Route path="/coordination" element={<CoordinationDashboard />} />
          </Route>

          {/* Facilities */}
          <Route element={<ProtectedRoute allowedRoles={allRoles} />}>
            <Route path="/facilities" element={<FacilitiesPage />} />
          </Route>

          {/* Stock Overview */}
          <Route element={<ProtectedRoute allowedRoles={allRoles} />}>
            <Route path="/stock" element={<StockOverviewPage />} />
          </Route>

          {/* DHIS2 Sync */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'moh', 'dhis2_admin']} />}>
            <Route path="/dhis2" element={<DHIS2SyncPage />} />
          </Route>

          {/* Facility Map */}
          <Route element={<ProtectedRoute allowedRoles={allRoles} />}>
            <Route path="/map" element={<FacilityMapPage />} />
          </Route>

          {/* Outbreak Alerts */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'moh', 'health_worker', 'dhis2_admin']} />}>
            <Route path="/alerts" element={<OutbreakAlertsPage />} />
          </Route>

          {/* Emergency Logistics */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'moh', 'logistics_coordinator', 'facility_manager']} />}>
            <Route path="/logistics" element={<EmergencyLogisticsPage />} />
          </Route>

          {/* Settings */}
          <Route element={<ProtectedRoute allowedRoles={allRoles} />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Persona Dashboards */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'moh', 'dhis2_admin']} />}>
            <Route path="/moh-dashboard" element={<MoHNationalDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'moh', 'facility_manager', 'logistics_coordinator']} />}>
            <Route path="/district-dashboard" element={<DistrictOfficerDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'moh', 'facility_manager', 'health_worker']} />}>
            <Route path="/facility-dashboard" element={<FacilityManagerDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'moh', 'health_worker', 'facility_manager']} />}>
            <Route path="/hw-dashboard" element={<HealthWorkerDashboardPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </MainLayout>
  );
};

export default App;
