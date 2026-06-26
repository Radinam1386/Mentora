import React from "react";
import { BookOpen, Target, Sparkles } from "lucide-react";

export default function StudyLoading(props) {
    const {
        title = "در حال بارگذاری...",
        subtitle = "لطفاً کمی صبر کنید",
        fullScreen = true,
    } = props;

    return (
        <div
            style={{
                ...wrapperStyle,
                minHeight: fullScreen ? "100vh" : "320px",
            }}
        >
            <div style={cardStyle}>
                <div style={iconWrapperStyle}>
                    <div style={pulseRingStyle} />
                    <div style={mainIconStyle}>
                        <BookOpen size={30} />
                    </div>
                </div>

                <div style={floatingIconOne}>
                    <Target size={18} />
                </div>

                <div style={floatingIconTwo}>
                    <Sparkles size={18} />
                </div>

                <h2 style={titleStyle}>{title}</h2>
                <p style={subtitleStyle}>{subtitle}</p>

                <div style={barsWrapperStyle}>
                    <div style={{ ...barStyle, animationDelay: "0s" }} />
                    <div style={{ ...barStyle, animationDelay: "0.15s" }} />
                    <div style={{ ...barStyle, animationDelay: "0.3s" }} />
                    <div style={{ ...barStyle, animationDelay: "0.45s" }} />
                    <div style={{ ...barStyle, animationDelay: "0.6s" }} />
                </div>

                <div style={dotsStyle}>
                    <span style={{ ...dotStyle, animationDelay: "0s" }} />
                    <span style={{ ...dotStyle, animationDelay: "0.2s" }} />
                    <span style={{ ...dotStyle, animationDelay: "0.4s" }} />
                </div>

                <div style={hintStyle}>منتورا در حال چیدن مسیر موفقیت تو است</div>
            </div>

            <style>
                {`
          @keyframes studyBounce {
            0%, 100% { transform: scaleY(0.45); opacity: 0.5; }
            50% { transform: scaleY(1); opacity: 1; }
          }

          @keyframes studyPulse {
            0% {
              transform: scale(0.9);
              opacity: 0.5;
            }
            70% {
              transform: scale(1.4);
              opacity: 0;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }

          @keyframes studyFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }

          @keyframes studyDots {
            0%, 80%, 100% {
              transform: scale(0.7);
              opacity: 0.4;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
            </style>
        </div>
    );
}

const wrapperStyle = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    direction: "rtl",
    fontFamily: "Vazir, Tahoma",
    background:
        "radial-gradient(circle at top, rgba(98,85,245,0.12), transparent 35%), #f8f7ff",
};

const cardStyle = {
    width: "100%",
    maxWidth: "460px",
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(98,85,245,0.12)",
    borderRadius: "28px",
    boxShadow: "0 18px 60px rgba(98,85,245,0.14)",
    padding: "36px 24px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
};

const iconWrapperStyle = {
    position: "relative",
    width: "90px",
    height: "90px",
    margin: "0 auto 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const pulseRingStyle = {
    position: "absolute",
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    border: "2px solid rgba(98,85,245,0.22)",
    animation: "studyPulse 2s infinite",
};

const mainIconStyle = {
    width: "72px",
    height: "72px",
    borderRadius: "22px",
    background: "linear-gradient(135deg, #6255f5, #8f84ff)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 30px rgba(98,85,245,0.35)",
    zIndex: 2,
};

const floatingIconOne = {
    position: "absolute",
    top: "22px",
    right: "22px",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#f3f1ff",
    color: "#6255f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "studyFloat 2.6s ease-in-out infinite",
};

const floatingIconTwo = {
    position: "absolute",
    top: "72px",
    left: "24px",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#f3f1ff",
    color: "#6255f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "studyFloat 2.8s ease-in-out infinite",
};

const titleStyle = {
    fontSize: "1.4rem",
    fontWeight: 800,
    color: "#2b2b2b",
    marginBottom: "8px",
};

const subtitleStyle = {
    fontSize: "0.95rem",
    color: "#6b7280",
    marginBottom: "24px",
};

const barsWrapperStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: "8px",
    height: "52px",
    marginBottom: "20px",
};

const barStyle = {
    width: "10px",
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(to top, #6255f5, #b4adff)",
    transformOrigin: "bottom",
    animation: "studyBounce 1s ease-in-out infinite",
};

const dotsStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "16px",
};

const dotStyle = {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#6255f5",
    display: "inline-block",
    animation: "studyDots 1.2s infinite ease-in-out",
};

const hintStyle = {
    fontSize: "0.88rem",
    color: "#7c7c90",
    fontWeight: 500,
};
