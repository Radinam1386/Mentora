import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeClosed } from "lucide-react";
import { useApp } from "../context/AppContext";
import StudyLoading from "./StudyLoading";

const Signin = () => {
  const navigate = useNavigate();
  const { register } = useApp();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیست.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      await register({ fullName, phone, password, confirmPassword });
      setSuccessMsg("ثبت‌نام با موفقیت انجام شد.");
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(err?.message || "خطا در اتصال به سرور.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
        padding: "24px",
        fontFamily: "Vazir, Arial, sans-serif",
        direction: "rtl",
      }}
    >
      <div
        className="card border-0 shadow-lg w-100"
        style={{ maxWidth: "420px", borderRadius: "24px", padding: "32px", backgroundColor: "#ffffff" }}
      >
        <div className="text-center mb-4">
          <h1 className="fw-bold mb-2" style={{ fontSize: "30px", color: "#0f172a" }}>
            ایجاد حساب کاربری
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b" }}>
            ثبت‌نام کنید و مسیر یادگیری خود را شروع کنید
          </p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 small text-end py-2 mb-3" style={{ borderRadius: "12px" }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success border-0 small text-end py-2 mb-3" style={{ borderRadius: "12px" }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="d-flex flex-column gap-3">
          <div className="d-flex flex-column gap-2">
            <label className="fw-semibold" style={labelStyle}>نام و نام خانوادگی</label>
            <input
              type="text"
              placeholder="نام کامل خود را وارد کنید"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-control"
              style={inputStyle}
              required
            />
          </div>

          <div className="d-flex flex-column gap-2">
            <label className="fw-semibold" style={labelStyle}>شماره موبایل</label>
            <input
              type="tel"
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-control"
              style={inputStyle}
              required
            />
          </div>

          <div className="d-flex flex-column gap-2">
            <label className="fw-semibold" style={labelStyle}>رمز عبور</label>
            <div className="position-relative d-flex align-items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="یک رمز عبور انتخاب کنید"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ ...inputStyle, paddingLeft: "72px" }}
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowPassword((p) => !p)} style={eyeBtn}>
                {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="d-flex flex-column gap-2">
            <label className="fw-semibold" style={labelStyle}>تکرار رمز عبور</label>
            <div className="position-relative d-flex align-items-center">
              <input
                type={showPassword2 ? "text" : "password"}
                placeholder="رمز عبور را تکرار کنید"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-control"
                style={{ ...inputStyle, paddingLeft: "72px" }}
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowPassword2((p) => !p)} style={eyeBtn}>
                {showPassword2 ? <EyeClosed size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn w-100 fw-bold mt-2" style={btnStyle}>
            {loading ? <StudyLoading /> : "ثبت‌نام"}
          </button>
        </form>

        <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
          <Link to="/login" className="btn btn-link p-0 fw-bold text-decoration-none" style={{ color: "#2563eb", fontSize: "14px" }}>
            قبلاً حساب ساخته‌اید؟ ورود
          </Link>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  backgroundColor: "#ffffff",
};
const labelStyle = { fontSize: "14px", color: "#334155" };
const btnStyle = {
  padding: "14px 18px",
  borderRadius: "14px",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  fontSize: "15px",
  border: "none",
};
const eyeBtn = {
  position: "absolute",
  left: "20px",
  top: "50%",
  transform: "translateY(-50%)",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "14px",
  padding: 0,
};

export default Signin;
