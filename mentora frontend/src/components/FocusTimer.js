import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, Target, Zap } from "lucide-react";

const FocusTimer = () => {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  const [mode, setMode] = useState("focus"); // focus | break
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  const timerRef = useRef(null);

  const totalTime = mode === "focus" ? focusMinutes * 60 : breakMinutes * 60;
  const progress = totalTime > 0 ? ((totalTime - seconds) / totalTime) * 100 : 0;

  useEffect(() => {
    if (isActive && seconds > 0) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      clearInterval(timerRef.current);
      setIsActive(false);
      alert(mode === "focus" ? "زمان تمرکز تمام شد! وقت استراحته." : "استراحت تمام شد! آماده‌ای؟");
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, seconds, mode]);

  useEffect(() => {
    setIsActive(false);
    setSeconds(mode === "focus" ? focusMinutes * 60 : breakMinutes * 60);
  }, [focusMinutes, breakMinutes, mode]);

  const toggleTimer = () => {
    setIsActive((prev) => !prev);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(mode === "focus" ? focusMinutes * 60 : breakMinutes * 60);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setSeconds(newMode === "focus" ? focusMinutes * 60 : breakMinutes * 60);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const circumference = 2 * Math.PI * 100;

  return (
    <div
      className="container py-5 d-flex justify-content-center"
      style={{ direction: "rtl", fontFamily: "Vazir, Tahoma, sans-serif" }}
    >
      <div
        className="card border-0 shadow-lg"
        style={{
          borderRadius: "40px",
          maxWidth: "430px",
          width: "100%",
          background: "#fff",
        }}
      >
        <div className="card-body p-5 text-center">
          {/* Header */}
          <div className="mb-4">
            <h2 className="fw-bold mb-1" style={{ fontSize: "20px", color: "#1f2937" }}>
              حالت تمرکز عمیق
            </h2>
            <p className="text-muted" style={{ fontSize: "13px" }}>
              ذهنت رو روی هدف قفل کن
            </p>
          </div>

          {/* Time Settings */}
          <div className="row g-3 mb-4">
            <div className="col-6">
              <div
                className="p-3"
                style={{
                  background: "#f8f9fc",
                  borderRadius: "18px",
                  border: "1px solid #eef0f6",
                }}
              >
                <label
                  className="form-label fw-bold mb-2"
                  style={{ fontSize: "13px", color: "#6255f5" }}
                >
                  زمان مطالعه
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={focusMinutes}
                  onChange={(e) => setFocusMinutes(Number(e.target.value))}
                  className="form-control text-center"
                  style={{
                    borderRadius: "12px",
                    border: "1px solid #ddd",
                    fontWeight: "700",
                  }}
                />
                <div className="mt-2 text-muted" style={{ fontSize: "11px" }}>
                  دقیقه
                </div>
              </div>
            </div>

            <div className="col-6">
              <div
                className="p-3"
                style={{
                  background: "#f8f9fc",
                  borderRadius: "18px",
                  border: "1px solid #eef0f6",
                }}
              >
                <label
                  className="form-label fw-bold mb-2"
                  style={{ fontSize: "13px", color: "#10b981" }}
                >
                  زمان استراحت
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(Number(e.target.value))}
                  className="form-control text-center"
                  style={{
                    borderRadius: "12px",
                    border: "1px solid #ddd",
                    fontWeight: "700",
                  }}
                />
                <div className="mt-2 text-muted" style={{ fontSize: "11px" }}>
                  دقیقه
                </div>
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div
            className="d-flex justify-content-center gap-2 mb-5 bg-light p-2"
            style={{ borderRadius: "20px" }}
          >
            <button
              onClick={() => switchMode("focus")}
              className={`btn btn-sm border-0 flex-grow-1 d-flex align-items-center justify-content-center gap-2 ${
                mode === "focus" ? "bg-white shadow-sm fw-bold" : "text-muted"
              }`}
              style={{
                borderRadius: "15px",
                transition: "0.3s",
                color: mode === "focus" ? "#6255f5" : "#6b7280",
              }}
            >
              <Zap size={16} /> تمرکز
            </button>

            <button
              onClick={() => switchMode("break")}
              className={`btn btn-sm border-0 flex-grow-1 d-flex align-items-center justify-content-center gap-2 ${
                mode === "break" ? "bg-white shadow-sm fw-bold" : "text-muted"
              }`}
              style={{
                borderRadius: "15px",
                transition: "0.3s",
                color: mode === "break" ? "#10b981" : "#6b7280",
              }}
            >
              <Coffee size={16} /> استراحت
            </button>
          </div>

          {/* Circular Progress & Timer */}
          <div className="position-relative d-flex justify-content-center align-items-center mb-5">
            <svg width="220" height="220" viewBox="0 0 220 220">
              <circle
                cx="110"
                cy="110"
                r="100"
                fill="none"
                stroke="#f1f3f5"
                strokeWidth="8"
              />
              <circle
                cx="110"
                cy="110"
                r="100"
                fill="none"
                stroke={mode === "focus" ? "#6255f5" : "#10b981"}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (circumference * progress) / 100}
                strokeLinecap="round"
                style={{
                  transition: "stroke-dashoffset 1s linear",
                  transform: "rotate(-90deg)",
                  transformOrigin: "center",
                }}
              />
            </svg>

            <div className="position-absolute text-center">
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: "900",
                  color: "#1f2937",
                  letterSpacing: "-1px",
                }}
              >
                {formatTime(seconds)}
              </div>
              <div className="text-muted fw-bold" style={{ fontSize: "12px" }}>
                {mode === "focus" ? "زمان مطالعه" : "زمان استراحت"}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="d-flex justify-content-center align-items-center gap-4">
            <button
              onClick={resetTimer}
              className="btn border-0 p-3"
              style={{
                borderRadius: "50%",
                background: "#f8f9fa",
                color: "#6b7280",
                width: "56px",
                height: "56px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RotateCcw size={24} />
            </button>

            <button
              onClick={toggleTimer}
              className="btn shadow-lg"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: mode === "focus" ? "#6255f5" : "#10b981",
                color: "white",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              {isActive ? (
                <Pause size={32} />
              ) : (
                <Play size={32} fill="white" />
              )}
            </button>

            <div
              style={{
                width: "56px",
                height: "56px",
                opacity: 0,
              }}
            />
          </div>

          {/* Motivational Tip */}
          <div
            className="mt-5 p-3"
            style={{
              background: mode === "focus" ? "rgba(98, 85, 245, 0.05)" : "rgba(16, 185, 129, 0.08)",
              borderRadius: "20px",
            }}
          >
            <p className="mb-0 text-dark" style={{ fontSize: "11px", fontWeight: "500" }}>
              <Target
                size={14}
                className="me-1"
                style={{ color: mode === "focus" ? "#6255f5" : "#10b981" }}
              />
              {mode === "focus"
                ? "بیشترین تمرکز در ۲۵ دقیقه اول اتفاق می‌افتد."
                : "استراحت کوتاه، بازدهی مطالعه را بیشتر می‌کند."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
