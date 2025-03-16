const BASE_URL = "http://localhost:3000/api";

export const createUser = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const getUserDetails = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const addReport = async (userId, report) => {
  try {
    const response = await fetch(`${BASE_URL}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, report }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding report:", error);
    throw error;
  }
};

export const getReports = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/reports/${encodeURIComponent(userId)}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

export const deleteReport = async (userId, reportId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/reports/${encodeURIComponent(userId)}/${encodeURIComponent(reportId)}`,
      { method: "DELETE" }
    );
    return await response.json();
  } catch (error) {
    console.error("Error deleting report:", error);
    throw error;
  }
};
