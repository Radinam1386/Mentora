import React from "react";
import { NavLink } from "react-router-dom";
import {
  UserCircle2,
  Settings,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default function ProfileSidebar() {
  const items = [
    { id: "overview", label: "نمای کلی", icon: <UserCircle2 size={18} /> },
    { id: "settings", label: "تنظیمات حساب", icon: <Settings size={18} /> },
    { id: "security", label: "امنیت", icon: <ShieldCheck size={18} /> },
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <aside
      style={{
        width: "280px",
        minHeight: "100vh",
        background: "#fff",
        borderLeft: "1px solid #eee",
        padding: "24px 18px",
        position: "sticky",
        top: 0,
      }}
    >
      <div className="mb-4">
        <div
          style={{
            background: "linear-gradient(135deg, #6255f5, #8e84ff)",
            color: "#fff",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 16px 40px rgba(98,85,245,0.18)",
          }}
        >
          <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>پنل کاربری</div>
          <div style={{ fontWeight: "800", fontSize: "1.3rem", marginTop: "6px" }}>
            پروفایل من
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.85, marginTop: "8px" }}>
            مدیریت حساب کاربری
          </div>
        </div>
      </div>

      <div className="d-flex flex-column gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            style={{
              border: "none",
              background: "#f8f7ff",
              borderRadius: "14px",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#3a3270",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <span style={{ color: "#6255f5" }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>

      <NavLink
        to="/home"
        style={{
          display: "block",
          marginTop: "20px",
          textDecoration: "none",
          background: "rgba(98,85,245,0.1)",
          color: "#6255f5",
          textAlign: "center",
          padding: "12px",
          borderRadius: "14px",
          fontWeight: "800",
        }}
      >
        بازگشت به داشبورد
      </NavLink>
    </aside>
  );
}
