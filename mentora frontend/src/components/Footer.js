import React from "react";
import { Heart, Sparkles, Instagram, Send, Mail } from "lucide-react";

export default function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white mt-4" style={{ fontFamily: "Vazir, sans-serif", borderTop: "1px solid #eef2f7" }} aria-label="فوتر سایت منتورا"
    >
      <style>
        {`
          .footer-container { padding: 24px 16px; }
          .footer-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
          }
          
          @media (min-width: 768px) {
            .footer-container { padding: 40px 0; }
            .footer-grid { 
              grid-template-columns: 2fr 1fr 1fr;
              gap: 40px; 
            }
          }

          .footer-link {
            display: block;
            color: #6b7280;
            text-decoration: none;
            font-size: 13px;
            margin-bottom: 8px;
            transition: color 0.2s;
          }
          .footer-link:hover { color: #6255f5; }
          
          /* بهینه‌سازی سایز متن برای موبایل */
          @media (max-width: 576px) {
            .footer-section { text-align: center; }
            .footer-grid { gap: 32px; }
          }
        `}
      </style>

      <div className="container" style={{ maxWidth: "1100px", direction: "rtl" }}>
        <div className="footer-container">

          <div className="footer-grid">
            <div className="footer-section">
              <h2 className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: "18px", fontWeight: 900, color: "#6255f5" }}>
                <Sparkles size={20} />
                منتورا
              </h2>
              <p style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.7", margin: 0 }}>
                منتورا یک پلتفرم هوشمند برنامه‌ریزی درسی و مدیریت مطالعه است که به دانش‌آموزان کمک می‌کند تمرکز، برنامه‌ریزی و پیشرفت تحصیلی خود را بهتر مدیریت کنند.
              </p>
            </div>

            <div className="footer-section">
              <h6 style={{ fontSize: "13px", fontWeight: 800, marginBottom: "12px", color: "#111827" }}>دسترسی سریع</h6>
              <a href="/home" className="footer-link">داشبورد اصلی</a>
              <a href="/reports" className="footer-link">تحلیل عملکرد</a>
              <a href="/subscription" className="footer-link">ارتقای اشتراک</a>
            </div>

            <div className="footer-section" aria-label="لینک‌های سریع سایت">
              <h6 style={{ fontSize: "13px", fontWeight: 800, marginBottom: "12px", color: "#111827" }}>ارتباط با ما</h6>
              <a href="mailto:support@mentora.ir" className="footer-link d-flex align-items-center gap-2 justify-content-center justify-content-md-start" aria-label="ارسال ایمیل به پشتیبانی منتورا"
              >
                <Mail size={14} /> پشتیبانی ایمیلی
              </a>
              <div className="d-flex gap-3 mt-2 justify-content-center justify-content-md-start">
                <a href="#" aria-label="اینستاگرام منتورا">
                  <Instagram size={20} color="#6b7280" />
                </a>
                <a href="https://t.me/ARS00hia" aria-label="تلگرام منتورا">
                  <Send size={20} color="#6b7280" />
                </a>

              </div>
            </div>
          </div>

          <div className="text-center mt-4 pt-3" style={{ borderTop: "1px solid #f3f4f6", fontSize: "11px", color: "#9ca3af" }}>
            تمامی حقوق محفوظ است © {currentYear} | ساخته شده با <Heart size={12} color="#ef4444" className="d-inline" /> برای دانش‌آموزان پرتلاش
          </div>
        </div>
      </div>
    </footer >
  );
}
