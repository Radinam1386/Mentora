import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Book,
  Sparkles,
  Award,
} from "lucide-react";

import { apiJson } from "../utils/api";

const toFa = (value) =>
  String(value).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

export default function Reports() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchReports = async () => {
      try {
        const { response, data } = await apiJson("/api/reports");
        if (response.ok) {
          if (active) setReport(data);
        }
      } catch (err) {
        console.error("خطا در دریافت گزارش‌ها:", err);
      }
    };
    fetchReports();
    return () => {
      active = false;
    };
  }, []);

  const topics = report?.topics || [];
  const primaryWeakness =
    report?.primaryWeakness ||
    topics.find((t) => t.level === "ضعف جدی")?.name ||
    "مشتق کسرها";
  const averageAccuracy = report?.averageAccuracy ?? 76;
  const accuracyGrowth = report?.accuracyGrowth ?? 12;
  const weeklyStudyHours = report?.weeklyStudyHours ?? 28;

  return (
    <div
      className="container py-4"
      style={{
        maxWidth: "1200px",
        direction: "rtl",
        fontFamily: "Vazir, Tahoma, Arial, sans-serif",
      }}
    >
      <div className="d-flex flex-column gap-3">
        <div
          className="bg-white border shadow-sm text-end"
          style={{
            borderRadius: "28px",
            padding: "20px",
            borderColor: "#f1f3f5",
          }}
        >
          <h2
            className="d-flex align-items-center justify-content-start gap-2 fw-bold text-dark mb-4"
            style={{ fontSize: "14px" }}
          >
            روند وضعیت تحصیلی شما
            <TrendingUp size={16} color="#6255f5" />
          </h2>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.16)",
                  borderRadius: "20px",
                  padding: "16px",
                }}
              >
                <span
                  className="d-block fw-bold"
                  style={{ fontSize: "10px", color: "#059669" }}
                >
                  میانگین صحت پاسخ
                </span>
                <span
                  className="d-block"
                  style={{
                    fontSize: "28px",
                    fontWeight: 900,
                    color: "#047857",
                    marginTop: "4px",
                  }}
                >
                  {toFa(averageAccuracy)}٪
                </span>
                <span
                  className="d-block"
                  style={{
                    fontSize: "10px",
                    color: "#059669",
                    marginTop: "2px",
                    fontWeight: 500,
                  }}
                >
                  {toFa(accuracyGrowth)}٪ رشد نسبت به هفته قبل
                </span>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div
                style={{
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.16)",
                  borderRadius: "20px",
                  padding: "16px",
                }}
              >
                <span
                  className="d-block fw-bold"
                  style={{ fontSize: "10px", color: "#4f46e5" }}
                >
                  ساعات مطالعه کل هفته
                </span>
                <span
                  className="d-block"
                  style={{
                    fontSize: "28px",
                    fontWeight: 900,
                    color: "#4338ca",
                    marginTop: "4px",
                  }}
                >
                  {toFa(weeklyStudyHours)} ساعت
                </span>
                <span
                  className="d-block"
                  style={{
                    fontSize: "10px",
                    color: "#4f46e5",
                    marginTop: "2px",
                    fontWeight: 500,
                  }}
                >
                  مطابق با استانداردهای هدف
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="bg-white border shadow-sm text-end"
          style={{
            borderRadius: "28px",
            padding: "20px",
            borderColor: "#f1f3f5",
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <h3
              className="d-flex align-items-center gap-2 fw-bold text-dark mb-0"
              style={{ fontSize: "12px" }}
            >
              تخمین پایداری مباحث تحصیلی
              <Book size={15} color="#6255f5" />
            </h3>
            <div
              className="d-flex gap-3 flex-wrap"
              style={{ fontSize: "10px", fontWeight: 700 }}
            >
              <span className="d-flex align-items-center gap-1">
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#10b981",
                    display: "inline-block",
                  }}
                ></span>
                عالی
              </span>

              <span className="d-flex align-items-center gap-1">
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#fbbf24",
                    display: "inline-block",
                  }}
                ></span>
                مرور
              </span>

              <span className="d-flex align-items-center gap-1">
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#f43f5e",
                    display: "inline-block",
                  }}
                ></span>
                ضعف
              </span>
            </div>

          </div>

          <div className="row g-4">
            {topics.map((t, idx) => (
              <div className="col-12 col-md-6" key={idx}>
                <div>
                  <div
                    className="d-flex justify-content-between align-items-center mb-2"
                    style={{ fontSize: "12px" }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#6b7280",
                      }}
                    >
                      {t.percent}% آمادگی
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#1f2937",
                      }}
                    >
                      {t.name}
                    </span>
                  </div>

                  <div
                    style={{
                      height: "10px",
                      width: "100%",
                      background: "#f3f4f6",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${t.percent}%`,
                        background: t.color,
                        borderRadius: "999px",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="d-flex gap-3 text-end"
          style={{
            background: "#fff1f2",
            border: "1px solid #fecdd3",
            borderRadius: "28px",
            padding: "18px",
          }}
        >
          <div style={{ color: "#e11d48", paddingTop: "2px" }} className=" d-flex align-itens-center justify-content-center ">
            <AlertTriangle size={50} />
          </div>

          <div className="flex-grow-1">
            <h4
              className="d-flex align-items-center justify-content-start gap-2 fw-bold mb-2"
              style={{
                fontSize: "12px",
                color: "#9f1239",
              }}
            >
              <Sparkles size={12} />
              توصیه فوری هوش مصنوعی منتورا
            </h4>

            <p
              className="mb-0"
              style={{
                fontSize: "11px",
                color: "#be123c",
                lineHeight: "1.9",
                fontWeight: 300,
              }}
            >
              بنابر نتایج تست‌های اخیر، مبحث{" "}
              <strong style={{ fontWeight: 700 }}>
                «{primaryWeakness}»
              </strong>{" "}
              نیازمند بالاترین اقدام فوری است. پیشنهاد می‌کنیم فردا علاوه بر
              برنامه روتین، حداقل ۱۰ دقیقه گلسبرگ یا خلاصه فرمول مشتق را مرور
              کنید یا از بخش منتورا کمک بگیرید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}