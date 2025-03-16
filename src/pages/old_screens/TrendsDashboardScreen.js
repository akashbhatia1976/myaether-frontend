import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Button,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LineChart } from "react-native-chart-kit";
import axios from "axios";

const TrendsDashboardScreen = ({ navigation }) => {
  const [trends, setTrends] = useState({});
  const [selectedParameter, setSelectedParameter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      console.log("Fetching trends data...");
      const response = await axios.get("http://localhost:3000/api/trends");
      console.log("Trends fetched:", response.data);
      setTrends(response.data.trends);
      const firstParameter = Object.keys(response.data.trends)[0];
      setSelectedParameter(firstParameter || ""); // Default to the first parameter if available
      setError(false);
    } catch (err) {
      console.error("Error fetching trends:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!selectedParameter || !trends[selectedParameter]) return null;

    const data = trends[selectedParameter];
    return (
      <LineChart
        data={{
          labels: data.map((d) => new Date(d.date).toLocaleDateString()),
          datasets: [{ data: data.map((d) => d.value) }],
        }}
        width={350} // Responsive width
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={styles.chart}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Drawer Navigation Button */}
      <Button title="Open Menu" onPress={() => navigation.openDrawer()} />

      <Text style={styles.title}>Health Trends</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : error ? (
        <Text style={styles.errorText}>
          Failed to fetch trends data. Please try again later.
        </Text>
      ) : Object.keys(trends).length > 0 ? (
        <>
          <Picker
            selectedValue={selectedParameter}
            onValueChange={(itemValue) => setSelectedParameter(itemValue)}
            style={styles.picker}
          >
            {Object.keys(trends).map((param) => (
              <Picker.Item key={param} label={param} value={param} />
            ))}
          </Picker>
          {renderChart()}
        </>
      ) : (
        <Text style={styles.emptyText}>No trends data available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  picker: { marginBottom: 20, height: 50, width: "100%" },
  chart: { marginVertical: 10, borderRadius: 8 },
  emptyText: { fontSize: 16, color: "#999999", textAlign: "center", marginTop: 20 },
  errorText: { fontSize: 16, color: "red", textAlign: "center", marginTop: 20 },
});

export default TrendsDashboardScreen;

