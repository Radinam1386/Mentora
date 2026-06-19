import React from "react";
import { Bell, Search, Sparkles, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function AppNavbar() {
    const navigate = useNavigate();
    const { profile, logout, isAuthenticated } = useApp();
    const safeProfile =
        profile && typeof profile === "object" ? profile : {};

    const studentName = safeProfile.name || "دانش‌آموز عزیز";

    return (
        <nav
            className="navbar bg-white px-3 px-md-4"
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
                {/* Right side */}
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="d-flex align-items-center justify-content-center text-white"
                        style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "14px",
                            background: "linear-gradient(135deg, #6255f5, #4f46e5)",
                            boxShadow: "0 4px 14px rgba(98,85,245,0.25)",
                        }}
                    >
                        <Sparkles size={18} />
                    </div>

                    <div style={{ direction: "rtl", textAlign: "right" }}>
                        <div
                            style={{
                                fontSize: "15px",
                                fontWeight: 800,
                                color: "#111827",
                                lineHeight: 1.8,
                            }}
                        >
                            منتورا
                        </div>
                        <div
                            style={{
                                fontSize: "11px",
                                color: "#9ca3af",
                                lineHeight: 1.8,
                            }}
                        >
                            دستیار هوشمند مطالعه و برنامه‌ریزی
                        </div>
                    </div>
                </div>

                {/* Center */}
                <div className="d-none d-md-flex align-items-center" style={{ width: "340px" }}>
                    <div
                        className="d-flex align-items-center w-100"
                        style={{
                            background: "#f8fafc",
                            border: "1px solid #e5e7eb",
                            borderRadius: "14px",
                            padding: "10px 12px",
                        }}
                    >
                        <Search size={16} color="#9ca3af" />
                        <input
                            type="text"
                            placeholder="جستجو در بخش‌های مختلف..."
                            className="form-control border-0 shadow-none bg-transparent"
                            style={{
                                fontSize: "12px",
                                textAlign: "right",
                                direction: "rtl",
                            }}
                        />
                    </div>
                </div>

                {/* Left side */}
                <div className="d-flex align-items-center gap-3">
                    <button
                        type="button"
                        className="btn position-relative"
                        style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: "14px",
                            padding: "10px 12px",
                            background: "#fff",
                        }}
                    >
                        <Bell size={18} color="#6b7280" />
                        <span
                            style={{
                                position: "absolute",
                                top: "6px",
                                left: "7px",
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "#ef4444",
                            }}
                        />
                    </button>

                    <Link
                        to="/profile"
                        className="d-flex align-items-center gap-2"
                        style={{
                            background: "#f8fafc",
                            border: "1px solid #e5e7eb",
                            borderRadius: "16px",
                            padding: "6px 10px",
                        }}
                    >
                        <div style={{ textAlign: "right", direction: "rtl" }}>
                            <div
                                style={{
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    color: "#111827",
                                }}
                            >
                                {studentName}
                            </div>
                            <div
                                style={{
                                    fontSize: "10px",
                                    color: "#9ca3af",
                                }}
                            >
                                پنل دانش‌آموز
                            </div>
                        </div>

                        <div
                            className="d-flex align-items-center justify-content-center text-white"
                            style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "12px",
                                background: "linear-gradient(135deg, #6255f5, #7c3aed)",
                                fontWeight: 800,
                                fontSize: "13px",
                            }}
                        >
                            {studentName.slice(0, 1)}
                        </div>
                    </Link>

                    {isAuthenticated && (
                        <button
                            type="button"
                            onClick={async () => {
                                await logout();
                                navigate("/login");
                            }}
                            className="btn d-flex align-items-center gap-1"
                            style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: "14px",
                                padding: "10px 12px",
                                background: "#fff",
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "#6b7280",
                            }}
                        >
                            <LogOut size={16} />
                            خروج
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
