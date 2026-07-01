import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowLeft, Calendar, Brain } from "lucide-react";

export default function FeatureIntroModal() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("hasSeenAIIntro");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn && !hasSeenIntro) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("hasSeenAIIntro", "true");
    setIsOpen(false);
  };

  const handleNavigate = () => {
    localStorage.setItem("hasSeenAIIntro", "true");
    setIsOpen(false);
    navigate("/planningassistant");
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(8px)",
        zIndex: 10050
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-md px-3">
        {/* استایل شیشه‌ای هماهنگ با طراحی کل سایت (منتورا کارت) */}
        <div
          className="modal-content border-0 shadow-lg p-4 text-center"
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            direction: "rtl",
            fontFamily: "Vazir, Tahoma, sans-serif"
          }}
        >
          {/* دکمه بستن */}
          <div className="modal-header border-0 d-flex justify-content-end pb-0">
            <button
              type="button"
              className="btn-close m-0"
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body px-3 pb-3 pt-1">
            {/* لوگو / آیکون هوش مصنوعی */}
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-4 position-relative"
              style={{
                width: "72px",
                height: "72px",
                background: "linear-gradient(135deg, #6255f5 0%, #4f46e5 100%)",
                borderRadius: "50%",
                boxShadow: "0 8px 20px rgba(98, 85, 245, 0.3)"
              }}
            >
              <Brain size={32} color="#ffffff" />
              <div
                className="position-absolute translate-middle-y start-0 bg-success rounded-circle p-1 border border-2 border-white d-flex align-items-center justify-content-center"
                style={{ top: "15px" }}
              >
                <Sparkles size={12} color="#ffffff" />
              </div>
            </div>

            <h4 className="fw-extrabold mb-3" style={{ color: "#1e1b4b" }}>
              برنامه‌ریزی هوشمند با قدرت AI ⚡
            </h4>

            <p className="text-secondary small lh-lg mb-4">
              سلام! به منتورا خوش آمدید. ما برای شما یک دستیار برنامه‌ریز اختصاصی طراحی کرده‌ایم. با این ابزار می‌توانید برنامه‌های درسی و اهداف روزانه خود را بر اساس هوش مصنوعی شخصی‌سازی کنید.
            </p>

            <div
              className="d-flex align-items-center text-start p-3 mb-4 rounded-3 border"
              style={{
                backgroundColor: "rgba(98, 85, 245, 0.05)",
                borderColor: "rgba(98, 85, 245, 0.1)"
              }}
            >
              <div className="ms-3">
                <Calendar size={24} style={{ color: "#6255f5" }} />
              </div>
              <div>
                <h6 className="fw-bold mb-1" style={{ fontSize: "14px", color: "#1e1b4b" }}>
                  تقویم تحصیلی و شخصی خودکار
                </h6>
                <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
                  تنظیم اهداف، توزیع هوشمند دروس و زمان‌بندی دقیق در چند ثانیه
                </p>
              </div>
            </div>

            <div className="d-grid gap-2">
              <button
                onClick={handleNavigate}
                className="btn py-3 text-white fw-bold d-flex align-items-center justify-content-center gap-2 border-0"
                style={{
                  background: "linear-gradient(135deg, #6255f5 0%, #4f46e5 100%)",
                  borderRadius: "14px",
                  boxShadow: "0 4px 14px rgba(98, 85, 245, 0.3)"
                }}
              >
                <span>شروع برنامه‌ریزی هوشمند</span>
                <ArrowLeft size={16} style={{ transform: "rotate(180deg)" }} />
              </button>

              <button
                onClick={handleClose}
                className="btn btn-link text-decoration-none text-secondary fw-semibold py-2"
              >
                بعداً می‌بینم
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
