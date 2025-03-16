import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";

const FileDetailsScreen = ({ route }) => {
  const { file } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [fileContent, setFileContent] = useState([]);

  useEffect(() => {
    if (file && file.content) {
      // Split the file content for rendering
      const contentLines = file.content.split("\n");
      setFileContent(contentLines);
    }
    setLoading(false);
  }, [file]);

  if (!file) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>File details are missing or invalid.</Text>
      </View>
    );
  }

  const renderDetail = ({ item, index }) => (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>Line {index + 1}:</Text>
      <Text style={styles.detailValue}>{item}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : (
        <>
          <Text style={styles.title}>File Details</Text>
          <Text style={styles.fileName}>File Name: {file.fileName || file.name}</Text>
          {fileContent.length > 0 ? (
            <FlatList
              data={fileContent}
              keyExtractor={(item, index) => `${index}`}
              renderItem={renderDetail}
              contentContainerStyle={styles.list}
            />
          ) : (
            <Text style={styles.emptyText}>No content available in this file.</Text>
          )}
        </>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333333",
  },
  fileName: {
    fontSize: 16,
    marginBottom: 20,
    color: "#555555",
  },
  list: {
    paddingBottom: 20,
  },
  detailItem: {
    backgroundColor: "#ffffff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6200ee",
  },
  detailValue: {
    fontSize: 16,
    color: "#333333",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#999999",
    textAlign: "center",
    marginTop: 20,
  },
});

export default FileDetailsScreen;

