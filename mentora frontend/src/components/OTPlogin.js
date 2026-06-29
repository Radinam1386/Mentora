import { useState, useEffect } from "react";
import OtpInput from "react-otp-input";

export default function PhoneLogin() {

    const [step, setStep] = useState(2);
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(90);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const sendOtp = async () => {

        if (phone.length !== 11) {
            setError("شماره موبایل معتبر نیست");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ phone })
            });

            if (res.ok) {
                setStep(2);
                setTimer(90);
            } else {
                setError("ارسال کد ناموفق بود");
            }

        } catch {
            setError("خطا در ارتباط با سرور");
        }

        setLoading(false);
    };

    const verifyOtp = async (code) => {

        try {

            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ phone, code })
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem("token", data.token);
                window.location.href = "/";
            } else {
                setError("کد وارد شده صحیح نیست");
            }

        } catch {
            setError("خطا در تایید کد");
        }
    };

    useEffect(() => {
        if (otp.length === 5) {
            verifyOtp(otp);
        }
    }, [otp]);

    useEffect(() => {

        if (timer <= 0) return;

        const t = setInterval(() => {
            setTimer((s) => s - 1);
        }, 1000);

        return () => clearInterval(t);

    }, [timer]);

    return (

        <div
            className="min-vh-100 d-flex align-items-center justify-content-center px-3"
            style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                fontFamily: "Vazir, Inter, Arial, sans-serif",
                direction: "rtl"
            }}
        >

            <div
                className="w-100 bg-white border shadow"
                style={{
                    maxWidth: "420px",
                    borderRadius: "24px",
                    padding: "32px"
                }}
            >

                <div className="text-center mb-4">
                    <h3 className="fw-bold mb-2">ورود با رمز یکبار مصرف</h3>
                    <p style={{ fontSize: "14px", color: "#64748b" }}>
                        برای ادامه کد ارسال شده را وارد کنید
                    </p>
                </div>

                {error && (
                    <div className="alert alert-danger py-2 small">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <>
                        <input
                            type="tel"
                            className="form-control mb-3"
                            placeholder="09123456789"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={inputStyle}
                        />

                        <button
                            className="btn w-100 fw-bold"
                            onClick={sendOtp}
                            disabled={loading}
                            style={primaryButton}
                        >
                            {loading ? "در حال ارسال..." : "دریافت کد"}
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <p
                            className="text-center mb-4"
                            style={{ fontSize: "14px", color: "#64748b" }}
                        >
                            کد ارسال شده به {phone}
                        </p>

                        <div className="d-flex justify-content-center mb-3" style={{ direction: "ltr" }}>
                            <OtpInput
                                value={otp}
                                onChange={setOtp}
                                numInputs={5}
                                renderSeparator={<span style={{ width: "8px" }}></span>}
                                renderInput={(props) => (
                                    <input
                                        {...props}
                                        style={otpStyle}
                                    />
                                )}
                            />
                        </div>

                        <div className="text-center mt-3">

                            {timer > 0 ? (
                                <small style={{ color: "#64748b" }}>
                                    ارسال مجدد تا {timer} ثانیه
                                </small>
                            ) : (
                                <button
                                    onClick={sendOtp}
                                    className="btn btn-link"
                                >
                                    ارسال مجدد کد
                                </button>
                            )}

                        </div>
                    </>
                )}

            </div>

        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    fontSize: "14px"
};

const primaryButton = {
    padding: "14px",
    borderRadius: "14px",
    background: "#2563eb",
    color: "#fff"
};

const otpStyle = {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    fontSize: "20px",
    textAlign: "center"
};
