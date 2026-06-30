import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import {
  Send,
  Bot,
  User,
  HelpCircle,
  RefreshCw,
  Image as ImageIcon,
  X,
  ChevronDown,
  Paperclip,
} from "lucide-react";
import "katex/dist/katex.min.css";
import { useApp } from "../context/AppContext";
import { apiJson, authHeaders, resolveMediaUrl } from "../utils/api";

const defaultProfile = {
  major: "ریاضی",
};

const formatTime = (date = new Date()) =>
  date.toLocaleTimeString("fa-IR", {
    hour: "numeric",
    minute: "numeric",
  });

const welcomeMessageFactory = () => ({
  id: "welcome",
  role: "model",
  content:
    `سلام قهرمان! من **منتورا** مربی هوشمند تو هستم. 🌟

امروز چه سوال یا مبحثی رو برات کالبدشکافی کنیم؟ هر سوال ریاضی، فیزیک، زیست یا شیمی که برات مبهم هست رو اینجا بفرست تا با هم به ساده‌ترین روش تستی و تشریحی حلش کنیم!`,
  timestamp: formatTime(),
});

function TypingDots() {
  return (
    <>
      <style>
        {`
          @keyframes tutor-bounce {
            0%, 80%, 100% { transform: scale(0.7); opacity: 0.45; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
      <div
        className="d-flex align-items-center gap-1"
        style={{ minWidth: "44px", justifyContent: "center" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#6255f5",
              display: "inline-block",
              animation: "tutor-bounce 1.2s infinite ease-in-out",
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

export default function Tutor() {
  const { profile: ctxProfile, bridgeQuestion, setBridgeQuestion } = useApp();
  const profile = ctxProfile || defaultProfile;
  const initialQuestion = bridgeQuestion;
  const onClearInitialQuestion = () => setBridgeQuestion(null);

  const [messages, setMessages] = useState([welcomeMessageFactory()]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const historyLoaded = useRef(false);
  const shouldStickToBottomRef = useRef(true);
  const imagePreviewRef = useRef("");
  const sentImagePreviewUrlsRef = useRef(new Set());

  const welcomeMessage = welcomeMessageFactory();

  const scrollToBottom = (smooth = true) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const checkIfNearBottom = () => {
    if (!scrollRef.current) return true;
    const el = scrollRef.current;
    const threshold = 120;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  useEffect(() => {
    if (historyLoaded.current) return;
    historyLoaded.current = true;

    const loadHistory = async () => {
      try {
        const { response, data } = await apiJson("/api/tutor/history");
        if (
          response.ok &&
          Array.isArray(data.messages) &&
          data.messages.length > 0
        ) {
          setMessages([
            welcomeMessage,
            ...data.messages.map((m) => ({
              id: String(m.id),
              role: m.role,
              content: m.content || "",
              timestamp: m.timestamp ? formatTime(new Date(m.timestamp)) : formatTime(),
              imagePreview: m.imagePreview || m.image || "",
              imageUrl: m.imageUrl || m.image || "",
            })),
          ]);
        }
      } catch (err) {
        console.error("خطا در بارگذاری تاریخچه چت:", err);
      }
    };

    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialQuestion) {
      handleSendMessage(initialQuestion);
      if (onClearInitialQuestion) {
        onClearInitialQuestion();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  useEffect(() => {
    if (shouldStickToBottomRef.current) {
      scrollToBottom(false);
    }
  }, [messages, loading]);

  useEffect(() => {
    imagePreviewRef.current = imagePreview;
  }, [imagePreview]);

  useEffect(() => {
    const sentPreviewUrls = sentImagePreviewUrlsRef.current;

    return () => {
      const currentPreview = imagePreviewRef.current;
      if (currentPreview && !sentPreviewUrls.has(currentPreview)) {
        URL.revokeObjectURL(currentPreview);
      }
      sentPreviewUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      sentPreviewUrls.clear();
    };
  }, []);

  const handleScroll = () => {
    const isNearBottom = checkIfNearBottom();
    shouldStickToBottomRef.current = isNearBottom;
    setShowScrollButton(!isNearBottom);
  };

  const handleImageChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("لطفاً فقط فایل‌های تصویری انتخاب کنید.");
      return;
    }

    if (imagePreview && !sentImagePreviewUrlsRef.current.has(imagePreview)) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedImage(file);
    setImagePreview(previewUrl);
    setUploadProgress(0);
  };

  const clearSelectedImage = ({ revoke = true } = {}) => {
    if (
      revoke &&
      imagePreview &&
      !sentImagePreviewUrlsRef.current.has(imagePreview)
    ) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendWithProgress = ({ formData }) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/tutor/chat");

      const headers = authHeaders?.() || {};
      Object.entries(headers).forEach(([key, value]) => {
        if (value != null) xhr.setRequestHeader(key, value);
      });

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        try {
          const data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
          } else {
            reject(new Error(data.error || "در اتصال به سرور خللی ایجاد شد."));
          }
        } catch {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({});
          } else {
            reject(new Error("پاسخ سرور قابل خواندن نبود."));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error("ارتباط با سرور برقرار نشد."));
      };

      xhr.send(formData);
    });
  };

  const handleSendMessage = async (textToSend = "", action) => {
    const userText = (textToSend || "").trim();
    const imageToSend = action ? null : selectedImage;
    const previewToSend = action ? "" : imagePreview;

    if (!userText && !action && !imageToSend) return;
    if (loading) return;

    const userMsgId = `user-${Date.now()}`;

    const newUserMessage = {
      id: userMsgId,
      role: "user",
      content:
        userText ||
        (action === "simpler" ? "ساده‌تر بگو" : "روش تست‌زنی دیگر"),
      timestamp: formatTime(),
      imagePreview: previewToSend || "",
      imageUrl: previewToSend || "",
    };

    if (!userText && imageToSend) {
      newUserMessage.content = "تصویر سوال ارسال شد.";
    }

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput("");
    shouldStickToBottomRef.current = true;
    setLoading(true);
    setUploadProgress(imageToSend ? 0 : 100);

    try {
      const historyPayload = updatedMessages
        .filter((m) => m.id !== "welcome")
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const formData = new FormData();
      formData.append("message", userText);
      formData.append("history", JSON.stringify(historyPayload));

      if (action) {
        formData.append("action", action);
      }

      if (imageToSend) {
        formData.append("image", imageToSend);
      }

      if (previewToSend) {
        sentImagePreviewUrlsRef.current.add(previewToSend);
      }
      clearSelectedImage({ revoke: false });

      const data = await sendWithProgress({ formData });

      setUploadProgress(100);

      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: "model",
          content: data.reply || "پاسخی از سرور دریافت نشد.",
          timestamp: formatTime(),
          imagePreview: data.imageUrl || data.image || "",
          imageUrl: data.imageUrl || data.image || "",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `model-error-${Date.now()}`,
          role: "model",
          content:
            err instanceof Error
              ? err.message
              : "متاسفانه خطایی در دریافت پاسخ مربی به وجود آمد.",
          timestamp: formatTime(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 600);
    }
  };

  const handleAction = (type) => {
    handleSendMessage("", type);
  };

  const canUseActions = !loading && messages.length >= 2;
  const canSubmit = !loading && (input.trim() || selectedImage);

  return (
    <div
      className="d-flex flex-column mx-auto position-relative"
      style={{
        width: "100%",
        maxWidth: "1180px",
        minHeight: "calc(100vh - 80px)",
        height: "calc(100vh - 80px)",
        fontFamily: "Vazir, Tahoma, Arial, sans-serif",
        background:
          "linear-gradient(180deg, #fffefe 0%, #fcfbf9 45%, #faf8ff 100%)",
        direction: "rtl",
        border: "1px solid #f1f2f6",
        borderRadius: "28px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        className="bg-white d-flex align-items-center justify-content-between"
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid #f3f4f6",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          flexShrink: 0,
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center text-white"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #6255f5, #4f46e5)",
              boxShadow: "0 8px 20px rgba(79,70,229,0.20)",
            }}
          >
            <Bot size={18} />
          </div>

          <div className="text-end">
            <h3
              className="d-flex align-items-center gap-2 mb-1"
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#111827",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  display: "inline-block",
                  boxShadow: "0 0 0 4px rgba(16,185,129,0.12)",
                }}
              />
              منتورا AI
            </h3>
            <p
              className="mb-0 d-none d-md-block"
              style={{
                fontSize: "11px",
                color: "#9ca3af",
                fontWeight: 400,
              }}
            >
              دستیار هوشمند آموزش، حل سوال و توضیح مرحله‌به‌مرحله
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              fontSize: "12px",
              background: "rgba(98,85,245,0.10)",
              color: "#6255f5",
              padding: "8px 12px",
              borderRadius: "12px",
              fontWeight: 800,
              border: "1px solid rgba(98,85,245,0.14)",
            }}
          >
            رشته {profile.major || "نامشخص"}
          </div>
        </div>
      </div>

      <div
        className="position-relative d-flex flex-column"
        style={{
          flex: 1,
          minHeight: 0,
          padding: "16px 16px 10px",
        }}
      >
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-auto"
          style={{
            flex: 1,
            minHeight: 0,
            maxHeight: "100%",
            padding: "6px 4px 14px",
            scrollBehavior: "smooth",
          }}
        >
          <div className="d-flex flex-column gap-3">
            {messages.map((m) => {
              const isModel = m.role === "model";
              const rawImageSrc = m.imageUrl || m.imagePreview;
              const imageSrc = resolveMediaUrl(rawImageSrc);

              return (
                <div
                  key={m.id}
                  className={`d-flex gap-2 ${isModel ? "justify-content-start" : "justify-content-end"
                    }`}
                >
                  {isModel && (
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "12px",
                        background:
                          "linear-gradient(135deg, #eef2ff, #f5f3ff)",
                        color: "#6255f5",
                        border: "1px solid #dbe4ff",
                        marginTop: "2px",
                      }}
                    >
                      <Bot size={16} />
                    </div>
                  )}

                  <div
                    className="d-flex flex-column"
                    style={{ maxWidth: "82%" }}
                  >
                    <div
                      style={{
                        borderRadius: "20px",
                        padding: imageSrc ? "10px" : "14px 16px",
                        fontSize: "13px",
                        lineHeight: "1.95",
                        textAlign: "right",
                        whiteSpace: "pre-wrap",
                        direction: "rtl",
                        background: isModel
                          ? "#ffffff"
                          : "linear-gradient(135deg, #6255f5, #5b50e6)",
                        color: isModel ? "#1f2937" : "#ffffff",
                        border: isModel ? "1px solid #eef0f5" : "none",
                        borderTopRightRadius: isModel ? "6px" : "20px",
                        borderTopLeftRadius: isModel ? "20px" : "6px",
                        boxShadow: isModel
                          ? "0 6px 20px rgba(15,23,42,0.04)"
                          : "0 8px 20px rgba(98,85,245,0.16)",
                        fontWeight: isModel ? 400 : 500,
                        overflow: "hidden",
                      }}
                    >
                      {imageSrc && (
                        <div style={{ marginBottom: m.content ? "10px" : "0" }}>
                          <img
                            src={imageSrc}
                            alt="chat-upload"
                            style={{
                              width: "100%",
                              maxWidth: "340px",
                              maxHeight: "280px",
                              borderRadius: "14px",
                              objectFit: "cover",
                              display: "block",
                              border: isModel
                                ? "1px solid #eef2ff"
                                : "1px solid rgba(255,255,255,0.25)",
                              background: "#f8fafc",
                              cursor: "pointer",
                            }}
                            onClick={() => window.open(imageSrc, "_blank")}
                          />
                        </div>
                      )}

                      {isModel ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            p: ({ children }) => (
                              <p style={{ marginBottom: "8px", fontSize: "14px" }}>{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul
                                style={{
                                  margin: "8px 0",
                                  paddingRight: "20px",
                                }}
                              >
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol
                                style={{
                                  margin: "8px 0",
                                  paddingRight: "20px",
                                }}
                              >
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li style={{ lineHeight: "1.8" }}>{children}</li>
                            ),
                            strong: ({ children }) => (
                              <strong
                                style={{
                                  fontWeight: 900,
                                  color: "#111827",
                                }}
                              >
                                {children}
                              </strong>
                            ),
                            code: ({ inline, children }) =>
                              inline ? (
                                <code
                                  style={{
                                    borderRadius: "6px",
                                    background: "#f3f4f6",
                                    padding: "2px 6px",
                                    fontSize: "12px",
                                    color: "#1f2937",
                                  }}
                                >
                                  {children}
                                </code>
                              ) : (
                                <pre
                                  style={{
                                    background: "#0f172a",
                                    color: "#e5e7eb",
                                    padding: "12px",
                                    borderRadius: "12px",
                                    overflowX: "auto",
                                    margin: "10px 0",
                                    direction: "ltr",
                                    textAlign: "left",
                                  }}
                                >
                                  <code>{children}</code>
                                </pre>
                              ),
                            div: ({ className, children }) => (
                              <div
                                className={className}
                                style={
                                  className === "math math-display"
                                    ? {
                                      margin: "12px 0",
                                      overflowX: "auto",
                                      padding: "4px 0",
                                    }
                                    : {}
                                }
                              >
                                {children}
                              </div>
                            ),
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      ) : (
                        <div>{m.content}</div>
                      )}
                    </div>

                    <span
                      style={{
                        fontSize: "10px",
                        color: "#9ca3af",
                        marginTop: "5px",
                        padding: "0 6px",
                        alignSelf: isModel ? "flex-start" : "flex-end",
                        fontWeight: 400,
                      }}
                    >
                      {m.timestamp}
                    </span>
                  </div>

                  {!isModel && (
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "12px",
                        backgroundColor: "#f8fafc",
                        color: "#4b5563",
                        border: "1px solid #e5e7eb",
                        marginTop: "2px",
                      }}
                    >
                      <User size={16} />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="d-flex gap-2 justify-content-start">
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #eef2ff, #f5f3ff)",
                    color: "#6255f5",
                    border: "1px solid #dbe4ff",
                    marginTop: "2px",
                  }}
                >
                  <Bot size={16} />
                </div>

                <div
                  className="d-flex flex-column"
                  style={{ maxWidth: "82%" }}
                >
                  <div
                    className="bg-white"
                    style={{
                      borderRadius: "20px",
                      borderTopRightRadius: "6px",
                      border: "1px solid #eef0f5",
                      padding: "14px 16px",
                      boxShadow: "0 6px 20px rgba(15,23,42,0.04)",
                      minWidth: "74px",
                    }}
                  >
                    <TypingDots />
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div
                      style={{
                        marginTop: "8px",
                        width: "180px",
                        background: "#eceffd",
                        borderRadius: "999px",
                        overflow: "hidden",
                        border: "1px solid #dde3ff",
                      }}
                    >
                      <div
                        style={{
                          width: `${uploadProgress}%`,
                          height: "7px",
                          background:
                            "linear-gradient(90deg, #6255f5 0%, #7c73ff 100%)",
                          transition: "width 0.2s ease",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#6255f5",
                          fontWeight: 700,
                          padding: "6px 8px",
                          background: "#f8f9ff",
                        }}
                      >
                        در حال آپلود تصویر... {uploadProgress}٪
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {showScrollButton && (
          <button
            type="button"
            onClick={() => {
              shouldStickToBottomRef.current = true;
              scrollToBottom(true);
            }}
            className="btn d-flex align-items-center justify-content-center"
            style={{
              position: "absolute",
              left: "18px",
              bottom: "18px",
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              color: "#6255f5",
              boxShadow: "0 8px 20px rgba(15,23,42,0.10)",
              zIndex: 5,
            }}
            title="برو به آخر چت"
          >
            <ChevronDown size={20} />
          </button>
        )}
      </div>

      <div
        style={{
          background:
            "linear-gradient(to top, #fcfbf9, rgba(252,251,249,0.98), rgba(252,251,249,0.80))",
          padding: "14px 16px 16px",
          borderTop: "1px solid #f3f4f6",
          flexShrink: 0,
        }}
      >
        <div className="d-flex flex-column gap-3">
          {imagePreview && (
            <div
              className="bg-white"
              style={{
                borderRadius: "18px",
                border: "1px solid #e1e6ff",
                padding: "10px",
                boxShadow: "0 4px 14px rgba(15,23,42,0.04)",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Selected question"
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "14px",
                    objectFit: "cover",
                    border: "1px solid #f3f4f6",
                    flexShrink: 0,
                  }}
                />

                <div className="flex-grow-1 text-end" style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      color: "#374151",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginBottom: "4px",
                    }}
                  >
                    {selectedImage?.name || "نام فایل"}
                  </div>

                  <div
                    style={{
                      fontSize: "10px",
                      color: "#9ca3af",
                      marginBottom: "8px",
                    }}
                  >
                    تصویر همراه سوال شما ارسال می‌شود
                  </div>

                  <div
                    style={{
                      height: "7px",
                      borderRadius: "999px",
                      background: "#eef2ff",
                      overflow: "hidden",
                      border: "1px solid #e1e7ff",
                    }}
                  >
                    <div
                      style={{
                        width: `${uploadProgress}%`,
                        height: "100%",
                        background:
                          "linear-gradient(90deg, #6255f5 0%, #7c73ff 100%)",
                        transition: "width 0.2s ease",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#6255f5",
                    }}
                  >
                    {uploadProgress > 0
                      ? `پیشرفت آپلود: ${uploadProgress}٪`
                      : "آماده برای ارسال"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={clearSelectedImage}
                  className="btn"
                  style={{
                    borderRadius: "12px",
                    border: "1px solid #f1f2f6",
                    padding: "8px",
                    color: "#9ca3af",
                    background: "#fff",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="d-flex gap-2">
            <button
              type="button"
              onClick={() => handleAction("simpler")}
              disabled={!canUseActions}
              className="btn flex-fill d-flex align-items-center justify-content-center gap-1"
              style={{
                background: canUseActions ? "#fffbeb" : "#f9fafb",
                color: canUseActions ? "#b45309" : "#9ca3af",
                fontWeight: 800,
                fontSize: "12px",
                padding: "11px 12px",
                border: "1px solid #fde68a",
                borderRadius: "14px",
              }}
            >
              <HelpCircle size={14} />
              ساده‌تر بگو
            </button>

            <button
              type="button"
              onClick={() => handleAction("alternative")}
              disabled={!canUseActions}
              className="btn flex-fill d-flex align-items-center justify-content-center gap-1"
              style={{
                background: canUseActions ? "#eef2ff" : "#f9fafb",
                color: canUseActions ? "#4338ca" : "#9ca3af",
                fontWeight: 800,
                fontSize: "12px",
                padding: "11px 12px",
                border: "1px solid #c7d2fe",
                borderRadius: "14px",
              }}
            >
              <RefreshCw size={14} />
              روش تست‌زنی دیگر
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="d-flex gap-2 align-items-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            <button
              type="button"
              onClick={() =>
                fileInputRef.current && fileInputRef.current.click()
              }
              disabled={loading}
              className="btn d-flex align-items-center justify-content-center"
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "16px",
                border: selectedImage
                  ? "1px solid #6255f5"
                  : "1px solid #e5e7eb",
                background: selectedImage
                  ? "rgba(98,85,245,0.08)"
                  : "#ffffff",
                color: selectedImage ? "#6255f5" : "#6b7280",
                flexShrink: 0,
              }}
              title="ارسال تصویر"
            >
              {selectedImage ? <Paperclip size={17} /> : <ImageIcon size={17} />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="سوال درسی جدید خود را بپرسید..."
              className="form-control"
              style={{
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                padding: "12px 16px",
                fontSize: "13px",
                textAlign: "right",
                color: "#1f2937",
                minHeight: "46px",
                boxShadow: "none",
              }}
            />

            <button
              type="submit"
              disabled={!canSubmit}
              className="btn d-flex align-items-center justify-content-center"
              style={{
                background: canSubmit ? "#6255f5" : "#c7c9d1",
                borderRadius: "16px",
                border: "none",
                width: "46px",
                height: "46px",
                color: "white",
                flexShrink: 0,
                boxShadow: canSubmit
                  ? "0 8px 18px rgba(98,85,245,0.24)"
                  : "none",
              }}
              title="ارسال"
            >
              <Send size={18} style={{ transform: "scaleX(-1)" }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
