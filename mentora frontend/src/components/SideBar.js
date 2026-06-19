import React from "react";
import { NavLink } from "react-router-dom";
import {
    House,
    CalendarDays,
    Bot,
    BarChart3,
    UserCircle2,
    BookMarked,
    ClipboardCheck,
    Hourglass
} from "lucide-react";

export default function AppSidebar({ currentPage, onNavigate }) {
    const menuItems = [
        { key: "", label: "خانه", icon: <House size={18} /> },
        { key: "today", label: "برنامه امروز", icon: <ClipboardCheck size={18} /> },
        { key: "planningassistant", label: "برنامه‌ریزی", icon: <CalendarDays size={18} /> },
        { key: "tutor", label: "مربی هوشمند", icon: <Bot size={18} /> },
        { key: "practice", label: "تمرین و آزمون", icon: <BookMarked size={18} /> },
        { key: "reports", label: "گزارش‌ها", icon: <BarChart3 size={18} /> },
        { key: "focustimer", label: "تایمر فوکوس", icon: <Hourglass size={18} /> },
        { key: "profile", label: "پروفایل", icon: <UserCircle2 size={18} /> },
    ];

    return (
        <aside
            className="d-none d-lg-flex flex-column bg-white"
            style={{
                width: "270px",
                minHeight: "calc(100vh - 72px)",
                borderLeft: "1px solid #eef2f7",
                padding: "20px 16px",
                position: "sticky",
                top: "72px",
                direction: "rtl",
                fontFamily: "Vazir, Tahoma, Arial, sans-serif",
            }}
        >
            <div
                style={{
                    background: "linear-gradient(to left, #6255f5, #4f46e5)",
                    borderRadius: "24px",
                    padding: "18px",
                    color: "white",
                    marginBottom: "18px",
                }}
            >
                <div
                    style={{
                        fontSize: "13px",
                        fontWeight: 800,
                        marginBottom: "6px",
                    }}
                >
                    مسیر موفقیت تو شروع شده ✨
                </div>
                <div
                    style={{
                        fontSize: "11px",
                        lineHeight: "2",
                        color: "#e9e7ff",
                    }}
                >
                    هر روز با یک قدم کوچک اما پیوسته، به هدفت نزدیک‌تر می‌شوی.
                </div>
            </div>

            <div className="d-flex flex-column gap-2">
                {menuItems.map((item, i) => (
                    <NavLink
                        key={i}
                        to={item.key}
                        style={({ isActive }) => ({
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "12px",
                            marginBottom: "8px",
                            borderRadius: "12px",
                            textDecoration: "none",
                            color: isActive ? "#6255f5" : "#374151",
                            background: isActive ? "rgba(98,85,245,0.1)" : "transparent",
                            fontWeight: "600",
                        })}
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}
            </div>

            <div
                className="mt-auto"
                style={{
                    background: "#f8fafc",
                    border: "1px solid #eef2f7",
                    borderRadius: "20px",
                    padding: "16px",
                }}
            >
                <div
                    style={{
                        fontSize: "12px",
                        fontWeight: 800,
                        color: "#111827",
                        marginBottom: "8px",
                    }}
                >
                    یادآوری امروز
                </div>
                <div
                    style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        lineHeight: "1.9",
                    }}
                >
                    حتی اگر امروز زمان کمی داری، فقط با انجام یک کار کوچک هم زنجیره
                    استمرار تو حفظ می‌شود.
                </div>
            </div>
        </aside>
    );
}
