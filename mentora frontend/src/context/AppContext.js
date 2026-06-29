import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiJson, getToken, setToken } from "../utils/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    readinessScore: 0,
    streakCount: 0,
    xpPoints: 0,
    calendarDate: "",
    programStartsTomorrow: false,
    upcomingTasksCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bridgeQuestion, setBridgeQuestion] = useState(null);
  const [latestWeeklyPlan, setLatestWeeklyPlan] = useState(null);

  const loadToday = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setProfile(null);
      setTasks([]);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { response, data } = await apiJson("/api/planner/today");
      if (response.status === 401) {
        setToken(null);
        setProfile(null);
        setTasks([]);
        setIsAuthenticated(false);
        return;
      }
      if (response.ok && data.profile) {
        setProfile(data.profile);
        setTasks(Array.isArray(data.tasks) ? data.tasks : []);
        setStats({
          readinessScore: data.readinessScore ?? 0,
          streakCount: data.streakCount ?? 0,
          xpPoints: data.xpPoints ?? 0,
          calendarDate: data.calendarDate ?? "",
          programStartsTomorrow: data.programStartsTomorrow ?? false,
          upcomingTasksCount: data.upcomingTasksCount ?? 0,
        });
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("خطا در همگام‌سازی با سرور:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMe = useCallback(async () => {
    const token = getToken();
    if (!token) return null;
    const { response, data } = await apiJson("/api/auth/me");
    if (response.ok) {
      if (data.profile) setProfile(data.profile);
      if (data.latestWeeklyPlan) setLatestWeeklyPlan(data.latestWeeklyPlan);
      setIsAuthenticated(true);
      return data;
    }
    if (response.status === 401) {
      setToken(null);
      setIsAuthenticated(false);
    }
    return null;
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (token) {
        await loadMe();
        await loadToday();
      } else {
        setLoading(false);
      }
    };
    init();
  }, [loadMe, loadToday]);

  const login = useCallback(async (phone, password) => {
    const { response, data } = await apiJson("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),  // ← email → phone
    });
    if (!response.ok) {
      throw new Error(data.error || "ورود ناموفق بود.");
    }
    setToken(data.token);
    setProfile(data.profile);
    setIsAuthenticated(true);
    await loadToday();
    return data;
  }, [loadToday]);

  const register = useCallback(async ({ fullName, email, password, confirmPassword }) => {
    const { response, data } = await apiJson("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        email,
        password,
        confirmPassword,
      }),
    });
    if (!response.ok) {
      throw new Error(data.error || "ثبت‌نام ناموفق بود.");
    }
    setToken(data.token);
    setProfile(data.profile);
    setIsAuthenticated(true);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiJson("/api/auth/logout", { method: "POST" });
    } catch (_) {
      /* ignore */
    }
    setToken(null);
    setProfile(null);
    setTasks([]);
    setLatestWeeklyPlan(null);
    setIsAuthenticated(false);
  }, []);

  const completeOnboarding = useCallback((newProfile, newTasks) => {
    setProfile(newProfile);
    setTasks(Array.isArray(newTasks) ? newTasks : []);
    setStats((prev) => ({
      ...prev,
      calendarDate:
        prev.calendarDate ||
        new Date().toLocaleDateString("fa-IR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
    }));
  }, []);

  const toggleTask = useCallback(async (taskId, completed) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed } : t))
    );

    try {
      const { response, data } = await apiJson(`/api/planner/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });

      if (response.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? data.task : t))
        );
      }
    } catch (err) {
      console.error("خطا در به‌روزرسانی کار:", err);
    }
  }, []);

  const applyTaskStats = useCallback((data) => {
    setStats((prev) => ({
      ...prev,
      readinessScore: data.readinessScore ?? prev.readinessScore,
      streakCount: data.streakCount ?? prev.streakCount,
      todayProgress: data.todayProgress ?? prev.todayProgress,
      xpPoints: data.xpPoints ?? prev.xpPoints,
    }));
  }, []);

  const createTask = useCallback(async (task) => {
    const { response, data } = await apiJson("/api/planner/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error(data.error || "افزودن تسک ناموفق بود.");
    }

    setTasks((prev) => [...prev, data.task]);
    applyTaskStats(data);
    return data.task;
  }, [applyTaskStats]);

  const updateTask = useCallback(async (taskId, updates) => {
    const { response, data } = await apiJson(`/api/planner/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(data.error || "ویرایش تسک ناموفق بود.");
    }

    setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
    applyTaskStats(data);
    return data.task;
  }, [applyTaskStats]);

  const deleteTask = useCallback(async (taskId) => {
    const { response, data } = await apiJson(`/api/planner/tasks/${taskId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(data.error || "حذف تسک ناموفق بود.");
    }

    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    applyTaskStats(data);
    return data;
  }, [applyTaskStats]);

  const updateProfile = useCallback((partial) => {
    setProfile((prev) => ({ ...(prev || {}), ...partial }));
  }, []);

  const value = {
    profile,
    tasks,
    stats,
    loading,
    isAuthenticated,
    bridgeQuestion,
    latestWeeklyPlan,
    setBridgeQuestion,
    completeOnboarding,
    toggleTask,
    createTask,
    updateTask,
    deleteTask,
    updateProfile,
    login,
    register,
    logout,
    refresh: loadToday,
    loadMe,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}

export default AppContext;
