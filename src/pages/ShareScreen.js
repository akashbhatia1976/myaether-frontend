import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";

const ShareScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [sharedReports, setSharedReports] = useState([]);
  const [receivedReports, setReceivedReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("shared"); // "shared" or "received"

  useEffect(() => {
    fetchSharedReports();
    fetchReceivedReports();
  }, [userId]);

  // ✅ Fetch reports that the user has SHARED
  const fetchSharedReports = async () => {
    try {
      console.log("🔍 Fetching reports shared BY user:", userId);
      const response = await fetch(`http://localhost:3000/api/share/shared-by/${userId}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to fetch shared reports.");

      console.log("✅ Shared Reports Response:", JSON.stringify(data, null, 2));
      setSharedReports(data.sharedReports || []);
    } catch (error) {
      console.error("❌ Error fetching shared reports:", error);
      Alert.alert("Error", "Could not load shared reports. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Fetch reports that have been SHARED *WITH* the user
  const fetchReceivedReports = async () => {
    try {
      console.log("🔍 Fetching reports shared WITH user:", userId);
      const response = await fetch(`http://localhost:3000/api/share/shared-with/${userId}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to fetch received reports.");

      console.log("✅ Received Reports Response:", JSON.stringify(data, null, 2));

      // ✅ Store only explicitly shared reports (No filtering needed)
      setReceivedReports(data.sharedReports || []);
    } catch (error) {
      console.error("❌ Error fetching received reports:", error);
      Alert.alert("Error", "Could not load received reports. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Helper function to format date correctly
  const formatDate = (dateString) => {
    if (!dateString) return "⚠️ Missing Date";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("❌ Error formatting date:", error);
      return "⚠️ Invalid Date";
    }
  };

  // ✅ Render individual report item
  const renderReport = ({ item }) => (
    <TouchableOpacity
      style={styles.reportItem}
      onPress={() => {
        if (!item.reportId) {
          console.warn("⚠️ Report ID missing:", item);
          Alert.alert("Error", "This report is missing a valid ID.");
          return;
        }
        console.log(`📂 Navigating to FileDetailsScreen with reportId: ${item.reportId}`);
        navigation.navigate("FileDetailsScreen", { userId, reportId: item.reportId });
      }}
    >
      <Text style={styles.reportText}>📄 Report ID: {item.reportId || "⚠️ Missing Report ID"}</Text>
      <Text style={styles.sharedWithText}>
        {viewMode === "shared"
          ? `👤 Shared With: ${item.sharedWith || "⚠️ Missing User"}`
          : `📥 Shared By: ${item.ownerId || "⚠️ Missing Owner"}`}
      </Text>
      <Text style={styles.dateText}>
        📅 Shared On: {formatDate(item.sharedAt)}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📑 Shared Reports</Text>

      {/* ✅ Center-Aligned Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === "shared" && styles.activeButton]}
          onPress={() => setViewMode("shared")}
        >
          <Text style={[styles.toggleText, viewMode === "shared" && styles.activeText]}>
            🔄 Shared Reports
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === "received" && styles.activeButton]}
          onPress={() => setViewMode("received")}
        >
          <Text style={[styles.toggleText, viewMode === "received" && styles.activeText]}>
            📥 Received Reports
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={viewMode === "shared" ? sharedReports : receivedReports}
        renderItem={renderReport}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.noReports}>No reports available.</Text>}
      />
    </View>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10, textAlign: "center", color: "#6200ee" },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 8,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  activeButton: { backgroundColor: "#6200ee" },
  toggleText: { fontSize: 14, fontWeight: "bold", color: "#444" },
  activeText: { color: "#fff" },
  list: { marginTop: 10 },
  reportItem: { padding: 12, backgroundColor: "#f9f9f9", borderRadius: 6, marginBottom: 8, borderWidth: 1, borderColor: "#ddd" },
  reportText: { fontSize: 16, fontWeight: "bold" },
  sharedWithText: { fontSize: 14, color: "#444", marginTop: 3 },
  dateText: { fontSize: 12, color: "#666", marginTop: 3 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  noReports: { textAlign: "center", fontSize: 14, color: "#999", marginTop: 10 },
});

export default ShareScreen;

