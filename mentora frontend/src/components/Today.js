import React from "react";
import {
  CheckCircle2,
  Circle,
  Flame,
  Calendar,
  Sparkles,
  BookOpen,
  Clock,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Today() {
  const { profile, tasks, stats, toggleTask } = useApp();
  const onToggleTask = toggleTask;
  const { readinessScore = 0, streakCount = 0, xpPoints = 0, calendarDate, programStartsTomorrow, upcomingTasksCount } = stats || {};

  const safeProfile =
    profile && typeof profile === "object" ? profile : {};

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const completedCount = safeTasks.filter((t) => t?.completed).length;

  const currentProgress =
    safeTasks.length > 0
      ? Math.round((completedCount / safeTasks.length) * 100)
      : 0;

  const majorText = safeProfile?.major || "عمومی";
  const targetRankText = safeProfile?.targetRank || "ثبت نشده";

  const quote =
    majorText === "ریاضی"
      ? "موفقیت مجموعه‌ای از مسئله‌های کوچکی است که هر روز حل می‌شوند. با تمرکز و استمرار ادامه بده؛ تو از چیزی که فکر می‌کنی قوی‌تری."
      : majorText === "تجربی"
      ? "سلول به سلولِ تلاشت تو را به هدفت نزدیک‌تر می‌کند. امروز با نظم، آرامش و استمرار پیش برو تا نتیجه‌ای درخشان بسازی."
      : majorText === "انسانی"
      ? "پیشرفت بزرگ، حاصل قدم‌های کوچک اما پیوسته است. امروز هم با تمرکز و اعتمادبه‌نفس جلو برو؛ آینده با تلاش تو ساخته می‌شود."
      : "هر قدمی که امروز برمی‌داری، تو را به هدفت نزدیک‌تر می‌کند. با تمرکز، نظم و امید ادامه بده.";

  const handleToggleTask = (task) => {
    if (!onToggleTask || task?.id === undefined || task?.id === null) return;
    onToggleTask(task.id, !task.completed);
  };

  const getCategoryStyles = (category) => {
    switch (category) {
      case "زیست‌شناسی":
        return {
          border: "1px solid #bbf7d0",
          background: "#ecfdf5",
          color: "#059669",
        };
      case "فیزیک":
        return {
          border: "1px solid #bfdbfe",
          background: "#eff6ff",
          color: "#2563eb",
        };
      case "شیمی":
        return {
          border: "1px solid #fecdd3",
          background: "#fff1f2",
          color: "#e11d48",
        };
      case "ریاضی":
        return {
          border: "1px solid #ddd6fe",
          background: "#f5f3ff",
          color: "#7c3aed",
        };
      case "ادبیات":
      case "علوم و فنون":
      case "عربی":
      case "دینی":
      case "فلسفه":
      case "منطق":
      case "تاریخ":
      case "جغرافیا":
        return {
          border: "1px solid #fde68a",
          background: "#fffbeb",
          color: "#b45309",
        };
      default:
        return {
          border: "1px solid #e9d5ff",
          background: "#faf5ff",
          color: "#9333ea",
        };
    }
  };

  return (
    <div
      className="container py-4"
      style={{
        maxWidth: "860px",
        direction: "rtl",
        textAlign: "right",
        fontFamily: "Vazir, Tahoma, Arial, sans-serif",
      }}
    >
      <div className="d-flex flex-column gap-3">
        {/* نوار بالایی */}
        <div
          className="d-flex justify-content-between align-items-center bg-white border shadow-sm"
          style={{
            borderRadius: "20px",
            padding: "16px",
            borderColor: "#f1f3f5",
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <Calendar size={18} color="#6255f5" />
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#374151",
              }}
            >
              {calendarDate || "شنبه ۱۱ خرداد ۱۴۰۵"}
            </span>
          </div>

          <div
            className="d-flex align-items-center gap-2"
            style={{
              background: "#fffbeb",
              padding: "6px 12px",
              borderRadius: "14px",
              border: "1px solid #fde68a",
            }}
          >
            <Flame size={18} color="#f59e0b" fill="#f59e0b" />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 900,
                color: "#b45309",
              }}
            >
              {streakCount} روز پیاپی
            </span>
          </div>
        </div>

        {/* کارت اصلی */}
        <div
          className="position-relative overflow-hidden text-white"
          style={{
            borderRadius: "28px",
            padding: "20px",
            background: "linear-gradient(to left, #6255f5, #4f46e5)",
            boxShadow: "0 10px 30px rgba(79,70,229,0.25)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-24px",
              left: "-24px",
              width: "96px",
              height: "96px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "50%",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: "-32px",
              right: "-32px",
              width: "128px",
              height: "128px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "50%",
            }}
          />

          <div
            className="row align-items-center position-relative"
            style={{ zIndex: 2 }}
          >
            <div className="col-12 col-md-8 mb-3 mb-md-0 text-center text-md-end">
              <span
                className="d-inline-flex align-items-center gap-1"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "10px",
                  fontWeight: 700,
                  backdropFilter: "blur(8px)",
                }}
              >
                <Sparkles size={11} />
                هدف رتبه: {targetRankText}
              </span>

              <h2
                className="fw-bold mt-3 mb-2"
                style={{
                  fontSize: "24px",
                  letterSpacing: "-0.3px",
                }}
              >
                وضعیت آمادگی امروز شما
              </h2>

              <p
                className="mb-0"
                style={{
                  fontSize: "11px",
                  color: "#e0e7ff",
                  lineHeight: "1.9",
                }}
              >
                با انجام کارهای امروز، قدم‌به‌قدم به هدف خود نزدیک‌تر می‌شوید.
              </p>
            </div>

            <div className="col-12 col-md-4 d-flex justify-content-center justify-content-md-start">
              <div
                className="d-flex flex-column align-items-center justify-content-center"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  padding: "18px",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  minWidth: "120px",
                  backdropFilter: "blur(10px)",
                }}
              >
                <span style={{ fontSize: "32px", fontWeight: 900 }}>
                  {currentProgress}٪
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    marginTop: "4px",
                    color: "#ede9fe",
                  }}
                >
                  پیشرفت امروز
                </span>
              </div>
            </div>
          </div>

          <div
            className="mt-4"
            style={{
              height: "8px",
              width: "100%",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${currentProgress}%`,
                height: "100%",
                background: "#fbbf24",
                borderRadius: "999px",
                transition: "all 0.5s ease",
              }}
            />
          </div>

          <div
            className="d-flex justify-content-between align-items-center mt-3"
            style={{
              fontSize: "11px",
              color: "#ddd6fe",
              fontWeight: 500,
            }}
          >
            <span>امتیاز امروز: {xpPoints}</span>
            <span>
              {completedCount} از {safeTasks.length} کار انجام شده
            </span>
          </div>
        </div>

        {/* مشاوره روزانه */}
        <div
          className="text-end"
          style={{
            background: "rgba(98,85,245,0.05)",
            border: "1px solid rgba(98,85,245,0.15)",
            borderRadius: "20px",
            padding: "16px",
          }}
        >
          <h3
            className="d-flex align-items-center gap-2 mb-2"
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#6255f5",
            }}
          >
            <Sparkles size={13} />
            پیشنهاد روزانه منتورا برای رشته {majorText}
          </h3>

          <p
            className="mb-0"
            style={{
              fontSize: "12px",
              color: "#374151",
              lineHeight: "1.9",
              fontWeight: 300,
            }}
          >
            {quote}
          </p>
        </div>

        {/* کارت خلاصه */}
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div
              className="bg-white h-100"
              style={{
                borderRadius: "20px",
                padding: "16px",
                border: "1px solid #eef2f7",
                boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
              }}
            >
              <div
                className="d-flex align-items-center gap-2 mb-2"
                style={{ color: "#6255f5", fontWeight: 700, fontSize: "12px" }}
              >
                <Sparkles size={15} />
                آمادگی ذهنی
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#111827",
                }}
              >
                {readinessScore}
              </div>
              <div style={{ fontSize: "11px", color: "#6b7280" }}>
                امتیاز آمادگی امروز
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div
              className="bg-white h-100"
              style={{
                borderRadius: "20px",
                padding: "16px",
                border: "1px solid #eef2f7",
                boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
              }}
            >
              <div
                className="d-flex align-items-center gap-2 mb-2"
                style={{ color: "#10b981", fontWeight: 700, fontSize: "12px" }}
              >
                <CheckCircle2 size={15} />
                کارهای تکمیل‌شده
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#111827",
                }}
              >
                {completedCount}
              </div>
              <div style={{ fontSize: "11px", color: "#6b7280" }}>
                تعداد کارهای انجام‌شده
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div
              className="bg-white h-100"
              style={{
                borderRadius: "20px",
                padding: "16px",
                border: "1px solid #eef2f7",
                boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
              }}
            >
              <div
                className="d-flex align-items-center gap-2 mb-2"
                style={{ color: "#f59e0b", fontWeight: 700, fontSize: "12px" }}
              >
                <Clock size={15} />
                کارهای باقی‌مانده
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#111827",
                }}
              >
                {safeTasks.length - completedCount}
              </div>
              <div style={{ fontSize: "11px", color: "#6b7280" }}>
                تعداد کارهای ناتمام
              </div>
            </div>
          </div>
        </div>

        {/* فهرست کارهای امروز */}
        <div>
          <h3
            className="d-flex align-items-center gap-2 mb-3 px-1"
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#1f2937",
            }}
          >
            <BookOpen size={16} color="#6255f5" />
            برنامه امروز شما
          </h3>

          {safeTasks.length === 0 ? (
            <div
              className="bg-white text-center"
              style={{
                border: "1px dashed #d1d5db",
                borderRadius: "20px",
                padding: "32px",
                color: "#9ca3af",
                fontSize: "12px",
              }}
            >
              {programStartsTomorrow
                ? `برنامه هفتگی شما از فردا شروع می‌شود. ${upcomingTasksCount || ""} تسک برای فردا آماده است.`
                : "هنوز کاری برای امروز ثبت نشده است. از بخش برنامه‌ریز، برنامه هفتگی بگیرید."}
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {safeTasks.map((task, index) => {
                const categoryStyles = getCategoryStyles(task?.category);

                return (
                  <div
                    key={task?.id ?? index}
                    onClick={() => handleToggleTask(task)}
                    className="d-flex justify-content-between align-items-center"
                    style={{
                      padding: "16px",
                      borderRadius: "20px",
                      cursor: onToggleTask ? "pointer" : "default",
                      transition: "all 0.2s ease",
                      border: task?.completed
                        ? "1px solid #bbf7d0"
                        : "1px solid #f1f3f5",
                      background: task?.completed ? "#ecfdf5" : "#ffffff",
                      color: task?.completed ? "#6b7280" : "#1f2937",
                      boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      {task?.completed ? (
                        <CheckCircle2 size={20} color="#10b981" />
                      ) : (
                        <Circle size={20} color="#d1d5db" />
                      )}

                      <div className="d-flex flex-column text-end">
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            textDecoration: task?.completed
                              ? "line-through"
                              : "none",
                            color: task?.completed ? "#9ca3af" : "#1f2937",
                          }}
                        >
                          {task?.title || "بدون عنوان"}
                        </span>

                        <span
                          className="d-flex align-items-center gap-1 mt-1"
                          style={{
                            fontSize: "10px",
                            color: "#9ca3af",
                            fontWeight: 500,
                          }}
                        >
                          <Clock size={11} />
                          {task?.duration || "زمان مشخص نشده"}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "4px 8px",
                        borderRadius: "8px",
                        ...categoryStyles,
                      }}
                    >
                      {task?.category || "عمومی"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* بخش تمرکز */}
        <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
          style={{
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: "20px",
            padding: "16px",
          }}
        >
          <div className="text-center text-md-end">
            <h4
              className="mb-1"
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#92400e",
              }}
            >
              حالت تمرکز عمیق
            </h4>
            <p
              className="mb-0"
              style={{
                fontSize: "11px",
                color: "rgba(146,64,14,0.85)",
                lineHeight: "1.9",
                fontWeight: 300,
              }}
            >
              یک بازه ۲۵ دقیقه‌ای مطالعه عمیق را شروع کنید و با تمرکز کامل
              پیش بروید.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              alert("قابلیت تایمر تمرکز به‌زودی به منتورا اضافه می‌شود.");
            }}
            className="btn text-white fw-bold"
            style={{
              background: "#d97706",
              borderRadius: "14px",
              fontSize: "11px",
              padding: "8px 16px",
              border: "none",
            }}
          >
            شروع تایمر
          </button>
        </div>
      </div>
    </div>
  );
}
