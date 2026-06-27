import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Carousel,
  Badge,
} from "react-bootstrap";
import {
  Sparkles,
  Brain,
  BarChart3,
  TimerReset,
  BookOpenCheck,
  ArrowLeft,
  CheckCircle2,
  Target,
  CalendarCheck2,
  Flame,
  TrendingUp,
  MessageCircleQuestion,
  Zap,
  Trophy,
  Rocket,
  Stars,
  Clock3,
  ShieldCheck,
  ListChecks,
  SmilePlus,
  GraduationCap,
  PlayCircle,
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
      title: "مربی هوشمند همیشه آنلاین",
      text: "هر وقت گیر کردی، سوالت رو بپرس. منتورا مفاهیم سخت رو ساده، مرحله‌به‌مرحله و قابل فهم توضیح می‌ده.",
      tag: "AI Tutor",
    },
    {
      icon: <BookOpenCheck size={26} />,
      title: "برنامه‌ریزی شخصی‌سازی‌شده",
      text: "بر اساس رشته، پایه، هدف و تایم آزاد تو، برنامه‌ای می‌سازی که واقعاً قابل انجام باشه؛ نه فقط قشنگ روی کاغذ.",
      tag: "Smart Plan",
    },
    {
      icon: <BarChart3 size={26} />,
      title: "گزارش پیشرفت واقعی",
      text: "ببین کجاها خوب پیش رفتی، کجاها افت داشتی و چطور می‌تونی هفته بعد بهتر عمل کنی.",
      tag: "Analytics",
    },
    {
      icon: <TimerReset size={26} />,
      title: "تایمر تمرکز و مطالعه",
      text: "با تایمرهای تمرکزی، جلسه‌های مطالعه‌ات رو جدی‌تر و منظم‌تر جلو ببر؛ مخصوص روزهایی که تمرکز سخت می‌شه.",
      tag: "Focus Mode",
    },
    {
      icon: <Target size={26} />,
      title: "هدف‌گذاری رتبه و مسیر",
      text: "هدفت فقط یک عدد نیست. منتورا کمکت می‌کنه مسیر رسیدن به اون هدف رو به کارهای کوچک و روزانه تبدیل کنی.",
      tag: "Goal",
    },
    {
      icon: <MessageCircleQuestion size={26} />,
      title: "سوال بپرس، سریع جلو برو",
      text: "به جای اینکه ساعت‌ها روی یک مبحث قفل کنی، سوالت رو بپرس و با توضیح ساده‌تر برگرد به مسیر.",
      tag: "Q&A",
    },
    {
      icon: <CalendarCheck2 size={26} />,
      title: "برنامه امروزت جلوی چشمته",
      text: "هر روز می‌دونی باید از کجا شروع کنی، چی بخونی، چی مرور کنی و چه کاری رو تیک بزنی.",
      tag: "Today",
    },
    {
      icon: <Flame size={26} />,
      title: "استمرار و انگیزه",
      text: "استریک روزانه، تیک‌زدن کارها و دیدن پیشرفت باعث می‌شه حس کنی داری واقعاً جلو می‌ری.",
      tag: "Streak",
    },
  ];

  const slides = [
    {
      title: "روزت رو با مود برنده شروع کن",
      text: "برنامه امروزت آماده است؛ فقط بازش کن، شروع کن، تیک بزن و حس پیشرفت رو ببین.",
      icon: <Rocket size={30} />,
    },
    {
      title: "دیگه تو درس خوندن تنها نیستی",
      text: "منتورا مثل یه همراه هوشمند کنارته؛ سوال می‌پرسی، برنامه می‌گیری و مسیرت رو شفاف‌تر می‌بینی.",
      icon: <Stars size={30} />,
    },
    {
      title: "پیشرفتت رو با عدد و نمودار ببین",
      text: "به جای حدس زدن، دقیق ببین چقدر مطالعه کردی، چقدر جلو رفتی و کجا باید بهتر بشی.",
      icon: <TrendingUp size={30} />,
    },
    {
      title: "تمرکزت رو برگردون به بازی",
      text: "با تایمر تمرکز و تسک‌های واضح، مطالعه‌ات از حالت پراکنده تبدیل می‌شه به یک روند قابل کنترل.",
      icon: <Zap size={30} />,
    },
  ];

  const stats = [
    {
      value: "۱۲+",
      label: "روز استمرار پیشنهادی",
      icon: <Flame size={20} />,
    },
    {
      value: "۷۸٪",
      label: "نمونه پیشرفت روزانه",
      icon: <TrendingUp size={20} />,
    },
    {
      value: "۴",
      label: "ابزار اصلی مطالعه",
      icon: <ListChecks size={20} />,
    },
    {
      value: "۲۴/۷",
      label: "همراه هوشمند",
      icon: <Brain size={20} />,
    },
  ];

  const steps = [
    {
      number: "01",
      title: "پروفایلت رو بساز",
      text: "رشته، پایه، هدف و شرایطت رو وارد کن تا منتورا بهتر بشناستت.",
      icon: <GraduationCap size={26} />,
    },
    {
      number: "02",
      title: "برنامه امروزت رو بگیر",
      text: "برنامه‌ات رو ببین، اولویت‌ها رو مشخص کن و شروع کن به تیک زدن.",
      icon: <CalendarCheck2 size={26} />,
    },
    {
      number: "03",
      title: "پیشرفتت رو تحلیل کن",
      text: "آخر روز یا آخر هفته ببین کجا عالی بودی و کجا باید هوشمندتر عمل کنی.",
      icon: <BarChart3 size={26} />,
    },
  ];

  const audience = [
    "دانش‌آموزهایی که نمی‌دونن از کجا شروع کنن",
    "کسایی که برنامه می‌نویسن ولی اجرا نمی‌کنن",
    "دانش‌آموزهایی که می‌خوان پیشرفت‌شون رو عددی ببینن",
    "کسایی که موقع درس خوندن سوال زیاد براشون پیش میاد",
    "دانش‌آموزهایی که دنبال نظم، تمرکز و انگیزه بیشترن",
    "کسایی که می‌خوان مسیر کنکور یا مدرسه رو هوشمندتر جلو ببرن",
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
      className="mentora-landing"
      style={{
        minHeight: "100vh",
        direction: "rtl",
        fontFamily: "Vazir, sans-serif",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #f8f6ff 0%, #f2efff 45%, #fcfbff 100%)",
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

          @keyframes softPulse {
            0% { transform: scale(1); opacity: .95; }
            50% { transform: scale(1.04); opacity: 1; }
            100% { transform: scale(1); opacity: .95; }
          }

          @keyframes floatCard {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
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

          .landing-shell {
            position: relative;
            z-index: 3;
          }

          .top-nav-glass {
            border: 1px solid rgba(255,255,255,0.7);
            background: rgba(255,255,255,0.58);
            backdrop-filter: blur(16px);
            border-radius: 24px;
            padding: 14px 16px;
            box-shadow: 0 18px 50px rgba(98,85,245,0.08);
          }

          .hero-glass-card {
            border: 1px solid rgba(255,255,255,0.6);
            border-radius: 30px;
            background: rgba(255,255,255,0.72);
            backdrop-filter: blur(16px);
            box-shadow: 0 20px 60px rgba(98,85,245,0.12);
            overflow: hidden;
            animation: floatCard 7s ease-in-out infinite;
          }

          .feature-card-mentora,
          .stat-card-mentora,
          .step-card-mentora,
          .audience-card-mentora {
            border: 1px solid rgba(98,85,245,0.08);
            border-radius: 24px;
            background: rgba(255,255,255,0.76);
            backdrop-filter: blur(10px);
            box-shadow: 0 14px 40px rgba(98,85,245,0.08);
            height: 100%;
            transition: transform 0.25s ease, box-shadow 0.25s ease, border-color .25s ease;
          }

          .feature-card-mentora:hover,
          .step-card-mentora:hover,
          .audience-card-mentora:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 44px rgba(98,85,245,0.14);
            border-color: rgba(98,85,245,0.18);
          }

          .hero-title {
            font-weight: 950;
            font-size: clamp(2rem, 4vw, 4.2rem);
            line-height: 1.45;
            color: #22175b;
            letter-spacing: -1px;
          }

          .hero-text {
            color: #6f6897;
            font-size: 1.08rem;
            line-height: 2.1;
            margin-top: 18px;
            max-width: 590px;
          }

          .gradient-text {
            background: linear-gradient(135deg, #6255f5, #f35bc3);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .primary-cta {
            background: linear-gradient(135deg, #6255f5, #7f73ff) !important;
            border: none !important;
            border-radius: 16px !important;
            padding: 14px 24px !important;
            font-weight: 800 !important;
            box-shadow: 0 12px 30px rgba(98,85,245,0.28);
            transition: transform .2s ease, box-shadow .2s ease;
          }

          .primary-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 18px 36px rgba(98,85,245,0.34);
          }

          .secondary-cta {
            border-radius: 16px !important;
            padding: 14px 24px !important;
            border: 1px solid #e3ddff !important;
            color: #6255f5 !important;
            font-weight: 800 !important;
            background: rgba(255,255,255,.72) !important;
          }

          .mini-chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #534a84;
            font-weight: 700;
            background: rgba(255,255,255,.65);
            border: 1px solid rgba(98,85,245,.09);
            padding: 8px 12px;
            border-radius: 999px;
          }

          .section-title {
            font-weight: 950;
            color: #271a67;
            letter-spacing: -0.5px;
          }

          .section-subtitle {
            color: #726b99;
            margin-top: 12px;
            line-height: 2;
          }

          .dashboard-mini-row {
            background: rgba(255,255,255,0.16);
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 18px;
            padding: 14px;
          }

          .progress-line {
            height: 9px;
            background: rgba(255,255,255,.22);
            border-radius: 999px;
            overflow: hidden;
          }

          .progress-line span {
            display: block;
            height: 100%;
            width: 78%;
            background: #fff;
            border-radius: 999px;
          }

          .floating-note {
            position: absolute;
            background: rgba(255,255,255,.82);
            backdrop-filter: blur(14px);
            border: 1px solid rgba(98,85,245,.08);
            box-shadow: 0 16px 36px rgba(98,85,245,.12);
            border-radius: 18px;
            padding: 12px 14px;
            color: #2d1f6f;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: softPulse 4s ease-in-out infinite;
          }

          .floating-note.one {
            top: 34px;
            left: 18px;
          }

          .floating-note.two {
            bottom: 28px;
            right: 18px;
            animation-delay: 1.2s;
          }

          .carousel-control-prev,
          .carousel-control-next {
            filter: invert(44%) sepia(70%) saturate(1348%) hue-rotate(220deg) brightness(92%) contrast(94%);
          }

          .carousel-indicators {
            display: none !important;
          }

          @media (max-width: 991.98px) {
            .mentora-landing {
              overflow-x: hidden;
            }

            .top-nav-glass {
              border-radius: 20px;
            }

            .hero-section {
              padding-top: 24px !important;
              text-align: center;
            }

            .hero-title {
              font-size: clamp(2rem, 8vw, 3rem);
              line-height: 1.55;
            }

            .hero-text {
              margin-left: auto;
              margin-right: auto;
              font-size: 1rem;
            }

            .hero-actions,
            .hero-chips {
              justify-content: center;
            }

            .hero-glass-card {
              margin-top: 12px;
              animation: none;
            }

            .floating-note {
              display: none;
            }
          }

          @media (max-width: 767.98px) {
            .landing-nav-actions {
              width: 100%;
              justify-content: space-between;
            }

            .landing-nav-actions .btn {
              flex: 1;
            }

            .hero-section {
              padding-bottom: 28px !important;
            }

            .hero-title {
              letter-spacing: -0.3px;
            }

            .primary-cta,
            .secondary-cta {
              width: 100%;
              justify-content: center;
            }

            .hero-actions {
              width: 100%;
            }

            .hero-actions .btn {
              width: 100%;
            }

            .dashboard-title {
              font-size: 1.05rem !important;
            }

            .slide-box {
              min-height: 245px !important;
              padding: 22px 16px !important;
            }

            .section-title {
              font-size: 1.45rem;
              line-height: 1.8;
            }

            .cta-card-body {
              padding: 26px 18px !important;
              text-align: center;
            }
          }

          @media (max-width: 575.98px) {
            .brand-subtitle {
              display: none;
            }

            .top-nav-glass {
              padding: 12px;
            }

            .brand-logo {
              width: 42px !important;
              height: 42px !important;
              border-radius: 14px !important;
            }

            .hero-badge {
              font-size: .78rem;
              line-height: 1.8;
            }

            .hero-title {
              font-size: 1.85rem;
            }

            .hero-text {
              font-size: .96rem;
              line-height: 2;
            }

            .hero-glass-card .card-body {
              padding: 16px !important;
            }

            .dashboard-card {
              padding: 18px !important;
            }

            .dashboard-mini-row {
              padding: 12px;
            }

            .feature-card-mentora .card-body,
            .step-card-mentora .card-body,
            .audience-card-mentora .card-body {
              padding: 20px !important;
            }
          }
        `}
      </style>

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

          <div
            className="mentora-blob"
            style={{
              width: "260px",
              height: "260px",
              background: "rgba(98,85,245,0.30)",
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${smoothMouse.x * 1.8
                }px), calc(-50% + ${smoothMouse.y * 1.8}px))`,
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
              transform: `translate(calc(-50% + ${smoothMouse.x * -1.35
                }px), calc(-50% + ${smoothMouse.y * -1.2}px))`,
              filter: "blur(18px)",
              animation: "blobFloatC 12s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <div className="mentora-grain" />

      <div className="landing-shell" style={{ padding: "20px 0" }}>
        <Container>
          <div className="top-nav-glass d-flex justify-content-between align-items-center  gap-3">
            <div className="d-flex align-items-center gap-2">
              <div
                className="brand-logo"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "16px",
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
                <div
                  style={{
                    fontWeight: "900",
                    fontSize: "1.25rem",
                    color: "#2d1f6f",
                  }}
                >
                  منتورا
                </div>
                <div
                  className="brand-subtitle"
                  style={{ color: "#7b74a8", fontSize: "0.9rem" }}
                >
                  همراه هوشمند مسیر یادگیری
                </div>
              </div>
            </div>

            <div className="landing-nav-actions d-flex align-items-center gap-2">
              <Button
                style={{
                  borderRadius: "14px",
                  padding: "10px 18px",
                  background: "#6255f5",
                  border: "none",
                  fontWeight: "800",
                  boxShadow: "0 10px 30px rgba(98,85,245,0.25)",
                }}
                onClick={() => navigate("/aboutus")}
              >
                درباره ما
              </Button>
              <Button
                variant="light"
                style={{
                  borderRadius: "14px",
                  padding: "10px 18px",
                  border: "1px solid #e6e1ff",
                  color: "#6255f5",
                  fontWeight: "800",
                  background: "rgba(255,255,255,.76)",
                }}
                onClick={() => navigate("/login")}
              >
                ورود
              </Button>

              <Button
                style={{
                  borderRadius: "14px",
                  padding: "10px 18px",
                  background: "#6255f5",
                  border: "none",
                  fontWeight: "800",
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

      <Container
        className="landing-shell hero-section"
        style={{
          paddingTop: "48px",
          paddingBottom: "48px",
        }}
      >
        <Row className="align-items-center g-4">
          <Col lg={6}>
            <Badge
              bg=""
              className="hero-badge"
              style={{
                background: "rgba(98,85,245,0.12)",
                color: "#6255f5",
                borderRadius: "999px",
                padding: "10px 16px",
                fontWeight: "800",
                marginBottom: "18px",
                border: "1px solid rgba(98,85,245,.08)",
              }}
            >
              نسل جدید درس خوندن؛ کمتر سردرگمی، بیشتر پیشرفت
            </Badge>

            <h1 className="hero-title">
              درس خوندن رو از حالت{" "}
              <span className="gradient-text">استرسی و شلوغ</span> تبدیل کن به
              یک مسیر هوشمند و قابل کنترل
            </h1>

            <p className="hero-text d-none d-md-block ">
              منتورا کنارته تا برنامه‌ریزی کنی، تمرکز بگیری، سوال‌هات رو
              بپرسی، پیشرفتت رو ببینی و هر روز با یک قدم کوچیک ولی واقعی جلو
              بری. اینجا قرار نیست فقط انگیزه بگیری؛ قراره مسیرت واضح‌تر بشه.
            </p>

            <div className="hero-actions d-flex flex-wrap gap-3 mt-4">
              <Button
                onClick={() => navigate("/signin")}
                className="primary-cta d-flex align-items-center"
              >
                شروع رایگان تجربه
                <ArrowLeft size={18} className="me-2" />
              </Button>

              <Button
                variant="light"
                className="secondary-cta d-flex align-items-center"
                onClick={() => {
                  const section = document.getElementById("features-section");
                  if (section) section.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <PlayCircle size={18} className="ms-2" />
                ببین چطور کار می‌کنه
              </Button>
            </div>

            <div className="hero-chips d-flex flex-wrap gap-2 mt-4">
              {[
                "برنامه‌ریزی شخصی",
                "مربی هوشمند",
                "گزارش پیشرفت",
                "تایمر تمرکز",
              ].map((item, i) => (
                <div key={i} className="mini-chip">
                  <CheckCircle2 size={17} color="#6255f5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Col>

          <Col lg={6}>
            <div style={{ position: "relative" }}>
              <div className="floating-note one">
                <Zap size={18} color="#6255f5" />
                امروزت آماده‌ست
              </div>

              <div className="floating-note two">
                <Trophy size={18} color="#6255f5" />
                استمرار ۱۲ روزه
              </div>

              <Card className="hero-glass-card">
                <Card.Body style={{ padding: "24px" }}>
                  <div
                    className="dashboard-card"
                    style={{
                      background:
                        "linear-gradient(135deg, #6255f5 0%, #8f84ff 100%)",
                      borderRadius: "24px",
                      padding: "24px",
                      color: "#fff",
                      marginBottom: "20px",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3 gap-3">
                      <div>
                        <div style={{ opacity: 0.9, fontSize: "0.95rem" }}>
                          داشبورد هوشمند مطالعه
                        </div>
                        <div
                          className="dashboard-title"
                          style={{ fontWeight: "900", fontSize: "1.35rem" }}
                        >
                          کنترل کامل مسیر پیشرفت
                        </div>
                      </div>
                      <Sparkles size={30} />
                    </div>

                    <Row className="g-3">
                      <Col xs={6}>
                        <div className="dashboard-mini-row">
                          <div style={{ fontSize: "0.86rem", opacity: 0.9 }}>
                            پیشرفت امروز
                          </div>
                          <div style={{ fontSize: "1.55rem", fontWeight: "900" }}>
                            78%
                          </div>
                        </div>
                      </Col>

                      <Col xs={6}>
                        <div className="dashboard-mini-row">
                          <div style={{ fontSize: "0.86rem", opacity: 0.9 }}>
                            زمان تمرکز
                          </div>
                          <div style={{ fontSize: "1.55rem", fontWeight: "900" }}>
                            3h
                          </div>
                        </div>
                      </Col>

                      <Col xs={12}>
                        <div className="dashboard-mini-row">
                          <div className="d-flex justify-content-between mb-2">
                            <span>تسک‌های امروز</span>
                            <strong>۷ از ۹</strong>
                          </div>
                          <div className="progress-line">
                            <span />
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <Carousel indicators controls interval={3500}>
                    {slides.map((slide, index) => (
                      <Carousel.Item key={index}>
                        <div
                          className="slide-box"
                          style={{
                            minHeight: "230px",
                            borderRadius: "24px",
                            background:
                              "linear-gradient(180deg, #fbfaff 0%, #f2efff 100%)",
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
                              width: "66px",
                              height: "66px",
                              borderRadius: "20px",
                              background: "rgba(98,85,245,0.12)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginBottom: "18px",
                              color: "#6255f5",
                            }}
                          >
                            {slide.icon}
                          </div>

                          <h4
                            style={{
                              color: "#2d1f6f",
                              fontWeight: "900",
                              marginBottom: "12px",
                            }}
                          >
                            {slide.title}
                          </h4>

                          <p
                            style={{
                              color: "#6d6594",
                              maxWidth: "430px",
                              lineHeight: "2",
                              marginBottom: 0,
                            }}
                          >
                            {slide.text}
                          </p>
                        </div>
                      </Carousel.Item>
                    ))}
                  </Carousel>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Stats */}
      <Container className="landing-shell" style={{ paddingBottom: "44px" }}>
        <Row className="g-3">
          {stats.map((stat, index) => (
            <Col xs={6} lg={3} key={index}>
              <Card className="stat-card-mentora">
                <Card.Body
                  style={{
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      margin: "0 auto 10px",
                      borderRadius: "15px",
                      background: "rgba(98,85,245,.1)",
                      color: "#6255f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {stat.icon}
                  </div>

                  <div
                    style={{
                      color: "#251960",
                      fontWeight: "950",
                      fontSize: "1.55rem",
                    }}
                  >
                    {stat.value}
                  </div>

                  <div
                    style={{
                      color: "#706895",
                      fontWeight: "700",
                      fontSize: ".92rem",
                    }}
                  >
                    {stat.label}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Container
        id="features-section"
        className="landing-shell"
        style={{
          paddingTop: "34px",
          paddingBottom: "70px",
        }}
      >
        <div className="text-center mb-5">
          <Badge
            bg=""
            style={{
              background: "rgba(98,85,245,0.1)",
              color: "#6255f5",
              borderRadius: "999px",
              padding: "9px 15px",
              fontWeight: "800",
              marginBottom: "14px",
            }}
          >
            امکاناتی که واقعاً به کارت میاد
          </Badge>

          <h2 className="section-title">
            همه‌چیز برای اینکه درس خوندنت از حالت پراکنده دربیاد
          </h2>

          <p className="section-subtitle">
            منتورا فقط یک اپ برنامه‌ریزی نیست؛ یک فضای کامل برای ساختن عادت،
            نظم، تمرکز و رشد روزانه‌ست.
          </p>
        </div>

        <Row className="g-4">
          {features.map((item, index) => (
            <Col md={6} lg={3} key={index}>
              <Card className="feature-card-mentora">
                <Card.Body style={{ padding: "24px" }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      style={{
                        width: "58px",
                        height: "58px",
                        borderRadius: "19px",
                        background: "rgba(98,85,245,0.12)",
                        color: "#6255f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </div>

                    <Badge
                      bg=""
                      style={{
                        background: "#f3f0ff",
                        color: "#6255f5",
                        borderRadius: "999px",
                        fontWeight: "800",
                      }}
                    >
                      {item.tag}
                    </Badge>
                  </div>

                  <h5 style={{ fontWeight: "900", color: "#2b1f68" }}>
                    {item.title}
                  </h5>

                  <p
                    style={{
                      color: "#6f6898",
                      lineHeight: "2",
                      marginBottom: 0,
                    }}
                  >
                    {item.text}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Container className="landing-shell" style={{ paddingBottom: "70px" }}>
        <Row className="align-items-center g-4 mb-4">
          <Col lg={7}>
            <Badge
              bg=""
              style={{
                background: "rgba(255,91,195,0.1)",
                color: "#d946a4",
                borderRadius: "999px",
                padding: "9px 15px",
                fontWeight: "800",
                marginBottom: "14px",
              }}
            >
              از سردرگمی تا مسیر واضح
            </Badge>

            <h2 className="section-title">
              فقط با سه قدم، مطالعه‌ات رو قابل مدیریت کن
            </h2>

            <p className="section-subtitle">
              لازم نیست از روز اول عالی باشی. کافیه مسیرت مشخص باشه، کارهای
              کوچیک رو انجام بدی و هر روز یک درصد بهتر بشی.
            </p>
          </Col>

          <Col lg={5}>
            <Card
              style={{
                border: "none",
                borderRadius: "26px",
                background:
                  "linear-gradient(135deg, rgba(98,85,245,.95), rgba(143,132,255,.95))",
                color: "#fff",
                boxShadow: "0 20px 55px rgba(98,85,245,.22)",
              }}
            >
              <Card.Body style={{ padding: "26px" }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    style={{
                      width: "54px",
                      height: "54px",
                      borderRadius: "18px",
                      background: "rgba(255,255,255,.16)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SmilePlus size={26} />
                  </div>

                  <div>
                    <div style={{ opacity: 0.9 }}>حس بهتر موقع درس</div>
                    <strong style={{ fontSize: "1.2rem" }}>
                      وقتی می‌دونی باید چیکار کنی، شروع کردن راحت‌تره
                    </strong>
                  </div>
                </div>

                <p style={{ lineHeight: "2", opacity: 0.92, marginBottom: 0 }}>
                  منتورا قرار نیست معجزه کنه؛ قراره مسیرت رو شفاف کنه تا هر
                  روز بدونی قدم بعدی چیه.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          {steps.map((step, index) => (
            <Col md={4} key={index}>
              <Card className="step-card-mentora">
                <Card.Body style={{ padding: "26px" }}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div
                      style={{
                        width: "58px",
                        height: "58px",
                        borderRadius: "19px",
                        background: "rgba(98,85,245,.12)",
                        color: "#6255f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {step.icon}
                    </div>

                    <div
                      style={{
                        fontWeight: "950",
                        fontSize: "1.5rem",
                        color: "rgba(98,85,245,.28)",
                      }}
                    >
                      {step.number}
                    </div>
                  </div>

                  <h5 style={{ color: "#2b1f68", fontWeight: "950" }}>
                    {step.title}
                  </h5>

                  <p style={{ color: "#6f6898", lineHeight: "2", margin: 0 }}>
                    {step.text}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Container className="landing-shell" style={{ paddingBottom: "70px" }}>
        <Card
          className="audience-card-mentora"
          style={{
            borderRadius: "30px",
            overflow: "hidden",
          }}
        >
          <Card.Body style={{ padding: "32px" }}>
            <Row className="g-4 align-items-center">
              <Col lg={5}>
                <Badge
                  bg=""
                  style={{
                    background: "rgba(98,85,245,0.1)",
                    color: "#6255f5",
                    borderRadius: "999px",
                    padding: "9px 15px",
                    fontWeight: "800",
                    marginBottom: "14px",
                  }}
                >
                  مناسب برای کیه؟
                </Badge>

                <h2 className="section-title">
                  اگر دنبال نظم، تمرکز و مسیر واضحی، منتورا برای تو ساخته شده
                </h2>

                <p className="section-subtitle">
                  چه تازه شروع کرده باشی، چه وسط مسیر باشی، چه احساس کنی عقب
                  افتادی؛ منتورا کمک می‌کنه دوباره کنترل رو به دست بگیری.
                </p>

                <Button
                  onClick={() => navigate("/signin")}
                  className="primary-cta mt-2"
                >
                  من آماده‌ام شروع کنم
                </Button>
              </Col>

              <Col lg={7}>
                <Row className="g-3">
                  {audience.map((item, index) => (
                    <Col md={6} key={index}>
                      <div
                        style={{
                          background: "#fbfaff",
                          border: "1px solid #eee9ff",
                          borderRadius: "18px",
                          padding: "15px",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          color: "#403673",
                          fontWeight: "800",
                          lineHeight: "1.9",
                        }}
                      >
                        <CheckCircle2
                          size={20}
                          color="#6255f5"
                          style={{ flexShrink: 0 }}
                        />
                        <span>{item}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>

      {/* Trust / Motivation */}
      <Container className="landing-shell" style={{ paddingBottom: "70px" }}>
        <Row className="g-4">
          <Col lg={4}>
            <Card className="feature-card-mentora">
              <Card.Body style={{ padding: "26px" }}>
                <ShieldCheck size={30} color="#6255f5" />
                <h5
                  style={{
                    color: "#2b1f68",
                    fontWeight: "950",
                    marginTop: "16px",
                  }}
                >
                  بدون پیچیدگی اضافه
                </h5>
                <p style={{ color: "#6f6898", lineHeight: "2", margin: 0 }}>
                  طراحی منتورا ساده و کاربردیه؛ یعنی لازم نیست برای استفاده از
                  ابزار، خودت رو درگیر تنظیمات پیچیده کنی.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="feature-card-mentora">
              <Card.Body style={{ padding: "26px" }}>
                <Clock3 size={30} color="#6255f5" />
                <h5
                  style={{
                    color: "#2b1f68",
                    fontWeight: "950",
                    marginTop: "16px",
                  }}
                >
                  مناسب روزهای شلوغ
                </h5>
                <p style={{ color: "#6f6898", lineHeight: "2", margin: 0 }}>
                  حتی اگر وقتت کم باشه، می‌تونی برنامه‌ات رو سبک‌تر و واقع‌بینانه‌تر
                  بچینی و همچنان مسیر رو حفظ کنی.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="feature-card-mentora">
              <Card.Body style={{ padding: "26px" }}>
                <Trophy size={30} color="#6255f5" />
                <h5
                  style={{
                    color: "#2b1f68",
                    fontWeight: "950",
                    marginTop: "16px",
                  }}
                >
                  پیشرفت کوچیک، نتیجه بزرگ
                </h5>
                <p style={{ color: "#6f6898", lineHeight: "2", margin: 0 }}>
                  منتورا کمک می‌کنه به جای فشار زیاد و شروع‌های انفجاری، با
                  استمرار و قدم‌های قابل انجام جلو بری.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* CTA */}
      <Container
        className="landing-shell"
        style={{
          paddingBottom: "80px",
        }}
      >
        <Card
          style={{
            border: "none",
            borderRadius: "32px",
            background:
              "linear-gradient(135deg, #6255f5 0%, #7b6dff 50%, #9d8fff 100%)",
            color: "#fff",
            boxShadow: "0 20px 60px rgba(98,85,245,0.25)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "260px",
              height: "260px",
              borderRadius: "50%",
              background: "rgba(255,255,255,.12)",
              top: "-110px",
              left: "-70px",
            }}
          />

          <div
            style={{
              position: "absolute",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: "rgba(255,255,255,.1)",
              bottom: "-80px",
              right: "10%",
            }}
          />

          <Card.Body className="cta-card-body" style={{ padding: "40px" }}>
            <Row className="align-items-center g-4">
              <Col lg={8}>
                <Badge
                  bg=""
                  style={{
                    background: "rgba(255,255,255,.16)",
                    color: "#fff",
                    borderRadius: "999px",
                    padding: "9px 15px",
                    fontWeight: "800",
                    marginBottom: "14px",
                  }}
                >
                  همین امروز شروع کن
                </Badge>

                <h3 style={{ fontWeight: "950", marginBottom: "14px" }}>
                  آماده‌ای مطالعه‌ات رو از حالت «نمی‌دونم چیکار کنم» خارج کنی؟
                </h3>

                <p style={{ marginBottom: 0, opacity: 0.92, lineHeight: "2" }}>
                  وارد منتورا شو، پروفایلت رو بساز، برنامه امروزت رو ببین و با
                  یک شروع ساده اما هوشمندانه مسیرت رو جلو ببر.
                </p>
              </Col>

              <Col lg={4} className="text-lg-center text-center d-flex justify-content-center justify-items-center">
                <Button
                  className="d-flex"
                  onClick={() => navigate("/signin")}
                  style={{
                    background: "#fff",
                    color: "#6255f5",
                    border: "none",
                    borderRadius: "16px",
                    padding: "14px 26px",
                    fontWeight: "950",
                    boxShadow: "0 12px 28px rgba(0,0,0,.12)",
                  }}
                >
                  شروع مسیر من
                  <ArrowLeft size={18} className="me-2 d-flex" />
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
