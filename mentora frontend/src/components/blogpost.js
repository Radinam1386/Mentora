import React from "react";
import { useParams, Link } from "react-router-dom";
import { blogPosts } from "../data/blogPosts.js";

export default function BlogPost() {
    const { slug } = useParams();
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        return (
            <main className="container py-5" style={{ direction: "rtl", textAlign: "right" }}>
                <p>مقاله پیدا نشد.</p>
                <Link to="/blog">بازگشت به بلاگ</Link>
            </main>
        );
    }

    return (
        <main
            className="container py-4 d-flex justify-content-center"
            style={{
                direction: "rtl",
                textAlign: "right",
                fontFamily: "Vazir, Tahoma, Arial, sans-serif",

            }}
        >
            <article
                className="col-md-12 col-12"
                style={{
                    background: "#fff",
                    borderRadius: "24px",
                    padding: "24px",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                    border: "1px solid rgba(148, 163, 184, 0.16)"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginBottom: "16px"
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

                <header>
                    <h1 style={{ fontWeight: 900, lineHeight: "1.8" }}>
                        {post.title}
                    </h1>

                    <p
                        style={{
                            color: "#475569",
                            marginTop: "10px",
                            lineHeight: "2"
                        }}
                    >
                        {post.description}
                    </p>
                </header>
                <section style={{ marginTop: "24px" }}>
                    {post.content.map((block, index) => {
                        if (block.type === "h2") {
                            return (
                                <h2
                                    key={index}
                                    style={{
                                        fontWeight: 900,
                                        marginTop: "28px",
                                        marginBottom: "10px",
                                        lineHeight: "1.8"
                                    }}
                                >
                                    {block.text}
                                </h2>
                            );
                        }

                        if (block.type === "p") {
                            return (
                                <p
                                    key={index}
                                    style={{
                                        marginTop: "10px",
                                        lineHeight: "2.2",
                                        color: "#334155"
                                    }}
                                >
                                    {block.text}
                                </p>
                            );
                        }

                        if (block.type === "ul") {
                            return (
                                <ul
                                    key={index}
                                    style={{
                                        marginTop: "12px",
                                        paddingRight: "20px",
                                        lineHeight: "2.2",
                                        color: "#334155"
                                    }}
                                >
                                    {block.items.map((item, i) => (
                                        <li key={i} style={{ marginBottom: "8px" }}>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            );
                        }

                        return null;
                    })}
                    <nav style={{ marginTop: "18px" }}>
                        <Link
                            to="/blog"
                            style={{
                                display: "inline-block",
                                padding: "8px 14px",
                                borderRadius: "12px",
                                background: "#f1f5f9",
                                color: "#0f172a",
                                textDecoration: "none",
                                fontWeight: 700
                            }}
                        >
                            ← بازگشت به همه مقالات
                        </Link>
                    </nav>
                </section>
            </article>
        </main>
    );
}
