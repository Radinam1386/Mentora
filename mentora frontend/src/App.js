import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './index.css';

import { AppProvider, useApp } from './context/AppContext';
import RequireAuth from './components/RequireAuth';
import RequireProfile from './components/RequireProfile';

import Onboarding from './components/OnBoarding';
import Tutor from './components/Tutor';
import Today from './components/Today';
import Signin from './components/SignIn';
import Reports from './components/Reports';
import Profile from './components/Profile';
import Practice from './components/Practice';
import PlanningAssistant from './components/PlanningAssistant';
import Login from './components/Login';
import FocusTimer from './components/FocusTimer';
import Home from './components/Home';
import LandingPage from './components/LandingPage';

import AppNavbar from './components/Navbar';
import AppSidebar from './components/SideBar';
import AppFooter from './components/Footer';

function AppLayout({ children }) {
  return (
    <div className="Vazir" style={{ display: 'flex', direction: 'rtl' }}>
      <AppSidebar />
      <div style={{ flexGrow: 1 }}>
        <AppNavbar />
        <div className="main-content p-3">{children}</div>
        <AppFooter />
      </div>
    </div>
  );
}

function ProtectedFeature({ children }) {
  return (
    <RequireAuth>
      <RequireProfile>{children}</RequireProfile>
    </RequireAuth>
  );
}

function MainAppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
        <Route path="/tutor" element={<ProtectedFeature><Tutor /></ProtectedFeature>} />
        <Route path="/today" element={<ProtectedFeature><Today /></ProtectedFeature>} />
        <Route path="/reports" element={<ProtectedFeature><Reports /></ProtectedFeature>} />
        <Route path="/practice" element={<ProtectedFeature><Practice /></ProtectedFeature>} />
        <Route path="/planningassistant" element={<ProtectedFeature><PlanningAssistant /></ProtectedFeature>} />
        <Route path="/focustimer" element={<RequireAuth><FocusTimer /></RequireAuth>} />
      </Routes>
    </AppLayout>
  );
}

function LandingOrHome() {
  const { isAuthenticated, loading } = useApp();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/home" replace />;
  return <LandingPage />;
}

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingOrHome />} />
          <Route path="/profile" element={<ProtectedFeature><Profile /></ProtectedFeature>} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<MainAppRoutes />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
