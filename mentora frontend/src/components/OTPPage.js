import { useEffect, useState } from "react";
import OtpInput from "react-otp-input";

/**
 * کامپوننت مشترک OTP برای ورود و ثبت‌نام
 *
 * این کامپوننت فقط UI و جریان دو مرحله‌ای OTP را مدیریت می‌کند:
 * 1) ارسال / ارسال مجدد کد
 * 2) دریافت و تایید کد
 *
 * اتصال به بک‌اند از طریق props انجام می‌شود تا هم Login و هم SignIn
 * بتوانند از همین صفحه استفاده کنند ولی payload مخصوص خودشان را ارسال کنند.
 */
export default function OTPPage({
  phone,
  onPhoneChange,
  phonePlaceholder = "09123456789",
  title = "تایید شماره موبایل",
  description,
  codeLength = 6,
  timerSeconds = 120,
  initialCodeSent = false,
  onSendOtp,
  onVerifyOtp,
  onVerified,
  onBack,
  backText = "بازگشت",
  onEdit,
  editText = "ویرایش شماره",
  sendButtonText = "دریافت کد تایید",
  resendButtonText = "ارسال مجدد کد",
  verifyButtonText = "تایید کد",
}) {
  const [codeSent, setCodeSent] = useState(initialCodeSent);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(initialCodeSent ? timerSeconds : 0);
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState(initialCodeSent ? "کد تایید ارسال شد." : "");

  useEffect(() => {
    setCodeSent(initialCodeSent);
    setTimer(initialCodeSent ? timerSeconds : 0);
    setOtp("");
  }, [initialCodeSent, timerSeconds, phone]);

  useEffect(() => {
    if (!codeSent || timer <= 0) return undefined;

    const interval = setInterval(() => {
      setTimer((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [codeSent, timer]);

  const handleSendOtp = async () => {
    if (!phone) {
      setError("شماره موبایل را وارد کنید.");
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoadingSend(true);

    try {
      const result = await onSendOtp?.();
      setCodeSent(true);
      setOtp("");
      setTimer(timerSeconds);
      setSuccessMsg(result?.message || "کد تایید به شماره موبایل شما ارسال شد.");
    } catch (err) {
      setError(err?.message || "ارسال کد ناموفق بود.");
    } finally {
      setLoadingSend(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== codeLength) {
      setError(`کد تایید باید ${codeLength} رقمی باشد.`);
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoadingVerify(true);

    try {
      const data = await onVerifyOtp?.(otp);
      await onVerified?.(data);
    } catch (err) {
      setError(err?.message || "کد وارد شده صحیح نیست یا منقضی شده است.");
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleOtpChange = (value) => {
    const normalizedValue = String(value || "")
      .replace(/\D/g, "")
      .slice(0, codeLength);

    setOtp(normalizedValue);
    if (error) setError("");
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="text-center">
        <h3 className="fw-bold mb-2" style={{ fontSize: "24px", color: "#0f172a" }}>
          {title}
        </h3>
        <p className="mb-0" style={{ fontSize: "14px", color: "#64748b" }}>
          {description || (codeSent ? `کد ارسال‌شده به ${phone} را وارد کنید` : "برای ادامه، کد تایید را دریافت کنید")}
        </p>
      </div>

      {error && (
        <div className="alert alert-danger border-0 small text-end py-2 mb-0" style={{ borderRadius: "12px" }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success border-0 small text-end py-2 mb-0" style={{ borderRadius: "12px" }}>
          {successMsg}
        </div>
      )}

      {/* بخش ۱: دریافت شماره و ارسال کد */}
      {!codeSent && (
        <div className="d-flex flex-column gap-3">
          {onPhoneChange && (
            <div className="d-flex flex-column gap-2">
              <label className="fw-semibold" style={labelStyle}>شماره موبایل</label>
              <input
                type="tel"
                className="form-control"
                placeholder={phonePlaceholder}
                value={phone}
                onChange={(e) => {
                  onPhoneChange(e.target.value);
                  if (error) setError("");
                }}
                style={inputStyle}
                required
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loadingSend}
            className="btn w-100 fw-bold"
            style={primaryButton}
          >
            {loadingSend ? "در حال ارسال کد..." : sendButtonText}
          </button>
        </div>
      )}

      {/* بخش ۲: تایید کد */}
      {codeSent && (
        <form onSubmit={handleVerifyOtp} className="d-flex flex-column gap-3">
          <p className="text-center mb-0" style={{ fontSize: "14px", color: "#64748b" }}>
            کد تایید به شماره <span dir="ltr">{phone}</span> ارسال شد.
          </p>

          <div className="d-flex justify-content-center" style={{ direction: "ltr" }}>
            <OtpInput
              value={otp}
              onChange={handleOtpChange}
              numInputs={codeLength}
              inputType="tel"
              shouldAutoFocus
              renderSeparator={<span style={{ width: "8px" }} />}
              renderInput={(props) => <input {...props} style={otpStyle} />}
            />
          </div>

          <button
            type="submit"
            disabled={loadingVerify || otp.length !== codeLength}
            className="btn w-100 fw-bold"
            style={primaryButton}
          >
            {loadingVerify ? "در حال تایید..." : verifyButtonText}
          </button>

          <div className="text-center">
            {timer > 0 ? (
              <small style={{ color: "#64748b" }}>ارسال مجدد تا {timer} ثانیه</small>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loadingSend}
                className="btn btn-link p-0 text-decoration-none"
              >
                {loadingSend ? "در حال ارسال..." : resendButtonText}
              </button>
            )}
          </div>
        </form>
      )}

      {(onEdit || onBack) && (
        <div className="d-flex justify-content-center gap-3">
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                setOtp("");
                setError("");
                setSuccessMsg("");
                onEdit();
              }}
              className="btn btn-link p-0 text-decoration-none"
              style={{ color: "#334155" }}
            >
              {editText}
            </button>
          )}

          {onBack && (
            <button
              type="button"
              onClick={() => {
                setOtp("");
                setError("");
                setSuccessMsg("");
                onBack();
              }}
              className="btn btn-link p-0 text-decoration-none"
            >
              {backText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  backgroundColor: "#ffffff",
};

const labelStyle = { fontSize: "14px", color: "#334155" };

const primaryButton = {
  padding: "14px 18px",
  borderRadius: "14px",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  fontSize: "15px",
  border: "none",
};

const otpStyle = {
  width: "48px",
  height: "52px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  fontSize: "20px",
  textAlign: "center",
};
