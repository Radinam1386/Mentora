import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import './App.css';
import './index.css';

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
import { useState, useEffect } from 'react';
import AppNavbar from './components/Navbar';
import AppSidebar from './components/SideBar';
import AppFooter from './components/Footer';
import SubscriptionPlans from './components/SubscriptionPlans';
import Subscription from './components/Subscription';
import NotFound from './components/NotFound'
import BlogPost from './components/blogpost';
import BlogList from './components/Bloglist';
import RequireAuth from './components/RequireAuth';
import RequireProfile from './components/RequireProfile';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();


  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);
  return (
    <div className='hidescroll' style={{ display: "flex", direction: "rtl"}}>
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div style={{ flexGrow: 1 }}>
        <AppNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="main-content p-3">
          <Outlet />
        </div>

        <AppFooter />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/onboarding" element={<Onboarding />} />

          <Route
            element={
              <RequireProfile>
                <Outlet />
              </RequireProfile>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/tutor" element={<Tutor />} />
            <Route path="/today" element={<Today />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/planningassistant" element={<PlanningAssistant />} />
            <Route path="/focustimer" element={<FocusTimer />} />
            <Route path="/subscriptionplans" element={<SubscriptionPlans />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
