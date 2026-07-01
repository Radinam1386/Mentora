import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LifeBuoy } from "lucide-react";

export default function SupportWidget() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isHovered, setIsHovered] = useState(false);

    if (location.pathname === "/support") {
        return null;
    }

    return (
        <div
            onClick={() => navigate("/support")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title="پشتیبانی منتورا"
            style={{
                position: "fixed",
                bottom: "24px",
                left: "24px",
                zIndex: 9999,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "48px",
                minWidth: "48px",
                width: isHovered ? "140px" : "48px",
                borderRadius: "24px",
                background: "linear-gradient(135deg, #6255f5 0%, #4f46e5 100%)",
                boxShadow: isHovered
                    ? "0 10px 25px -5px rgba(98, 85, 245, 0.5), 0 8px 10px -6px rgba(98, 85, 245, 0.5)"
                    : "0 4px 14px 0 rgba(98, 85, 245, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isHovered ? "translateY(-4px) scale(1.05)" : "none",
                overflow: "hidden",
                padding: "0 12px",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>

                <LifeBuoy
                    size={22}
                    color="#ffffff"
                    style={{
                        transition: "transform 0.4s ease",
                        transform: isHovered ? "rotate(180deg)" : "rotate(0deg)",
                        flexShrink: 0,
                        display: "block",
                    }}
                />
                {isHovered && (
                    <span
                        style={{
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "12px",
                            fontFamily: "Vazir, Tahoma, Arial",
                            whiteSpace: "nowrap",
                            animation: "fadeIn 0.2s ease forwards",
                            pointerEvents: "none",
                            direction: "rtl",
                        }}
                    >
                        پشتیبانی
                    </span>
                )}
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(5px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
        </div>
    );
}
