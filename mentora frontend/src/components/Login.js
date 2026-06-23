import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  Eye,
  EyeClosed
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(email, password);
      const from = location.state?.from || "/home";
      if (data.profile?.onboardingCompleted) {
        navigate(from, { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    } catch (err) {
      setError(err.message || "ورود ناموفق بود.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center px-3"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        fontFamily: "Vazir, Inter, Arial, sans-serif",
        direction: "rtl",
      }}
    >
      <div
        className="w-100 bg-white border shadow"
        style={{
          maxWidth: "420px",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)",
          borderColor: "#e2e8f0",
        }}
      >
        <div className="text-center mb-3">
          <h1 className="fw-bold mb-2" style={{ fontSize: "30px", color: "#0f172a" }}>
            خوش برگشتی!
          </h1>
          <p className="mb-0" style={{ fontSize: "14px", color: "#64748b" }}>
            وارد شو تا با حساب کاربری خودت ادامه بدی
          </p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 small text-end py-2 mb-3" style={{ borderRadius: "12px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: "14px", color: "#334155" }}>
              ایمیل
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="ایمیل خود را وارد کنید"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div className="mb-3">
            <label
              className="form-label fw-semibold"
              style={{ fontSize: "14px", color: "#334155" }}
            >
              رمز عبور
            </label>

            <div className="position-relative w-100">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="رمز عبور خود را وارد کنید"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingLeft: "50px" }}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  left: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "14px",
                  padding: 0
                }}
              >
                {showPassword ? <EyeClosed size={18} />
                  : <Eye size={18}/>}
              </button>
            </div>
          </div>


          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
            <label className="d-flex align-items-center gap-2" style={{ fontSize: "14px", color: "#475569" }}>
              <span style={{ fontSize: "12px" }}>مرا به خاطر بسپار</span>
              <input
                type="checkbox"
                className="form-check-input m-0"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn w-100 fw-bold"
            style={{ marginTop: "6px", padding: "14px 18px", borderRadius: "14px", border: "none", background: "#2563eb", color: "#ffffff", fontSize: "15px" }}
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        <div className="mt-4 d-flex justify-content-center align-items-center gap-2 flex-wrap">
          <span style={{ color: "#64748b", fontSize: "14px" }}>حساب کاربری نداری؟</span>
          <Link to="/signin" className="btn p-0 fw-bold" style={{ border: "none", background: "transparent", color: "#2563eb", fontSize: "14px", boxShadow: "none", textDecoration: "none" }}>
            ایجاد حساب کاربری
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

export default Login;
