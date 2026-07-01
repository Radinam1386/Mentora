import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  Clock,
  RotateCcw,
  Sparkles,
  Target,
  TimerReset,
  Wand2,
  Clock10Icon
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { apiJson } from "../utils/api";
import StudyLoading from "./StudyLoading";

const DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

const defaultCourseInput = () => ({
  student_weakness: 3,
  target_importance: 4,
  interest: 3,
  backlog_hours: 0,
  last_test_percent: 50,
  notes: "",
});

export default function PlanningAssistant() {
  const { profile, latestWeeklyPlan, refresh, loadMe, loading: globalLoading } = useApp();

  const [studentName, setStudentName] = useState("دانش‌آموز منتورا");
  const [grade, setGrade] = useState((profile && profile.grade) || "دوازدهم");
  const [major, setMajor] = useState((profile && profile.major) || "تجربی");
  const [examYear, setExamYear] = useState("۱۴۰۵");
  const [goal, setGoal] = useState(
    profile && profile.targetRank
      ? `رسیدن به رتبه ${profile.targetRank}`
      : "افزایش تراز و اجرای منظم برنامه"
  );
  const [dailyHours, setDailyHours] = useState(
    Object.fromEntries(DAYS.map((day) => [day, (profile && profile.studyHours) || 6]))
  );
  const [preferredSessionMinutes, setPreferredSessionMinutes] = useState(90);
  const [restMinutes, setRestMinutes] = useState(15);
  const [constraints, setConstraints] = useState("جمعه سبک‌تر باشد");
  const [catalog, setCatalog] = useState([]);
  const [courses, setCourses] = useState({});
  const [plan, setPlan] = useState(null);
  const [creatingNewPlan, setCreatingNewPlan] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [initializedFromProfile, setInitializedFromProfile] = useState(false);
  const [initializedLatestPlan, setInitializedLatestPlan] = useState(false);

  const weeklyHours = useMemo(() => {
    return Object.values(dailyHours).reduce((sum, value) => sum + Number(value || 0), 0);
  }, [dailyHours]);

  useEffect(() => {
    if (!profile || initializedFromProfile) {
      return;
    }

    setStudentName(profile.name || "دانش‌آموز منتورا");
    setGrade(profile.grade || "دوازدهم");
    setMajor(profile.major || "تجربی");
    setExamYear(profile.examYear || "۱۴۰۵");
    setGoal(
      profile.targetRank
        ? `رسیدن به رتبه ${profile.targetRank}`
        : "افزایش تراز و اجرای منظم برنامه"
    );

    const defaultStudyHours = Number(profile.studyHours) || 6;
    setDailyHours(Object.fromEntries(DAYS.map((day) => [day, defaultStudyHours])));

    setInitializedFromProfile(true);
  }, [profile, initializedFromProfile]);

  useEffect(() => {
    const loadLatestPlan = async () => {
      if (latestWeeklyPlan || initializedLatestPlan) {
        return;
      }

      if (loadMe) {
        await loadMe();
      }
      setInitializedLatestPlan(true);
    };

    loadLatestPlan();
  }, [latestWeeklyPlan, initializedLatestPlan, loadMe]);

  useEffect(() => {
    if (!latestWeeklyPlan || plan || creatingNewPlan || !initializedFromProfile) {
      return;
    }

    setPlan(latestWeeklyPlan);
  }, [latestWeeklyPlan, plan, creatingNewPlan, initializedFromProfile]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCatalog(true);
      setError("");

      try {
        const { response, data } = await apiJson(
          `/api/planner/courses?major=${encodeURIComponent(major)}`
        );

        if (!response.ok) {
          throw new Error(data.error || "دریافت فهرست درس‌ها با مشکل مواجه شد.");
        }

        setCatalog(data.courses || []);
        setCourses((prev) => {
          const next = {};
          for (const item of data.courses || []) {
            next[item.name] = prev[item.name] || defaultCourseInput();
          }
          return next;
        });
      } catch (err) {
        setError(err.message || "ارتباط با سرور برنامه‌ریز برقرار نشد.");
      } finally {
        setLoadingCatalog(false);
      }
    };

    fetchCourses();
  }, [major]);

  const updateCourse = (courseName, field, value) => {
    setCourses((prev) => ({
      ...prev,
      [courseName]: {
        ...(prev[courseName] || defaultCourseInput()),
        [field]: value,
      },
    }));
  };

  const buildPayload = () => ({
    student: {
      name: profile?.name || studentName || "دانش‌آموز منتورا",
      grade: profile?.grade || grade || "دوازدهم",
      major: profile?.major || major || "تجربی",
      exam_year: profile?.examYear || examYear,
      goal: profile?.targetRank ? `رسیدن به رتبه ${profile.targetRank}` : goal,
    },
    availability: {
      daily_hours: dailyHours,
      preferred_session_minutes: preferredSessionMinutes,
      rest_minutes_between_sessions: restMinutes,
      constraints: constraints
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    },
    courses,
  });

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");

    try {
      const { response, data } = await apiJson("/api/planner/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });

      if (!response.ok) {
        throw new Error(data.error || "تولید برنامه با مشکل مواجه شد.");
      }

      setPlan(data);
      setCreatingNewPlan(false);

      if (refresh) {
        await refresh({ silent: true });
      }
      if (loadMe) {
        await loadMe();
      }
    } catch (err) {
      setError(err.message || "در فرآیند تولید برنامه خطایی رخ داد.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateNewPlan = () => {
    setCreatingNewPlan(true);
    setPlan(null);
    setError("");
  };

  // ۱. لودینگ کل صفحه در صورتی که هنوز داده‌های پروفایل گلوبال در حال دریافت است
  if (globalLoading) {
    return <StudyLoading />;
  }

  if (plan && !creatingNewPlan) {
    const courseSummary = Array.isArray(plan.courseSummary) ? plan.courseSummary : [];
    const dailyPlan = Array.isArray(plan.dailyPlan) ? plan.dailyPlan : [];
    const recommendations = Array.isArray(plan.recommendations) ? plan.recommendations : [];

    return (
      <div
        className="container py-4"
        style={{
          maxWidth: "1200px",
          direction: "rtl",
          fontFamily: "Vazir, Tahoma, Arial, sans-serif",
        }}
      >
        <div className="d-flex flex-column gap-4" style={{ direction: "rtl" }}>
          <div className="card border-0 shadow-sm" style={{ borderRadius: "24px" }}>
            <div className="card-body p-4 text-end">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">

                <div>
                  <h2
                    className="fw-bold d-flex align-items-center justify-content-end gap-2 mb-1"
                    style={{ fontSize: "16px" }}
                  >
                    برنامه هفتگی شخصی‌سازی‌شده
                    <Sparkles size={16} color="#6255f5" />
                  </h2>
                  <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
                    منبع تولید: {plan.source === "llm" ? "مدل زبانی" : "موتور داخلی برنامه‌ریز"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCreateNewPlan}
                  className="btn btn-light border d-inline-flex align-items-center gap-2 fw-bold"
                  style={{ borderRadius: "14px", fontSize: "12px" }}
                >
                  <RotateCcw size={14} />
                  دریافت برنامه جدید
                </button>
              </div>

              {plan.generationError && (
                <div
                  className="mb-3"
                  style={{
                    border: "1px solid #fde68a",
                    background: "#fffbeb",
                    color: "#b45309",
                    borderRadius: "16px",
                    padding: "12px",
                    fontSize: "12px",
                  }}
                >
                  مدل زبانی در دسترس نبود؛ برنامه با موتور داخلی منتورا تولید شد.
                </div>
              )}

              <div
                style={{
                  border: "1px solid rgba(98,85,245,0.12)",
                  background: "rgba(98,85,245,0.05)",
                  borderRadius: "16px",
                  padding: "16px",
                }}
              >
                <h3 className="mb-2 fw-bold" style={{ fontSize: "13px", color: "#6255f5" }}>
                  وضعیت کلی دانش‌آموز
                </h3>
                <p className="mb-0 text-secondary" style={{ fontSize: "13px", lineHeight: "1.9" }}>
                  {plan.status}
                </p>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: "24px", direction: "rtl" }}>
            <div className="card-body p-4 text-end">
              <h3
                className="fw-bold d-flex align-items-center justify-content-start gap-2 mb-4"
                style={{ fontSize: "14px" }}
              >
                <Target size={15} color="#6255f5" />
                اولویت‌بندی درس‌ها
              </h3>

              <div className="row g-3">
                {courseSummary.length === 0 && (
                  <div className="col-12">
                    <div
                      className="text-center text-muted"
                      style={{
                        border: "1px solid #f1f5f9",
                        background: "rgba(248,250,252,0.8)",
                        borderRadius: "18px",
                        padding: "18px",
                        fontSize: "12px",
                      }}
                    >
                      خلاصه درس‌ها برای این برنامه ذخیره نشده است.
                    </div>
                  </div>
                )}

                {courseSummary.map((course) => (
                  <div className="col-12 col-md-6" key={course.name}>
                    <div
                      className="h-100"
                      style={{
                        border: "1px solid #f1f5f9",
                        background: "rgba(248,250,252,0.8)",
                        borderRadius: "18px",
                        padding: "14px",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                        <span className="fw-bold text-dark" style={{ fontSize: "14px" }}>
                          {course.name}
                        </span>
                        <span className="fw-bold" style={{ fontSize: "12px", color: "#6255f5" }}>
                          {course.recommendedWeeklyHours} ساعت پیشنهادی
                        </span>
                      </div>

                      <div className="row g-2 text-center">
                        <div className="col-4">
                          <div className="bg-white border h-100" style={{ borderRadius: "14px", padding: "10px" }}>
                            <span className="d-block text-muted" style={{ fontSize: "10px" }}>
                              میزان ضعف
                            </span>
                            <span className="fw-bold" style={{ fontSize: "13px" }}>
                              {course.weakness}/۵
                            </span>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="bg-white border h-100" style={{ borderRadius: "14px", padding: "10px" }}>
                            <span className="d-block text-muted" style={{ fontSize: "10px" }}>
                              عقب‌افتادگی
                            </span>
                            <span className="fw-bold" style={{ fontSize: "13px" }}>
                              {course.backlogHours} ساعت
                            </span>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="bg-white border h-100" style={{ borderRadius: "14px", padding: "10px" }}>
                            <span className="d-block text-muted" style={{ fontSize: "10px" }}>
                              امتیاز اولویت
                            </span>
                            <span className="fw-bold" style={{ fontSize: "13px" }}>
                              {course.priorityScore}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: "24px" }}>
            <div className="card-body p-4 text-end">
              <h3
                className="fw-bold d-flex align-items-center justify-content-start gap-2 mb-4"
                style={{ fontSize: "14px" }}
              >
                <CalendarDays size={15} color="#6255f5" />
                برنامه روزانه هفته
              </h3>

              <div className="d-flex flex-column gap-3">
                {dailyPlan.map((day) => (
                  <div
                    key={`${day.date}-${day.day}`}
                    className="border bg-white"
                    style={{
                      borderRadius: "18px",
                      padding: "16px",
                      boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                      direction: "rtl"
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center gap-3 pb-2 mb-3 border-bottom">
                      <div>
                        <h4 className="mb-1 fw-bold text-dark" style={{ fontSize: "15px" }}>
                          {day.day}
                        </h4>
                        <p className="mb-0 text-muted" style={{ fontSize: "11px" }}>
                          {day.date}
                        </p>
                      </div>
                      <span
                        style={{
                          background: "#ecfdf5",
                          color: "#047857",
                          border: "1px solid #d1fae5",
                          borderRadius: "10px",
                          padding: "6px 10px",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        {day.totalHours}
                      </span>
                    </div>

                    <div className="d-flex flex-column gap-2">
                      <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "14px" }}>
                        <span className="d-block mb-1 fw-bold text-muted" style={{ fontSize: "11px" }}>
                          برنامه اصلی
                        </span>
                        <p className="mb-0 text-secondary" style={{ fontSize: "13px", lineHeight: "1.9" }}>
                          {day.mainPlan}
                        </p>
                      </div>

                      <div
                        style={{
                          background: "#fffbeb",
                          border: "1px solid #fde68a",
                          borderRadius: "14px",
                          padding: "14px",
                        }}
                      >
                        <span className="d-block mb-1 fw-bold" style={{ fontSize: "11px", color: "#b45309" }}>
                          بخش جبرانی شناور
                        </span>
                        <p className="mb-0" style={{ fontSize: "13px", lineHeight: "1.9", color: "#92400e" }}>
                          {day.floatingPlan}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: "24px" }}>
            <div className="card-body p-4 text-end">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                {plan.source === "llm" ? (
                  <span
                    style={{
                      background: "rgba(98,85,245,0.1)",
                      color: "#6255f5",
                      borderRadius: "10px",
                      padding: "6px 10px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    خروجی مدل زبانی
                  </span>
                ) : (
                  <span
                    style={{
                      background: "#f3f4f6",
                      color: "#6b7280",
                      borderRadius: "10px",
                      padding: "6px 10px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    خروجی موتور داخلی
                  </span>
                )}

                <h3
                  className="fw-bold d-flex align-items-center justify-content-end gap-2 mb-0"
                  style={{ fontSize: "14px" }}
                >
                  متن کامل تولیدشده
                  <Sparkles size={15} color="#6255f5" />
                </h3>
              </div>

              <p className="text-muted mb-3" style={{ fontSize: "11px", lineHeight: "1.9" }}>
                این بخش متن کامل برنامه تولیدشده را نمایش می‌دهد.
              </p>

              <pre
                dir="rtl"
                style={{
                  maxHeight: "28rem",
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  background: "#f8fafc",
                  border: "1px solid #f1f5f9",
                  borderRadius: "16px",
                  padding: "16px",
                  fontSize: "13px",
                  lineHeight: "2",
                  fontFamily: "Vazir, Tahoma, Arial, sans-serif",
                  color: "#1f2937",
                }}
              >
                {plan.markdown}
              </pre>
            </div>
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: "24px" }}>
            <div className="card-body p-4 text-end">
              <h3
                className="fw-bold d-flex align-items-center justify-content-start gap-2 mb-3"
                style={{ fontSize: "14px" }}
              >
                <ClipboardList size={15} color="#6255f5" />
                پیشنهادها و به‌روزرسانی پروفایل
              </h3>

              <div className="d-flex flex-column gap-2">
                {recommendations.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      border: "1px solid #f1f5f9",
                      background: "rgba(248,250,252,0.8)",
                      borderRadius: "16px",
                      padding: "14px",
                      fontSize: "13px",
                      lineHeight: "1.9",
                      color: "#374151",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container py-4"
      style={{
        maxWidth: "1200px",
        direction: "rtl",
        fontFamily: "Vazir, Tahoma, Arial, sans-serif",
      }}
    >
      <div className="d-flex flex-column gap-4">
        <div className="card border-0 shadow-sm" style={{ borderRadius: "24px" }}>
          <div className="card-body p-4 text-end">
            <div className="d-flex justify-content-start align-items-start gap-3 flex-wrap mb-3">
              <div
                style={{
                  background: "rgba(98,85,245,0.1)",
                  color: "#6255f5",
                  borderRadius: "16px",
                  padding: "14px",
                }}
              >
                <Wand2 size={22} />
              </div>

              <div>
                <h2 className="fw-bold mb-1" style={{ fontSize: "18px" }}>
                  دستیار برنامه‌ریزی
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: "12px", lineHeight: "1.9" }}>
                  زمان‌های آزاد و وضعیت درس‌ها را تنظیم کن تا منتورا برنامه هفتگی قابل اجرا بسازد.
                </p>
              </div>
            </div>

            {error && (
              <div
                style={{
                  border: "1px solid #fecaca",
                  background: "#fef2f2",
                  color: "#dc2626",
                  borderRadius: "16px",
                  padding: "12px",
                  fontSize: "12px",
                }}
              >
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="card border-0 shadow-sm" style={{ borderRadius: "24px" }}>
          <div className="card-body p-4 text-end">
            <h3
              className="fw-bold d-flex align-items-center justify-content-start gap-2 mb-4"
              style={{ fontSize: "14px" }}
            >
              <Clock size={15} color="#6255f5" />
              زمان آزاد برای مطالعه
            </h3>

            <div className="row g-3 mb-4">
              {DAYS.map((day) => (
                <div className="col-6 col-md-3" key={day}>
                  <label className="w-100" style={boxStyle}>
                    <span className="d-block mb-2 fw-bold text-secondary" style={{ fontSize: "11px" }}>
                      {day}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="16"
                      value={dailyHours[day]}
                      onChange={(event) =>
                        setDailyHours((prev) => ({
                          ...prev,
                          [day]: Number(event.target.value),
                        }))
                      }
                      className="form-control text-center"
                      style={smallInputStyle}
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-4">
                <div
                  style={{
                    background: "#ecfdf5",
                    border: "1px solid #d1fae5",
                    borderRadius: "16px",
                    padding: "14px",
                  }}
                >
                  <span className="d-block fw-bold" style={{ fontSize: "11px", color: "#059669" }}>
                    مجموع ساعات هفتگی
                  </span>
                  <span className="d-block mt-2" style={{ fontSize: "28px", fontWeight: 900, color: "#047857" }}>
                    {weeklyHours} ساعت
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label className="w-100" style={boxStyle}>
                  <span
                    className="d-flex align-items-center justify-content-start gap-1 mb-2 fw-bold text-muted"
                    style={{ fontSize: "11px" }}
                  >
                    <TimerReset size={12} />
                    مدت هر پارت مطالعاتی
                  </span>
                  <input
                    type="number"
                    min="30"
                    max="180"
                    value={preferredSessionMinutes}
                    onChange={(event) => setPreferredSessionMinutes(Number(event.target.value))}
                    className="form-control text-center"
                    style={smallInputStyle}
                  />
                </label>
              </div>

              <div className="col-12 col-md-4">
                <label className="w-100" style={boxStyle}>
                  <span className="d-flex align-items-center justify-content-start gap-1 mb-2 fw-bold text-muted"
                    style={{ fontSize: "11px" }}>
                    <Clock10Icon size={12} />
                    استراحت بین پارت‌ها
                  </span>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={restMinutes}
                    onChange={(event) => setRestMinutes(Number(event.target.value))}
                    className="form-control text-center"
                    style={smallInputStyle}
                  />
                </label>
              </div>
            </div>

            <div className="mt-3">
              <label className="w-100">
                <span className="d-block mb-2 fw-bold text-muted" style={{ fontSize: "11px" }}>
                  محدودیت‌ها و زمان‌های غیرقابل مطالعه
                </span>
                <input
                  value={constraints}
                  onChange={(event) => setConstraints(event.target.value)}
                  placeholder="مثلاً: جمعه سبک‌تر باشد، سه‌شنبه کلاس دارم"
                  className="form-control text-end"
                  style={inputStyle}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm" style={{ borderRadius: "24px" }}>
          <div className="card-body p-4 text-end">
            <h3
              className="fw-bold d-flex align-items-center justify-content-start gap-2 mb-4"
              style={{ fontSize: "14px" }}
            >
              <ClipboardList size={15} color="#6255f5" />
              وضعیت درس‌ها
            </h3>

            {/* ۲. اضافه کردن لودینگ زیباتر برای دریافت کاتالوگ درس‌ها */}
            {loadingCatalog ? (
              <div
                className="text-center py-5 d-flex flex-column align-items-center justify-content-center"
                style={{
                  border: "1px dashed rgba(98,85,245,0.3)",
                  borderRadius: "16px",
                  background: "rgba(98,85,245,0.02)",
                }}
              >
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2rem', height: '2rem' }}></div>
                <div className="text-secondary fw-bold" style={{ fontSize: "13px" }}>
                  در حال دریافت لیست درس‌های متناسب با رشته شما...
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {catalog.map((item) => {
                  const values = courses[item.name] || defaultCourseInput();

                  return (
                    <div
                      key={item.name}
                      style={{
                        border: "1px solid #f1f5f9",
                        background: "rgba(248,250,252,0.6)",
                        borderRadius: "18px",
                        padding: "16px",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                        <h4 className="mb-0 fw-bold text-dark" style={{ fontSize: "15px" }}>
                          {item.name}
                        </h4>
                        <span className="text-muted fw-bold" style={{ fontSize: "11px" }}>
                          سختی پایه {item.baseDifficulty}/۵
                        </span>
                      </div>

                      <div className="row g-2">
                        <div className="col-6 col-md-4">
                          <NumberField
                            label="میزان ضعف"
                            value={values.student_weakness}
                            min={1}
                            max={5}
                            onChange={(value) => updateCourse(item.name, "student_weakness", value)}
                          />
                        </div>

                        <div className="col-6 col-md-4">
                          <NumberField
                            label="اهمیت برای هدف"
                            value={values.target_importance}
                            min={1}
                            max={5}
                            onChange={(value) => updateCourse(item.name, "target_importance", value)}
                          />
                        </div>

                        <div className="col-6 col-md-4">
                          <NumberField
                            label="علاقه"
                            value={values.interest}
                            min={1}
                            max={5}
                            onChange={(value) => updateCourse(item.name, "interest", value)}
                          />
                        </div>

                        <div className="col-6 col-md-4">
                          <NumberField
                            label="ساعت عقب‌افتادگی"
                            value={values.backlog_hours}
                            min={0}
                            max={100}
                            onChange={(value) => updateCourse(item.name, "backlog_hours", value)}
                          />
                        </div>

                        <div className="col-6 col-md-4">
                          <NumberField
                            label="آخرین درصد آزمون"
                            value={values.last_test_percent}
                            min={0}
                            max={100}
                            onChange={(value) => updateCourse(item.name, "last_test_percent", value)}
                          />
                        </div>

                        <div className="col-12 col-md-4">
                          <label className="w-100">
                            <span className="d-block mb-2 fw-bold text-muted" style={{ fontSize: "10px" }}>
                              یادداشت
                            </span>
                            <input
                              value={values.notes}
                              onChange={(event) => updateCourse(item.name, "notes", event.target.value)}
                              className="form-control text-end"
                              style={smallInputStyle}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ۳. اعمال استیل لودینگ و غیرفعال شدن روی دکمه تولید برنامه */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || loadingCatalog}
              className="btn w-100 mt-4 d-inline-flex align-items-center justify-content-center gap-2 fw-bold text-white transition-all"
              style={{
                borderRadius: "14px",
                background: generating ? "#8c82f8" : "#6255f5",
                border: "none",
                padding: "14px 16px",
                fontSize: "14px",
                cursor: (generating || loadingCatalog) ? "not-allowed" : "pointer"
              }}
            >
              {generating ? (
                <>
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                  در حال آنالیز درس‌ها و تولید برنامه هفتگی هوشمند...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  تولید برنامه هفتگی
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, min, max, onChange }) {
  return (
    <label className="w-100">
      <span className="d-block mb-2 fw-bold text-muted" style={{ fontSize: "10px" }}>
        {label}
      </span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="form-control text-center"
        style={smallInputStyle}
      />
    </label>
  );
}

const inputStyle = {
  borderRadius: "14px",
  background: "rgba(248,250,252,0.8)",
  fontSize: "13px",
  fontWeight: 700,
};

const smallInputStyle = {
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: 700,
};

const boxStyle = {
  border: "1px solid #f1f5f9",
  background: "rgba(248,250,252,0.8)",
  borderRadius: "16px",
  padding: "12px",
};
