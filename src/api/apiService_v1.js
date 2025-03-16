// apiService.js

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
const TIMEOUT = 10000; // 10 seconds

// Utility function to handle fetch with timeout and error handling
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Fetch error: ${error.message}`);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

// User Management
export const createUser = async (userId) => {
  return fetchWithTimeout(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
};

export const getUserDetails = async (userId) => {
  return fetchWithTimeout(`${BASE_URL}/users/${encodeURIComponent(userId)}`);
};

export const deleteUser = async (userId) => {
  return fetchWithTimeout(`${BASE_URL}/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
};

// Report Management
export const addReport = async (userId, report) => {
  return fetchWithTimeout(`${BASE_URL}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, report }),
  });
};

export const getReports = async (userId) => {
  return fetchWithTimeout(`${BASE_URL}/reports/${encodeURIComponent(userId)}`);
};

export const deleteReport = async (userId, reportId) => {
  return fetchWithTimeout(
    `${BASE_URL}/reports/${encodeURIComponent(userId)}/${encodeURIComponent(reportId)}`,
    { method: "DELETE" }
  );
};
