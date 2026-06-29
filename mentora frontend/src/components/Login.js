import React, { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Eye, EyeClosed } from "lucide-react";

const Login = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();

  const [mode, setMode] = useState("password"); // password | otp

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [timer, setTimer] = useState(0);

  const startTimer = () => {
    setTimer(90);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const sendOtp = async () => {
    try {
      setLoading(true);

      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone })
      });

      setOtpSent(true);
      startTimer();

    } catch (err) {
      setError("ارسال کد ناموفق بود");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {

      setLoading(true);

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone,
          code: otp
        })
      });

      const data = await res.json();

      const from = location.state?.from || "/home";

      if (data.profile?.onboardingCompleted) {
        navigate(from, { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }

    } catch (err) {
      setError("کد وارد شده صحیح نیست");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "password") {
      try {
        setLoading(true);
        const data = await login(phone, password);

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
    } else {
      if (!otpSent) {
        sendOtp();
      } else {
        verifyOtp();
      }
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

        {error && (
          <div className="alert alert-danger py-2 small">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

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


          {/* PASSWORD LOGIN */}

          {mode === "password" && (
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
                    background: "transparent"
                  }}
                >
                  {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                </button>

              </div>

              <div className="text-start mt-1">
                <button
                  type="button"
                  onClick={() => setMode("otp")}
                  className="btn-sm  btn btn-link"
                >
                  ورود با رمز یکبار مصرف
                </button>
              </div>

            </div>
          )}


          {/* OTP LOGIN */}

          {mode === "otp" && (

            <div className="mb-3">

              {!otpSent ? (

                <div className="text-center">

                  <button
                    type="button"
                    onClick={sendOtp}
                    className="btn btn-outline-primary w-100"
                    style={{ borderRadius: "12px", padding: "12px" }}
                  >
                    ارسال کد تایید
                  </button>

                </div>

              ) : (

                <>
                  <label className="form-label">کد پیامک شده</label>

                  <input
                    type="text"
                    maxLength="5"
                    className="form-control text-center"
                    placeholder="12345"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    style={{
                      ...inputStyle,
                      fontSize: "20px",
                      letterSpacing: "8px",
                      textAlign: "center"
                    }}
                  />

                  {timer > 0 && (
                    <small style={{ color: "#64748b" }}>
                      ارسال مجدد تا {timer} ثانیه
                    </small>
                  )}

                </>
              )}

              <div className="text-center mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("password")
                    setOtpSent(false)
                  }}
                  className="btn btn-link"
                >
                  ورود با رمز عبور
                </button>
              </div>

            </div>

          )}

          <button
            type="submit"
            disabled={loading}
            className="btn w-100 fw-bold"
            style={{
              padding: "14px",
              borderRadius: "14px",
              background: "#2563eb",
              color: "#fff"
            }}
          >

            {loading
              ? "در حال پردازش..."
              : mode === "password"
                ? "ورود"
                : otpSent
                  ? "تایید کد"
                  : "ارسال کد"}

          </button>

        </form>

        <div className="d-flex align-items-center justify-content-center">
          <Link
            to="/signin"
            className="btn btn-link mt-2"
          >
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

export default Login;
