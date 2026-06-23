import { useState, useEffect } from "react";
import { Bell } from "lucide-react";

const mockNotifications = [
  {
    id: 1,
    text: "جلسه تمرکز امروزت کامل شد 👏",
    time: "2 دقیقه پیش",
  },
  {
    id: 2,
    text: "یک تمرین جدید برایت اضافه شد",
    time: "1 ساعت پیش",
  },
  {
    id: 3,
    text: "گزارش هفتگی آماده است",
    time: "دیروز",
  },
];

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);

  // بستن با کلیک بیرون
  useEffect(() => {
    const close = () => setOpen(false);
    if (open) window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [open]);

  return (
    <div
      style={{ position: "relative" }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Bell */}
      <button
        onClick={() => setOpen(!open)}
        className="btn p-2 d-flex align-items-center justify-content-center"
        style={{
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: "#fff",
          width: 40,
          height: 40,
          position: "relative",
        }}
      >
        <Bell size={18} />

        {/* badge */}
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            background: "#ef4444",
            borderRadius: "50%",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 48,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(340px, 92vw)", // ریسپانسیو
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
            zIndex: 2000,
            overflow: "hidden",
            direction: "rtl",
          }}
        >
          {/* header */}
          <div
            style={{
              padding: "12px 14px",
              fontWeight: 700,
              borderBottom: "1px solid #f1f5f9",
              fontSize: 14,
            }}
          >
            نوتیفیکیشن‌ها
          </div>

          {/* list */}
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {mockNotifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #f5f5f5",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 13 }}>{n.text}</div>

                <div
                  style={{
                    fontSize: 11,
                    color: "#9ca3af",
                    marginTop: 4,
                  }}
                >
                  {n.time}
                </div>
              </div>
            ))}
          </div>

          {/* footer */}
          <div
            style={{
              textAlign: "center",
              padding: 10,
              fontSize: 13,
              color: "#6255f5",
              cursor: "pointer",
              background: "#fafafa",
            }}
          >
            مشاهده همه
          </div>
        </div>
      )}
    </div>
  );
}
