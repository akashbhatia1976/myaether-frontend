const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
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
    return response.exists || false; // Ensure boolean return type
  } catch (error) {
    console.error("❌ Error checking user existence:", error);
    return false; // Assume user doesn't exist in case of an error
  }
};

// ✅ Register a new user with email/phone verification & HealthID
export const createUser = async (userId, email, phone, password) => {
  try {
    console.log("📌 Registering user with payload:", { userId, email, phone, password }); // ✅ Debug log
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

// ✅ Verify Email
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

// ✅ Verify Phone Number
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

// ✅ Login user (Now retrieves HealthID)
export const loginUser = async (userId, password) => {
  try {
    console.log(`📌 Logging in: ${userId}`);
    const response = await fetchWithTimeout(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password }),
    });
    console.log("✅ Login successful:", response);
    return response; // Now includes healthId
  } catch (error) {
    console.error("❌ Error logging in:", error);
    throw new Error(error.message || "Incorrect User ID or password.");
  }
};

// ✅ Fetch user details via HealthID
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

// ✅ Reset password for existing users
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

// ✅ Check if the user needs a password reset
export const needsPasswordReset = async (userId) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/users/reset-required/${encodeURIComponent(userId)}`);
    if (!response || typeof response.resetRequired === "undefined") {
      throw new Error("Invalid response from server.");
    }
    console.log(`🔍 Password reset required for ${userId}:`, response.resetRequired);
    return response.resetRequired; // Boolean value
  } catch (error) {
    console.error("❌ Error checking password reset status:", error);
    return false; // Assume no reset required if there's an error
  }
};

// ✅ Upload report
export const uploadReport = async (userId, reportDate, file) => {
  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("reportDate", reportDate);
  formData.append("file", {
    uri: file.uri,
    type: file.type,
    name: file.name,
  });

  try {
    console.log("📌 Uploading report...");
    return await fetchWithTimeout(`${BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    console.error("❌ Error uploading report:", error);
    throw error;
  }
};

// ✅ Get details of a specific report
export const getReportDetails = async (userId, reportId) => {
  try {
    const response = await fetchWithTimeout(
      `${BASE_URL}/reports/${encodeURIComponent(userId)}/${encodeURIComponent(reportId)}`
    );

    if (!response || !response.extractedParameters) {
      throw new Error("No extracted parameters found.");
    }

    console.log("✅ Report details fetched successfully:", response);

    return {
      reportId: response.reportId,
      userId: response.userId,
      date: response.date,
      fileName: response.fileName,
      parameters: response.extractedParameters,
    };
  } catch (error) {
    console.error("❌ Error fetching report details:", error);
    throw new Error("Failed to retrieve report details.");
  }
};

// ✅ Get user details
export const getUserDetails = async (userId) => {
  try {
    return await fetchWithTimeout(`${BASE_URL}/users/${encodeURIComponent(userId)}`);
  } catch (error) {
    console.error("❌ Error fetching user details:", error);
    throw new Error("Failed to retrieve user details.");
  }
};

// ✅ Delete a user
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

// ✅ Get all reports for a user
export const getReports = async (userId) => {
  try {
    return await fetchWithTimeout(`${BASE_URL}/reports/${encodeURIComponent(userId)}`);
  } catch (error) {
    console.error("❌ Error fetching reports:", error);
    throw new Error("Failed to retrieve reports.");
  }
};

// ✅ Delete a report
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

