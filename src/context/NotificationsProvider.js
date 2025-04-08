import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { View } from "react-native";

export const NotificationContext = createContext();
const socket = io(process.env.EXPO_PUBLIC_API_BASE_URL); // Backend URL

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    console.log("🔵 NotificationProvider mounted");

    socket.on("report-shared", (data) => {
      console.log("📩 New Report Shared:", data);
      setNotifications((prev) => [
        ...prev,
        { type: "shared", message: `📄 Report shared by ${data.ownerId}`, reportId: data.reportId },
      ]);
    });

    socket.on("report-revoked", (data) => {
      console.log("🚫 Report Revoked:", data);
      setNotifications((prev) => [
        ...prev,
        { type: "revoked", message: `🚫 Report revoked by ${data.ownerId}`, reportId: data.reportId },
      ]);
    });

    return () => {
      socket.off("report-shared");
      socket.off("report-revoked");
    };
  }, []);

  console.log("🔵 Notifications State:", notifications);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      <View style={{ flex: 1 }}>{children}</View>
    </NotificationContext.Provider>
  );
};

