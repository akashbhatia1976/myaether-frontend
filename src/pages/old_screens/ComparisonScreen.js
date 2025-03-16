import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from "react-native";
import axios from "axios";

const ComparisonScreen = ({ route }) => {
  const { files } = route.params;
  const [comparisonResults, setComparisonResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Files passed to ComparisonScreen:", files); // Debug log
    compareFiles();
  }, []);

  const compareFiles = async () => {
    if (!files || files.length !== 2) {
      Alert.alert("Error", "Exactly two files must be selected for comparison.");
      console.error("Invalid files array:", files); // Debug log
      setLoading(false);
      return;
    }

    try {
      const requestBody = {
        file1: files[0].name.replace(".pdf", ".csv"),
        file2: files[1].name.replace(".pdf", ".csv"),
      };
      console.log("Request body for comparison:", requestBody); // Debug log

      const response = await axios.post("http://localhost:3000/compare", requestBody);

      console.log("Comparison API response:", response.data); // Debug log
      setComparisonResults(response.data.comparison);
    } catch (error) {
      console.error("Error comparing files:", error.response?.data || error.message); // Debug log
      Alert.alert("Error", "Failed to compare files. Please check the logs.");
      setComparisonResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderDifference = ({ item }) => (
    <View style={styles.differenceItem}>
      <Text style={styles.parameter}>Parameter: {item.parameter}</Text>
      <Text style={styles.value}>File 1 Value: {item.file1_value}</Text>
      <Text style={styles.value}>File 2 Value: {item.file2_value}</Text>
      <Text style={styles.row}>Row: {item.row}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : comparisonResults && comparisonResults.length > 0 ? (
        <FlatList
          data={comparisonResults}
          keyExtractor={(item, index) => `${item.parameter}-${index}`}
          renderItem={renderDifference}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.emptyText}>No differences or data available for comparison.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  list: {
    paddingBottom: 20,
  },
  differenceItem: {
    backgroundColor: "#ffffff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  parameter: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6200ee",
  },
  value: {
    fontSize: 14,
    color: "#333333",
    marginTop: 5,
  },
  row: {
    fontSize: 12,
    color: "#777777",
    marginTop: 5,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "#999999",
  },
});

export default ComparisonScreen;

