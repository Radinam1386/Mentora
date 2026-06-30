import React, { useEffect, useState } from "react";
import { LifeBuoy, MessageCircle, Plus, RefreshCw, Send } from "lucide-react";
import { apiJson } from "../utils/api";
import "./Support.css";

const statusLabels = {
  open: "باز",
  in_progress: "در حال پیگیری",
  resolved: "حل شده",
  closed: "بسته",
};

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ title: "", category: "عمومی", body: "" });
  const [error, setError] = useState("");

  const loadTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const { response, data } = await apiJson("/api/support/tickets");
      if (!response.ok) throw new Error(data.error || "دریافت تیکت‌ها ناموفق بود.");
      setTickets(data.tickets || []);
      if (!selectedTicket && data.tickets?.length) {
        await loadTicket(data.tickets[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTicket = async (ticketId) => {
    setError("");
    const { response, data } = await apiJson(`/api/support/tickets/${ticketId}`);
    if (!response.ok) {
      setError(data.error || "دریافت جزئیات تیکت ناموفق بود.");
      return;
    }
    setSelectedTicket(data.ticket);
  };

  const createTicket = async (event) => {
    event.preventDefault();
    setError("");
    const { response, data } = await apiJson("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      setError(data.error || "ثبت تیکت ناموفق بود.");
      return;
    }
    setForm({ title: "", category: "عمومی", body: "" });
    setSelectedTicket(data.ticket);
    await loadTickets();
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (selectedTicket?.status === "closed") return;
    if (!selectedTicket || !message.trim()) return;
    setError("");
    const { response, data } = await apiJson(`/api/support/tickets/${selectedTicket.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: message }),
    });
    if (!response.ok) {
      setError(data.error || "ارسال پیام ناموفق بود.");
      return;
    }
    setMessage("");
    setSelectedTicket(data.ticket);
    await loadTickets();
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="support-page">
      <div className="support-header">
        <div>
          <span className="support-kicker">پشتیبانی منتورا</span>
          <h1>درخواست‌ها و گزارش مشکل</h1>
        </div>
        <button type="button" onClick={loadTickets} className="support-icon-button" disabled={loading}>
          <RefreshCw size={18} />
        </button>
      </div>

      {error && <div className="support-alert">{error}</div>}

      <div className="support-layout">
        <section className="support-panel support-new">
          <div className="support-panel-title">
            <Plus size={18} />
            <span>تیکت جدید</span>
          </div>
          <form onSubmit={createTicket} className="support-form">
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="عنوان کوتاه مشکل"
            />
            <select
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            >
              <option value="عمومی">عمومی</option>
              <option value="اشتراک">اشتراک</option>
              <option value="مربی هوشمند">مربی هوشمند</option>
              <option value="برنامه‌ریزی">برنامه‌ریزی</option>
              <option value="گزارش باگ">گزارش باگ</option>
            </select>
            <textarea
              value={form.body}
              onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
              placeholder="چه اتفاقی افتاده؟ هر جزئیاتی که کمک می‌کند را بنویس."
              rows={5}
            />
            <button type="submit" className="support-primary">
              <Send size={17} />
              ثبت درخواست
            </button>
          </form>
        </section>

        <section className="support-panel support-list">
          <div className="support-panel-title">
            <LifeBuoy size={18} />
            <span>درخواست‌های من</span>
          </div>
          <div className="support-ticket-list">
            {tickets.length === 0 && <div className="support-empty">هنوز تیکتی ثبت نشده است.</div>}
            {tickets.map((ticket) => (
              <button
                type="button"
                key={ticket.id}
                className={`support-ticket-row ${selectedTicket?.id === ticket.id ? "active" : ""}`}
                onClick={() => loadTicket(ticket.id)}
              >
                <span>{ticket.title}</span>
                <small>{statusLabels[ticket.status] || ticket.status}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="support-panel support-thread">
          <div className="support-panel-title">
            <MessageCircle size={18} />
            <span>{selectedTicket ? selectedTicket.title : "گفتگو"}</span>
          </div>
          {!selectedTicket ? (
            <div className="support-empty">یک تیکت را انتخاب کن.</div>
          ) : (
            <>
              {selectedTicket.status === "closed" && (
                <div className="support-closed-note">
                  این تیکت بسته شده و امکان ارسال پاسخ جدید ندارد.
                </div>
              )}
              <div className="support-thread-meta">
                <span>{selectedTicket.category}</span>
                <span>{statusLabels[selectedTicket.status] || selectedTicket.status}</span>
              </div>
              <div className="support-messages">
                {(selectedTicket.messages || []).map((item) => (
                  <div key={item.id} className={`support-message ${item.senderRole}`}>
                    <div>{item.body}</div>
                    <small>{item.senderRole === "admin" ? "پشتیبانی منتورا" : "شما"}</small>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="support-reply">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={selectedTicket.status === "closed" ? "این تیکت بسته شده است" : "پاسخ یا توضیح جدید..."}
                  disabled={selectedTicket.status === "closed"}
                />
                <button
                  type="submit"
                  className="support-icon-button"
                  disabled={selectedTicket.status === "closed" || !message.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
