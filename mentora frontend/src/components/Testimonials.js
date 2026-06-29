import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Container,
    Row,
    Col,
    Button,
    Card,
    Carousel,
    Badge,
} from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
const Testimonials = () => {
    const navigate = useNavigate();

    useEffect(() => {

        const elements = document.querySelectorAll(".reveal");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("active")
                    }
                })
            },
            { threshold: 0.2 }
        )

        elements.forEach(el => observer.observe(el))

    }, [])

    const testimonials = [
        {
            name: "علی رضایی",
            role: "دانش‌آموز دوازدهم تجربی",
            text: "قبل از منتورا اصلاً نمی‌دانستم چطور برای امتحان نهایی برنامه‌ریزی کنم. الان هر روز دقیق می‌دانم چه مبحثی را باید بخوانم.",
            avatar: "https://i.pravatar.cc/100?img=12"
        },
        {
            name: "مریم احمدی",
            role: "دانش‌آموز دوازدهم ریاضی",
            text: "بخش تحلیل پیشرفت خیلی کمکم کرد بفهمم در کدام فصل‌های ریاضی ضعف دارم و بیشتر روی همان‌ها تمرکز کنم.",
            avatar: "https://i.pravatar.cc/100?img=32"
        },
        {
            name: "سینا کریمی",
            role: "دانش‌آموز دوازدهم انسانی",
            text: "با برنامه‌ریزی هوشمند منتورا توانستم زمان درسم را خیلی بهتر مدیریت کنم و استرسم برای امتحانات کمتر شد.",
            avatar: "https://i.pravatar.cc/100?img=15"
        },
        {
            name: "زهرا موسوی",
            role: "دانش‌آموز دوازدهم تجربی",
            text: "بخش تمرین‌ها خیلی خوب طراحی شده و باعث شد مباحث زیست را عمیق‌تر یاد بگیرم.",
            avatar: "https://i.pravatar.cc/100?img=47"
        },
        {
            name: "محمد حسینی",
            role: "دانش‌آموز دوازدهم ریاضی",
            text: "قبل از استفاده از منتورا همیشه برنامه‌ام به‌هم می‌ریخت، اما حالا با برنامه روزانه خیلی منظم‌تر درس می‌خوانم.",
            avatar: "https://i.pravatar.cc/100?img=21"
        },
        {
            name: "نگار کاظمی",
            role: "دانش‌آموز دوازدهم انسانی",
            text: "گزارش پیشرفت واقعاً انگیزه می‌دهد. وقتی نمودار پیشرفتم را می‌بینم بیشتر تلاش می‌کنم.",
            avatar: "https://i.pravatar.cc/100?img=5"
        },
        {
            name: "امیرعلی نادری",
            role: "دانش‌آموز دوازدهم تجربی",
            text: "با کمک منتورا توانستم برنامه درسی شخصی‌سازی شده داشته باشم و زمانم را بهتر مدیریت کنم.",
            avatar: "https://i.pravatar.cc/100?img=18"
        },
        {
            name: "سارا کریمی",
            role: "دانش‌آموز دوازدهم ریاضی",
            text: "بخش مرور مباحث قبل از امتحان خیلی کاربردی است و باعث شد در امتحانات نهایی عملکرد بهتری داشته باشم.",
            avatar: "https://i.pravatar.cc/100?img=25"
        },
        {
            name: "پارسا مرادی",
            role: "دانش‌آموز دوازدهم تجربی",
            text: "یکی از بهترین ویژگی‌های منتورا این است که دقیق نشان می‌دهد کدام درس‌ها نیاز به تمرین بیشتری دارند.",
            avatar: "https://i.pravatar.cc/100?img=14"
        },
        {
            name: "فاطمه جعفری",
            role: "دانش‌آموز دوازدهم انسانی",
            text: "از وقتی با منتورا درس می‌خوانم تمرکزم بیشتر شده و احساس می‌کنم مسیر یادگیری‌ام واضح‌تر است.",
            avatar: "https://i.pravatar.cc/100?img=9"
        },
        {
            name: "آرمان صادقی",
            role: "دانش‌آموز دوازدهم ریاضی",
            text: "تمرین‌های هدفمند و برنامه روزانه باعث شد برای امتحانات خیلی بهتر آماده شوم.",
            avatar: "https://i.pravatar.cc/100?img=33"
        },
        {
            name: "ریحانه عباسی",
            role: "دانش‌آموز دوازدهم تجربی",
            text: "بخش دستیار هوشمند خیلی جالب است و کمک می‌کند سریع‌تر جواب سوال‌هایم را پیدا کنم.",
            avatar: "https://i.pravatar.cc/100?img=41"
        }
    ];


    return (
        <>
            <style>{`

.testimonials-section{

position:relative;
padding:60px 20px;
overflow:hidden;
direction:rtl;
background:#fff;
color:#251960;


}

/* lava blobs */

.blob{

position:absolute;
width:500px;
height:500px;
border-radius:50%;
filter:blur(120px);
opacity:.5;
animation:blobMove 18s infinite alternate ease-in-out;

}

.blob1{
background:#6366f1;
top:-120px;
right:-120px;
}

.blob2{
background:#2563eb;
bottom:-150px;
left:-100px;
animation-delay:4s;
}

.blob3{
background:#8b5cf6;
top:40%;
left:40%;
animation-delay:8s;
}

@keyframes blobMove{

0%{transform:translate(0,0) scale(1)}
50%{transform:translate(80px,-60px) scale(1.2)}
100%{transform:translate(-60px,70px) scale(0.9)}

}

/* header */

.testimonials-header{

text-align:center;
max-width:700px;
margin:auto;
margin-bottom:80px;
position:relative;
z-index:2;

}

.testimonials-header h2{

font-size:44px;
font-weight:800;
margin-bottom:16px;

background:linear-gradient(90deg,#60a5fa,#a78bfa);
-webkit-background-clip:text;
-webkit-text-fill-color:transparent;

}

.testimonials-header p{

color:#251960;
font-size:17px;

}

/* grid */

.testimonials-grid{

max-width:1100px;
margin:auto;
display:grid;
grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
gap:35px;
position:relative;
z-index:2;

}

/* card */

.testimonial-card{

background:rgba(255, 255, 255, 0.08);
backdrop-filter:blur(16px);

border:1px solid rgba(255,255,255,0.1);

padding:30px;
border-radius:24px;

transition:all .45s ease;

opacity:0;
transform:translateY(60px);

}

.reveal.active{

opacity:1;
transform:translateY(0);

}

.testimonial-card:hover{

transform:translateY(-12px) scale(1.03);
background:rgba(255,255,255,0.12);

box-shadow:0 25px 60px rgba(99,102,241,0.35);

}

/* user */

.testimonial-user{

display:flex;
align-items:center;
gap:14px;
margin-bottom:14px;

}

.testimonial-user img{

width:50px;
height:50px;
border-radius:50%;
border:2px solid rgba(255,255,255,0.4);

}

.testimonial-user h4{

margin:0;
font-size:15px;

}

.testimonial-user span{

font-size:13px;
color:#6255f5;

}

.testimonial-stars{

color:#fbbf24;
font-size:18px;
margin-bottom:12px;

}

.testimonial-text{

font-size:14px;
line-height:1.9;
color:#251960;

}

`}</style>

            <section className="testimonials-section" id="testimonials" style={{
                fontFamily: "Vazir, sans-serif",
            }}>

                <div className="blob blob1"></div>
                <div className="blob blob2"></div>
                <div className="blob blob3"></div>

                <div className="testimonials-header">

                    <h2>تجربه کاربران منتورا</h2>

                    <p>
                        دانش‌آموزان زیادی با Mentora مسیر یادگیری خود را هوشمندتر مدیریت می‌کنند
                    </p>

                </div>

                <div className="testimonials-grid">

                    {testimonials.map((item, index) => (

                        <div key={index} className="testimonial-card reveal">

                            <div className="testimonial-user">

                                <img src={item.avatar} />

                                <div>

                                    <h4>{item.name}</h4>
                                    <span>{item.role}</span>

                                </div>

                            </div>

                            <div className="testimonial-stars">
                                ★★★★★
                            </div>

                            <p className="testimonial-text">
                                {item.text}
                            </p>

                        </div>

                    ))}

                </div>
                <Container
                    className="landing-shell"
                    style={{
                        paddingBottom: "80px",
                        paddingTop: "80px",
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
            </section>

        </>
    )
}

export default Testimonials
