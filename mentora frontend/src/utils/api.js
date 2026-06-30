import React from "react";

const TOKEN_KEY = "mentora_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function authHeaders(extra = {}) {
  const token = getToken();
  const headers = { ...extra };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch(url, options = {}) {
  const headers = authHeaders(options.headers || {});
  const response = await fetch(url, { ...options, headers });
  return response;
}

export async function apiJson(url, options = {}) {
  const response = await apiFetch(url, options);
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export function resolveMediaUrl(url) {
  if (!url) return "";
  if (/^(https?:|blob:|data:)/i.test(url)) return url;

  const configuredOrigin = process.env.REACT_APP_API_ORIGIN || process.env.REACT_APP_API_BASE_URL || "";
  if (configuredOrigin) {
    return new URL(url, configuredOrigin).toString();
  }

  if (
    typeof window !== "undefined" &&
    url.startsWith("/media/") &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname) &&
    window.location.port &&
    window.location.port !== "8000"
  ) {
    return `${window.location.protocol}//${window.location.hostname}:8000${url}`;
  }

  return url;
}
