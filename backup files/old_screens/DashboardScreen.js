import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Button,
} from "react-native";
import axios from "axios";

const DashboardScreen = ({ navigation }) => {
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      console.log("Fetching dashboard metrics...");
      const response = await axios.get("http://localhost:3000/api/dashboard-metrics");
      console.log("Dashboard metrics response:", response.data);
      setDashboardMetrics(response.data);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Drawer Navigation Button */}
      <Button title="Open Menu" onPress={() => navigation.openDrawer()} />

      <Text style={styles.header}>Dashboard</Text>

      {/* Summary Cards */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Files Uploaded</Text>
          <Text style={styles.cardValue}>
            {dashboardMetrics?.summary?.totalFilesUploaded || 0}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Processed Files</Text>
          <Text style={styles.cardValue}>
            {dashboardMetrics?.summary?.totalProcessedFiles || 0}
          </Text>
        </View>
      </View>

      {/* Trends Highlights */}
      <Text style={styles.sectionHeader}>Trends Summary</Text>
      <View style={styles.trendsContainer}>
        {dashboardMetrics?.highlights ? (
          Object.entries(dashboardMetrics.highlights).map(([key, value], index) => (
            <View key={index} style={styles.trendItem}>
              <Text style={styles.trendTitle}>{key}</Text>
              <Text style={styles.trendDescription}>{value}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No trends data available</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 5,
    elevation: 3,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6200ee",
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  trendsContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  trendItem: {
    marginBottom: 15,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007BFF",
  },
  trendDescription: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  noDataText: {
    textAlign: "center",
    color: "#999",
  },
});

export default DashboardScreen;

