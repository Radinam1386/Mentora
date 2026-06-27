import { useEffect, useRef, useState } from "react";
import "./Aboutus.css";

const teamMembers = [
    {
        name: "عرشیا قاسم زاده",
        role: "Frontend Developer",
        image: "/team/member3.jpg",
        bio: "مسئول طراحی رابط کاربری، انیمیشن‌ها، تجربه کاربری و ساخت صفحات تعاملی سایت.",
        tag: "Frontend & UI",
    },
    {
        name: "کیان الماسی",
        role: "Backend Developer",
        image: "/team/member4.jpg",
        bio: "مسئول توسعه سرور، APIها، دیتابیس، امنیت و زیرساخت فنی پلتفرم.",
        tag: "Backend & Security",
    },
    {
        name: "علی نجف پور",
        role: "AI Engineer",
        image: "/team/member1.jpg",
        bio: "مسئول طراحی بخش‌های هوش مصنوعی، تحلیل یادگیری و ساخت تجربه آموزشی هوشمند برای کاربران.",
        tag: "Artificial Intelligence",
    },
    {
        name: "رادین الماسی",
        role: "AI Engineer",
        image: "/team/member2.jpg",
        bio: "مسئول طراحی بخش‌های هوش مصنوعی، تحلیل یادگیری و ساخت تجربه آموزشی هوشمند برای کاربران.",
        tag: "Artificial Intelligence",
    },
];

function FloatingCube({ className }) {
    return (
        <div className={`about-cube ${className || ""}`}>
            <span className="cube-face cube-front"></span>
            <span className="cube-face cube-back"></span>
            <span className="cube-face cube-right"></span>
            <span className="cube-face cube-left"></span>
            <span className="cube-face cube-top"></span>
            <span className="cube-face cube-bottom"></span>
        </div>
    );
}

function TeamCard({ member, index }) {
    const cardRef = useRef(null);
    const [visible, setVisible] = useState(false);
    const [tilt, setTilt] = useState({
        rotateX: 0,
        rotateY: 0,
    });

    const isLeft = index % 2 === 0;

    useEffect(() => {
        const element = cardRef.current;

        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                }
            },
            {
                threshold: 0.25,
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const middleX = rect.width / 2;
        const middleY = rect.height / 2;

        const rotateY = ((x - middleX) / middleX) * 8;
        const rotateX = -((y - middleY) / middleY) * 8;

        setTilt({
            rotateX,
            rotateY,
        });
    };

    const handleMouseLeave = () => {
        setTilt({
            rotateX: 0,
            rotateY: 0,
        });
    };

    return (
        <div
            className={`team-row ${isLeft ? "team-row-left" : "team-row-right"}`}
        >
            <div
                ref={cardRef}
                className={`
          team-card-3d
          ${visible ? "team-card-visible" : ""}
          ${isLeft ? "from-left" : "from-right"}
        `}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    transform: `
            perspective(1100px)
            rotateX(${tilt.rotateX}deg)
            rotateY(${tilt.rotateY}deg)
          `,
                }}
            >
                <div className="team-card-glow"></div>

                <div className="team-image-wrapper">
                    <img src={member.image} alt={member.name} className="team-image" />

                    <div className="team-floating-badge">
                        {member.tag}
                    </div>
                </div>

                <div className="team-card-content">
                    <span className="team-index">
                        0{index + 1}
                    </span>

                    <h3>{member.name}</h3>

                    <p className="team-role">
                        {member.role}
                    </p>

                    <p className="team-bio">
                        {member.bio}
                    </p>

                    <div className="team-card-footer">
                        <span>Mentora Team</span>
                        <span className="team-dot"></span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AboutUs() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY || 0);
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <main className="about-page">
            <div className="about-background">
                <div className="about-gradient about-gradient-one"></div>
                <div className="about-gradient about-gradient-two"></div>
                <div className="about-grid-bg"></div>
            </div>

            <FloatingCube className="cube-one" />
            <FloatingCube className="cube-two" />
            <FloatingCube className="cube-three" />

            <section className="about-hero">
                <div
                    className="hero-3d-orb orb-one"
                    style={{
                        transform: `translateY(${scrollY * 0.12}px) rotate(${scrollY * 0.06}deg)`,
                    }}
                ></div>

                <div
                    className="hero-3d-orb orb-two"
                    style={{
                        transform: `translateY(${-scrollY * 0.09}px) rotate(${-scrollY * 0.05}deg)`,
                    }}
                ></div>

                <div className="hero-content">
                    <span className="about-pill">
                        درباره Mentora
                    </span>

                    <h1>
                        ما داریم آینده یادگیری را
                        <span> هوشمندتر </span>
                        می‌سازیم
                    </h1>

                    <p>
                        Mentora توسط یک تیم چهار نفره ساخته شده؛ با هدف ترکیب هوش مصنوعی،
                        طراحی مدرن و تجربه آموزشی شخصی‌سازی‌شده برای کمک به دانش‌آموزها.
                    </p>

                    <div className="hero-actions">
                        <a href="#team" className="about-primary-btn">
                            دیدن تیم ما
                        </a>

                        <a href="#idea" className="about-secondary-btn">
                            ایده Mentora
                        </a>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="main-3d-card">
                        <div className="main-3d-card-inner">
                            <div className="main-card-top">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>

                            <div className="brain-orbit">
                                <div className="brain-core">
                                    AI
                                </div>

                                <div className="orbit orbit-one">
                                    <span></span>
                                </div>

                                <div className="orbit orbit-two">
                                    <span></span>
                                </div>

                                <div className="orbit orbit-three">
                                    <span></span>
                                </div>
                            </div>

                            <h3>Mentora Learn</h3>
                        </div>
                    </div>
                </div>
            </section>

            <section id="idea" className="about-story-section">
                <div className="story-card">
                    <span className="section-label">
                        ایده ما
                    </span>

                    <h2>
                        چرا Mentora را ساختیم؟
                    </h2>

                    <p>
                        ما دیدیم خیلی از دانش‌آموزها برای برنامه‌ریزی، تمرین، رفع اشکال و
                        تحلیل پیشرفتشان ابزار یکپارچه و هوشمند ندارند. هدف ما ساخت یک
                        همراه آموزشی است که فقط محتوا نشان ندهد؛ بلکه بفهمد کاربر کجاست،
                        چه چیزی بلد نیست و قدم بعدی برای بهتر شدن چیست.
                    </p>

                    <div className="story-stats">
                        <div>
                            <strong>4</strong>
                            <span>عضو تیم</span>
                        </div>

                        <div>
                            <strong>AI</strong>
                            <span>هسته اصلی محصول</span>
                        </div>

                        <div>
                            <strong>24/7</strong>
                            <span>همراه یادگیری</span>
                        </div>
                    </div>
                </div>
            </section>

            <section id="team" className="team-section">
                <div className="team-heading">
                    <span className="section-label">
                        تیم سازنده
                    </span>

                    <h2>
                        آدم‌هایی که پشت Mentora هستند
                    </h2>
                </div>

                <div className="team-timeline-line"></div>

                {teamMembers.map((member, index) => (
                    <TeamCard
                        key={member.name}
                        member={member}
                        index={index}
                    />
                ))}
            </section>

            <section className="values-section">
                <div className="values-content">
                    <span className="section-label">
                        ارزش‌های ما
                    </span>

                    <h2>
                        ما فقط یک سایت نمی‌سازیم؛ یک تجربه یادگیری می‌سازیم
                    </h2>

                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon">01</div>
                            <h3>هوشمند</h3>
                            <p>
                                هر کاربر مسیر یادگیری مخصوص خودش را دارد.
                            </p>
                        </div>

                        <div className="value-card">
                            <div className="value-icon">02</div>
                            <h3>ساده و زیبا</h3>
                            <p>
                                تجربه کاربری باید هم حرفه‌ای باشد، هم راحت.
                            </p>
                        </div>

                        <div className="value-card">
                            <div className="value-icon">03</div>
                            <h3>تحلیل‌محور</h3>
                            <p>
                                پیشرفت باید قابل اندازه‌گیری و قابل فهم باشد.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
