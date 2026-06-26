import React from "react";
import {
  Sparkles,
  BookOpen,
  Brain,
  CalendarDays,
  Target,
  Flame,
  ArrowLeft,
  CheckCircle2,
  MessageCircleMore,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Home({
  profile: profileProp,
}) {
  const { profile: contextProfile, tasks, stats } = useApp();
  const profile = profileProp || contextProfile;
  const safeProfile =
    profile && typeof profile === "object" ? profile : {};
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const completedCount = safeTasks.filter((task) => task?.completed).length;

  const studentName = safeProfile.name || "دانش‌آموز عزیز";
  const major = safeProfile.major || "عمومی";
  const targetRank = safeProfile.targetRank || "ثبت نشده";
  const streak = stats?.streakCount ?? 0;
  const todayProgress =
    safeTasks.length > 0
      ? Math.round((completedCount / safeTasks.length) * 100)
      : stats?.todayProgress ?? 0;

  const features = [
    {
      title: "برنامه امروز",
      desc: "کارهای امروزت را ببین، تیک بزن و میزان پیشرفتت را لحظه‌ای دنبال کن.",
      icon: <CheckCircle2 size={20} />,
      color: "#10b981",
      bg: "#ecfdf5",
      border: "#bbf7d0",
      buttonText: "مشاهده برنامه امروز",
      ref: '/today',
    },
    {
      title: "دستیار برنامه‌ریزی",
      desc: "با توجه به شرایط، ساعت مطالعه و هدفت، برنامه هفتگی شخصی‌سازی‌شده بگیر.",
      icon: <CalendarDays size={20} />,
      color: "#6255f5",
      bg: "#eef2ff",
      border: "#c7d2fe",
      buttonText: "ساخت برنامه",
      ref: '/planningassistant',

    },
    {
      title: "مربی هوشمند",
      desc: "سوالات درسی، تستی و مفهومی‌ات را بپرس و پاسخ مرحله‌به‌مرحله بگیر.",
      icon: <MessageCircleMore size={20} />,
      color: "#f59e0b",
      bg: "#fffbeb",
      border: "#fde68a",
      buttonText: "رفتن به مربی",
      ref: '/tutor ',

    },
    {
      title: "گزارش عملکرد",
      desc: "پیشرفت، استمرار، کیفیت مطالعه و وضعیت کلی عملکردت را بررسی کن.",
      icon: <BarChart3 size={20} />,
      color: "#ef4444",
      bg: "#fef2f2",
      border: "#fecaca",
      buttonText: "دیدن گزارش‌ها",
      ref: '/reports',

    },
  ];

  const quickStats = [
    {
      title: "رشته",
      value: major,
      icon: <BookOpen size={18} />,
      color: "#6255f5",
      bg: "rgba(98,85,245,0.1)",
    },
    {
      title: "هدف رتبه",
      value: targetRank,
      icon: <Target size={18} />,
      color: "#0f766e",
      bg: "rgba(20,184,166,0.12)",
    },
    {
      title: "استمرار",
      value: `${streak} روز`,
      icon: <Flame size={18} />,
      color: "#d97706",
      bg: "rgba(245,158,11,0.12)",
    },
    {
      title: "پیشرفت امروز",
      value: `${todayProgress}٪`,
      icon: <Brain size={18} />,
      color: "#7c3aed",
      bg: "rgba(168,85,247,0.12)",
    },
  ];

  return (
    <div
      className="container py-4"
      style={{
        maxWidth: "1200px",
        direction: "rtl",
        textAlign: "right",
        fontFamily: "Vazir, Tahoma, Arial, sans-serif",
      }}
    >
      <div className="d-flex flex-column gap-4">
        <header
          className="position-relative overflow-hidden text-white"
          style={{
            borderRadius: "28px",
            padding: "24px",
            background: "linear-gradient(to left, #6255f5, #4f46e5)",
            boxShadow: "0 10px 30px rgba(79,70,229,0.25)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-30px",
              left: "-20px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-40px",
              right: "-30px",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
            }}
          />

          <div className="row align-items-center position-relative" style={{ zIndex: 2 }}>
            <div className="col-12 col-lg-8 mb-4 mb-lg-0">
              <h
                className="d-inline-flex align-items-center gap-2"
                style={{
                  background: "rgba(255,255,255,0.14)",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                <Sparkles size={14} />
                خوش اومدی به منتورا
              </h>

              <h1
                className="fw-bold mt-3 mb-2"
                style={{
                  fontSize: "30px",
                  lineHeight: "1.8",
                }}
              >
                سلام {studentName} 👋
              </h1>

              <article
                className="mb-0"
                style={{
                  fontSize: "13px",
                  color: "#e0e7ff",
                  lineHeight: "2",
                  maxWidth: "700px",
                }}
              >
                اینجا مرکز فرماندهی مطالعه و برنامه‌ریزی درسی توست. از برنامه روزانه و هفتگی گرفته تا مربی هوشمند، تحلیل عملکرد و پیگیری استمرار — همه‌چیز یکجا برای رسیدن به هدفت آماده است.

              </article>

              <div className="d-flex flex-wrap gap-2 mt-4">
                <Link
                  type="button"
                  className="btn text-white fw-bold"
                  to='/today'
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    borderRadius: "14px",
                    padding: "10px 16px",
                    fontSize: "12px",
                    backdropFilter: "blur(8px)",
                  }}
                  aria-label="مشاهده برنامه مطالعه امروز"
                >
                  شروع از برنامه امروز
                </Link>

                <Link
                  type="button"
                  className="btn fw-bold"
                  to="/tutor"
                  style={{
                    background: "#ffffff",
                    color: "#4f46e5",
                    borderRadius: "14px",
                    padding: "10px 16px",
                    fontSize: "12px",
                    border: "none",
                  }}
                  aria-label="پرسیدن سوال درسی از مربی هوشمند"

                >
                  پرسیدن سوال از مربی
                </Link>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: "24px",
                  padding: "18px",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  className="d-flex justify-content-between align-items-center mb-2"
                  style={{ fontSize: "12px", color: "#e9e7ff" }}
                >
                  <span>پیشرفت امروز</span>
                  <span className="fw-bold">{todayProgress}٪</span>
                </div>

                <div
                  style={{
                    height: "10px",
                    background: "rgba(255,255,255,0.16)",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${todayProgress}%`,
                      height: "100%",
                      background: "#fbbf24",
                      borderRadius: "999px",
                    }}
                  />
                </div>

                <div
                  className="mt-3 d-flex justify-content-between"
                  style={{ fontSize: "11px", color: "#ddd6fe" }}
                >
                  <span>رشته: {major}</span>
                  <span>هدف رتبه: {targetRank}</span>
                </div>

                <div
                  className="mt-3"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    padding: "12px",
                    fontSize: "11px",
                    color: "#f5f3ff",
                    lineHeight: "1.9",
                  }}
                >
                  با همین استمرار ادامه بده؛ امروز می‌تواند یکی از روزهای مهم
                  مسیر موفقیتت باشد.
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="row g-3">
          {quickStats.map((item, index) => (
            <div className="col-12 col-sm-6 col-lg-3 " key={index}>
              <div
                className="bg-white h-100"
                style={{
                  borderRadius: "22px",
                  padding: "16px",
                  border: "1px solid #eef2f7",
                  boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "14px",
                    background: item.bg,
                    color: item.color,
                  }}
                >
                  {item.icon}
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    marginBottom: "6px",
                  }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 900,
                    color: "#111827",
                  }}
                >
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>
        <section aria-labelledby="mentora-features">
          <div className="d-flex align-items-center justify-content-between mb-3 px-1">
            <h2
              className="mb-0"
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#1f2937",
              }}
            >
              امکانات اصلی منتورا
            </h2>

            <span
              style={{
                fontSize: "11px",
                color: "#9ca3af",
                fontWeight: 500,
              }}
            >
              همه‌چیز برای یک مطالعه هدفمند
            </span>
          </div>

          <div className="row g-3">
            {features.map((item, index) => (
              <div className="col-12 col-md-6" key={index}>
                <div
                  className="bg-white h-100 d-flex flex-column justify-content-between"
                  style={{
                    borderRadius: "24px",
                    padding: "18px",
                    border: "1px solid #eef2f7",
                    boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
                  }}
                >
                  <div>
                    <div
                      className="d-inline-flex align-items-center justify-content-center mb-3"
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "16px",
                        background: item.bg,
                        color: item.color,
                        border: `1px solid ${item.border}`,
                      }}
                    >
                      {item.icon}
                    </div>

                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: 800,
                        color: "#111827",
                        marginBottom: "8px",
                      }}
                    >
                      {item.title}
                    </h3>

                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        lineHeight: "1.95",
                        marginBottom: "0",
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4">
                    <Link
                      type="button"
                      to={item.ref}
                      className="btn d-inline-flex align-items-center gap-2 fw-bold"
                      style={{
                        background: item.bg,
                        color: item.color,
                        border: `1px solid ${item.border}`,
                        borderRadius: "14px",
                        fontSize: "12px",
                        padding: "10px 14px",
                      }}
                    >
                      {item.buttonText}
                      <ArrowLeft size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div
          style={{
            background: "rgba(98,85,245,0.05)",
            border: "1px solid rgba(98,85,245,0.14)",
            borderRadius: "24px",
            padding: "18px",
          }}
        >
          <h3
            className="d-flex align-items-center gap-2 mb-2"
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "#6255f5",
            }}
          >
            <Sparkles size={16} />
            پیام امروز منتورا
          </h3>

          <article
            className="mb-0"
            style={{
              fontSize: "12px",
              color: "#374151",
              lineHeight: "2",
            }}
            aria-label="پیام انگیزشی امروز"

          >
            لازم نیست همه‌چیز را یک‌باره کامل انجام بدهی. کافی است امروز، فقط
            قدم بعدی درست را برداری. استمرار تو، مهم‌تر از هیجان مقطعی است.
          </article>
        </div>
      </div>
    </div>
  );
}