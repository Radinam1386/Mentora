import React from "react";
import { Bell, Search, Sparkles, LogOut, Menu, Crown } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import NotificationDropdown from "./NotificationDropdown";

export default function AppNavbar({ onToggleSidebar }) {
    const navigate = useNavigate();
    const { profile, logout } = useApp();

    const safeProfile = profile && typeof profile === "object" ? profile : {};
    const studentName = safeProfile.name || "دانش‌آموز عزیز";
    const subscriptionDays = safeProfile.subscription_days || 0;
    const location = useLocation();

    const handleMenuClick = () => {
        onToggleSidebar();
    };

    return (
        <nav
            className="navbar bg-white px-2 px-md-4"
            style={{
                height: "72px",
                borderBottom: "1px solid #eef2f7",
                position: "sticky",
                top: 0,
                zIndex: 1030,
                direction: "rtl",
                fontFamily: "Vazir, Tahoma, Arial, sans-serif",
            }}
        >
            <div className="container-fluid p-0 d-flex align-items-center justify-content-between">

                <div className="d-flex align-items-center gap-2 gap-md-3">
                    <button
                        onClick={handleMenuClick}
                        aria-label="باز کردن منو"
                        className="btn d-flex align-items-center justify-content-center p-2"
                        style={{ width: "40px", height: "40px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "#fff" }}
                    >
                        <Menu size={20} />
                    </button>

                    <div className="d-flex align-items-center gap-2">
                        <Link to="/home" className="d-flex align-items-center justify-content-center text-white"
                            style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg, #6255f5, #4f46e5)" }}>
                            <Sparkles size={18} />
                        </Link>
                        <div className="d-flex">
                            <div style={{ fontSize: "14px", fontWeight: 800, color: "#111827" }}>منتورا</div>
                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-center gap-2 gap-md-3">

                    <Link to={subscriptionDays > 0 ? "/subscription" : "/subscriptionplans"}
                        className="d-flex align-items-center gap-2 px-2 px-md-3 py-2"
                        style={{ background: subscriptionDays > 0 ? "#f5f3ff" : "#fff7ed", border: "1px solid #ddd", borderRadius: "12px", textDecoration: "none" }}>
                        <Crown
                            size={window.innerWidth < 768 ? 20 : 18}
                            color={subscriptionDays > 0 ? "#6255f5" : "#ea580c"}
                        />
                        <span className="d-none d-md-inline" style={{ fontSize: "12px", fontWeight: 700, color: subscriptionDays > 0 ? "#6255f5" : "#c2410c" }}>
                            {subscriptionDays > 0 ? `${subscriptionDays} روز` : "خرید اشتراک"}
                        </span>
                    </Link>

                    <NotificationDropdown />

                    <Link to="/profile" className="d-flex align-items-center" style={{ textDecoration: "none" }}>
                        <div className="d-none d-md-flex flex-column align-items-end mx-2">
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#111827" }}>{studentName}</span>
                            <span style={{ fontSize: "10px", color: "#9ca3af" }}>پنل دانش‌آموز</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-center text-white"
                            style={{ width: "36px", height: "36px", borderRadius: "12px", background: "linear-gradient(135deg, #6255f5, #7c3aed)", fontSize: "13px" }}>
                            {studentName.slice(0, 1)}
                        </div>
                    </Link>
                    <button type="button" onClick={async () => { await logout(); navigate("/login"); }}
                        className="btn p-2 d-flex align-items-center justify-content-center"
                        style={{
                            borderRadius: 12,
                            border: "1px solid #e5e7eb",
                            background: "#fff",
                            width: 40,
                            height: 40,
                            position: "relative",
                        }}>
                        <LogOut size={20} />
                </button>
            </div>
        </div>
        </nav >
    );
}
