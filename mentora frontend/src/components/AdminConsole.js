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
    <div className="card border-0 shadow-sm p-3 h-100" style={{ background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(10px)", borderRadius: "16px" }}>
      <span className="text-secondary small fw-bold d-block mb-1">{label}</span>
      <strong className="fs-4 text-indigo" style={{ color: "#4f46e5" }}>{value ?? 0}</strong>
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
  }, []);

  useEffect(() => {
    loadActiveTab();
  }, [admin, activeTab]);

  if (accessError && !admin) {
    return (
      <div className="container py-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "80vh", fontFamily: "Vazir, Tahoma" }}>
        <div className="mentora-card p-5 text-center shadow-lg border-0" style={{ maxWidth: "500px", borderRadius: "24px", background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(15px)" }}>
          <ShieldCheck size={48} className="text-danger mb-3" />
          <h1 className="h3 fw-bold mb-3 text-dark">دسترسی ادمین لازم است</h1>
          <p className="text-muted">{accessError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ direction: "rtl", fontFamily: "Vazir, Tahoma" }}>
      {/* هدر */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-secondary small fw-bold">Mentora Operations</span>
          <h1 className="h3 fw-extrabold text-dark m-0">کنسول ادمین</h1>
        </div>
        <button 
          type="button" 
          className="btn btn-light rounded-circle shadow-sm border p-2 d-flex align-items-center justify-content-center" 
          onClick={loadActiveTab} 
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? "spin" : ""} />
        </button>
      </div>

      {/* تب‌ها */}
      <div className="d-flex flex-wrap gap-2 mb-4 p-2 bg-light rounded-3 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              className={`btn btn-sm d-flex align-items-center gap-2 border-0 py-2 px-3 fw-bold rounded-2 transition-all ${
                isActive 
                  ? "btn-indigo text-white" 
                  : "btn-light text-secondary"
              }`}
              style={isActive ? { background: "linear-gradient(135deg, #6255f5 0%, #4f46e5 100%)" } : {}}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {error && <div className="alert alert-danger shadow-sm border-0 mb-4 rounded-3">{error}</div>}
      {loading && <div className="text-secondary mb-4 text-center py-3">در حال بارگذاری...</div>}

      {/* محتوای تب داشبورد */}
      {activeTab === "dashboard" && dashboard && (
        <section className="mb-4">
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-4 col-lg-3"><Stat label="کل کاربران" value={dashboard.summary.totalUsers} /></div>
            <div className="col-6 col-md-4 col-lg-3"><Stat label="کاربران جدید ۷ روز" value={dashboard.summary.newUsers7d} /></div>
            <div className="col-6 col-md-4 col-lg-3"><Stat label="اشتراک فعال" value={dashboard.summary.activeSubscriptions} /></div>
            <div className="col-6 col-md-4 col-lg-3"><Stat label="در حال انقضا" value={dashboard.summary.expiringSubscriptions7d} /></div>
            <div className="col-6 col-md-4 col-lg-3"><Stat label="تیکت باز" value={dashboard.summary.openTickets} /></div>
            <div className="col-6 col-md-4 col-lg-3"><Stat label="API در ۲۴ ساعت" value={dashboard.summary.apiCalls24h} /></div>
            <div className="col-6 col-md-4 col-lg-3"><Stat label="خطاهای API" value={dashboard.summary.apiErrors24h} /></div>
            <div className="col-6 col-md-4 col-lg-3"><Stat label="نرخ خطا" value={`${dashboard.summary.apiErrorRate24h}%`} /></div>
          </div>
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <LogList title="خطاهای اخیر مدل" items={dashboard.recentApiErrors || []} type="usage" />
            </div>
            <div className="col-12 col-lg-6">
              <TicketList title="تیکت‌های اخیر" tickets={dashboard.recentTickets || []} onOpen={loadTicket} />
            </div>
          </div>
        </section>
      )}

      {/* محتوای تب کاربران */}
      {activeTab === "users" && (
        <section className="mb-4">
          <form className="d-flex flex-wrap gap-2 mb-4 align-items-center" onSubmit={(event) => { event.preventDefault(); loadUsers(); }}>
            <div className="input-group flex-grow-1" style={{ maxWidth: "500px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Search size={18} />
              </span>
              <input
                className="form-control border-start-0 ps-0 shadow-none"
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="جستجو با نام، موبایل، ایمیل، رشته..."
              />
            </div>
            <button type="submit" className="btn text-white px-4 border-0" style={{ background: "linear-gradient(135deg, #6255f5 0%, #4f46e5 100%)", borderRadius: "8px" }}>جستجو</button>
          </form>
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <div className="table-responsive bg-white rounded-3 shadow-sm border">
                <table className="table table-hover align-middle mb-0 text-center">
                  <thead className="table-light">
                    <tr>
                      <th>کاربر</th>
                      <th>موبایل</th>
                      <th>اشتراک</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} onClick={() => loadUser(user.id)} style={{ cursor: "pointer" }}>
                        <td className="fw-bold">{user.name || "-"}</td>
                        <td>{user.phone}</td>
                        <td>
                          <span className={`badge ${user.subscription?.active ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"} p-2`}>
                            {user.subscription?.active ? `${user.subscription.remainingDays} روز` : "غیرفعال"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <UserDetail
                selectedUser={selectedUser}
                subscriptionForm={subscriptionForm}
                setSubscriptionForm={setSubscriptionForm}
                runSubscriptionAction={runSubscriptionAction}
              />
            </div>
          </div>
        </section>
      )}

      {/* محتوای تب پشتیبانی */}
      {activeTab === "support" && (
        <section className="mb-4">
          <div className="d-flex flex-wrap gap-2 mb-4 align-items-center">
            <select className="form-select w-auto shadow-none" value={ticketFilter} onChange={(event) => setTicketFilter(event.target.value)}>
              <option value="">همه وضعیت‌ها</option>
              <option value="open">باز</option>
              <option value="in_progress">در حال پیگیری</option>
              <option value="resolved">حل شده</option>
              <option value="closed">بسته</option>
            </select>
            <button type="button" className="btn text-white px-4 border-0" style={{ background: "linear-gradient(135deg, #6255f5 0%, #4f46e5 100%)", borderRadius: "8px" }} onClick={loadTickets}>اعمال فیلتر</button>
          </div>
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <TicketList title="تیکت‌ها" tickets={tickets} onOpen={loadTicket} selectedId={selectedTicket?.id} />
            </div>
            <div className="col-12 col-lg-6">
              <TicketDetail
                ticket={selectedTicket}
                reply={reply}
                setReply={setReply}
                sendReply={sendReply}
              />
            </div>
          </div>
        </section>
      )}

      {/* محتوای تب مصرف ای‌پی‌آی */}
      {activeTab === "usage" && (
        <section className="mb-4">
          <div className="d-flex flex-wrap gap-2 mb-4">
            <input
              className="form-control w-auto shadow-none"
              value={usageFilters.provider}
              onChange={(event) => setUsageFilters((prev) => ({ ...prev, provider: event.target.value }))}
              placeholder="provider مثل google"
            />
            <select
              className="form-select w-auto shadow-none"
              value={usageFilters.status}
              onChange={(event) => setUsageFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="">همه</option>
              <option value="success">موفق</option>
              <option value="error">خطا</option>
            </select>
            <input
              className="form-control w-auto shadow-none"
              value={usageFilters.operation}
              onChange={(event) => setUsageFilters((prev) => ({ ...prev, operation: event.target.value }))}
              placeholder="operation"
            />
            <button type="button" className="btn text-white px-4 border-0" style={{ background: "linear-gradient(135deg, #6255f5 0%, #4f46e5 100%)", borderRadius: "8px" }} onClick={loadUsage}>اعمال</button>
          </div>
          {usage && (
            <>
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-3"><Stat label="کل" value={usage.summary.total} /></div>
                <div className="col-6 col-md-3"><Stat label="خطا" value={usage.summary.errors} /></div>
                <div className="col-6 col-md-3"><Stat label="نرخ خطا" value={`${usage.summary.errorRate}%`} /></div>
                <div className="col-6 col-md-3"><Stat label="توکن نمونه" value={usage.summary.sampledTotalTokens} /></div>
              </div>
              <LogList title="درخواست‌های مدل/API" items={usage.logs || []} type="usage" />
            </>
          )}
        </section>
      )}

      {/* محتوای تب خطاها */}
      {activeTab === "errors" && errors && (
        <section className="mb-4">
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <LogList title="خطاهای Provider/API" items={errors.modelErrors || []} type="usage" />
            </div>
            <div className="col-12 col-lg-6">
              <EventList title="رویدادهای برنامه" items={errors.appEvents || []} />
            </div>
          </div>
        </section>
      )}

      {/* محتوای تب پروايدرها */}
      {activeTab === "providers" && providers && (
        <section className="mb-4">
          <div className="row g-3">
            {(providers.providers || []).map((provider) => (
              <div key={provider.key} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm p-3" style={{ background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(10px)", borderRadius: "16px" }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong className="text-dark">{provider.label}</strong>
                    <span className={`badge ${provider.configured ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"} p-2`}>
                      {provider.configured ? "تنظیم شده" : "فیلد مفقود"}
                    </span>
                  </div>
                  <p className="text-muted small mb-1">{provider.provider} / {provider.sdk}</p>
                  <p className="text-secondary small mb-1">مدل: {provider.model}</p>
                  <p className="text-secondary small mb-1">آدرس: {provider.baseUrl}</p>
                  <p className="text-indigo small fw-bold mb-0">کلیدها: {provider.keyCount} | خطاها: {provider.recentErrorCount}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* محتوای تب حسابرسی */}
      {activeTab === "audit" && (
        <section className="mb-4">
          <div className="table-responsive bg-white rounded-3 shadow-sm border">
            <table className="table table-hover align-middle mb-0 text-center">
              <thead className="table-light">
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
                    <td className="fw-bold">{item.admin?.name || item.admin?.phone || "-"}</td>
                    <td><span className="badge bg-light text-dark border p-2">{item.action}</span></td>
                    <td>{item.targetType} #{item.targetId}</td>
                    <td className="text-muted small">{item.note || "-"}</td>
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
    return <div className="text-center text-secondary py-5 bg-white rounded-3 border">یک کاربر را از لیست انتخاب کن.</div>;
  }
  const user = selectedUser.user;
  return (
    <div className="card border-0 shadow-sm p-4" style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(15px)", borderRadius: "20px" }}>
      <h2 className="h5 fw-extrabold text-dark mb-3">{user.name || user.phone}</h2>
      
      <div className="row g-2 mb-4 bg-light p-3 rounded-3 text-end">
        <div className="col-6"><span className="small text-secondary d-block">موبایل:</span> <strong className="small text-dark">{user.phone}</strong></div>
        <div className="col-6"><span className="small text-secondary d-block">ایمیل:</span> <strong className="small text-dark">{user.email || "-"}</strong></div>
        <div className="col-6"><span className="small text-secondary d-block">رشته:</span> <strong className="small text-dark">{user.major || "-"}</strong></div>
        <div className="col-6"><span className="small text-secondary d-block">پایه:</span> <strong className="small text-dark">{user.grade || "-"}</strong></div>
      </div>

      <h3 className="h6 fw-bold text-dark mb-3">مدیریت اشتراک</h3>
      <div className="mb-4">
        <div className="row g-2 mb-2">
          <div className="col-6">
            <select
              className="form-select shadow-none"
              value={subscriptionForm.planId}
              onChange={(event) => setSubscriptionForm((prev) => ({ ...prev, planId: event.target.value }))}
            >
              {(selectedUser.plans || []).map((plan) => (
                <option key={plan.id} value={plan.id}>{plan.name} - {plan.durationDays} روز</option>
              ))}
            </select>
          </div>
          <div className="col-6">
            <input
              type="number"
              className="form-control shadow-none"
              min="1"
              max="730"
              value={subscriptionForm.days}
              onChange={(event) => setSubscriptionForm((prev) => ({ ...prev, days: event.target.value }))}
              placeholder="روز تمدید"
            />
          </div>
        </div>
        <textarea
          className="form-control shadow-none mb-3"
          value={subscriptionForm.note}
          onChange={(event) => setSubscriptionForm((prev) => ({ ...prev, note: event.target.value }))}
          placeholder="یادداشت داخلی الزامی"
          rows={2}
        />
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-sm btn-success flex-grow-1" onClick={() => runSubscriptionAction("activate")}>فعال‌سازی</button>
          <button type="button" className="btn btn-sm btn-primary flex-grow-1" onClick={() => runSubscriptionAction("extend")}>تمدید</button>
          <button type="button" className="btn btn-sm btn-warning flex-grow-1" onClick={() => runSubscriptionAction("change-plan")}>تغییر پلن</button>
          <button type="button" className="btn btn-sm btn-danger flex-grow-1" onClick={() => runSubscriptionAction("cancel")}>لغو</button>
        </div>
      </div>

      <h3 className="h6 fw-bold text-dark mb-3">تاریخچه اشتراک</h3>
      <div className="d-flex flex-column gap-2" style={{ maxHeight: "200px", overflowY: "auto" }}>
        {(selectedUser.subscriptions || []).map((sub) => (
          <div key={sub.id} className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
            <div>
              <strong className="small text-dark d-block">{sub.planName}</strong>
              <span className="small text-muted">تا {sub.endDate}</span>
            </div>
            <span className={`badge ${sub.active ? "bg-success" : "bg-secondary"} p-2`}>
              {sub.active ? "فعال" : "غیرفعال"} | {sub.remainingDays} روز
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TicketList({ title, tickets, onOpen, selectedId }) {
  return (
    <div className="card border-0 shadow-sm p-4 h-100" style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(15px)", borderRadius: "20px" }}>
      <h2 className="h5 fw-extrabold text-dark mb-3">{title}</h2>
      {(tickets || []).length === 0 && <div className="text-center text-secondary py-4">موردی وجود ندارد.</div>}
      <div className="d-flex flex-column gap-2" style={{ maxHeight: "400px", overflowY: "auto" }}>
        {(tickets || []).map((ticket) => (
          <button
            type="button"
            key={ticket.id}
            className={`btn text-start p-3 border rounded-3 d-flex justify-content-between align-items-center transition-all ${
              selectedId === ticket.id 
                ? "border-primary bg-primary-subtle text-primary" 
                : "border-light bg-light text-dark"
            }`}
            onClick={() => onOpen(ticket.id)}
          >
            <strong className="small text-truncate" style={{ maxWidth: "200px" }}>{ticket.title}</strong>
            <span className="small text-muted">{ticket.user?.name || ticket.user?.phone || "-"} | {statusLabels[ticket.status] || ticket.status}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TicketDetail({ ticket, reply, setReply, sendReply }) {
  if (!ticket) return <div className="text-center text-secondary py-5 bg-white rounded-3 border">یک تیکت را انتخاب کن.</div>;
  return (
    <div className="card border-0 shadow-sm p-4" style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(15px)", borderRadius: "20px" }}>
      <h2 className="h5 fw-extrabold text-dark mb-3">{ticket.title}</h2>
      <div className="row g-2 mb-4 bg-light p-3 rounded-3 text-end">
        <div className="col-6"><span className="small text-secondary d-block">کاربر:</span> <strong className="small text-dark">{ticket.user?.name || ticket.user?.phone}</strong></div>
        <div className="col-6"><span className="small text-secondary d-block">دسته:</span> <strong className="small text-dark">{ticket.category}</strong></div>
        <div className="col-6"><span className="small text-secondary d-block">وضعیت:</span> <strong className="small text-dark">{statusLabels[ticket.status] || ticket.status}</strong></div>
        <div className="col-6"><span className="small text-secondary d-block">آخرین تغییر:</span> <strong className="small text-dark">{formatDate(ticket.updatedAt)}</strong></div>
      </div>
      
      <div className="d-flex flex-column gap-2 mb-4 p-2 rounded-3 bg-light" style={{ maxHeight: "250px", overflowY: "auto" }}>
        {(ticket.messages || []).map((item) => (
          <div key={item.id} className={`p-3 rounded-3 ${item.senderRole === "admin" ? "bg-primary text-white ms-auto" : "bg-white text-dark border me-auto"}`} style={{ maxWidth: "80%" }}>
            <div className="small mb-1">{item.body}</div>
            <small className="d-block text-end opacity-75" style={{ fontSize: "9px" }}>
              {item.senderRole === "admin" ? "ادمین" : "کاربر"} | {formatDate(item.createdAt)}
            </small>
          </div>
        ))}
      </div>

      <form onSubmit={sendReply}>
        <textarea
          className="form-control shadow-none mb-3"
          value={reply.body}
          onChange={(event) => setReply((prev) => ({ ...prev, body: event.target.value }))}
          placeholder="پاسخ به کاربر"
          rows={3}
        />
        <div className="row g-2">
          <div className="col-6">
            <select className="form-select shadow-none" value={reply.status} onChange={(event) => setReply((prev) => ({ ...prev, status: event.target.value }))}>
              <option value="in_progress">در حال پیگیری</option>
              <option value="resolved">حل شده</option>
              <option value="closed">بسته</option>
            </select>
          </div>
          <div className="col-6">
            <button type="submit" className="btn text-white w-100 border-0" style={{ background: "linear-gradient(135deg, #6255f5 0%, #4f46e5 100%)", borderRadius: "8px" }}>ارسال پاسخ</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function LogList({ title, items, type }) {
  return (
    <div className="card border-0 shadow-sm p-4 h-100" style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(15px)", borderRadius: "20px" }}>
      <h2 className="h5 fw-extrabold text-dark mb-3">{title}</h2>
      {(items || []).length === 0 && <div className="text-center text-secondary py-4">موردی وجود ندارد.</div>}
      <div className="d-flex flex-column gap-2" style={{ maxHeight: "350px", overflowY: "auto" }}>
        {(items || []).map((item) => (
          <div key={item.id} className={`p-3 rounded-3 border ${item.status === "error" ? "border-danger bg-danger-subtle text-danger" : "border-light bg-light text-dark"}`}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <strong className="small">{type === "usage" ? `${item.provider} / ${item.operation}` : item.eventType}</strong>
              <span className="small">{item.model || item.source || "-"} | {statusLabels[item.status] || item.status || item.level}</span>
            </div>
            {item.errorMessage && <div className="small text-danger my-1">{item.errorType}: {item.errorMessage}</div>}
            <small className="text-muted d-block" style={{ fontSize: "10px" }}>{formatDate(item.createdAt)}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventList({ title, items }) {
  return (
    <div className="card border-0 shadow-sm p-4 h-100" style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(15px)", borderRadius: "20px" }}>
      <h2 className="h5 fw-extrabold text-dark mb-3">{title}</h2>
      {(items || []).length === 0 && <div className="text-center text-secondary py-4">موردی وجود ندارد.</div>}
      <div className="d-flex flex-column gap-2" style={{ maxHeight: "350px", overflowY: "auto" }}>
        {(items || []).map((item) => (
          <div key={item.id} className="p-3 rounded-3 border border-light bg-light text-dark">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <strong className="small">{item.eventType}</strong>
              <span className="small badge bg-secondary-subtle text-secondary">{item.source} | {item.level}</span>
            </div>
            <div className="small mb-1">{item.message}</div>
            <small className="text-muted d-block" style={{ fontSize: "10px" }}>{formatDate(item.createdAt)}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
