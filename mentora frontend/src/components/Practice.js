import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockQuestions } from "../data/questions";
import {
  AlertCircle,
  Check,
  X,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Practice() {
  const navigate = useNavigate();
  const { setBridgeQuestion } = useApp();
  const onAskTutor = (questionText) => {
    setBridgeQuestion(questionText);
    navigate("/tutor");
  };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const question = mockQuestions[currentIndex];

  const handleSelect = (idx) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null || isSubmitted) return;

    setIsSubmitted(true);
    setTotalAnswered((prev) => prev + 1);

    if (selectedOption === question.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < mockQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }

    setSelectedOption(null);
    setIsSubmitted(false);
  };

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
        {/* Top statistics panel */}
        <div
          className="bg-white border shadow-sm d-flex justify-content-between align-items-center flex-wrap gap-2"
          style={{
            borderRadius: "20px",
            padding: "16px",
            borderColor: "#f1f3f5",
          }}
        >
          <h2
            className="mb-0 fw-bold text-dark"
            style={{ fontSize: "14px" }}
          >
            آمادگی و تمرین تطبیقی
          </h2>

          <div className="d-flex gap-2 flex-wrap">
            <span
              style={{
                fontSize: "12px",
                background: "rgba(98,85,245,0.1)",
                color: "#6255f5",
                padding: "8px 12px",
                borderRadius: "12px",
                fontWeight: 700,
              }}
            >
              درست: {score} از {totalAnswered}
            </span>

            <span
              style={{
                fontSize: "12px",
                background: "#f8f9fa",
                color: "#6c757d",
                padding: "8px 12px",
                borderRadius: "12px",
                fontWeight: 600,
                border: "1px solid #f1f3f5",
              }}
            >
              سوال {currentIndex + 1} از {mockQuestions.length}
            </span>
          </div>
        </div>

        {/* Main interactive Question Card */}
        <div
          className="bg-white border shadow-sm"
          style={{
            borderRadius: "28px",
            padding: "20px",
            borderColor: "#f1f3f5",
          }}
        >
          <div
            className="d-flex justify-content-between align-items-center mb-3"
            style={{
              background: "#f8f9fa",
              padding: "10px 12px",
              borderRadius: "16px",
              border: "1px solid #f1f3f5",
            }}
          >
            <span
              className="fw-bold"
              style={{
                fontSize: "12px",
                color: "#6255f5",
              }}
            >
              {question.subject}
            </span>

            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                padding: "4px 8px",
                borderRadius: "8px",
                ...(question.difficulty === "آسان"
                  ? {
                      background: "#ecfdf3",
                      color: "#059669",
                      border: "1px solid #d1fae5",
                    }
                  : question.difficulty === "متوسط"
                  ? {
                      background: "#fffbeb",
                      color: "#d97706",
                      border: "1px solid #fde68a",
                    }
                  : {
                      background: "#fff1f2",
                      color: "#e11d48",
                      border: "1px solid #fecdd3",
                    }),
              }}
            >
              سطح {question.difficulty}
            </span>
          </div>

          {/* Question Text */}
          <div
            className="text-end fw-semibold text-dark mb-3"
            style={{
              fontSize: "14px",
              lineHeight: "1.9",
              direction: "rtl",
            }}
          >
            {question.questionText}
          </div>

          {/* Options Selection */}
          <div className="d-flex flex-column gap-2 pt-2">
            {question.options.map((opt, idx) => {
              let optionStyle = {
                border: "1px solid #dee2e6",
                background: "#fff",
                color: "#495057",
              };

              let prefixIcon = null;

              if (selectedOption === idx) {
                optionStyle = {
                  border: "1px solid #6255f5",
                  background: "rgba(98,85,245,0.06)",
                  color: "#6255f5",
                  fontWeight: 600,
                };
              }

              if (isSubmitted) {
                if (idx === question.correctAnswer) {
                  optionStyle = {
                    border: "1px solid #22c55e",
                    background: "#ecfdf3",
                    color: "#166534",
                    fontWeight: 700,
                  };
                  prefixIcon = <Check size={16} color="#16a34a" style={{ marginLeft: "8px" }} />;
                } else if (selectedOption === idx) {
                  optionStyle = {
                    border: "1px solid #f43f5e",
                    background: "#fff1f2",
                    color: "#9f1239",
                    fontWeight: 600,
                  };
                  prefixIcon = <X size={16} color="#e11d48" style={{ marginLeft: "8px" }} />;
                } else {
                  optionStyle = {
                    border: "1px solid #f1f3f5",
                    background: "#fff",
                    color: "#adb5bd",
                    opacity: 0.65,
                  };
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  disabled={isSubmitted}
                  className="w-100 d-flex align-items-center justify-content-between text-end"
                  style={{
                    borderRadius: "18px",
                    padding: "14px",
                    fontSize: "13px",
                    transition: "all 0.2s ease",
                    cursor: isSubmitted ? "default" : "pointer",
                    ...optionStyle,
                  }}
                >
                  <span style={{ flex: 1, textAlign: "right" }}>{opt}</span>
                  {prefixIcon}
                </button>
              );
            })}
          </div>

          {/* Submission Controls */}
          <div className="pt-3 d-flex gap-3">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={selectedOption === null}
                className="btn w-100 text-white fw-bold"
                style={{
                  background: selectedOption === null ? "#dee2e6" : "#6255f5",
                  border: "none",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  fontSize: "14px",
                  boxShadow:
                    selectedOption === null
                      ? "none"
                      : "0 8px 18px rgba(98,85,245,0.18)",
                }}
              >
                ثبت پاسخ و ارزیابی
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="btn w-100 text-white fw-bold d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: "#212529",
                  border: "none",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  fontSize: "14px",
                  boxShadow: "0 8px 18px rgba(33,37,41,0.18)",
                }}
              >
                سوال بعدی
                <ArrowLeft size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Answer Explanation & Tutor Bridge */}
        {isSubmitted && (
          <div
            className="bg-white border shadow-sm text-end"
            style={{
              borderRadius: "28px",
              padding: "20px",
              borderColor: "#f1f3f5",
            }}
          >
            <div
              className="d-flex align-items-center gap-2 fw-bold mb-3"
              style={{
                fontSize: "12px",
                color: "#d97706",
              }}
            >
              <AlertCircle size={16} />
              تحلیل تشریحی و گام‌به‌گام سوال:
            </div>

            <p
              style={{
                fontSize: "12px",
                color: "#495057",
                lineHeight: "1.9",
                fontWeight: 300,
                background: "rgba(248,249,250,0.7)",
                padding: "14px",
                borderRadius: "18px",
                border: "1px solid #f1f3f5",
                marginBottom: "16px",
              }}
            >
              {question.explanation}
            </p>

            <div style={{ borderTop: "1px solid #f1f3f5", paddingTop: "14px" }}>
              <div
                style={{
                  fontSize: "11px",
                  color: "#adb5bd",
                  fontWeight: 300,
                  marginBottom: "10px",
                }}
              >
                متوجه مراحل محاسبات یا تحلیل مفهومی سوال نشدی؟
              </div>

              <button
                onClick={() =>
                  onAskTutor(
                    `می‌شه لطفا سوال رو گام‌به‌گام توضیح بدی؟ سوال: "${question.questionText}"`
                  )
                }
                className="btn w-100 d-inline-flex align-items-center justify-content-center gap-2 fw-bold"
                style={{
                  borderRadius: "14px",
                  background: "#f5f3ff",
                  color: "#7c3aed",
                  border: "1px solid #e9d5ff",
                  padding: "12px 14px",
                  fontSize: "12px",
                }}
              >
                <Sparkles size={14} />
                حل و رفع اشکال کامل با معلم منتورا
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
