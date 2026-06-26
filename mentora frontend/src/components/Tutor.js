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
} from "lucide-react";
import "katex/dist/katex.min.css";
import { useApp } from "../context/AppContext";
import { apiJson, authHeaders } from "../utils/api";

const defaultProfile = {
  major: "ریاضی",
};

const typingDotStyle = (delay) => ({
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: "#6255f5",
  display: "inline-block",
  animation: "mentoraTypingDot 0.9s ease-in-out infinite",
  animationDelay: delay,
});

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("تصویر انتخاب‌شده خوانده نشد."));
    reader.readAsDataURL(file);
  });

const tutorFriendlyError = (message) => {
  const text = String(message || "").trim();
  const lowerText = text.toLowerCase();

  if (!text) {
    return "الان نتوانستم پاسخ را آماده کنم. لطفاً چند لحظه دیگر دوباره تلاش کن.";
  }

  if (/[آ-ی]/.test(text) && !/[A-Za-z]{4,}/.test(text)) {
    return text;
  }

  if (
    lowerText.includes("503") ||
    lowerText.includes("unavailable") ||
    lowerText.includes("high demand") ||
    lowerText.includes("overloaded")
  ) {
    return "الان فشار روی مدل هوشمند زیاد است. سوالت ثبت شد؛ لطفاً چند لحظه دیگر دوباره بفرست.";
  }

  if (
    lowerText.includes("api key") ||
    lowerText.includes("not installed") ||
    lowerText.includes("configuration") ||
    lowerText.includes("config")
  ) {
    return "اتصال مربی هوشمند هنوز کامل تنظیم نشده است. لطفاً بعداً دوباره امتحان کن.";
  }

  if (
    lowerText.includes("failed to fetch") ||
    lowerText.includes("network") ||
    lowerText.includes("connection")
  ) {
    return "ارتباط با سرور برقرار نشد. اینترنت یا سرور را بررسی کن و دوباره تلاش کن.";
  }

  return "منتورا نتوانست این پاسخ را آماده کند. لطفاً سوال را کمی واضح‌تر یا دوباره ارسال کن.";
};

export default function Tutor() {
  const { profile: ctxProfile, bridgeQuestion, setBridgeQuestion } = useApp();
  const profile = ctxProfile || defaultProfile;
  const initialQuestion = bridgeQuestion;
  const onClearInitialQuestion = () => setBridgeQuestion(null);

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "model",
      content:
        `سلام قهرمان! من **منتورا** مربی هوشمند تو هستم. 🌟\n\nامروز چه سوال یا مبحثی رو برات کالبدشکافی کنیم؟ هر سوال ریاضی، فیزیک، زیست یا شیمی که برات مبهم هست رو اینجا بفرست تا با هم به ساده‌ترین روش تستی و تشریحی حلش کنیم!`,
      timestamp: new Date().toLocaleTimeString("fa-IR", {
        hour: "numeric",
        minute: "numeric",
      }),
    },
  ]);

  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const historyLoaded = useRef(false);

  const welcomeMessage = {
    id: "welcome",
    role: "model",
    content:
      `سلام قهرمان! من **منتورا** مربی هوشمند تو هستم. 🌟\n\nامروز چه سوال یا مبحثی رو برات کالبدشکافی کنیم؟ هر سوال ریاضی، فیزیک، زیست یا شیمی که برات مبهم هست رو اینجا بفرست تا با هم به ساده‌ترین روش تستی و تشریحی حلش کنیم!`,
    timestamp: new Date().toLocaleTimeString("fa-IR", {
      hour: "numeric",
      minute: "numeric",
    }),
  };

  useEffect(() => {
    if (historyLoaded.current) return;
    historyLoaded.current = true;

    const loadHistory = async () => {
      try {
        const { response, data } = await apiJson("/api/tutor/history");
        if (response.ok && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages([
            welcomeMessage,
            ...data.messages.map((m) => ({
              id: String(m.id),
              role: m.role,
              content: m.content,
              timestamp: new Date(m.timestamp).toLocaleTimeString("fa-IR", {
                hour: "numeric",
                minute: "numeric",
              }),
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

  // Handle initial question passed as a prop
  useEffect(() => {
    if (initialQuestion) {
      handleSendMessage(initialQuestion);
      if (onClearInitialQuestion) {
        onClearInitialQuestion();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Handle image file selection
  const handleImageChange = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    // Only accept image files
    if (!file.type.startsWith("image/")) {
      alert("لطفاً فقط فایل‌های تصویری انتخاب کنید.");
      return;
    }

    try {
      const preview = await readFileAsDataUrl(file);
      setSelectedImage(file);
      setImagePreview(preview);
    } catch (_) {
      setSelectedImage(null);
      setImagePreview("");
      alert("تصویر انتخاب‌شده خوانده نشد. لطفاً یک تصویر دیگر انتخاب کنید.");
    }
  };

  // Clear selected image
  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the file input
    }
  };

  // Send message or image to the backend
  const handleSendMessage = async (textToSend, action) => {
    const userText = textToSend.trim();
    const imageToSend = action ? null : selectedImage; // Only send image if not an action
    const previewToSend = action ? "" : imagePreview;

    // Prevent sending empty messages or actions without content
    if (!userText && !action && !imageToSend) return;

    const userMsgId = Date.now().toString(); // Unique ID for the user message

    // Construct the new user message object
    const newUserMessage = {
      id: userMsgId,
      role: "user",
      content: userText || (action === "simpler" ? "ساده‌تر بگو" : "روش تست‌زنی دیگر"),
      timestamp: new Date().toLocaleTimeString("fa-IR", {
        hour: "numeric",
        minute: "numeric",
      }),
    };

    if (!userText && imageToSend) {
      newUserMessage.content = "تصویر سوال ارسال شد."; // Default content if only image is sent
    }
    if (previewToSend) {
      newUserMessage.imagePreview = previewToSend; // Attach image preview for display
    }

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    // Clear input and image after sending
    setInput("");
    clearSelectedImage(); // Use the clear function

    setLoading(true); // Set loading state

    try {
      // Prepare conversation history for the API
      const historyPayload = updatedMessages
        .filter((m) => m.id !== "welcome") // Exclude welcome message
        .slice(-6) // Take last 6 messages
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Use FormData to send text, history, action, and image
      const formData = new FormData();
      formData.append("message", userText);
      formData.append("history", JSON.stringify(historyPayload));

      if (action) {
        formData.append("action", action); // Add action type if provided
      }

      if (imageToSend) {
        formData.append("image", imageToSend); // Add image file if selected
      }

      // Fetch response from the tutor API
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });

      // Try to parse JSON, handle potential errors
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(tutorFriendlyError(data.error));
      }

      // Add the model's reply to the messages state
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(), // Unique ID for model message
          role: "model",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString("fa-IR", {
            hour: "numeric",
            minute: "numeric",
          }),
        },
      ]);
    } catch (err) {
      // Add error message to state if API call fails
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          content: tutorFriendlyError(err instanceof Error ? err.message : ""),
          timestamp: new Date().toLocaleTimeString("fa-IR", {
            hour: "numeric",
            minute: "numeric",
          }),
        },
      ]);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Handle specific actions like "simpler" or "alternative"
  const handleAction = (type) => {
    handleSendMessage("", type); // Send empty message with action type
  };

  return (
    <div
      className="d-flex flex-column flex-grow-1 h-100 mx-auto position-relative"
      style={{
        width: "100%",
        maxWidth: "1200px",
        minHeight: "calc(100vh - 64px)",
        fontFamily: "Vazir ,Tahoma, Arial, sans-serif", // Vazir font as primary
        backgroundColor: "#fcfbf9", // Light background color
        direction: "rtl", // Right-to-left text direction
        borderLeft: "1px solid #f3f4f6", // Subtle border
        borderRight: "1px solid #f3f4f6",
        borderRadius: "25px"
      }}
    >
      <style>{`
        @keyframes mentoraTypingDot {
          0%, 80%, 100% {
            transform: translateY(0) scale(0.9);
            opacity: 0.45;
          }
          40% {
            transform: translateY(-6px) scale(1.08);
            opacity: 1;
          }
        }

        @keyframes mentoraThinkingPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(98,85,245,0.18);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(98,85,245,0.08);
            transform: scale(1.04);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mentora-typing-dot,
          .mentora-thinking-avatar {
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
      {/* Header Section */}
      <div
        className="bg-white d-flex align-items-center justify-content-between"
        style={{
          padding: "16px",
          borderBottom: "1px solid #f3f4f6", // Separator line
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)", // Subtle shadow
          flexShrink: 0, // Prevent shrinking
        }}
      >
        <div className="d-flex align-items-center gap-3">
          {/* Bot Icon */}
          <div
            className="d-flex align-items-center justify-content-center text-white"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6255f5, #4f46e5)", // Gradient background
              boxShadow: "0 2px 8px rgba(79,70,229,0.25)", // Shadow for depth
            }}
          >
            <Bot size={20} />
          </div>

          {/* Bot Info */}
          <div className="text-end">
            <h3
              className="d-flex align-items-center gap-1 mb-1"
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#1f2937", // Dark text for name
              }}
            >
              منتورا AI
              {/* Online Status Indicator */}
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981", // Green color for online
                  display: "inline-block",
                }}
              ></span>
            </h3>
            <p
              className="mb-0"
              style={{
                fontSize: "10px",
                color: "#9ca3af", // Gray color for status
                fontWeight: 300,
              }}
            >
              پاسخگویی هوشمند ۲۴ ساعته کنکور
            </p>
          </div>
        </div>

        {/* Profile Major Display */}
        <div
          style={{
            fontSize: "12px",
            background: "rgba(98,85,245,0.15)", // Light purple background
            color: "#6255f5", // Purple text
            padding: "6px 10px",
            borderRadius: "10px",
            fontWeight: 700,
          }}
        >
          رشته {profile.major || "نامشخص"} {/* Fallback if major is missing */}
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-grow-1 overflow-auto" // Allows scrolling
        style={{
          padding: "16px",
        }}
      >
        <div className="d-flex flex-column gap-3">
          {messages.map((m) => {
            const isModel = m.role === "model";

            return (
              <div
                key={m.id}
                className={`d-flex gap-2 ${isModel ? "justify-content-start" : "justify-content-end"}`}
              >
                {/* Model Avatar */}
                {isModel && (
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "#eef2ff", // Light blue background
                      color: "#6255f5", // Purple icon
                      border: "1px solid #c7d2fe",
                    }}
                  >
                    <Bot size={16} />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className="d-flex flex-column"
                  style={{ maxWidth: "80%" }} // Max width for message bubble
                >
                  <div
                    style={{
                      borderRadius: "18px", // Rounded corners
                      padding: "16px",
                      fontSize: "13px",
                      lineHeight: "1.9",
                      textAlign: "right",
                      whiteSpace: "pre-wrap", // Preserve whitespace and line breaks
                      direction: "rtl",
                      backgroundColor: isModel ? "#ffffff" : "#6255f5", // White for model, purple for user
                      color: isModel ? "#1f2937" : "#ffffff", // Dark text for model, white for user
                      border: isModel ? "1px solid #f3f4f6" : "none", // Border for model messages
                      borderTopRightRadius: isModel ? "0" : "18px", // Adjust corner based on role
                      borderTopLeftRadius: isModel ? "18px" : "0",
                      boxShadow: isModel
                        ? "0 1px 4px rgba(0,0,0,0.04)"
                        : "none", // Subtle shadow for model
                      fontWeight: isModel ? 400 : 500, // Font weight
                    }}
                  >
                    {/* Image Preview if available */}
                    {m.imagePreview && (
                      <img
                        src={m.imagePreview}
                        alt="تصویر سوال"
                        style={{
                          marginBottom: "12px",
                          maxHeight: "224px",
                          width: "100%",
                          borderRadius: "14px",
                          objectFit: "contain",
                          background: "rgba(255,255,255,0.2)", // Semi-transparent background
                        }}
                      />
                    )}

                    {/* Render Markdown for model messages */}
                    {isModel ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          // Customizing Markdown components
                          p: ({ children }) => (
                            <p style={{ marginBottom: "8px" }}>{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul style={{ margin: "8px 0", paddingRight: "20px" }}>
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol style={{ margin: "8px 0", paddingRight: "20px" }}>
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li style={{ lineHeight: "1.8" }}>{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong style={{ fontWeight: 900, color: "#111827" }}>
                              {children}
                            </strong>
                          ),
                          code: ({ children }) => (
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
                      // Render plain text for user messages
                      m.content
                    )}
                  </div>

                  {/* Timestamp */}
                  <span
                    style={{
                      fontSize: "9px",
                      color: "#9ca3af",
                      marginTop: "4px",
                      padding: "0 4px",
                      alignSelf: "flex-start", // Align timestamp to the left of the bubble
                      fontWeight: 300,
                    }}
                  >
                    {m.timestamp}
                  </span>
                </div>

                {/* User Avatar */}
                {!isModel && (
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "#f3f4f6", // Light gray background
                      color: "#4b5563", // Dark gray icon
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="d-flex gap-2 justify-content-start">
              {/* Model Avatar */}
              <div
                className="mentora-thinking-avatar d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#eef2ff",
                  color: "#6255f5",
                  border: "1px solid #c7d2fe",
                  animation: "mentoraThinkingPulse 1.4s ease-in-out infinite",
                }}
              >
                <Bot size={16} />
              </div>

              {/* Typing Animation */}
              <div
                className="d-flex align-items-center gap-2 bg-white"
                style={{
                  borderRadius: "18px",
                  borderTopRightRadius: "0",
                  border: "1px solid #f3f4f6",
                  padding: "16px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <span className="mentora-typing-dot" style={typingDotStyle("0s")}></span>
                <span className="mentora-typing-dot" style={typingDotStyle("0.15s")}></span>
                <span className="mentora-typing-dot" style={typingDotStyle("0.3s")}></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area and Action Buttons */}
      <div
        style={{
          // Gradient overlay for a softer transition to the input area
          background: "linear-gradient(to top, #fcfbf9, rgba(252,251,249,0.95), transparent)",
          padding: "16px",
          borderTop: "1px solid #f3f4f6", // Separator line
          flexShrink: 0, // Prevent shrinking
        }}
      >
        <div className="d-flex flex-column gap-3">
          {/* Image Preview Area */}
          {imagePreview && (
            <div
              className="d-flex align-items-center gap-3 bg-white"
              style={{
                borderRadius: "18px",
                border: "1px solid #c7d2fe",
                padding: "8px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <img
                src={imagePreview}
                alt="Selected question"
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "12px",
                  objectFit: "cover",
                  border: "1px solid #f3f4f6",
                }}
              />

              {/* File Info */}
              <div className="flex-grow-1 text-end" style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#374151",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {selectedImage?.name || "نام فایل"}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#9ca3af",
                  }}
                >
                  تصویر همراه سوال ارسال می‌شود
                </div>
              </div>

              {/* Close Button for Image Preview */}
              <button
                type="button"
                onClick={clearSelectedImage}
                className="btn"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #f3f4f6",
                  padding: "8px",
                  color: "#9ca3af",
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Action Buttons (Simpler, Alternative) */}
          <div className="d-flex gap-2">
            {/* "Say it simpler" Button */}
            <button
              type="button"
              onClick={() => handleAction("simpler")}
              disabled={loading || messages.length < 2} // Disable if loading or only welcome message exists
              className="btn flex-fill d-flex align-items-center justify-content-center gap-1"
              style={{
                background: "#fffbeb", // Light yellow background
                color: "#b45309", // Orange text
                fontWeight: 700,
                fontSize: "12px",
                padding: "10px 12px",
                border: "1px solid #fde68a", // Yellow border
                borderRadius: "14px",
              }}
            >
              <HelpCircle size={14} />
              ساده‌تر بگو 😊
            </button>

            <button
              type="button"
              onClick={() => handleAction("alternative")}
              disabled={loading || messages.length < 2}
              className="btn flex-fill d-flex align-items-center justify-content-center gap-1"
              style={{
                background: "#eef2ff", // Light blue background
                color: "#4338ca", // Indigo text
                fontWeight: 700,
                fontSize: "12px",
                padding: "10px 12px",
                border: "1px solid #c7d2fe", // Blue border
                borderRadius: "14px",
              }}
            >
              <RefreshCw size={14} />
              روش تست‌زنی دیگر ⚡
            </button>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input); // Send input message on submit
            }}
            className="d-flex gap-2"
          >
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*" // Accept only image files
              onChange={handleImageChange}
              style={{ display: "none" }} // Hide the actual input
            />

            {/* Image Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()} // Trigger hidden file input
              disabled={loading}
              className="btn p-2 d-flex align-items-center justify-content-center"
              style={{
                padding: "12px",
                borderRadius: "14px",
                width: "40px",
                height: "40px",
                border: selectedImage
                  ? "1px solid #6255f5" // Highlight border if image selected
                  : "1px solid #e5e7eb",
                background: selectedImage ? "rgba(98,85,245,0.1)" : "#ffffff", // Light purple background if selected
                color: selectedImage ? "#6255f5" : "#6b7280", // Purple icon if selected
              }}
            >
              <ImageIcon size={16} />
            </button>

            {/* Text Input Field */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="سوال درسی جدید خود را بپرسید..."
              className="form-control"
              style={{
                borderRadius: "14px",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                padding: "12px 16px",
                fontSize: "12px",
                textAlign: "right", // Ensure text aligns right
                color: "#1f2937",
              }}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || (!input.trim() && !selectedImage)} // Disable if loading or no input/image
              className="btn p-2 d-flex align-items-center justify-content-center"
              style={{
                background: "#6255f5", // Purple background
                padding: "12px",
                borderRadius: "14px",
                border: "none",
                width: "40px",
                height: "40px",
                color: "white",
                boxShadow: "0 2px 6px rgba(98,85,245,0.2)", // Shadow for emphasis
              }}

            >
              <Send size={18} style={{ transform: "scaleX(-1)" }} /> {/* Rotated send icon */}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
