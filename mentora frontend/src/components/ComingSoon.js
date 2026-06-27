import React from 'react';

const ComingSoon = () => {
    return (
        <div
            className="d-flex flex-column align-items-center justify-content-center"
            style={{
                textAlign: "center",
                fontFamily: "Vazir ,Tahoma, Arial, sans-serif",
                maxWidth: "1200px",
            }}
        >
            <div
                className="bg-white shadow-sm p-4 p-md-5"
                style={{
                    borderRadius: "32px",
                    border: "1px solid #eef2f7"
                }}
            >
                <div
                    className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                    style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "24px",
                        background: "linear-gradient(135deg, #6255f5, #4f46e5)",
                        color: "#fff",
                        fontSize: "32px"
                    }}
                >
                    🚀
                </div>

                <h1 style={{ fontWeight: 900, color: "#111827", marginBottom: "16px" }}>
                    کامینگ سووون!
                </h1>

                <p style={{ color: "#6b7280", fontSize: "16px", marginBottom: "32px", lineHeight: "1.6" }}>
                    ما در حال آماده‌سازی یک تجربه جدید برای شما هستیم.
                    این بخش به‌زودی با قابلیت‌های هیجان‌انگیز در دسترس قرار خواهد گرفت.
                </p>

                <button
                    onClick={() => window.history.back()}
                    style={{
                        background: "#4f46e5",
                        color: "#fff",
                        border: "none",
                        padding: "12px 32px",
                        borderRadius: "16px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.background = "#4338ca"}
                    onMouseOut={(e) => e.target.style.background = "#4f46e5"}
                >
                    بازگشت
                </button>
            </div>
        </div>
    );
};

export default ComingSoon;
