import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Flame,
  Calendar,
  Sparkles,
  BookOpen,
  Clock,
  Edit3,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Link } from "react-router-dom";

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function Today() {
  const { profile, tasks, stats, toggleTask, createTask, updateTask, deleteTask } = useApp();
  const onToggleTask = toggleTask;
  const today = new Date();
  const todayIso = formatLocalDate(today);
  const emptyTaskForm = {
    title: "",
    duration: "",
    category: "شخصی",
    scheduledDate: todayIso,
  };
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingForm, setEditingForm] = useState(emptyTaskForm);
  const [taskActionError, setTaskActionError] = useState("");
  const [savingTask, setSavingTask] = useState(false);

  const formattedDate = new Date().toLocaleDateString("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const { readinessScore = 0, streakCount = 0, xpPoints = 0, programStartsTomorrow, upcomingTasksCount } = stats || {};

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

  const startEditTask = (task) => {
    setTaskActionError("");
    setEditingTaskId(task.id);
    setEditingForm({
      title: task.title || "",
      duration: task.duration || "",
      category: task.category || "عمومی",
      scheduledDate: task.scheduledDate || todayIso,
    });
  };

  const handleAddTask = async (event) => {
    event.preventDefault();
    if (!taskForm.title.trim()) {
      setTaskActionError("عنوان تسک را وارد کن.");
      return;
    }

    setSavingTask(true);
    setTaskActionError("");
    try {
      await createTask(taskForm);
      setTaskForm(emptyTaskForm);
      setShowAddTask(false);
    } catch (err) {
      setTaskActionError(err.message || "افزودن تسک ناموفق بود.");
    } finally {
      setSavingTask(false);
    }
  };

  const handleSaveTask = async (event) => {
    event.preventDefault();
    if (!editingTaskId || !editingForm.title.trim()) {
      setTaskActionError("عنوان تسک نمی‌تواند خالی باشد.");
      return;
    }

    setSavingTask(true);
    setTaskActionError("");
    try {
      await updateTask(editingTaskId, editingForm);
      setEditingTaskId(null);
    } catch (err) {
      setTaskActionError(err.message || "ویرایش تسک ناموفق بود.");
    } finally {
      setSavingTask(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setSavingTask(true);
    setTaskActionError("");
    try {
      await deleteTask(taskId);
      if (editingTaskId === taskId) {
        setEditingTaskId(null);
      }
    } catch (err) {
      setTaskActionError(err.message || "حذف تسک ناموفق بود.");
    } finally {
      setSavingTask(false);
    }
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
        maxWidth: "1200px",
        direction: "rtl",
        textAlign: "right",
        fontFamily: "Vazir, Tahoma, Arial, sans-serif",
      }}
    >
      <div className="d-flex flex-column gap-3">
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
              {formattedDate}
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

            <div className="col-12 col-md-4 d-flex justify-content-center justify-content-md-end">
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
          <div className="d-flex justify-content-between align-items-center gap-2 mb-3 px-1 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setTaskActionError("");
                setShowAddTask((prev) => !prev);
              }}
              className="btn d-inline-flex align-items-center gap-2 fw-bold"
              style={{
                borderRadius: "12px",
                background: "#6255f5",
                color: "#fff",
                border: "none",
                fontSize: "12px",
                padding: "9px 12px",
              }}
            >
              {showAddTask ? <X size={14} /> : <Plus size={14} />}
              {showAddTask ? "بستن" : "افزودن تسک"}
            </button>

            <h3
              className="d-flex align-items-center gap-2 mb-0"
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#1f2937",
              }}
            >
              <BookOpen size={16} color="#6255f5" />
              برنامه امروز شما
            </h3>
          </div>

          {taskActionError && (
            <div
              className="mb-2"
              style={{
                border: "1px solid #fecaca",
                background: "#fef2f2",
                color: "#dc2626",
                borderRadius: "14px",
                padding: "10px 12px",
                fontSize: "12px",
              }}
            >
              {taskActionError}
            </div>
          )}

          {showAddTask && (
            <TaskEditor
              values={taskForm}
              onChange={setTaskForm}
              onSubmit={handleAddTask}
              onCancel={() => setShowAddTask(false)}
              saving={savingTask}
              submitLabel="افزودن"
            />
          )}

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
                const isEditing = editingTaskId === task?.id;

                if (isEditing) {
                  return (
                    <TaskEditor
                      key={task?.id ?? index}
                      values={editingForm}
                      onChange={setEditingForm}
                      onSubmit={handleSaveTask}
                      onCancel={() => setEditingTaskId(null)}
                      saving={savingTask}
                      submitLabel="ذخیره"
                    />
                  );
                }

                return (
                  <div
                    key={task?.id ?? index}
                    onClick={() => handleToggleTask(task)}
                    className="d-flex justify-content-between align-items-center gap-3 flex-wrap"
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

                    <div className="d-flex align-items-center gap-1">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          startEditTask(task);
                        }}
                        className="btn btn-light border d-inline-flex align-items-center justify-content-center"
                        style={{ width: "34px", height: "34px", borderRadius: "10px", padding: 0 }}
                        aria-label="ویرایش تسک"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
                        className="btn btn-light border d-inline-flex align-items-center justify-content-center"
                        style={{ width: "34px", height: "34px", borderRadius: "10px", padding: 0, color: "#dc2626" }}
                        aria-label="حذف تسک"
                        disabled={savingTask}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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

          <Link
            type="button"
            to="/focustimer"
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
          </Link>
        </div>
      </div>
    </div>
  );
}

function TaskEditor({ values, onChange, onSubmit, onCancel, saving, submitLabel }) {
  const updateField = (field, value) => {
    onChange((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white mb-2"
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        padding: "14px",
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
      }}
    >
      <div className="row g-2 align-items-end">
        <div className="col-12 col-md-4">
          <label className="w-100">
            <span className="d-block mb-1 fw-bold text-muted" style={{ fontSize: "10px" }}>
              عنوان
            </span>
            <input
              value={values.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="form-control text-end"
              style={taskInputStyle}
              placeholder="مثلاً حسابان - تست"
            />
          </label>
        </div>

        <div className="col-12 col-md-3">
          <label className="w-100">
            <span className="d-block mb-1 fw-bold text-muted" style={{ fontSize: "10px" }}>
              ساعت / مدت
            </span>
            <input
              value={values.duration}
              onChange={(event) => updateField("duration", event.target.value)}
              className="form-control text-end"
              style={taskInputStyle}
              placeholder="08:00 تا 09:30"
            />
          </label>
        </div>

        <div className="col-12 col-md-2">
          <label className="w-100">
            <span className="d-block mb-1 fw-bold text-muted" style={{ fontSize: "10px" }}>
              دسته
            </span>
            <input
              value={values.category}
              onChange={(event) => updateField("category", event.target.value)}
              className="form-control text-end"
              style={taskInputStyle}
              placeholder="درس"
            />
          </label>
        </div>

        <div className="col-12 col-md-3">
          <div className="d-flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="btn flex-fill d-inline-flex align-items-center justify-content-center gap-1 fw-bold"
              style={{
                borderRadius: "12px",
                background: "#10b981",
                color: "#fff",
                border: "none",
                fontSize: "12px",
                padding: "10px",
              }}
            >
              <Save size={14} />
              {saving ? "در حال ذخیره..." : submitLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-light border d-inline-flex align-items-center justify-content-center"
              style={{ width: "42px", borderRadius: "12px" }}
              aria-label="لغو"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

const taskInputStyle = {
  borderRadius: "12px",
  background: "#f8fafc",
  fontSize: "12px",
  fontWeight: 700,
};
