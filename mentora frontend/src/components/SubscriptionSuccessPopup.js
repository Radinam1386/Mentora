import { useEffect, useState } from "react";
import { CheckCircle2, Sparkles, X } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function SubscriptionSuccessPopup({ isPurchased = true }) {
    const [showPopup, setShowPopup] = useState(false);
    const { profile } = useApp();
    const safeProfile = profile && typeof profile === "object" ? profile : {};
    const subscriptionDays = safeProfile.subscription_days || 10;

    useEffect(() => {
        if (!isPurchased) {
            setShowPopup(false);
            return;
        }

        const userKey = safeProfile.email || "guest";
        const storageKey = `subscription_success_seen_${userKey}`;
        const hasSeen = localStorage.getItem(storageKey);

        if (!hasSeen) {
            setShowPopup(true);
            localStorage.setItem(storageKey, "true");
        }
    }, [isPurchased, safeProfile.email]);

    const closePopup = () => setShowPopup(false);

    if (!showPopup) return null;

    return (
        <div style={overlayStyle} onClick={closePopup}>
            <div style={popupStyle} onClick={(e) => e.stopPropagation()}>
                <button onClick={closePopup} style={closeBtnStyle} aria-label="بستن">
                    <X size={18} />
                </button>

                <div style={iconWrapStyle}>
                    <div style={iconCircleStyle}>
                        <CheckCircle2 size={34} color="#fff" />
                    </div>
                    <div style={sparkle1Style}>
                        <Sparkles size={16} color="#8f84ff" />
                    </div>
                    <div style={sparkle2Style}>
                        <Sparkles size={14} color="#6255f5" />
                    </div>
                </div>

                <h2 style={titleStyle}>اشتراک {subscriptionDays} روزه شما با موفقیت فعال شد</h2>
                <p style={descStyle}>
                    تبریک! از این لحظه به تمام امکانات ویژه، ابزارهای پیشرفته و تجربه حرفه‌ای دسترسی دارید.
                </p>
                <button onClick={closePopup} style={actionBtnStyle}>
                    شروع استفاده
                </button>
            </div>
        </div>
    );
}

const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
    fontFamily: "Vazir, Tahoma",

};

const popupStyle = {
    width: "100%",
    maxWidth: "460px",
    background: "linear-gradient(180deg, #ffffff 0%, #f8f7ff 100%)",
    borderRadius: "28px",
    padding: "28px 24px",
    boxShadow: "0 24px 80px rgba(98, 85, 245, 0.25)",
    position: "relative",
    textAlign: "center",
    animation: "popupIn 0.28s ease-out",
    border: "1px solid rgba(98,85,245,0.08)",
};

const closeBtnStyle = {
    position: "absolute",
    top: "14px",
    left: "14px",
    border: "none",
    background: "rgba(98,85,245,0.08)",
    color: "#6255f5",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
};

const iconWrapStyle = {
    position: "relative",
    width: "92px",
    height: "92px",
    margin: "0 auto 18px",
};

const iconCircleStyle = {
    width: "92px",
    height: "92px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6255f5, #8f84ff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 18px 40px rgba(98, 85, 245, 0.35)",
};

const sparkle1Style = {
    position: "absolute",
    top: "-6px",
    right: "-8px",
    background: "#fff",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
};

const sparkle2Style = {
    position: "absolute",
    bottom: "0",
    left: "-10px",
    background: "#fff",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
};

const titleStyle = {
    fontSize: "1.35rem",
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: "10px",
};

const descStyle = {
    fontSize: "0.98rem",
    color: "#6b7280",
    lineHeight: "1.8",
    marginBottom: "18px",
};


const actionBtnStyle = {
    width: "100%",
    border: "none",
    borderRadius: "16px",
    padding: "13px 18px",
    background: "linear-gradient(135deg, #6255f5, #8f84ff)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "0.98rem",
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(98, 85, 245, 0.25)",
};
