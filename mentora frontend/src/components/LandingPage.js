import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card, Carousel, Badge } from "react-bootstrap";
import {
  Sparkles,
  Brain,
  BarChart3,
  TimerReset,
  BookOpenCheck,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [smoothMouse, setSmoothMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 160;
      const y = (e.clientY / window.innerHeight - 0.5) * 160;
      setMouse({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    let animationFrame;

    const animate = () => {
      setSmoothMouse((prev) => ({
        x: prev.x + (mouse.x - prev.x) * 0.08,
        y: prev.y + (mouse.y - prev.y) * 0.08,
      }));
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, [mouse]);

  const features = [
    {
      icon: <Brain size={26} />,
      title: "مربی هوشمند",
      text: "پاسخ به سوالات درسی، توضیح ساده‌تر مفاهیم و همراهی در مسیر یادگیری.",
    },
    {
      icon: <BookOpenCheck size={26} />,
      title: "برنامه‌ریزی شخصی",
      text: "براساس رشته، هدف و وضعیت درسی تو برنامه‌ای متناسب پیشنهاد می‌شود.",
    },
    {
      icon: <BarChart3 size={26} />,
      title: "گزارش پیشرفت",
      text: "روند مطالعه، عملکرد و میزان پیشرفتت را شفاف و قابل تحلیل ببین.",
    },
    {
      icon: <TimerReset size={26} />,
      title: "تمرکز و تایمر",
      text: "با تایمر مطالعه و تمرکز، جلسات مفید و منظم‌تری داشته باش.",
    },
  ];

  const slides = [
    {
      title: "هر روزت را هدفمند شروع کن",
      text: "برنامه امروزت را ببین، کارها را تیک بزن و با انگیزه پیش برو.",
    },
    {
      title: "با منتورا تنها نیستی",
      text: "از مشاوره روزانه تا مربی هوشمند، همیشه یک همراه کنار توست.",
    },
    {
      title: "پیشرفتت را قابل اندازه‌گیری کن",
      text: "آمار، گزارش و تحلیل کمک می‌کند حرفه‌ای‌تر درس بخوانی.",
    },
  ];

  const blobs = useMemo(
    () => [
      {
        size: 460,
        color: "rgba(98,85,245,0.55)",
        top: "-120px",
        right: "-120px",
        dx: smoothMouse.x * 1.15,
        dy: smoothMouse.y * 1.15,
        duration: "11s",
      },
      {
        size: 380,
        color: "rgba(140,120,255,0.46)",
        top: "18%",
        left: "8%",
        dx: smoothMouse.x * -0.9,
        dy: smoothMouse.y * -0.8,
        duration: "14s",
      },
      {
        size: 320,
        color: "rgba(255,120,210,0.34)",
        bottom: "10%",
        left: "-70px",
        dx: smoothMouse.x * -1.2,
        dy: smoothMouse.y * 0.8,
        duration: "16s",
      },
      {
        size: 280,
        color: "rgba(110,220,255,0.22)",
        top: "52%",
        right: "12%",
        dx: smoothMouse.x * 0.65,
        dy: smoothMouse.y * -0.7,
        duration: "13s",
      },
      {
        size: 240,
        color: "rgba(173,126,255,0.35)",
        top: "38%",
        left: "36%",
        dx: smoothMouse.x * 0.45,
        dy: smoothMouse.y * 0.4,
        duration: "18s",
      },
    ],
    [smoothMouse]
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        direction: "rtl",
        fontFamily: "Vazir, sans-serif",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #f8f6ff 0%, #f2efff 45%, #fcfbff 100%)",
        isolation: "isolate",
      }}
    >
      <style>
        {`
          @keyframes blobFloatA {
            0%   { transform: translate3d(0px, 0px, 0) scale(1); }
            25%  { transform: translate3d(22px, -18px, 0) scale(1.04); }
            50%  { transform: translate3d(-16px, 20px, 0) scale(0.98); }
            75%  { transform: translate3d(14px, 12px, 0) scale(1.03); }
            100% { transform: translate3d(0px, 0px, 0) scale(1); }
          }

          @keyframes blobFloatB {
            0%   { transform: translate3d(0px, 0px, 0) scale(1); }
            20%  { transform: translate3d(-18px, 16px, 0) scale(1.03); }
            50%  { transform: translate3d(20px, -14px, 0) scale(0.97); }
            80%  { transform: translate3d(-12px, -16px, 0) scale(1.02); }
            100% { transform: translate3d(0px, 0px, 0) scale(1); }
          }

          @keyframes blobFloatC {
            0%   { transform: translate3d(0px, 0px, 0) scale(1); }
            30%  { transform: translate3d(14px, 18px, 0) scale(0.98); }
            60%  { transform: translate3d(-20px, -10px, 0) scale(1.05); }
            100% { transform: translate3d(0px, 0px, 0) scale(1); }
          }

          .mentora-lava-wrap {
            position: absolute;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            overflow: hidden;
          }

          .mentora-lava-core {
            position: absolute;
            inset: -8%;
            filter: blur(42px) saturate(145%);
            opacity: 1;
          }

          .mentora-blob {
            position: absolute;
            border-radius: 50%;
            mix-blend-mode: multiply;
            will-change: transform;
          }

          .mentora-grain {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 1;
            opacity: 0.035;
            background-image:
              radial-gradient(circle at 20% 20%, #000 0.6px, transparent 0.8px),
              radial-gradient(circle at 80% 30%, #000 0.7px, transparent 0.9px),
              radial-gradient(circle at 40% 70%, #000 0.6px, transparent 0.8px),
              radial-gradient(circle at 60% 50%, #000 0.7px, transparent 0.9px);
            background-size: 180px 180px;
          }

          .hero-glass-card {
            border: 1px solid rgba(255,255,255,0.6);
            border-radius: 28px;
            background: rgba(255,255,255,0.72);
            backdrop-filter: blur(16px);
            box-shadow: 0 20px 60px rgba(98,85,245,0.12);
            overflow: hidden;
          }

          .feature-card-mentora {
            border: 1px solid rgba(98,85,245,0.08);
            border-radius: 22px;
            background: rgba(255,255,255,0.76);
            backdrop-filter: blur(10px);
            box-shadow: 0 14px 40px rgba(98,85,245,0.08);
            height: 100%;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }

          .feature-card-mentora:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 44px rgba(98,85,245,0.14);
          }
        `}
      </style>

      {/* Lava Lamp Background */}
      <div className="mentora-lava-wrap">
        <div className="mentora-lava-core">
          {blobs.map((blob, index) => {
            const floatAnimation =
              index % 3 === 0
                ? "blobFloatA"
                : index % 3 === 1
                ? "blobFloatB"
                : "blobFloatC";

            return (
              <div
                key={index}
                className="mentora-blob"
                style={{
                  width: `${blob.size}px`,
                  height: `${blob.size}px`,
                  background: blob.color,
                  top: blob.top,
                  left: blob.left,
                  right: blob.right,
                  bottom: blob.bottom,
                  transform: `translate(${blob.dx}px, ${blob.dy}px)`,
                  animation: `${floatAnimation} ${blob.duration} ease-in-out infinite`,
                  filter: "blur(10px)",
                }}
              />
            );
          })}

          {/* mouse attractor blob */}
          <div
            className="mentora-blob"
            style={{
              width: "260px",
              height: "260px",
              background: "rgba(98,85,245,0.30)",
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${smoothMouse.x * 1.8}px), calc(-50% + ${smoothMouse.y * 1.8}px))`,
              filter: "blur(14px)",
              animation: "blobFloatB 10s ease-in-out infinite",
            }}
          />

          <div
            className="mentora-blob"
            style={{
              width: "220px",
              height: "220px",
              background: "rgba(255,120,210,0.22)",
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${smoothMouse.x * -1.35}px), calc(-50% + ${smoothMouse.y * -1.2}px))`,
              filter: "blur(18px)",
              animation: "blobFloatC 12s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <div className="mentora-grain" />

      {/* Top Nav */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          padding: "20px 0",
        }}
      >
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-2">
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #6255f5, #8b7bff)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  boxShadow: "0 10px 30px rgba(98,85,245,0.25)",
                }}
              >
                <Sparkles size={22} />
              </div>
              <div>
                <div style={{ fontWeight: "800", fontSize: "1.2rem", color: "#2d1f6f" }}>
                  منتورا
                </div>
                <div style={{ color: "#7b74a8", fontSize: "0.9rem" }}>
                  همراه هوشمند مسیر یادگیری
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Button
                variant="light"
                style={{
                  borderRadius: "12px",
                  padding: "10px 18px",
                  border: "1px solid #e6e1ff",
                  color: "#6255f5",
                  fontWeight: "600",
                }}
                onClick={() => navigate("/login")}
              >
                ورود
              </Button>

              <Button
                style={{
                  borderRadius: "12px",
                  padding: "10px 18px",
                  background: "#6255f5",
                  border: "none",
                  fontWeight: "700",
                  boxShadow: "0 10px 30px rgba(98,85,245,0.25)",
                }}
                onClick={() => navigate("/signin")}
              >
                شروع کن
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Hero */}
      <Container
        style={{
          position: "relative",
          zIndex: 3,
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        <Row className="align-items-center g-4">
          <Col lg={6}>
            <Badge
              bg=""
              style={{
                background: "rgba(98,85,245,0.12)",
                color: "#6255f5",
                borderRadius: "999px",
                padding: "10px 16px",
                fontWeight: "600",
                marginBottom: "18px",
              }}
            >
              نسل جدید یادگیری و برنامه‌ریزی برای دانش‌آموزها
            </Badge>

            <h1
              style={{
                fontWeight: "900",
                fontSize: "clamp(2rem, 4vw, 4rem)",
                lineHeight: "1.5",
                color: "#22175b",
              }}
            >
              با <span style={{ color: "#6255f5" }}>منتورا</span> هوشمندتر درس بخون،
              منظم‌تر پیش برو و با انگیزه‌تر ادامه بده
            </h1>

            <p
              style={{
                color: "#6f6897",
                fontSize: "1.08rem",
                lineHeight: "2",
                marginTop: "18px",
                maxWidth: "560px",
              }}
            >
              منتورا یک فضای آموزشی هوشمند برای برنامه‌ریزی، تمرکز، پیگیری پیشرفت
              و همراهی روزانه‌ی دانش‌آموزهاست؛ از برنامه امروز تا مربی هوشمند،
              همه‌چیز یک‌جا کنار توست.
            </p>

            <div className="d-flex flex-wrap gap-3 mt-4">
              <Button
                onClick={() => navigate("/signin")}
                style={{
                  background: "#6255f5",
                  border: "none",
                  borderRadius: "14px",
                  padding: "14px 24px",
                  fontWeight: "700",
                  boxShadow: "0 12px 30px rgba(98,85,245,0.28)",
                }}
              >
                شروع تجربه <ArrowLeft size={18} className="me-2" />
              </Button>

              <Button
                variant="light"
                style={{
                  borderRadius: "14px",
                  padding: "14px 24px",
                  border: "1px solid #e3ddff",
                  color: "#6255f5",
                  fontWeight: "700",
                }}
                onClick={() => {
                  const section = document.getElementById("features-section");
                  if (section) section.scrollIntoView({ behavior: "smooth" });
                }}
              >
                بیشتر ببین
              </Button>
            </div>

            <div className="d-flex flex-wrap gap-4 mt-4">
              {["برنامه‌ریزی شخصی", "مربی هوشمند", "گزارش پیشرفت", "تایمر تمرکز"].map((item, i) => (
                <div key={i} className="d-flex align-items-center gap-2">
                  <CheckCircle2 size={18} color="#6255f5" />
                  <span style={{ color: "#534a84", fontWeight: "600" }}>{item}</span>
                </div>
              ))}
            </div>
          </Col>

          <Col lg={6}>
            <Card className="hero-glass-card">
              <Card.Body style={{ padding: "24px" }}>
                <div
                  style={{
                    background: "linear-gradient(135deg, #6255f5 0%, #8f84ff 100%)",
                    borderRadius: "22px",
                    padding: "22px",
                    color: "#fff",
                    marginBottom: "20px",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div style={{ opacity: 0.9, fontSize: "0.95rem" }}>داشبورد هوشمند مطالعه</div>
                      <div style={{ fontWeight: "800", fontSize: "1.35rem" }}>کنترل کامل مسیر پیشرفت</div>
                    </div>
                    <Sparkles size={28} />
                  </div>

                  <Row className="g-3">
                    <Col xs={6}>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.16)",
                          borderRadius: "16px",
                          padding: "14px",
                        }}
                      >
                        <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>پیشرفت امروز</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: "800" }}>78%</div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.16)",
                          borderRadius: "16px",
                          padding: "14px",
                        }}
                      >
                        <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>استمرار</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: "800" }}>12 روز</div>
                      </div>
                    </Col>
                  </Row>
                </div>

                <Carousel indicators={true} controls={true} interval={3500}>
                  {slides.map((slide, index) => (
                    <Carousel.Item key={index}>
                      <div
                        style={{
                          minHeight: "220px",
                          borderRadius: "22px",
                          background: "linear-gradient(180deg, #fbfaff 0%, #f2efff 100%)",
                          padding: "28px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          flexDirection: "column",
                          border: "1px solid #ede9ff",
                        }}
                      >
                        <div
                          style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "18px",
                            background: "rgba(98,85,245,0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "18px",
                            color: "#6255f5",
                          }}
                        >
                          <Sparkles size={28} />
                        </div>
                        <h4 style={{ color: "#2d1f6f", fontWeight: "800", marginBottom: "12px" }}>
                          {slide.title}
                        </h4>
                        <p style={{ color: "#6d6594", maxWidth: "420px", lineHeight: "2" }}>
                          {slide.text}
                        </p>
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Features */}
      <Container
        id="features-section"
        style={{
          position: "relative",
          zIndex: 3,
          paddingTop: "40px",
          paddingBottom: "70px",
        }}
      >
        <div className="text-center mb-5">
          <h2 style={{ fontWeight: "900", color: "#271a67" }}>
            همه‌چیز برای یک تجربه یادگیری بهتر
          </h2>
          <p style={{ color: "#726b99", marginTop: "12px" }}>
            ابزارهایی که کمک می‌کنند برنامه‌ریزی کنی، پیگیری کنی و بهتر نتیجه بگیری
          </p>
        </div>

        <Row className="g-4">
          {features.map((item, index) => (
            <Col md={6} lg={3} key={index}>
              <Card className="feature-card-mentora">
                <Card.Body style={{ padding: "24px" }}>
                  <div
                    style={{
                      width: "58px",
                      height: "58px",
                      borderRadius: "18px",
                      background: "rgba(98,85,245,0.12)",
                      color: "#6255f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    {item.icon}
                  </div>
                  <h5 style={{ fontWeight: "800", color: "#2b1f68" }}>{item.title}</h5>
                  <p style={{ color: "#6f6898", lineHeight: "2", marginBottom: 0 }}>
                    {item.text}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* CTA */}
      <Container
        style={{
          position: "relative",
          zIndex: 3,
          paddingBottom: "80px",
        }}
      >
        <Card
          style={{
            border: "none",
            borderRadius: "28px",
            background: "linear-gradient(135deg, #6255f5 0%, #7b6dff 50%, #9d8fff 100%)",
            color: "#fff",
            boxShadow: "0 20px 60px rgba(98,85,245,0.25)",
            overflow: "hidden",
          }}
        >
          <Card.Body style={{ padding: "36px" }}>
            <Row className="align-items-center g-4">
              <Col lg={8}>
                <h3 style={{ fontWeight: "900", marginBottom: "14px" }}>
                  آماده‌ای با یک مسیر هوشمندتر درس بخونی؟
                </h3>
                <p style={{ marginBottom: 0, opacity: 0.92, lineHeight: "2" }}>
                  همین حالا وارد منتورا شو و تجربه‌ی برنامه‌ریزی، تمرکز و پیشرفت هدفمند را شروع کن.
                </p>
              </Col>
              <Col lg={4} className="text-lg-start text-center">
                <Button
                  onClick={() => navigate("/signin")}
                  style={{
                    background: "#fff",
                    color: "#6255f5",
                    border: "none",
                    borderRadius: "14px",
                    padding: "14px 24px",
                    fontWeight: "800",
                  }}
                >
                  شروع
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
