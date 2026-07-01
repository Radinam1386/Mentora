import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
    House,
    CalendarDays,
    Bot,
    BarChart3,
    UserCircle2,
    BookMarked,
    ClipboardCheck,
    Hourglass,
    X,
    TextIcon,
    ShoppingBasket,
    NotebookTabs,
    LifeBuoy,
    ShieldCheck
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AppSidebar({ open, onClose }) {
    const { profile } = useApp();
    const isAdmin = Boolean(profile?.isAdmin);

    useEffect(() => {
        if (window.innerWidth < 992) {
            document.body.style.overflow = open ? "hidden" : "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    const menuItems = [
        { key: "/home", label: "خانه", icon: <House size={18} /> },
        { key: "/today", label: "برنامه امروز", icon: <ClipboardCheck size={18} /> },
        { key: "/planningassistant", label: "برنامه‌ریزی", icon: <CalendarDays size={18} /> },
        { key: "/tutor", label: "مربی هوشمند", icon: <Bot size={18} /> },
        { key: "/practice", label: "تمرین و آزمون", icon: <BookMarked size={18} /> },
        { key: "/reports", label: "گزارش‌ها", icon: <BarChart3 size={18} /> },
        { key: "/exams", label: "نهایی", icon: <NotebookTabs size={18} /> },
        { key: "/focustimer", label: "تایمر فوکوس", icon: <Hourglass size={18} /> },
        { key: "/blog", label: "بلاگ", icon: <TextIcon size={18} /> },
        { key: "/subscription", label: "اشتراک", icon: <ShoppingBasket size={18} /> },
        ...(isAdmin ? [{ key: "/admin/console", label: "کنسول ادمین", icon: <ShieldCheck size={18} /> }] : []),
        { key: "/profile", label: "پروفایل", icon: <UserCircle2 size={18} /> },
    ];

    const handleLinkClick = () => {
        if (window.innerWidth < 992) {
            onClose?.();
        }
    };

    const handleClose = (e) => {
        e?.stopPropagation?.();
        e?.preventDefault?.();
        onClose?.();
    };

    return (
        <>
            <style>
                {`
        .app-sidebar {
          direction: rtl;
          font-family: Vazir, Tahoma, Arial, sans-serif;
          background: #fff;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: width 0.3s ease, padding 0.3s ease, transform 0.3s ease;
        }

        @media (min-width: 992px) {
          .app-sidebar {
            width: var(--sidebar-width);
            min-height: 100vh;
            border-left: var(--sidebar-border);
            padding: var(--sidebar-padding);
            position: relative;
            transform: none;
            position: sticky; 
            top: 0;  
            height: 100vh;  
          }
        }

        @media (max-width: 991.98px) {
          .app-sidebar {
            position: fixed;
            top: 0;
            right: 0;
            width: 260px;
            height: 100vh;
            padding: 20px 16px;
            border-left: 1px solid #eef2f7;
            z-index: 2000;
            transform: translateX(100%);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          .app-sidebar.open {
            transform: translateX(0);
          }

          .app-sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.35);
            z-index: 1500;
          }
        }
        `}
            </style>

            {open && (
                <div
                    className="app-sidebar-overlay d-lg-none"
                    onClick={onClose}
                />
            )}

            <aside
                className={`app-sidebar ${open ? "open" : ""}`}
                style={{
                    "--sidebar-width": open ? "270px" : "0px",
                    "--sidebar-padding": open ? "20px 16px" : "0px",
                    "--sidebar-border": open ? "1px solid #eef2f7" : "none",
                }}
            >
                <div
                    style={{
                        minWidth: "218px",
                        opacity: open ? 1 : 0,
                        transition: "opacity 0.2s ease",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                    }}
                >
                    <div className="d-flex d-lg-none align-items-center justify-content-between mb-3">
                        <div>
                            <div
                                style={{
                                    fontSize: "14px",
                                    fontWeight: 900,
                                    color: "#111827",
                                }}
                            >
                                منوی اصلی
                            </div>

                            <div
                                style={{
                                    fontSize: "11px",
                                    color: "#6b7280",
                                    marginTop: "4px",
                                }}
                            >
                                مسیرهای منتورا
                            </div>
                        </div>
                        <button
                            type="button"
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onClose && onClose();
                            }}
                            className="btn d-flex align-items-center justify-content-center"
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "12px",
                                border: "1px solid #eef2f7",
                                background: "#f8fafc",
                                color: "#6255f5",
                                padding: 0,
                                cursor: "pointer",
                                position: "relative",
                                zIndex: 3000,
                                touchAction: "manipulation"
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div
                        className="d-none d-md-block text-center"
                        style={{
                            background: "linear-gradient(to left, #6255f5, #4f46e5)",
                            borderRadius: "12px",
                            padding: "15px",
                            marginBottom : "10px",
                            color: "white",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "13px",
                                fontWeight: 800,
                            }}
                        >
                            مسیر موفقیت تو شروع شده ✨
                        </div>
                    </div>

                    <div className="d-flex flex-column gap-2">
                        {menuItems.map((item, i) => (
                            <NavLink
                                key={i}
                                to={item.key}
                                onClick={handleLinkClick}
                                style={({ isActive }) => ({
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "12px",
                                    borderRadius: "12px",
                                    textDecoration: "none",
                                    color: isActive ? "#6255f5" : "#374151",
                                    background: isActive
                                        ? "rgba(98,85,245,0.1)"
                                        : "transparent",
                                    fontWeight: "600",
                                    whiteSpace: "nowrap",
                                })}
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </aside>
        </>
    );
}
