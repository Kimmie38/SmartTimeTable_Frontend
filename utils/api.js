import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./config";

let authToken = null;

// Call once on app start so requests have the token before any screen mounts
export async function loadStoredToken() {
  authToken = await AsyncStorage.getItem("authToken");
  return authToken;
}

export async function setAuthToken(token) {
  authToken = token;
  if (token) {
    await AsyncStorage.setItem("authToken", token);
  } else {
    await AsyncStorage.removeItem("authToken");
  }
}

async function request(path, { method = "GET", body, auth = true, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";

  if (auth) {
    if (!authToken) authToken = await AsyncStorage.getItem("authToken");
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE_URL}/api${path}`, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch (err) {
    throw new Error("Couldn't reach the server. Check your connection and API_BASE_URL in config.js.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body, opts) => request(path, { method: "POST", body, ...opts }),
  put: (path, body, opts) => request(path, { method: "PUT", body, ...opts }),
  patch: (path, body, opts) => request(path, { method: "PATCH", body, ...opts }),
  delete: (path) => request(path, { method: "DELETE" }),
};