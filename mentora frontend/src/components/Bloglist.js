import React from "react";
import { Link } from "react-router-dom";
import { blogPosts } from "../data/blogPosts.js";

export default function BlogList() {
    return (
        <main
            className="container py-4"
            style={{
                direction: "rtl",
                textAlign: "right"
            }}
        >
            <section
                style={{
                    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                    borderRadius: "24px",
                    fontFamily: "Vazir, Tahoma, Arial, sans-serif",
                    padding: "28px",
                    color: "#fff",
                    boxShadow: "0 12px 40px rgba(79, 70, 229, 0.25)",
                    marginBottom: "24px"
                }}
            >
                <h1 style={{ fontWeight: 900, marginBottom: "10px" }}>
                    بلاگ آموزشی منتورا
                </h1>
                <p style={{ margin: 0, opacity: 0.92, lineHeight: "2" }}>
                    مجموعه‌ای از مقاله‌های آموزشی، سئویی و کاربردی برای مطالعه بهتر،
                    برنامه‌ریزی اصولی، افزایش تمرکز و موفقیت در مسیر یادگیری.
                </p>
            </section>

            <div className="row g-4">
                {blogPosts.map((post) => (
                    <div className="col-12 col-md-6" key={post.slug}>
                        <article
                            style={{
                                background: "#fff",
                                borderRadius: "22px",
                                padding: "22px",
                                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                                border: "1px solid rgba(148, 163, 184, 0.16)",
                                height: "100%",
                                fontFamily: "Vazir, Tahoma, Arial, sans-serif"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginBottom: "14px",
                                    flexWrap: "wrap"
                                }}
                            >
                                <span
                                    style={{
                                        background: "#ede9fe",
                                        color: "#6d28d9",
                                        padding: "6px 12px",
                                        borderRadius: "999px",
                                        fontSize: "13px",
                                        fontWeight: 700
                                    }}
                                >
                                    {post.category || "مقاله"}
                                </span>

                                <span style={{ fontSize: "13px", color: "#64748b" }}>
                                    {post.readingTime || "مطالعه کوتاه"}
                                </span>
                            </div>

                            <h2 style={{ fontWeight: 900, fontSize: "22px", lineHeight: "1.8" }}>
                                {post.title}
                            </h2>

                            <p style={{ color: "#475569", lineHeight: "2", marginTop: "12px" }}>
                                {post.description}
                            </p>

                            <Link
                                to={`/blog/${post.slug}`}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    marginTop: "16px",
                                    padding: "10px 16px",
                                    borderRadius: "14px",
                                    background: "#4f46e5",
                                    color: "#fff",
                                    textDecoration: "none",
                                    fontWeight: 700
                                }}
                            >
                                خواندن مقاله
                            </Link>
                        </article>
                    </div>
                ))}
            </div>
        </main>
    );
}
