import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Eye, EyeClosed } from "lucide-react";
import { apiJson } from "../utils/api";
import OTPPage from "./OTPPage";

const API = process.env.REACT_APP_API_URL || "";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();

  const [mode, setMode] = useState("password"); // password | otp
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

  // OTP ورود: اتصال به بک‌اند
  const sendLoginOtp = async () => {
    const { response, data } = await apiJson(`${API}/api/auth/login/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      throw new Error(data?.error || "ارسال کد ناموفق بود.");
    }

    return data;
  };

  // OTP ورود: تایید کد و ذخیره توکن
  const verifyLoginOtp = async (code) => {
    const { response, data } = await apiJson(`${API}/api/auth/login/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });

    if (!response.ok) {
      throw new Error(data?.error || "کد وارد شده صحیح نیست یا منقضی شده است.");
    }

    if (data?.token) {
      localStorage.setItem("mentora_token", data.token);
    }

    return data;
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
        {mode === "password" && (
          <>
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

                <div className="text-start mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setMode("otp");
                    }}
                    className="btn-sm btn btn-link"
                  >
                    ورود با رمز یکبار مصرف
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn w-100 fw-bold"
                style={primaryButton}
              >
                {loading ? "در حال پردازش..." : "ورود"}
              </button>
            </form>
          </>
        )}

        {mode === "otp" && (
          <OTPPage
            phone={phone}
            onPhoneChange={setPhone}
            title="ورود با رمز یکبار مصرف"
            description="برای ورود، کد تایید پیامک‌شده را وارد کنید"
            codeLength={6}
            timerSeconds={120}
            initialCodeSent={false}
            onSendOtp={sendLoginOtp}
            onVerifyOtp={verifyLoginOtp}
            onVerified={goAfterAuth}
            onBack={() => {
              setError("");
              setMode("password");
            }}
            backText="ورود با رمز عبور"
            sendButtonText="ارسال کد تایید"
            verifyButtonText="تایید و ورود"
          />
        )}

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
