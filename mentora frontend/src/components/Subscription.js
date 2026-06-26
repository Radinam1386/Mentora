import React from "react";
import { Link } from "react-router-dom";
import {
  Crown,
  CalendarDays,
  BadgeCheck,
  Clock3,
  ArrowLeft,
} from "lucide-react";

export default function Subscription() {
  // بعداً می‌تونی این داده رو از API بگیری
  const subscription = {
    active: true,
    planName: "پلن طلایی",
    totalDays: 30,
    remainingDays: 12,
    startDate: "1405/03/01",
    endDate: "1405/04/01",
    price: "300,000 تومان",
  };

  const usedDays = subscription.totalDays - subscription.remainingDays;
  const usedPercent = Math.min(
    100,
    Math.round((usedDays / subscription.totalDays) * 100)
  );
  const remainingPercent = 100 - usedPercent;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8f7ff 0%, #ffffff 35%, #ffffff 100%)",
        padding: "24px",
        direction: "rtl",
        fontFamily: "Vazir, Tahoma, sans-serif",
      }}
    >
      <div className="container">
        {/* Header */}
        <div
          className="mb-4"
          style={{
            background: "linear-gradient(135deg, #6255f5, #4f46e5)",
            borderRadius: "28px",
            padding: "28px",
            color: "#fff",
            boxShadow: "0 20px 60px rgba(98,85,245,0.18)",
          }}
        >
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <div style={{ opacity: 0.9, fontSize: "14px", marginBottom: "8px" }}>
                وضعیت اشتراک شما
              </div>
              <h2 style={{ margin: 0, fontWeight: 900 }}>{subscription.planName}</h2>
              <div style={{ marginTop: "10px", fontSize: "14px", opacity: 0.92 }}>
                مدیریت وضعیت، زمان باقی‌مانده و جزئیات پلن
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: "20px",
                padding: "14px 18px",
                minWidth: "180px",
              }}
            >
              <div style={{ fontSize: "13px", opacity: 0.9 }}>باقی‌مانده اشتراک</div>
              <div style={{ fontSize: "30px", fontWeight: 900, marginTop: "6px" }}>
                {subscription.remainingDays} روز
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div
              style={{
                background: "#fff",
                borderRadius: "24px",
                padding: "24px",
                border: "1px solid #ede9fe",
                boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-3">
                <Crown size={20} color="#6255f5" />
                <h5 style={{ margin: 0, fontWeight: 800, color: "#2a1f68" }}>
                  جزئیات مصرف اشتراک
                </h5>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: "#6b7280", fontSize: "14px" }}>درصد مصرف‌شده</span>
                  <span style={{ color: "#111827", fontWeight: 800 }}>{usedPercent}%</span>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: "14px",
                    background: "#ede9fe",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${usedPercent}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #6255f5, #8b5cf6)",
                      borderRadius: "999px",
                      transition: "width .4s ease",
                    }}
                  />
                </div>
              </div>

              <div className="row g-3 mt-1">
                <div className="col-12 col-sm-6">
                  <div
                    style={{
                      background: "#fafaff",
                      border: "1px solid #ede9fe",
                      borderRadius: "18px",
                      padding: "16px",
                    }}
                  >
                    <div style={{ color: "#6b7280", fontSize: "13px" }}>روزهای استفاده‌شده</div>
                    <div style={{ marginTop: "8px", fontSize: "24px", fontWeight: 900, color: "#111827" }}>
                      {usedDays} روز
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div
                    style={{
                      background: "#fafaff",
                      border: "1px solid #ede9fe",
                      borderRadius: "18px",
                      padding: "16px",
                    }}
                  >
                    <div style={{ color: "#6b7280", fontSize: "13px" }}>روزهای باقی‌مانده</div>
                    <div style={{ marginTop: "8px", fontSize: "24px", fontWeight: 900, color: "#6255f5" }}>
                      {subscription.remainingDays} روز
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3 mt-1">
                <div className="col-12 col-sm-6">
                  <div
                    style={{
                      background: "#fafaff",
                      border: "1px solid #ede9fe",
                      borderRadius: "18px",
                      padding: "16px",
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <CalendarDays size={16} color="#6255f5" />
                      <span style={{ fontSize: "13px", color: "#6b7280" }}>تاریخ شروع</span>
                    </div>
                    <div style={{ fontWeight: 800, color: "#111827" }}>
                      {subscription.startDate}
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div
                    style={{
                      background: "#fafaff",
                      border: "1px solid #ede9fe",
                      borderRadius: "18px",
                      padding: "16px",
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Clock3 size={16} color="#6255f5" />
                      <span style={{ fontSize: "13px", color: "#6b7280" }}>تاریخ پایان</span>
                    </div>
                    <div style={{ fontWeight: 800, color: "#111827" }}>
                      {subscription.endDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div
              style={{
                background: "#fff",
                borderRadius: "24px",
                padding: "24px",
                border: "1px solid #ede9fe",
                boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
                height: "100%",
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-3">
                <BadgeCheck size={20} color="#16a34a" />
                <h5 style={{ margin: 0, fontWeight: 800, color: "#2a1f68" }}>
                  وضعیت پلن
                </h5>
              </div>

              <div
                style={{
                  background: "#ecfdf5",
                  color: "#15803d",
                  border: "1px solid #bbf7d0",
                  borderRadius: "16px",
                  padding: "12px 14px",
                  fontWeight: 800,
                  textAlign: "center",
                  marginBottom: "16px",
                }}
              >
                اشتراک فعال است
              </div>

              <div className="d-flex flex-column gap-3">
                <div
                  style={{
                    background: "#fafaff",
                    borderRadius: "16px",
                    padding: "14px",
                    border: "1px solid #ede9fe",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>نام پلن</div>
                  <div style={{ marginTop: "6px", fontWeight: 900, color: "#111827" }}>
                    {subscription.planName}
                  </div>
                </div>

                <div
                  style={{
                    background: "#fafaff",
                    borderRadius: "16px",
                    padding: "14px",
                    border: "1px solid #ede9fe",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>هزینه پلن</div>
                  <div style={{ marginTop: "6px", fontWeight: 900, color: "#111827" }}>
                    {subscription.price}
                  </div>
                </div>

                <div
                  style={{
                    background: "#fafaff",
                    borderRadius: "16px",
                    padding: "14px",
                    border: "1px solid #ede9fe",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>درصد باقی‌مانده</div>
                  <div style={{ marginTop: "6px", fontWeight: 900, color: "#6255f5" }}>
                    {remainingPercent}%
                  </div>
                </div>
              </div>

              <Link
                to="/subscriptionplans"
                className="d-inline-flex align-items-center justify-content-center gap-2 mt-4"
                style={{
                  width: "100%",
                  textDecoration: "none",
                  background: "linear-gradient(90deg, #6255f5, #4f46e5)",
                  color: "#fff",
                  padding: "14px",
                  borderRadius: "16px",
                  fontWeight: 800,
                }}
              >
                تمدید یا ارتقای اشتراک
                <ArrowLeft size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
