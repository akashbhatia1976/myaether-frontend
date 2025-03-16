import React from "react";
import { View, Text, Image, FlatList, StyleSheet } from "react-native";

const SERVER_URL = "http://localhost:3000"; // Centralized server URL

const ComparisonResultsScreen = ({ route }) => {
  const { comparison, file1Date, file2Date } = route.params;

  if (!comparison || comparison.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No differences found for comparison.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comparison Results</Text>
      <Text style={styles.dateHeader}>
        Comparing: {file1Date} vs {file2Date}
      </Text>
      <FlatList
        data={comparison}
        keyExtractor={(item, index) => `${item.parameter}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <Text style={styles.parameter}>Parameter: {item.parameter}</Text>
            <Text style={styles.value}>
              <Text style={styles.label}>{file1Date}:</Text> {item.file1_value}
            </Text>
            <Text style={styles.value}>
              <Text style={styles.label}>{file2Date}:</Text> {item.file2_value}
            </Text>
            <Text style={styles.row}>Row: {item.row}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
      <Image
        source={{
          uri: `${SERVER_URL}/comparison_results/comparison_chart.png`,
        }}
        style={styles.chart}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#6200ee",
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#444444",
  },
  list: {
    paddingBottom: 20,
  },
  resultItem: {
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
  label: {
    fontWeight: "bold",
    color: "#444444",
  },
  row: {
    fontSize: 12,
    color: "#777777",
    marginTop: 5,
  },
  chart: {
    marginTop: 20,
    height: 300,
    width: "100%",
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "#999999",
  },
});

export default ComparisonResultsScreen;

