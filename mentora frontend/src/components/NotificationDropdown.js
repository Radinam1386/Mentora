import { useState } from "react";
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

  return (
    <div style={{ position: "relative" }}>
      
      {/* Bell Button */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          cursor: "pointer",
          position: "relative",
        }}
      >
        <Bell size={22} />

        {/* red badge */}
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            width: 10,
            height: 10,
            background: "#ef4444",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* Floating Panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: 35,
            left: 0,
            width: 300,
            background: "white",
            borderRadius: 16,
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
            padding: 10,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              fontWeight: 700,
              borderBottom: "1px solid #eee",
            }}
          >
            نوتیفیکیشن‌ها
          </div>

          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {mockNotifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid #f2f2f2",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 14 }}>{n.text}</div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#888",
                    marginTop: 3,
                  }}
                >
                  {n.time}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              textAlign: "center",
              padding: 8,
              fontSize: 13,
              color: "#6255f5",
              cursor: "pointer",
            }}
          >
            مشاهده همه
          </div>
        </div>
      )}
    </div>
  );
}
