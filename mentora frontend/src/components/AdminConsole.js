import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  Database,
  KeyRound,
  LifeBuoy,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { apiJson } from "../utils/api";
import "./AdminConsole.css";

const tabs = [
  { key: "dashboard", label: "داشبورد", icon: BarChart3 },
  { key: "users", label: "کاربران و اشتراک", icon: UserCog },
  { key: "support", label: "پشتیبانی", icon: LifeBuoy },
  { key: "usage", label: "مصرف API", icon: Database },
  { key: "errors", label: "خطاها", icon: AlertTriangle },
  { key: "providers", label: "Providerها", icon: KeyRound },
  { key: "audit", label: "Audit", icon: ClipboardList },
];

const statusLabels = {
  open: "باز",
  in_progress: "در حال پیگیری",
  resolved: "حل شده",
  closed: "بسته",
  success: "موفق",
  error: "خطا",
};

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("fa-IR");
  } catch (_) {
    return value;
  }
}

function Stat({ label, value }) {
  return (
    <div className="admin-stat">
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </div>
  );
}

export default function AdminConsole() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [admin, setAdmin] = useState(null);
  const [accessError, setAccessError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [subscriptionForm, setSubscriptionForm] = useState({ planId: "", days: 30, note: "" });

  const [tickets, setTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState({ body: "", status: "in_progress", note: "" });

  const [usageFilters, setUsageFilters] = useState({ provider: "", status: "", operation: "" });
  const [usage, setUsage] = useState(null);
  const [errors, setErrors] = useState(null);
  const [providers, setProviders] = useState(null);
  const [audit, setAudit] = useState([]);

  const adminFetch = async (url, options = {}) => {
    const { response, data } = await apiJson(url, options);
    if (response.status === 401) {
      navigate("/login", { replace: true });
      throw new Error("نیاز به ورود دوباره.");
    }
    if (!response.ok) throw new Error(data.error || "درخواست ادمین ناموفق بود.");
    return data;
  };

  const loadAdmin = async () => {
    try {
      const data = await adminFetch("/api/admin/me");
      setAdmin(data.admin);
      setAccessError("");
    } catch (err) {
      setAccessError(err.message);
    }
  };

  const loadDashboard = async () => setDashboard(await adminFetch("/api/admin/dashboard"));

  const loadUsers = async () => {
    const params = new URLSearchParams();
    if (userSearch.trim()) params.set("q", userSearch.trim());
    const data = await adminFetch(`/api/admin/users?${params.toString()}`);
    setUsers(data.users || []);
  };

  const loadUser = async (userId) => {
    const data = await adminFetch(`/api/admin/users/${userId}`);
    setSelectedUser(data);
    const firstPlan = data.plans?.[0]?.id || "";
    setSubscriptionForm((prev) => ({ ...prev, planId: prev.planId || firstPlan }));
  };

  const loadTickets = async () => {
    const params = new URLSearchParams();
    if (ticketFilter) params.set("status", ticketFilter);
    const data = await adminFetch(`/api/admin/support/tickets?${params.toString()}`);
    setTickets(data.tickets || []);
  };

  const loadTicket = async (ticketId) => {
    const data = await adminFetch(`/api/admin/support/tickets/${ticketId}`);
    setSelectedTicket(data.ticket);
  };

  const loadUsage = async () => {
    const params = new URLSearchParams();
    Object.entries(usageFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setUsage(await adminFetch(`/api/admin/api-usage?${params.toString()}`));
  };

  const loadErrors = async () => setErrors(await adminFetch("/api/admin/errors"));
  const loadProviders = async () => setProviders(await adminFetch("/api/admin/providers"));
  const loadAudit = async () => {
    const data = await adminFetch("/api/admin/audit-logs");
    setAudit(data.logs || []);
  };

  const loadActiveTab = async () => {
    if (!admin) return;
    setLoading(true);
    setError("");
    try {
      if (activeTab === "dashboard") await loadDashboard();
      if (activeTab === "users") await loadUsers();
      if (activeTab === "support") await loadTickets();
      if (activeTab === "usage") await loadUsage();
      if (activeTab === "errors") await loadErrors();
      if (activeTab === "providers") await loadProviders();
      if (activeTab === "audit") await loadAudit();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runSubscriptionAction = async (action) => {
    if (!selectedUser?.user) return;
    setError("");
    const body = { note: subscriptionForm.note };
    if (action === "extend") body.days = Number(subscriptionForm.days);
    if (action === "activate" || action === "change-plan") {
      body.planId = Number(subscriptionForm.planId || selectedUser.plans?.[0]?.id);
    }
    try {
      await adminFetch(`/api/admin/users/${selectedUser.user.id}/subscriptions/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setSubscriptionForm((prev) => ({ ...prev, note: "" }));
      await loadUser(selectedUser.user.id);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const sendReply = async (event) => {
    event.preventDefault();
    if (!selectedTicket) return;
    try {
      const data = await adminFetch(`/api/admin/support/tickets/${selectedTicket.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reply),
      });
      setSelectedTicket(data.ticket);
      setReply({ body: "", status: "in_progress", note: "" });
      await loadTickets();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadActiveTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, activeTab]);

  if (accessError && !admin) {
    return (
      <div className="admin-console admin-denied">
        <ShieldCheck size={34} />
        <h1>دسترسی ادمین لازم است</h1>
        <p>{accessError}</p>
      </div>
    );
  }

  return (
    <div className="admin-console">
      <div className="admin-header">
        <div>
          <span className="admin-kicker">Mentora Operations</span>
          <h1>کنسول ادمین</h1>
        </div>
        <button type="button" className="admin-icon-button" onClick={loadActiveTab} disabled={loading}>
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="admin-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              className={activeTab === tab.key ? "active" : ""}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon size={17} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {error && <div className="admin-alert">{error}</div>}
      {loading && <div className="admin-muted">در حال بارگذاری...</div>}

      {activeTab === "dashboard" && dashboard && (
        <section className="admin-section">
          <div className="admin-stat-grid">
            <Stat label="کل کاربران" value={dashboard.summary.totalUsers} />
            <Stat label="کاربران جدید ۷ روز" value={dashboard.summary.newUsers7d} />
            <Stat label="اشتراک فعال" value={dashboard.summary.activeSubscriptions} />
            <Stat label="در حال انقضا" value={dashboard.summary.expiringSubscriptions7d} />
            <Stat label="تیکت باز" value={dashboard.summary.openTickets} />
            <Stat label="API در ۲۴ ساعت" value={dashboard.summary.apiCalls24h} />
            <Stat label="خطاهای API" value={dashboard.summary.apiErrors24h} />
            <Stat label="نرخ خطا" value={`${dashboard.summary.apiErrorRate24h}%`} />
          </div>
          <div className="admin-grid-two">
            <LogList title="خطاهای اخیر مدل" items={dashboard.recentApiErrors || []} type="usage" />
            <TicketList title="تیکت‌های اخیر" tickets={dashboard.recentTickets || []} onOpen={loadTicket} />
          </div>
        </section>
      )}

      {activeTab === "users" && (
        <section className="admin-section">
          <form className="admin-toolbar" onSubmit={(event) => { event.preventDefault(); loadUsers(); }}>
            <div className="admin-search">
              <Search size={17} />
              <input
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="جستجو با نام، موبایل، ایمیل، رشته..."
              />
            </div>
            <button type="submit" className="admin-primary">جستجو</button>
          </form>
          <div className="admin-grid-two users-grid">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>کاربر</th>
                    <th>موبایل</th>
                    <th>اشتراک</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} onClick={() => loadUser(user.id)}>
                      <td>{user.name || "-"}</td>
                      <td>{user.phone}</td>
                      <td>{user.subscription?.active ? `${user.subscription.remainingDays} روز` : "غیرفعال"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <UserDetail
              selectedUser={selectedUser}
              subscriptionForm={subscriptionForm}
              setSubscriptionForm={setSubscriptionForm}
              runSubscriptionAction={runSubscriptionAction}
            />
          </div>
        </section>
      )}

      {activeTab === "support" && (
        <section className="admin-section">
          <div className="admin-toolbar">
            <select value={ticketFilter} onChange={(event) => setTicketFilter(event.target.value)}>
              <option value="">همه وضعیت‌ها</option>
              <option value="open">باز</option>
              <option value="in_progress">در حال پیگیری</option>
              <option value="resolved">حل شده</option>
              <option value="closed">بسته</option>
            </select>
            <button type="button" className="admin-primary" onClick={loadTickets}>اعمال فیلتر</button>
          </div>
          <div className="admin-grid-two support-admin-grid">
            <TicketList title="تیکت‌ها" tickets={tickets} onOpen={loadTicket} selectedId={selectedTicket?.id} />
            <TicketDetail
              ticket={selectedTicket}
              reply={reply}
              setReply={setReply}
              sendReply={sendReply}
            />
          </div>
        </section>
      )}

      {activeTab === "usage" && (
        <section className="admin-section">
          <div className="admin-toolbar">
            <input
              value={usageFilters.provider}
              onChange={(event) => setUsageFilters((prev) => ({ ...prev, provider: event.target.value }))}
              placeholder="provider مثل google"
            />
            <select
              value={usageFilters.status}
              onChange={(event) => setUsageFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="">همه</option>
              <option value="success">موفق</option>
              <option value="error">خطا</option>
            </select>
            <input
              value={usageFilters.operation}
              onChange={(event) => setUsageFilters((prev) => ({ ...prev, operation: event.target.value }))}
              placeholder="operation"
            />
            <button type="button" className="admin-primary" onClick={loadUsage}>اعمال</button>
          </div>
          {usage && (
            <>
              <div className="admin-stat-grid compact">
                <Stat label="کل" value={usage.summary.total} />
                <Stat label="خطا" value={usage.summary.errors} />
                <Stat label="نرخ خطا" value={`${usage.summary.errorRate}%`} />
                <Stat label="توکن نمونه" value={usage.summary.sampledTotalTokens} />
              </div>
              <LogList title="درخواست‌های مدل/API" items={usage.logs || []} type="usage" />
            </>
          )}
        </section>
      )}

      {activeTab === "errors" && errors && (
        <section className="admin-section">
          <div className="admin-grid-two">
            <LogList title="خطاهای Provider/API" items={errors.modelErrors || []} type="usage" />
            <EventList title="رویدادهای برنامه" items={errors.appEvents || []} />
          </div>
        </section>
      )}

      {activeTab === "providers" && providers && (
        <section className="admin-section">
          <div className="admin-provider-grid">
            {(providers.providers || []).map((provider) => (
              <div key={provider.key} className="admin-provider">
                <div className="admin-provider-head">
                  <strong>{provider.label}</strong>
                  <span className={provider.configured ? "ok" : "bad"}>
                    {provider.configured ? "configured" : "missing key"}
                  </span>
                </div>
                <p>{provider.provider} / {provider.sdk}</p>
                <p>model: {provider.model}</p>
                <p>base: {provider.baseUrl}</p>
                <p>keys: {provider.keyCount} | errors: {provider.recentErrorCount}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "audit" && (
        <section className="admin-section">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>زمان</th>
                  <th>ادمین</th>
                  <th>عملیات</th>
                  <th>هدف</th>
                  <th>یادداشت</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>{item.admin?.name || item.admin?.phone || "-"}</td>
                    <td>{item.action}</td>
                    <td>{item.targetType} #{item.targetId}</td>
                    <td>{item.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function UserDetail({ selectedUser, subscriptionForm, setSubscriptionForm, runSubscriptionAction }) {
  if (!selectedUser) {
    return <div className="admin-empty">یک کاربر را از لیست انتخاب کن.</div>;
  }
  const user = selectedUser.user;
  return (
    <div className="admin-detail">
      <h2>{user.name || user.phone}</h2>
      <div className="admin-detail-grid">
        <span>موبایل: {user.phone}</span>
        <span>ایمیل: {user.email || "-"}</span>
        <span>رشته: {user.major || "-"}</span>
        <span>پایه: {user.grade || "-"}</span>
      </div>

      <h3>مدیریت اشتراک</h3>
      <div className="admin-sub-actions">
        <select
          value={subscriptionForm.planId}
          onChange={(event) => setSubscriptionForm((prev) => ({ ...prev, planId: event.target.value }))}
        >
          {(selectedUser.plans || []).map((plan) => (
            <option key={plan.id} value={plan.id}>{plan.name} - {plan.durationDays} روز</option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          max="730"
          value={subscriptionForm.days}
          onChange={(event) => setSubscriptionForm((prev) => ({ ...prev, days: event.target.value }))}
          placeholder="روز تمدید"
        />
        <textarea
          value={subscriptionForm.note}
          onChange={(event) => setSubscriptionForm((prev) => ({ ...prev, note: event.target.value }))}
          placeholder="یادداشت داخلی الزامی"
          rows={2}
        />
        <div className="admin-action-row">
          <button type="button" onClick={() => runSubscriptionAction("activate")}>فعال‌سازی</button>
          <button type="button" onClick={() => runSubscriptionAction("extend")}>تمدید</button>
          <button type="button" onClick={() => runSubscriptionAction("change-plan")}>تغییر پلن</button>
          <button type="button" className="danger" onClick={() => runSubscriptionAction("cancel")}>لغو</button>
        </div>
      </div>

      <h3>تاریخچه اشتراک</h3>
      <div className="admin-mini-list">
        {(selectedUser.subscriptions || []).map((sub) => (
          <div key={sub.id}>
            <strong>{sub.planName}</strong>
            <span>{sub.active ? "فعال" : "غیرفعال"} | {sub.remainingDays} روز | تا {sub.endDate}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TicketList({ title, tickets, onOpen, selectedId }) {
  return (
    <div className="admin-list-panel">
      <h2>{title}</h2>
      {(tickets || []).length === 0 && <div className="admin-empty">موردی وجود ندارد.</div>}
      {(tickets || []).map((ticket) => (
        <button
          type="button"
          key={ticket.id}
          className={`admin-ticket-row ${selectedId === ticket.id ? "active" : ""}`}
          onClick={() => onOpen(ticket.id)}
        >
          <strong>{ticket.title}</strong>
          <span>{ticket.user?.name || ticket.user?.phone || "-"} | {statusLabels[ticket.status] || ticket.status}</span>
        </button>
      ))}
    </div>
  );
}

function TicketDetail({ ticket, reply, setReply, sendReply }) {
  if (!ticket) return <div className="admin-empty">یک تیکت را انتخاب کن.</div>;
  return (
    <div className="admin-detail">
      <h2>{ticket.title}</h2>
      <div className="admin-detail-grid">
        <span>کاربر: {ticket.user?.name || ticket.user?.phone}</span>
        <span>دسته: {ticket.category}</span>
        <span>وضعیت: {statusLabels[ticket.status] || ticket.status}</span>
        <span>آخرین تغییر: {formatDate(ticket.updatedAt)}</span>
      </div>
      <div className="admin-thread">
        {(ticket.messages || []).map((item) => (
          <div key={item.id} className={`admin-message ${item.senderRole}`}>
            <div>{item.body}</div>
            <small>{item.senderRole === "admin" ? "ادمین" : "کاربر"} | {formatDate(item.createdAt)}</small>
          </div>
        ))}
      </div>
      <form className="admin-reply" onSubmit={sendReply}>
        <textarea
          value={reply.body}
          onChange={(event) => setReply((prev) => ({ ...prev, body: event.target.value }))}
          placeholder="پاسخ به کاربر"
          rows={3}
        />
        <select value={reply.status} onChange={(event) => setReply((prev) => ({ ...prev, status: event.target.value }))}>
          <option value="in_progress">در حال پیگیری</option>
          <option value="resolved">حل شده</option>
          <option value="closed">بسته</option>
        </select>
        <button type="submit" className="admin-primary">ارسال پاسخ</button>
      </form>
    </div>
  );
}

function LogList({ title, items, type }) {
  return (
    <div className="admin-list-panel">
      <h2>{title}</h2>
      {(items || []).length === 0 && <div className="admin-empty">موردی وجود ندارد.</div>}
      {(items || []).map((item) => (
        <div key={item.id} className={`admin-log-row ${item.status === "error" ? "error" : ""}`}>
          <strong>{type === "usage" ? `${item.provider} / ${item.operation}` : item.eventType}</strong>
          <span>{item.model || item.source || "-"} | {statusLabels[item.status] || item.status || item.level}</span>
          {item.errorMessage && <small>{item.errorType}: {item.errorMessage}</small>}
          <small>{formatDate(item.createdAt)}</small>
        </div>
      ))}
    </div>
  );
}

function EventList({ title, items }) {
  return (
    <div className="admin-list-panel">
      <h2>{title}</h2>
      {(items || []).length === 0 && <div className="admin-empty">موردی وجود ندارد.</div>}
      {(items || []).map((item) => (
        <div key={item.id} className={`admin-log-row ${item.level}`}>
          <strong>{item.eventType}</strong>
          <span>{item.source} | {item.level}</span>
          <small>{item.message}</small>
          <small>{formatDate(item.createdAt)}</small>
        </div>
      ))}
    </div>
  );
}
