import React from "react";
import { Heart, Sparkles } from "lucide-react";

export default function AppFooter() {
  return (
    <footer
      className="bg-white mt-4"
      style={{
        borderTop: "1px solid #eef2f7",
        padding: "18px 0",
      }}
    >
      <div
        className="container"
        style={{
          maxWidth: "1100px",
          direction: "rtl",
          textAlign: "right",
          fontFamily: "Vazir, Tahoma, Arial, sans-serif",
        }}
      >
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <div>
            <div
              className="d-flex align-items-center gap-2"
              style={{
                fontSize: "14px",
                fontWeight: 800,
                color: "#6255f5",
              }}
            >
              <Sparkles size={16} />
              منتورا
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#9ca3af",
                marginTop: "4px",
              }}
            >
              دستیار هوشمند برنامه‌ریزی، یادگیری و رشد
            </div>
          </div>

          <div
            style={{
              fontSize: "11px",
              color: "#6b7280",
            }}
          >
            ساخته شده با <Heart size={14} color="#ef4444" /> برای دانش‌آموزهای پرتلاش
          </div>
        </div>
      </div>
    </footer>
  );
}
