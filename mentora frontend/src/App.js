import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
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
import StudyLoading from './components/StudyLoading'
import SubscriptionSuccessPopup from './components/SubscriptionSuccessPopup'
import { useApp } from './context/AppContext';
import ComingSoon from './components/ComingSoon';
import AboutUs from './components/AboutUs';
import OTPlogin from './components/OTPlogin';
import Testimonials from './components/Testimonials'
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState();
  const { profile } = useApp();
  const hasActiveSubscription = Boolean(profile?.subscriptionActive);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ display: "flex", direction: "rtl" }}>
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div style={{ flexGrow: 1 }}>
        <AppNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="main-content p-3">
          <Outlet />
        </div>

        {hasActiveSubscription && <SubscriptionSuccessPopup isPurchased />}

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
        <Route path="/login/otp" element={<OTPlogin />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route element={<AppLayout />}>
          <Route path="*" element={<NotFound />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/tutor" element={<Tutor />} />
          <Route path="/today" element={<Today />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/planningassistant" element={<PlanningAssistant />} />
          <Route path="/focustimer" element={<FocusTimer />} />
          <Route path="/subscriptionplans" element={<SubscriptionPlans />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/loading" element={<StudyLoading />} />
          <Route path="/exams" element={<ComingSoon />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
