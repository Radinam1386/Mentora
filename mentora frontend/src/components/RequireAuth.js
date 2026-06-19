import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useApp();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "60vh", direction: "rtl" }}
      >
        <div className="d-flex flex-column align-items-center gap-3">
          <div className="spinner-border text-primary" role="status" />
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#6b7280" }}>
            در حال بارگذاری...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
