import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Trophy, BookOpen, Clock } from "lucide-react";
import { useApp } from "../context/AppContext";
import { apiJson } from "../utils/api";

const Onboarding = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useApp();
  const [grade, setGrade] = useState("دوازدهم");
  const [major, setMajor] = useState("تجربی");
  const [targetRank, setTargetRank] = useState("زیر ۱۰۰۰");
  const [studyHours, setStudyHours] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { response, data } = await apiJson("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, major, targetRank, studyHours }),
      });

      if (!response.ok) {
        throw new Error(data.error || "خطا در ثبت اطلاعات. لطفاً دوباره تلاش کنید.");
      }

      completeOnboarding(data.profile, data.tasks);
      navigate("/today");
    } catch (err) {
      setError(err.message || "برقراری ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        background: "linear-gradient(to bottom, #f8fafc, #eef2f6)",
        fontFamily: "Vazir ,Tahoma, Arial, sans-serif",
        direction: "rtl"
      }}
    >
      <div
        className="row g-0 overflow-hidden shadow-lg"
        style={{
          maxWidth: "1200px",
          width: "100%",
          borderRadius: "24px",
          backgroundColor: "#fff",
          border: "1px solid #f1f5f9"
        }}
      >
        {/* Left Side (Decorative Header) */}
        <div
          className="col-md-5 d-flex flex-column justify-content-center align-items-center text-center text-md-end p-4 p-md-5 position-relative text-white"
          style={{
            background: "linear-gradient(135deg, #6255f5, #4f46e5)"
          }}
        >
          <div className="position-absolute opacity-10 d-none d-md-block" style={{ left: "-20px", bottom: "-20px" }}>
            <Sparkles size={180} />
          </div>
          <h1 className="display-5 fw-black mb-3 position-relative z-1" style={{ fontWeight: "900" }}>
            منتورا<br className="d-none d-md-block" /> Mentora
          </h1>
          <p className="lead fw-light position-relative z-1" style={{ fontSize: "1.1rem", opacity: 0.9 }}>
            مربی شخصی‌سازی‌شده و همگام با برنامه کنکور شما
          </p>
        </div>

        {/* Right Side (Form) */}
        <div className="col-md-7 p-4 p-md-5">
          <form onSubmit={handleSubmit}>
            <div className="text-center mb-4">
              <h2 className="h5 fw-bold text-dark">خوش آمدید! مسیر شخصی خودت رو بساز</h2>
              <p className="small text-muted">با وارد کردن مشخصات تحصیلی، بهترین برنامه‌ریزی را بگیرید.</p>
            </div>

            {error && (
              <div className="alert alert-danger border-0 small text-end py-2" style={{ borderRadius: "12px", backgroundColor: "#fff5f5", color: "#e53e3e" }}>
                {error}
              </div>
            )}

            {/* Grade Selection */}
            <div className="mb-4 text-end">
              <label className="form-label d-flex align-items-center justify-content-start gap-2 fw-bold text-secondary small">
                <BookOpen size={16} className="text-primary" />
                پایه تحصیلی شما:
              </label>
              <div className="row g-2">
                {["یازدهم", "دوازدهم"].map((g) => (
                  <div className="col-6" key={g}>
                    <button
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`btn w-100 py-2 fw-bold small ${grade === g
                          ? "btn-primary shadow-sm"
                          : "btn-light border text-muted"
                        }`}
                      style={{ borderRadius: "12px" }}
                    >
                      پایه {g}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Major Selection */}
            <div className="mb-4 text-end">
              <label className="form-label d-flex align-items-center justify-content-start gap-2 fw-bold text-secondary small">
                <Trophy size={16} className="text-primary" />
                رشته تحصیلی:
              </label>
              <div className="row g-2">
                {["تجربی", "ریاضی"].map((m) => (
                  <div className="col-6" key={m}>
                    <button
                      type="button"
                      onClick={() => setMajor(m)}
                      className={`btn w-100 py-2 fw-bold small ${major === m
                          ? "btn-primary shadow-sm"
                          : "btn-light border text-muted"
                        }`}
                      style={{ borderRadius: "12px" }}
                    >
                      رشته {m}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 text-end">
              <label className="form-label d-flex align-items-center justify-content-start gap-2 fw-bold text-secondary small">
                <Trophy size={16} className="text-primary" />
                رتبه یا تراز هدف شما در کنکور:
              </label>
              <input
                type="text"
                value={targetRank}
                onChange={(e) => setTargetRank(e.target.value)}
                className="form-control text-end"
                style={{ borderRadius: "12px", backgroundColor: "#f8fafc", fontSize: "14px", padding: "12px" }}
                placeholder="مثلاً: زیر ۱۰۰۰ منطقه"
              />
            </div>

            <div className="mb-4 text-end">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="d-flex align-items-center gap-2 fw-bold text-secondary small">
                  <Clock size={16} className="text-primary" />
                  ساعت مطالعه روزانه در دسترس:
                </span>
                <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">
                  {studyHours} ساعت
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="14"
                value={studyHours}
                onChange={(e) => setStudyHours(Number(e.target.value))}
                className="form-range custom-range"
              />
              <div className="d-flex justify-content-between small text-muted mt-1" style={{ fontSize: "10px" }}>
                <span>2 ساعت</span>
                <span>8 ساعت</span>
                <span>14   ساعت</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-100 py-3 fw-bold shadow-sm"
              style={{ borderRadius: "14px", backgroundColor: "#6255f5", borderColor: "#6255f5" }}
            >
              {loading ? (
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
              ) : (
                "شروع یادگیری با منتورا"
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .btn-primary { background-color: #6255f5; border-color: #6255f5; }
        .btn-primary:hover { background-color: #4f46e5; border-color: #4f46e5; }
        .bg-primary-subtle { backgroundColor: rgba(98, 85, 245, 0.1) !important; }
        .form-range::-webkit-slider-thumb { background: #6255f5; }
        .form-range::-moz-range-thumb { background: #6255f5; }
        .form-control:focus { border-color: #6255f5; box-shadow: 0 0 0 0.2rem rgba(98, 85, 245, 0.25); }
      `}</style>
    </div>
  );
};

export default Onboarding;