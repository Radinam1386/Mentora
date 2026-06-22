import React from "react";
import { NavLink } from "react-router-dom";
import {
  UserCircle2,
  Settings,
  ShieldCheck,
  ChevronRight,
  X,
} from "lucide-react";

export default function ProfileSidebar({ open, onClose }) {
  const menuItems = [
    { id: "overview", label: "نمای کلی", icon: <UserCircle2 size={18} /> },
    { id: "settings", label: "تنظیمات حساب", icon: <Settings size={18} /> },
    { id: "security", label: "امنیت", icon: <ShieldCheck size={18} /> },
  ];

  const handleClick = (id) => {
    const el = document.getElementById(id);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    if (window.innerWidth < 992) {
      onClose && onClose();
    }
  };

  return (
    <>
      <style>
        {`
        .profile-sidebar{
          direction:rtl;
          background:#fff;
          overflow:hidden;
          display:flex;
          flex-direction:column;
          transition:transform .3s ease;
        }

        @media (min-width:992px){
          .profile-sidebar{
            width:280px;
            min-height:100vh;
            border-left:1px solid #eef2f7;
            padding:24px 18px;
            position:relative;
            transform:none;
          }
        }

        @media (max-width:991.98px){
          .profile-sidebar{
            position:fixed;
            top:0;
            right:0;
            width:280px;
            height:100vh;
            padding:24px 18px;
            border-left:1px solid #eef2f7;
            z-index:1050;
            transform:translateX(100%);
            box-shadow:-20px 0 60px rgba(15,23,42,.18);
          }

          .profile-sidebar.open{
            transform:translateX(0);
          }

          .profile-sidebar-overlay{
            position:fixed;
            inset:0;
            background:rgba(15,23,42,.35);
            z-index:1040;
          }
        }
        `}
      </style>

      {open && (
        <div
          className="profile-sidebar-overlay d-lg-none"
          onClick={onClose}
        />
      )}

      <aside className={`profile-sidebar ${open ? "open" : ""}`}>
        {/* header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <div style={{ fontWeight: 900, fontSize: "1rem", color: "#2a1f68" }}>
              پروفایل من
            </div>

            <div style={{ fontSize: ".8rem", color: "#7c75a8", marginTop: "4px" }}>
              مدیریت حساب کاربری
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn d-flex align-items-center justify-content-center d-lg-none"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              border: "1px solid #eee",
              background: "#faf9ff",
              color: "#6255f5",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* gradient card */}
        <div
          style={{
            background: "linear-gradient(135deg,#6255f5,#8e84ff)",
            color: "#fff",
            borderRadius: "20px",
            padding: "18px",
            marginBottom: "20px",
            boxShadow: "0 16px 40px rgba(98,85,245,.18)",
          }}
        >
          <div style={{ fontSize: ".85rem", opacity: .9 }}>
            پنل کاربری
          </div>

          <div style={{ fontWeight: 800, fontSize: "1.1rem", marginTop: "6px" }}>
            مدیریت پروفایل
          </div>
        </div>

        {/* menu */}
        <div className="d-flex flex-column gap-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              style={{
                border: "none",
                background: "#f8f7ff",
                borderRadius: "14px",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#3a3270",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all .2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f1efff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#f8f7ff")
              }
            >
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: "#6255f5" }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>

              <ChevronRight size={16} />
            </button>
          ))}
        </div>

        {/* back button */}
        <NavLink
          to="/home"
          onClick={onClose}
          style={{
            display: "block",
            marginTop: "auto",
            textDecoration: "none",
            background: "rgba(98,85,245,.1)",
            color: "#6255f5",
            textAlign: "center",
            padding: "12px",
            borderRadius: "14px",
            fontWeight: 800,
          }}
        >
          بازگشت به داشبورد
        </NavLink>
      </aside>
    </>
  );
}
