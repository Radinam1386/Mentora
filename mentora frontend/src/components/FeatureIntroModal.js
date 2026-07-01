import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowLeft, Calendar, Brain } from "lucide-react";

export default function FeatureIntroModal() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isHoveredBtn, setIsHoveredBtn] = useState(false);

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
    navigate("/planning-assistant");
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(8px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.3s ease-out forwards",
      }}
    >
      {/* بدنه اصلی کارت پاپ‌آپ با استایل شیشه‌ای (Glassmorphism) */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "480px",
          padding: "32px",
          textAlign: "center",
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 50px 0 rgba(98, 85, 245, 0.1)",
          position: "relative",
          direction: "rtl",
          fontFamily: "Vazir, Tahoma, sans-serif",
          animation: "scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        }}
      >
        {/* نشان و آیکون هوش مصنوعی بالای پاپ‌آپ */}
        <div
          style={{
            width: "72px",
            height: "72px",
            background: "linear-gradient(135deg, #6255f5 0%, #4f46e5 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px auto",
            boxShadow: "0 8px 20px rgba(98, 85, 245, 0.3)",
            position: "relative",
          }}
        >
          <Brain size={32} color="#ffffff" />
          <div
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "#10B981",
              borderRadius: "50%",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #ffffff",
            }}
          >
            <Sparkles size={12} color="#ffffff" />
          </div>
        </div>

        <h3
          style={{
            fontWeight: 800,
            fontSize: "20px",
            color: "#1e1b4b",
            marginBottom: "12px",
          }}
        >
          برنامه‌ریزی هوشمند با قدرت AI ⚡
        </h3>
        
        <p
          style={{
            fontSize: "14px",
            color: "#475569",
            lineHeight: "1.7",
            marginBottom: "24px",
          }}
        >
          سلام! به منتورا خوش آمدید. ما برای شما یک دستیار برنامه‌ریز اختصاصی طراحی کرده‌ایم. با این ابزار می‌توانید برنامه‌های درسی و اهداف روزانه خود را بر اساس هوش مصنوعی شخصی‌سازی کنید.
        </p>

        <div
          style={{
            background: "rgba(98, 85, 245, 0.05)",
            border: "1px solid rgba(98, 85, 245, 0.1)",
            borderRadius: "16px",
            padding: "12px 16px",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textAlign: "right",
          }}
        >
          <Calendar size={24} color="#6255f5" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "13px", color: "#1e1b4b" }}>تقویم تحصیلی و شخصی خودکار</div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>تنظیم اهداف، توزیع هوشمند دروس و زمان‌بندی دقیق در چند ثانیه</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={handleNavigate}
            onMouseEnter={() => setIsHoveredBtn(true)}
            onMouseLeave={() => setIsHoveredBtn(false)}
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #6255f5 0%, #4f46e5 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "14px",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: isHoveredBtn 
                ? "0 10px 20px -5px rgba(98, 85, 245, 0.4)" 
                : "0 4px 10px rgba(98, 85, 245, 0.2)",
              transform: isHoveredBtn ? "translateY(-2px)" : "translateY(0)",
              transition: "all 0.25s ease",
            }}
          >
            شروع برنامه‌ریزی هوشمند
            <ArrowLeft size={16} />
          </button>

          <button
            onClick={handleClose}
            style={{
              width: "100%",
              padding: "12px",
              background: "transparent",
              color: "#64748b",
              border: "none",
              borderRadius: "14px",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => (e.target.style.background = "rgba(0, 0, 0, 0.04)")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            بعداً می‌بینم
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
