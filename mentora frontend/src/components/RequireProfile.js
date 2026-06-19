import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function RequireProfile({ children }) {
  const { profile, loading, isAuthenticated } = useApp();

  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "60vh", direction: "rtl" }}
      >
        <div className="d-flex flex-column align-items-center gap-3">
          <div className="spinner-border text-primary" role="status" />
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#6b7280" }}>
            داده‌ها در حال همگام‌سازی...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!profile || !profile.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
