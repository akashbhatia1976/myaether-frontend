const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
const TIMEOUT = 60000; // 60 seconds

// ✅ Utility function for fetch with timeout
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

// ✅ Check if a user exists
export const checkUserExists = async (userId) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/users/exists/${encodeURIComponent(userId)}`);
    return response.exists || false; // Ensure boolean return type
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false; // Assume user doesn't exist in case of an error
  }
};

// ✅ Create a new user
export const createUser = async (userId) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    return response;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user. Please try again.");
  }
};

// ✅ Upload report (Correct API Endpoint: `/api/upload`)
export const uploadReport = async (userId, reportDate, file, autoCreateUser = true) => {
  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("reportDate", reportDate);
  formData.append("file", {
    uri: file.uri,
    type: file.type,
    name: file.name,
  });

  try {
    return await fetchWithTimeout(`${BASE_URL}/upload`, {
      method: "POST",
      body: formData, // No need to set "Content-Type" header manually
    });
  } catch (error) {
    if (autoCreateUser && error.message.includes("User not found")) {
      console.log("⚠️ User does not exist. Attempting auto-creation...");
      await createUser(userId);
      return await fetchWithTimeout(`${BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
    }
    throw error;
  }
};

// ✅ Get details of a specific report (Ensure extractedParameters is included)
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
      parameters: response.extractedParameters, // Ensure this is correctly formatted
    };
  } catch (error) {
    console.error("Error fetching report details:", error);
    throw new Error("Failed to retrieve report details.");
  }
};

// ✅ Create User and Upload Report (one function)
export const createUserAndUploadReport = async (userId, reportDate, file) => {
  const userExists = await checkUserExists(userId);

  if (!userExists) {
    console.log(`⚠️ User '${userId}' does not exist. Creating user...`);
    await createUser(userId);
  }

  return uploadReport(userId, reportDate, file, false);
};

// ✅ Get user details
export const getUserDetails = async (userId) => {
  try {
    return await fetchWithTimeout(`${BASE_URL}/users/${encodeURIComponent(userId)}`);
  } catch (error) {
    console.error("Error fetching user details:", error);
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
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user.");
  }
};

// ✅ Get all reports for a user
export const getReports = async (userId) => {
  try {
    return await fetchWithTimeout(`${BASE_URL}/reports/${encodeURIComponent(userId)}`);
  } catch (error) {
    console.error("Error fetching reports:", error);
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
    console.error("Error deleting report:", error);
    throw new Error("Failed to delete report.");
  }
};

