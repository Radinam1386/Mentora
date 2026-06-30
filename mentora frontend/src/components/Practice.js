import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Check,
  ClipboardList,
  Lock,
  Play,
  RefreshCw,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { apiJson, resolveMediaUrl } from "../utils/api";

const ALL_TOPICS = "همه مباحث";
const MAJORS = ["تجربی", "ریاضی"];
const FALLBACK_COUNTS = [5, 10, 15, 20, 25, 30];
const PRACTICE_SESSION_STORAGE_KEY = "mentora_practice_session_v1";
const PRACTICE_SESSION_VERSION = 2;
const SAVED_PHASES = ["running", "results"];
const DEFAULT_FEATURES = {
  topics: false,
  explanations: false,
  difficulty: false,
};
const OPTION_LABELS = ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"];

const toFa = (value, maximumFractionDigits = 0) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "۰";
  return number.toLocaleString("fa-IR", { maximumFractionDigits });
};

const storageAvailable = () => {
  try {
    return typeof window !== "undefined" && window.localStorage;
  } catch {
    return null;
  }
};

const clampQuestionIndex = (value, maxIndex) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(Math.max(Math.trunc(number), 0), Math.max(maxIndex, 0));
};

const normalizeSavedAnswers = (answers, length) => {
  const source = Array.isArray(answers) ? answers : [];
  return Array.from({ length }, (_, index) => {
    const answer = source[index];
    return Number.isInteger(answer) ? answer : null;
  });
};

const loadPracticeSession = () => {
  if (!storageAvailable()) return null;

  try {
    const raw = window.localStorage.getItem(PRACTICE_SESSION_STORAGE_KEY);
    if (!raw) return null;

    const saved = JSON.parse(raw);
    const savedQuestions = Array.isArray(saved?.questions) ? saved.questions : [];
    const savedPhase = SAVED_PHASES.includes(saved?.phase) ? saved.phase : "";

    if (saved?.version !== PRACTICE_SESSION_VERSION || !savedQuestions.length || !savedPhase) {
      window.localStorage.removeItem(PRACTICE_SESSION_STORAGE_KEY);
      return null;
    }

    return {
      activeTab: "practice",
      major: MAJORS.includes(saved.major) ? saved.major : "تجربی",
      lesson: saved.lesson || "",
      grade: saved.grade || "",
      topic: saved.topic || ALL_TOPICS,
      questionCount: Number(saved.questionCount) || savedQuestions.length,
      phase: savedPhase,
      questions: savedQuestions,
      answers: normalizeSavedAnswers(saved.answers, savedQuestions.length),
      currentIndex: clampQuestionIndex(saved.currentIndex, savedQuestions.length - 1),
    };
  } catch {
    window.localStorage.removeItem(PRACTICE_SESSION_STORAGE_KEY);
    return null;
  }
};

const savePracticeSession = (session) => {
  if (!storageAvailable()) return;

  try {
    window.localStorage.setItem(
      PRACTICE_SESSION_STORAGE_KEY,
      JSON.stringify({
        version: PRACTICE_SESSION_VERSION,
        savedAt: new Date().toISOString(),
        ...session,
      })
    );
  } catch {
    // localStorage can be unavailable in private mode or when quota is full.
  }
};

const clearPracticeSession = () => {
  if (!storageAvailable()) return;
  window.localStorage.removeItem(PRACTICE_SESSION_STORAGE_KEY);
};

function BlockMarkdown({ children }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children: paragraphChildren }) => (
          <p style={{ marginBottom: "8px" }}>{paragraphChildren}</p>
        ),
      }}
    >
      {children || ""}
    </ReactMarkdown>
  );
}

export default function Practice() {
  const navigate = useNavigate();
  const { profile, setBridgeQuestion } = useApp();
  const initialMajor = MAJORS.includes(profile?.major) ? profile.major : "تجربی";

  const [activeTab, setActiveTab] = useState("practice");
  const [major, setMajor] = useState(initialMajor);
  const [lessons, setLessons] = useState([]);
  const [lesson, setLesson] = useState("");
  const [grade, setGrade] = useState("");
  const [topics, setTopics] = useState([ALL_TOPICS]);
  const [topic, setTopic] = useState(ALL_TOPICS);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [questionCounts, setQuestionCounts] = useState(FALLBACK_COUNTS);
  const [questionCount, setQuestionCount] = useState(10);
  const [availableCount, setAvailableCount] = useState(0);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const [phase, setPhase] = useState("setup");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [showDamage, setShowDamage] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const lessonConfig = useMemo(
    () => lessons.find((item) => item.name === lesson),
    [lessons, lesson]
  );
  const gradeOptions = lessonConfig?.grades || [];
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const hasAnswered = currentAnswer !== null && currentAnswer !== undefined;
  const currentIsCorrect = currentAnswer === currentQuestion?.correctAnswer;

  const result = useMemo(() => {
    const total = questions.length;
    const correct = questions.reduce(
      (sum, question, index) => sum + (answers[index] === question.correctAnswer ? 1 : 0),
      0
    );
    const wrong = questions.reduce((sum, question, index) => {
      const answer = answers[index];
      return sum + (answer !== null && answer !== undefined && answer !== question.correctAnswer ? 1 : 0);
    }, 0);
    const unsolved = Math.max(0, total - correct - wrong);
    const rawPercent = total ? (correct / total) * 100 : 0;
    const negativePercent = total ? ((correct * 3 - wrong) / (total * 3)) * 100 : 0;

    return { total, correct, wrong, unsolved, rawPercent, negativePercent };
  }, [answers, questions]);

  const fireCorrectConfetti = () => {
    setShowCelebration(false);
    window.setTimeout(() => setShowCelebration(true), 0);
    window.setTimeout(() => setShowCelebration(false), 700);
  };

  const triggerWrongFlash = () => {
    setShowDamage(true);
    window.setTimeout(() => {
      setShowDamage(false);
    }, 420);
  };

  const resetRun = () => {
    clearPracticeSession();
    setPhase("setup");
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setShowCelebration(false);
    setShowDamage(false);
  };

  useEffect(() => {
    const savedSession = loadPracticeSession();
    if (savedSession) {
      setActiveTab(savedSession.activeTab);
      setMajor(savedSession.major);
      setLesson(savedSession.lesson);
      setGrade(savedSession.grade);
      setTopic(savedSession.topic);
      setQuestionCount(savedSession.questionCount);
      setQuestions(savedSession.questions);
      setAnswers(savedSession.answers);
      setCurrentIndex(savedSession.currentIndex);
      setPhase(savedSession.phase);
    }
    setSessionLoaded(true);
  }, []);

  useEffect(() => {
    if (!sessionLoaded) return;

    if (SAVED_PHASES.includes(phase) && questions.length) {
      savePracticeSession({
        major,
        lesson,
        grade,
        topic,
        questionCount,
        phase,
        questions,
        answers: normalizeSavedAnswers(answers, questions.length),
        currentIndex: clampQuestionIndex(currentIndex, questions.length - 1),
      });
      return;
    }

    clearPracticeSession();
  }, [answers, currentIndex, grade, lesson, major, phase, questionCount, questions, sessionLoaded, topic]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ major });
    if (lesson) params.set("lesson", lesson);
    if (grade) params.set("grade", grade);
    if (topic) params.set("topic", topic);

    const loadFilters = async () => {
      setFiltersLoading(true);
      setError("");
      try {
        const { response, data } = await apiJson(`/api/practice/filters?${params.toString()}`);
        if (!response.ok) {
          throw new Error(data.error || "دریافت تنظیمات تمرین با مشکل مواجه شد.");
        }
        if (!active) return;

        const nextLessons = Array.isArray(data.lessons) ? data.lessons : [];
        const nextTopics = Array.isArray(data.topics) && data.topics.length ? data.topics : [ALL_TOPICS];
        const nextCounts =
          Array.isArray(data.questionCounts) && data.questionCounts.length
            ? data.questionCounts
            : FALLBACK_COUNTS;

        setLessons(nextLessons);
        setTopics(nextTopics);
        setFeatures({ ...DEFAULT_FEATURES, ...(data.features || {}) });
        setQuestionCounts(nextCounts);
        setAvailableCount(data.availableCount || 0);

        if (data.selectedLesson && data.selectedLesson !== lesson) {
          setLesson(data.selectedLesson);
        }
        if (data.selectedGrade && data.selectedGrade !== grade) {
          setGrade(data.selectedGrade);
        }
        if (data.selectedTopic && data.selectedTopic !== topic) {
          setTopic(data.selectedTopic);
        } else if (!nextTopics.includes(topic)) {
          setTopic(nextTopics[0]);
        }
        if (!nextCounts.includes(questionCount)) {
          setQuestionCount(nextCounts[1] || nextCounts[0] || 10);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "ارتباط با سرور تمرین برقرار نشد.");
        }
      } finally {
        if (active) setFiltersLoading(false);
      }
    };

    loadFilters();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [major, lesson, grade, topic]);

  const updateMajor = (value) => {
    setMajor(value);
    setLesson("");
    setGrade("");
    setTopic(ALL_TOPICS);
    resetRun();
  };

  const updateLesson = (value) => {
    setLesson(value);
    setGrade("");
    setTopic(ALL_TOPICS);
    resetRun();
  };

  const updateGrade = (value) => {
    setGrade(value);
    setTopic(ALL_TOPICS);
    resetRun();
  };

  const startPractice = async () => {
    setStarting(true);
    setError("");
    try {
      const { response, data } = await apiJson("/api/practice/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          major,
          lesson,
          grade,
          topic,
          count: questionCount,
        }),
      });

      if (!response.ok) {
        throw new Error(data.error || "شروع تمرین با مشکل مواجه شد.");
      }

      const nextQuestions = Array.isArray(data.questions) ? data.questions : [];
      if (!nextQuestions.length) {
        throw new Error("برای این انتخاب هنوز سوالی وجود ندارد.");
      }

      setQuestions(nextQuestions);
      setAnswers(Array(nextQuestions.length).fill(null));
      setCurrentIndex(0);
      setPhase("running");
    } catch (err) {
      setError(err.message || "شروع تمرین با مشکل مواجه شد.");
    } finally {
      setStarting(false);
    }
  };

  const answerQuestion = (optionIndex) => {
    if (!currentQuestion || hasAnswered) return;

    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = optionIndex;
      return next;
    });

    if (optionIndex === currentQuestion.correctAnswer) {
      fireCorrectConfetti();
    } else {
      triggerWrongFlash();
    }
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setPhase("results");
    }
  };

  const askTutor = (question) => {
    if (!question) return;
    const questionLabel = `سوال تصویری ${currentIndex + 1}`.trim();
    setBridgeQuestion(`این سوال را مرحله‌به‌مرحله توضیح بده: "${questionLabel}"`);
    navigate("/tutor");
  };

  return (
    <div
      className="container py-4"
      style={{
        maxWidth: "1200px",
        direction: "rtl",
        fontFamily: "Vazir, Tahoma, Arial, sans-serif",
        position: "relative",
      }}
    >
      {showDamage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(239, 68, 68, 0.22)",
            pointerEvents: "none",
            zIndex: 9998,
            animation: "damageFlash 420ms ease-out",
          }}
        />
      )}

      {showCelebration && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 35%, rgba(34, 197, 94, 0.24), transparent 18%), radial-gradient(circle at 78% 42%, rgba(99, 102, 241, 0.2), transparent 16%), radial-gradient(circle at 50% 25%, rgba(250, 204, 21, 0.22), transparent 14%)",
            pointerEvents: "none",
            zIndex: 9998,
            animation: "successFlash 700ms ease-out",
          }}
        />
      )}

      <style>
        {`
          @keyframes damageFlash {
            0% { opacity: 0; }
            20% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes successFlash {
            0% { opacity: 0; transform: scale(0.98); }
            20% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(1.02); }
          }
        `}
      </style>

      <div className="d-flex flex-column gap-3">
        <div
          className="bg-white border shadow-sm"
          style={{ borderRadius: "22px", padding: "16px", borderColor: "#eef2f7" }}
        >
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h2 className="fw-bold mb-1" style={{ fontSize: "18px", color: "#111827" }}>
                تمرین‌ها و آزمون
              </h2>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                بانک سوال، پاسخ فوری و جمع‌بندی درصد کنکوری
              </div>
            </div>

            <div
              className="d-flex align-items-center gap-2"
              style={{ background: "#f8fafc", borderRadius: "14px", padding: "4px", border: "1px solid #e5e7eb" }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("practice")}
                className="btn d-inline-flex align-items-center gap-2 fw-bold"
                style={tabButtonStyle(activeTab === "practice")}
              >
                <ClipboardList size={15} />
                تمرین
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("exam")}
                className="btn d-inline-flex align-items-center gap-2 fw-bold"
                style={tabButtonStyle(activeTab === "exam")}
              >
                <Lock size={15} />
                آزمون
              </button>
            </div>
          </div>
        </div>

        {activeTab === "exam" ? (
          <div
            className="bg-white border shadow-sm text-center"
            style={{ borderRadius: "24px", padding: "48px 20px", borderColor: "#eef2f7" }}
          >
            <div
              className="d-inline-flex align-items-center justify-content-center mb-3"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "18px",
                background: "#f3f4f6",
                color: "#6b7280",
              }}
            >
              <Lock size={24} />
            </div>
            <h3 className="fw-bold mb-2" style={{ fontSize: "18px", color: "#111827" }}>
              بخش آزمون در حال توسعه است
            </h3>
            <p className="mb-0 mx-auto" style={{ maxWidth: "520px", fontSize: "13px", color: "#6b7280", lineHeight: "1.9" }}>
              در نسخه بعدی، آزمون زمان‌دار، مرور سوالات نشان‌دار و تحلیل کامل آزمون به این بخش اضافه می‌شود.
            </p>
          </div>
        ) : (
          <>
            {phase === "setup" && (
              <div className="row g-3">
                <div className="col-12 col-lg-8">
                  <div
                    className="bg-white border shadow-sm h-100"
                    style={{ borderRadius: "24px", padding: "20px", borderColor: "#eef2f7" }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <BookOpen size={18} color="#6255f5" />
                      <h3 className="mb-0 fw-bold" style={{ fontSize: "15px", color: "#111827" }}>
                        ساخت تمرین
                      </h3>
                    </div>

                    {error && (
                      <div
                        className="mb-3 d-flex align-items-center gap-2"
                        style={{
                          background: "#fef2f2",
                          color: "#b91c1c",
                          border: "1px solid #fecaca",
                          borderRadius: "14px",
                          padding: "12px",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        <AlertCircle size={15} />
                        {error}
                      </div>
                    )}

                    <div className="mb-3">
                      <span className="d-block mb-2 fw-bold text-muted" style={{ fontSize: "11px" }}>
                        رشته
                      </span>
                      <div className="d-flex gap-2 flex-wrap">
                        {MAJORS.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => updateMajor(item)}
                            className="btn fw-bold"
                            style={choiceButtonStyle(major === item)}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="w-100">
                          <span className="d-block mb-2 fw-bold text-muted" style={{ fontSize: "11px" }}>
                            درس
                          </span>
                          <select
                            className="form-select text-end"
                            value={lesson}
                            onChange={(event) => updateLesson(event.target.value)}
                            style={selectStyle}
                            disabled={filtersLoading}
                          >
                            {lessons.map((item) => (
                              <option key={item.name} value={item.name}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="w-100">
                          <span className="d-block mb-2 fw-bold text-muted" style={{ fontSize: "11px" }}>
                            پایه
                          </span>
                          <select
                            className="form-select text-end"
                            value={grade}
                            onChange={(event) => updateGrade(event.target.value)}
                            style={selectStyle}
                            disabled={filtersLoading}
                          >
                            {gradeOptions.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      {features.topics && (
                        <div className="col-12 col-md-6">
                          <label className="w-100">
                            <span className="d-block mb-2 fw-bold text-muted" style={{ fontSize: "11px" }}>
                              مبحث
                            </span>
                            <select
                              className="form-select text-end"
                              value={topic}
                              onChange={(event) => {
                                setTopic(event.target.value);
                                resetRun();
                              }}
                              style={selectStyle}
                              disabled={filtersLoading}
                            >
                              {topics.map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      )}

                      <div className="col-12 col-md-6">
                        <label className="w-100">
                          <span className="d-block mb-2 fw-bold text-muted" style={{ fontSize: "11px" }}>
                            تعداد سوال
                          </span>
                          <select
                            className="form-select text-end"
                            value={questionCount}
                            onChange={(event) => setQuestionCount(Number(event.target.value))}
                            style={selectStyle}
                            disabled={filtersLoading}
                          >
                            {questionCounts.map((item) => (
                              <option key={item} value={item}>
                                {toFa(item)} سوال
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={startPractice}
                      disabled={filtersLoading || starting || availableCount <= 0}
                      className="btn w-100 mt-4 d-inline-flex align-items-center justify-content-center gap-2 fw-bold text-white"
                      style={{
                        borderRadius: "14px",
                        background: filtersLoading || starting || availableCount <= 0 ? "#cbd5e1" : "#6255f5",
                        border: "none",
                        padding: "14px 16px",
                        fontSize: "14px",
                      }}
                    >
                      {starting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                          در حال آماده‌سازی
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          شروع تمرین
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="col-12 col-lg-4">
                  <div
                    className="bg-white border shadow-sm h-100 d-flex flex-column gap-3"
                    style={{ borderRadius: "24px", padding: "20px", borderColor: "#eef2f7" }}
                  >
                    <SummaryTile
                      icon={<Target size={17} />}
                      label="انتخاب فعلی"
                      value={`${lesson || "-"} · ${grade || "-"}`}
                      color="#6255f5"
                      bg="#eef2ff"
                    />
                    {features.topics && (
                      <SummaryTile
                        icon={<ClipboardList size={17} />}
                        label="مبحث"
                        value={topic || ALL_TOPICS}
                        color="#0f766e"
                        bg="#ecfdf5"
                      />
                    )}
                    <SummaryTile
                      icon={<BarChart3 size={17} />}
                      label="سوال‌های موجود"
                      value={filtersLoading ? "..." : `${toFa(availableCount)} سوال`}
                      color={availableCount > 0 ? "#d97706" : "#dc2626"}
                      bg={availableCount > 0 ? "#fffbeb" : "#fef2f2"}
                    />
                    {availableCount <= 0 && !filtersLoading && (
                      <div
                        style={{
                          border: "1px dashed #fecaca",
                          background: "#fff7f7",
                          color: "#b91c1c",
                          borderRadius: "16px",
                          padding: "12px",
                          fontSize: "12px",
                          lineHeight: "1.9",
                        }}
                      >
                        برای این انتخاب هنوز سوالی در بانک سوال ثبت نشده است.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {phase === "running" && currentQuestion && (
              <div className="d-flex flex-column gap-3">
                <div
                  className="bg-white border shadow-sm d-flex align-items-center justify-content-between flex-wrap gap-3"
                  style={{ borderRadius: "20px", padding: "14px 16px", borderColor: "#eef2f7" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span style={pillStyle("#eef2ff", "#6255f5")}>{currentQuestion.lesson}</span>
                    <span style={pillStyle("#f8fafc", "#475569")}>{currentQuestion.grade}</span>
                    {features.topics && (
                      <span style={pillStyle("#ecfdf5", "#047857")}>{currentQuestion.topic || ALL_TOPICS}</span>
                    )}
                  </div>
                  <div className="fw-bold" style={{ fontSize: "12px", color: "#6b7280" }}>
                    سوال {toFa(currentIndex + 1)} از {toFa(questions.length)}
                  </div>
                </div>

                <div
                  className="bg-white border shadow-sm"
                  style={{ borderRadius: "24px", padding: "20px", borderColor: "#eef2f7" }}
                >
                  <div
                    style={{
                      height: "8px",
                      background: "#f1f5f9",
                      borderRadius: "999px",
                      overflow: "hidden",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${((currentIndex + 1) / questions.length) * 100}%`,
                        background: "#6255f5",
                        borderRadius: "999px",
                      }}
                    />
                  </div>

                  <div className="text-end fw-bold mb-3" style={{ fontSize: "15px", lineHeight: "2", color: "#111827" }}>
                    {currentQuestion.questionImage && (
                      <img
                        src={resolveMediaUrl(currentQuestion.questionImage)}
                        alt={`Question ${currentIndex + 1}`}
                        style={{
                          width: "100%",
                          maxHeight: "640px",
                          objectFit: "contain",
                          borderRadius: "14px",
                          border: "1px solid #e5e7eb",
                          background: "#fff",
                        }}
                      />
                    )}
                    {!currentQuestion.questionImage && (
                      <div style={{ color: "#991b1b", fontSize: "13px" }}>
                        تصویر سوال برای این ردیف پیدا نشد.
                      </div>
                    )}
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {OPTION_LABELS.map((option, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => answerQuestion(index)}
                        disabled={hasAnswered}
                        className="w-100 d-flex align-items-center justify-content-between text-end"
                        style={{
                          borderRadius: "16px",
                          padding: "14px 16px",
                          fontSize: "13px",
                          transition: "all 0.18s ease",
                          cursor: hasAnswered ? "default" : "pointer",
                          ...optionStateStyle(index, currentQuestion.correctAnswer, currentAnswer, hasAnswered),
                        }}
                      >
                        <span style={{ flex: 1, textAlign: "right", lineHeight: "1.9" }}>
                          {option}
                        </span>
                        {hasAnswered && index === currentQuestion.correctAnswer && <Check size={17} color="#16a34a" />}
                        {hasAnswered && index === currentAnswer && index !== currentQuestion.correctAnswer && (
                          <X size={17} color="#e11d48" />
                        )}
                      </button>
                    ))}
                  </div>

                  {hasAnswered && (
                    <div
                      className="mt-3"
                      style={{
                        background: currentIsCorrect ? "#ecfdf5" : "#fff1f2",
                        border: currentIsCorrect ? "1px solid #bbf7d0" : "1px solid #fecdd3",
                        color: currentIsCorrect ? "#166534" : "#9f1239",
                        borderRadius: "16px",
                        padding: "14px",
                        fontSize: "12px",
                        lineHeight: "1.9",
                      }}
                    >
                      <div className="fw-bold mb-1">
                        {currentIsCorrect ? "پاسخ درست بود." : "پاسخ انتخاب‌شده درست نبود."}
                      </div>
                      {features.explanations && currentQuestion.explanation && (
                        <BlockMarkdown>{currentQuestion.explanation}</BlockMarkdown>
                      )}
                    </div>
                  )}

                  <div className="d-flex flex-column flex-md-row gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => askTutor(currentQuestion)}
                      className="btn flex-fill d-inline-flex align-items-center justify-content-center gap-2 fw-bold"
                      style={{
                        borderRadius: "14px",
                        background: "#f5f3ff",
                        color: "#7c3aed",
                        border: "1px solid #e9d5ff",
                        padding: "12px",
                        fontSize: "12px",
                      }}
                    >
                      <Sparkles size={14} />
                      توضیح با منتورا
                    </button>

                    <button
                      type="button"
                      onClick={goNext}
                      className="btn flex-fill d-inline-flex align-items-center justify-content-center gap-2 fw-bold text-white"
                      style={{
                        borderRadius: "14px",
                        background: hasAnswered ? "#111827" : "#64748b",
                        border: "none",
                        padding: "12px",
                        fontSize: "12px",
                      }}
                    >
                      {currentIndex < questions.length - 1 ? (hasAnswered ? "سوال بعدی" : "رد کردن") : "مشاهده نتیجه"}
                      <ArrowLeft size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {phase === "results" && (
              <div className="bg-white border shadow-sm" style={{ borderRadius: "24px", padding: "20px", borderColor: "#eef2f7" }}>
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                  <div>
                    <h3 className="fw-bold mb-1" style={{ fontSize: "18px", color: "#111827" }}>
                      نتیجه تمرین
                    </h3>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {lesson} · {grade}
                      {features.topics ? ` · ${topic}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetRun}
                    className="btn d-inline-flex align-items-center gap-2 fw-bold"
                    style={{
                      borderRadius: "14px",
                      border: "1px solid #e5e7eb",
                      color: "#475569",
                      fontSize: "12px",
                      padding: "10px 14px",
                    }}
                  >
                    <RefreshCw size={14} />
                    ساخت تمرین جدید
                  </button>
                </div>

                <div className="row g-3 mb-3">
                  <ResultCard label="درست" value={result.correct} color="#047857" bg="#ecfdf5" />
                  <ResultCard label="غلط" value={result.wrong} color="#be123c" bg="#fff1f2" />
                  <ResultCard label="نزده" value={result.unsolved} color="#b45309" bg="#fffbeb" />
                  <ResultCard label="کل سوالات" value={result.total} color="#4338ca" bg="#eef2ff" />
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div style={scoreBoxStyle("#eef2ff")}>
                      <span className="d-block fw-bold mb-1" style={{ fontSize: "12px", color: "#4338ca" }}>
                        درصد خام
                      </span>
                      <span style={{ fontSize: "30px", fontWeight: 900, color: "#312e81" }}>
                        {toFa(result.rawPercent, 1)}٪
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div style={scoreBoxStyle("#f8fafc")}>
                      <span className="d-block fw-bold mb-1" style={{ fontSize: "12px", color: "#334155" }}>
                        درصد با نمره منفی کنکور
                      </span>
                      <span style={{ fontSize: "30px", fontWeight: 900, color: "#0f172a" }}>
                        {toFa(result.negativePercent, 1)}٪
                      </span>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
                        فرمول: ((درست × ۳ - غلط) ÷ (کل × ۳)) × ۱۰۰
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SummaryTile({ icon, label, value, color, bg }) {
  return (
    <div style={{ background: bg, borderRadius: "16px", padding: "14px", border: "1px solid rgba(15,23,42,0.06)" }}>
      <div className="d-flex align-items-center gap-2 mb-2" style={{ color, fontSize: "12px", fontWeight: 800 }}>
        {icon}
        {label}
      </div>
      <div className="fw-bold" style={{ color: "#111827", fontSize: "14px", lineHeight: "1.8" }}>
        {value}
      </div>
    </div>
  );
}

function ResultCard({ label, value, color, bg }) {
  return (
    <div className="col-6 col-md-3">
      <div style={{ background: bg, borderRadius: "18px", padding: "16px", border: "1px solid rgba(15,23,42,0.06)" }}>
        <span className="d-block fw-bold" style={{ color, fontSize: "12px" }}>
          {label}
        </span>
        <span className="d-block mt-2" style={{ color: "#111827", fontSize: "28px", fontWeight: 900 }}>
          {toFa(value)}
        </span>
      </div>
    </div>
  );
}

const tabButtonStyle = (active) => ({
  borderRadius: "11px",
  border: "none",
  background: active ? "#6255f5" : "transparent",
  color: active ? "#ffffff" : "#64748b",
  fontSize: "12px",
  padding: "9px 14px",
});

const choiceButtonStyle = (active) => ({
  minWidth: "96px",
  borderRadius: "14px",
  border: active ? "1px solid #6255f5" : "1px solid #e5e7eb",
  background: active ? "rgba(98,85,245,0.08)" : "#ffffff",
  color: active ? "#6255f5" : "#475569",
  fontSize: "12px",
  padding: "10px 14px",
});

const selectStyle = {
  borderRadius: "14px",
  border: "1px solid #e5e7eb",
  backgroundColor: "#f8fafc",
  fontSize: "13px",
  fontWeight: 700,
  color: "#111827",
  padding: "12px",
};

const pillStyle = (bg, color) => ({
  background: bg,
  color,
  borderRadius: "999px",
  padding: "6px 10px",
  fontSize: "11px",
  fontWeight: 800,
});

const optionStateStyle = (index, correctIndex, answer, hasAnswered) => {
  if (!hasAnswered) {
    return {
      border: "1px solid #e5e7eb",
      background: "#ffffff",
      color: "#334155",
    };
  }
  if (index === correctIndex) {
    return {
      border: "1px solid #86efac",
      background: "#ecfdf5",
      color: "#166534",
      fontWeight: 800,
    };
  }
  if (index === answer) {
    return {
      border: "1px solid #fecdd3",
      background: "#fff1f2",
      color: "#9f1239",
      fontWeight: 800,
    };
  }
  return {
    border: "1px solid #f1f5f9",
    background: "#ffffff",
    color: "#94a3b8",
  };
};

const scoreBoxStyle = (bg) => ({
  background: bg,
  border: "1px solid rgba(15,23,42,0.06)",
  borderRadius: "18px",
  padding: "18px",
  minHeight: "132px",
});
