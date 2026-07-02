import React, { useEffect, useState } from "react";
import { LifeBuoy, MessageCircle, Plus, Send, RefreshCw, Logs } from "lucide-react";
import { apiJson } from "../utils/api";

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "عمومی",
    body: "",
  });

  /* --- Load all tickets --- */
  const loadTickets = async () => {
    try {
      const { response, data } = await apiJson("/api/support/tickets");
      if (response.ok) setTickets(data.tickets || []);
    } catch (e) {
      console.error(e);
    }
  };

  /* --- Load single ticket --- */
  const loadTicket = async (id) => {
    try {
      const { response, data } = await apiJson(`/api/support/tickets/${id}`);
      if (response.ok) setSelected(data.ticket);
    } catch (e) {
      console.error(e);
    }
  };

  /* --- Create new ticket --- */
  const createTicket = async (e) => {
    e.preventDefault();
    try {
      const { response, data } = await apiJson("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setForm({ title: "", category: "عمومی", body: "" });
        if (data.ticket) setSelected(data.ticket);
        await loadTickets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  /* --- Send message --- */
  const sendMessage = async () => {
    if (!selected || !message.trim()) return;

    try {
      const { response } = await apiJson(`/api/support/tickets/${selected.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: message }),
      });

      if (response.ok) {
        setMessage("");
        loadTicket(selected.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <div
      className="container py-4"
      style={{
        maxWidth: "1200px",
        direction: "rtl",
        fontFamily: "Vazir, Tahoma",
      }}
    >
      <div className="d-flex flex-column gap-3">

        {/* --- HEADER --- */}
        <div
          className="bg-white border shadow-sm"
          style={{
            borderRadius: "28px",
            padding: "20px",
            borderColor: "#f1f3f5",
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <h2
              className="fw-bold text-dark mb-0 d-flex align-items-center gap-2"
              style={{ fontSize: "14px" }}
            >
              <LifeBuoy size={16} color="#6255f5" />
              سامانه پشتیبانی منتورا
            </h2>

            <button
              className="btn btn-light rounded-pill d-flex justify-content-center align-items-center"
              onClick={loadTickets}
              style={{
                background: "#f8fafc",
                borderColor: "#e2e8f0",
                width: "50px",
                height: "50px"
              }}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="row g-4">

          <div className="col-12 col-md-4">
            <div
              className="bg-white border shadow-sm text-end h-100"
              style={{
                borderRadius: "28px",
                padding: "20px",
                borderColor: "#f1f3f5",
              }}
            >
              <h3
                className="fw-bold d-flex align-items-center gap-2 mb-3"
                style={{ fontSize: "12px", color: "#1f2937" }}
              >
                <Plus size={15} color="#6255f5" />
                ثبت تیکت جدید
              </h3>

              <form onSubmit={createTicket}>
                <input
                  className="form-control mb-3"
                  placeholder="عنوان مشکل"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  style={{
                    background: "#f9fafb",
                    borderRadius: "18px",
                    borderColor: "#e5e7eb",
                  }}
                />

                <select
                  className="form-select mb-3"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  style={{
                    background: "#f9fafb",
                    borderRadius: "18px",
                    borderColor: "#e5e7eb",
                  }}
                >
                  <option>عمومی</option>
                  <option>مربی هوشمند</option>
                  <option>برنامه‌ریزی</option>
                  <option>آزمون‌ها</option>
                </select>

                <textarea
                  className="form-control mb-3"
                  rows="4"
                  placeholder="توضیحات بیشتر..."
                  value={form.body}
                  onChange={(e) =>
                    setForm({ ...form, body: e.target.value })
                  }
                  style={{
                    background: "#f9fafb",
                    borderRadius: "18px",
                    borderColor: "#e5e7eb",
                  }}
                ></textarea>

                <button
                  className="btn w-100 fw-bold text-center d-flex justify-content-center align-items-center p-2"
                  style={{
                    background: "#6255f5",
                    borderRadius: "18px",
                    color: "white",
                  }}
                  type="submit"
                >
                  ارسال تیکت
                  <Send size={15} className="m-2 d-flex" />

                </button>
              </form>
            </div>
          </div>

          {/* --- TICKET LIST --- */}
          <div className="col-12 col-md-4">
            <div
              className="bg-white border shadow-sm text-end h-100"
              style={{
                borderRadius: "28px",
                padding: "20px",
                borderColor: "#f1f3f5",
              }}
            >
              <h3
                className="fw-bold d-flex align-items-center gap-2 mb-3"
                style={{ fontSize: "12px", color: "#1f2937" }}
              >
                <Logs size={15} color="#6255f5" />
                درخواست‌های شما
              </h3>

              {tickets.length === 0 && (
                <p className="text-secondary small">
                  هیچ تیکتی ثبت نشده است.
                </p>
              )}

              {tickets.map((t) => (
                <button
                  key={t.id}
                  className="btn w-100 text-end mb-2"
                  onClick={() => loadTicket(t.id)}
                  style={{
                    background:
                      selected?.id === t.id ? "#eef2ff" : "#f9fafb",
                    borderRadius: "18px",
                    borderColor: "#e5e7eb",
                    padding: "12px",
                  }}
                >
                  <div className="fw-bold">{t.title}</div>
                  <small className="text-secondary">{t.status}</small>
                </button>
              ))}
            </div>
          </div>

          {/* --- CHAT / REPLIES --- */}
          <div className="col-12 col-md-4">
            <div
              className="bg-white border shadow-sm text-end h-100 d-flex flex-column"
              style={{
                borderRadius: "28px",
                padding: "20px",
                borderColor: "#f1f3f5",
              }}
            >
              <h3
                className="fw-bold d-flex align-items-center gap-2 mb-3"
                style={{ fontSize: "12px", color: "#1f2937" }}
              >
                <MessageCircle size={15} color="#6255f5" />
                {selected ? selected.title : "گفتگو"}
              </h3>

              <div className="flex-grow-1 overflow-auto mb-3">
                {selected?.messages?.map((m) => (
                  <div
                    key={m.id}
                    className="p-2 mb-2"
                    style={{
                      borderRadius: "18px",
                      width: "75%",
                      marginLeft: m.senderRole === "user" ? "auto" : "",
                      background:
                        m.senderRole === "user"
                          ? "#6255f5"
                          : "#f3f4f6",
                      color: m.senderRole === "user" ? "white" : "#1f2937",
                    }}
                  >
                    {m.body}
                  </div>
                ))}
              </div>

              <div className="input-group">
                <input
                  className="form-control"
                  placeholder="پیام خود را بنویسید..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    background: "#f9fafb",
                    borderRadius: "18px",
                    borderColor: "#e5e7eb",
                  }}
                />
                <button
                  className="btn"
                  onClick={sendMessage}
                  style={{
                    background: "#6255f5",
                    borderRadius: "18px",
                    color: "white",
                    width: "40px",
                    height: "40px"
                  }}
                >
                  <Send size={18} style={{ transform: "scaleX(-1)" }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
