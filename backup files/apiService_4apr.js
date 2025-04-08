import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";

const BASE_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api`;
console.log("🌐 BASE_URL:", BASE_URL); // should print .../api


const TIMEOUT = 60000; // 60 seconds

// ✅ Utility function for fetch with timeout
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`HTTP error: ${response.status}`);
      }
      throw new Error(errorData.message || `HTTP error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Fetch error (${url}):`, error.message);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

// ✅ Check if a user exists
export const checkUserExists = async (userId) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/users/exists/${encodeURIComponent(userId)}`);
    return response.exists || false;
  } catch (error) {
    console.error("❌ Error checking user existence:", error);
    return false;
  }
};

// ✅ Register a new user
export const createUser = async (userId, email, phone, password) => {
  try {
    console.log("📌 Registering user with payload:", { userId, email, phone, password });
    const response = await fetchWithTimeout(`${BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, email, phone, password }),
    });
    console.log("✅ User registration successful:", response);
    return response;
  } catch (error) {
    console.error("❌ Error creating user:", error);
    throw new Error(error.message || "Failed to create user. Please try again.");
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/users/verify-email?token=${encodeURIComponent(token)}`);
    console.log("✅ Email verification successful:", response);
    return response;
  } catch (error) {
    console.error("❌ Error verifying email:", error);
    throw new Error("Invalid or expired verification link.");
  }
};

export const verifyPhone = async (phone, code) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/users/verify-phone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    console.log("✅ Phone verification successful:", response);
    return response;
  } catch (error) {
    console.error("❌ Error verifying phone:", error);
    throw new Error("Invalid phone verification code.");
  }
};

export const loginUser = async (userId, password) => {
  try {
    console.log(`📌 Logging in: ${userId}`);
    const response = await fetchWithTimeout(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password }),
    });
    console.log("✅ Login successful:", response);
    await AsyncStorage.setItem("token", response.token);
    return response;
  } catch (error) {
    console.error("❌ Error logging in:", error);
    throw new Error(error.message || "Incorrect User ID or password.");
  }
};

export const getUserByHealthId = async (healthId) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/users/healthid/${encodeURIComponent(healthId)}`);
    console.log("✅ Fetched user details by HealthID:", response);
    return response;
  } catch (error) {
    console.error("❌ Error fetching user by HealthID:", error);
    throw new Error("Failed to retrieve user details.");
  }
};

export const resetPassword = async (userId, newPassword) => {
  try {
    console.log(`📌 Resetting password for: ${userId}`);
    const response = await fetchWithTimeout(`${BASE_URL}/users/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, newPassword }),
    });
    console.log("✅ Password reset successful.");
    return response;
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    throw new Error(error.message || "Password reset failed.");
  }
};

export const needsPasswordReset = async (userId) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/users/reset-required/${encodeURIComponent(userId)}`);
    if (!response || typeof response.resetRequired === "undefined") {
      throw new Error("Invalid response from server.");
    }
    console.log(`🔍 Password reset required for ${userId}:`, response.resetRequired);
    return response.resetRequired;
  } catch (error) {
    console.error("❌ Error checking password reset status:", error);
    return false;
  }
};

export const uploadReport = async (userId, reportDate, file, autoCreateUser = false, reportName = "") => {
  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("reportDate", reportDate);
  formData.append("autoCreateUser", autoCreateUser.toString());

  if (reportName?.trim()) {
    formData.append("reportName", reportName.trim());
  }

  formData.append("file", {
    uri: file.uri,
    type: file.type || "application/pdf",
    name: file.name,
  });

  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  try {
    console.log("📌 Uploading report with auth...");

    const response = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Report uploaded successfully:", result);
    return result;

  } catch (error) {
    console.error("❌ Error uploading report:", error.message);
    throw error;
  }
};


export const getReportDetails = async (userId, reportId) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  try {
    const response = await fetchWithTimeout(
      `${BASE_URL}/reports/${encodeURIComponent(userId)}/${encodeURIComponent(reportId)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      }
    );

    if (!response || typeof response !== "object") {
      throw new Error("Invalid or empty response from server.");
    }

    const extracted = response.extractedParameters || response.parameters || {};

    console.log("✅ Report details fetched successfully:", response);

    return {
      reportId: response.reportId || response._id,
      userId: response.userId,
      date: response.date,
      fileName: response.fileName || "Unnamed Report",
      name: response.name || "Report Details",
      parameters: extracted,
      aiAnalysis: response.aiAnalysis || null,
    };
  } catch (error) {
    console.error("❌ Error fetching report details:", error);
    throw new Error("Failed to retrieve report details.");
  }
};


export const getUserDetails = async (userId) => {
  try {
    return await fetchWithTimeout(`${BASE_URL}/users/${encodeURIComponent(userId)}`);
  } catch (error) {
    console.error("❌ Error fetching user details:", error);
    throw new Error("Failed to retrieve user details.");
  }
};

export const deleteUser = async (userId) => {
  try {
    return await fetchWithTimeout(`${BASE_URL}/users/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    throw new Error("Failed to delete user.");
  }
};

export const getReports = async (userId) => {
  const token = await AsyncStorage.getItem("token");
  console.log("🛂 Retrieved token in getReports:", token);

  if (!token) throw new Error("No token found");

  if (!token.startsWith("ey")) {
    console.warn("🚨 Token looks invalid or blank:", token);
  }

  const url = `${BASE_URL}/reports/${encodeURIComponent(userId)}`;
  console.log("📡 Fetching reports from:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Backend responded with error:", errorData);
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Reports fetched:", data.length);
    return data;
  } catch (error) {
    console.error("❌ Error fetching reports:", error.message);
    throw new Error("Failed to retrieve reports.");
  }
};

export const deleteReport = async (userId, reportId) => {
  try {
    return await fetchWithTimeout(
      `${BASE_URL}/reports/${encodeURIComponent(userId)}/${encodeURIComponent(reportId)}`,
      { method: "DELETE" }
    );
  } catch (error) {
    console.error("❌ Error deleting report:", error);
    throw new Error("Failed to delete report.");
  }
};

export const analyzeReportWithAI = async (userId, reportId) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await fetch(`${BASE_URL}/ai-analysis/analyze-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, reportId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "AI analysis failed.");
  }

  return await response.json();
};

// ✅ Share a specific report with a user
export const shareReport = async ({ ownerId, sharedWith, reportId, permissionType = "view" }) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await fetchWithTimeout(`${BASE_URL}/share/share-report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ ownerId, sharedWith, reportId, permissionType }),
  });

  return response;
};

// ✅ Share all reports with a user
export const shareAllReports = async ({ ownerId, sharedWith, permissionType = "view" }) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await fetchWithTimeout(`${BASE_URL}/share/share-all`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ ownerId, sharedWith, permissionType }),
  });

  return response;
};

// ✅ Revoke access to shared report
export const revokeSharedReport = async ({ ownerId, reportId, sharedWithId, sharedWithEmail }) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await fetch(`${BASE_URL}/share/revoke`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ ownerId, reportId, sharedWithId, sharedWithEmail }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to revoke access.");
  }

  return await response.json();
};

// ✅ NLP Search Reports
export const searchReportsWithNLP = async (userId, queryText) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/search/nlp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, queryText }),
    });

    if (!response.success) {
      throw new Error('Search failed');
    }

    return response.reports;
  } catch (error) {
    console.error("❌ NLP Search error:", error.message);
    throw error;
  }
};

// Get comments for a report

export const getCommentsForReport = async (reportId) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  try {
    const res = await fetch(`${BASE_URL}/comments/${encodeURIComponent(reportId)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch comments.");
    return data.comments || [];
  } catch (error) {
    console.error("❌ Error in getCommentsForReport:", error);
    throw error;
  }
};




// Post Comment for Reports

export const postCommentForReport = async ({ reportId, userId, commentText }) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  try {
    const res = await fetch(`${BASE_URL}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        reportId,
        userId,
        sharedBy: userId,
        commenterId: userId,
        commentType: "parameter",
        parameterPath: "Report Level",
        text: commentText,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add comment.");
    return data;
  } catch (error) {
    console.error("❌ Error in postCommentForReport:", error);
    throw error;
  }
};


// Share Screen functions

export const getSharedReportsByUser = async (userId) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await fetch(`${BASE_URL}/api/share/shared-by/${userId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch shared reports.");
  return data.sharedReports || [];
};

export const getReportsSharedWithUser = async (userId) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await fetch(`${BASE_URL}/api/share/shared-with/${userId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch received reports.");
  return data.sharedReports || [];
};







