import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { View, Text } from "react-native"; // Ensure Text is imported

export const NotificationContext = createContext();

const socket = io("http://localhost:3000"); // Backend URL

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]); // Ensure notifications is an array

  useEffect(() => {
    console.log("🔵 NotificationProvider mounted"); // Debugging log

    // Listen for report shared events
    socket.on("report-shared", (data) => {
      console.log("📩 New Report Shared:", data); // Debugging log
      setNotifications((prev) => [
        ...prev,
        { type: "shared", message: `New report shared by ${data.ownerId}`, reportId: data.reportId },
      ]);
    });

    // Listen for report revoked events
    socket.on("report-revoked", (data) => {
      console.log("🚫 Report Revoked:", data); // Debugging log
      setNotifications((prev) => [
        ...prev,
        { type: "revoked", message: `Report access revoked by ${data.ownerId}`, reportId: data.reportId },
      ]);
    });

    return () => {
      socket.off("report-shared");
      socket.off("report-revoked");
    };
  }, []);

  console.log("🔵 Notifications State:", notifications); // Debugging log

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </NotificationContext.Provider>
  );
};


