import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Eye, EyeClosed } from "lucide-react";
import StudyLoading from "./StudyLoading";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goAfterAuth = (data) => {
    const from = location.state?.from || "/home";

    if (data?.profile?.onboardingCompleted) {
      navigate(from, { replace: true });
    } else {
      navigate("/onboarding", { replace: true });
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      const data = await login(phone, password);
      goAfterAuth(data);
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
        }}
      >
        <div className="text-center mb-3">
          <h1 className="fw-bold mb-2">خوش برگشتی!</h1>
          <p style={{ fontSize: "14px", color: "#64748b" }}>
            وارد حساب کاربری خودت شو
          </p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handlePasswordLogin}>
          <div className="mb-3">
            <label className="form-label">شماره موبایل</label>
            <input
              type="tel"
              className="form-control"
              placeholder="09123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">رمز عبور</label>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingLeft: "50px" }}
              />

              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{
                  position: "absolute",
                  left: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                }}
              >
                {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn w-100 fw-bold"
            style={primaryButton}
          >
            {loading ? <StudyLoading/>: "ورود"}
          </button>
        </form>

        <div className="d-flex align-items-center justify-content-center">
          <Link to="/signin" className="btn btn-link mt-2">
            حساب کاربری ندارید؟ ثبت‌نام کنید
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
};

const primaryButton = {
  padding: "14px",
  borderRadius: "14px",
  background: "#2563eb",
  color: "#fff",
};

export default Login;
