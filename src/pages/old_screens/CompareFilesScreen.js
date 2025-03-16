import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import axios from "axios";

const SERVER_URL = "http://localhost:3000"; // Centralized server URL

const CompareFilesScreen = ({ navigation }) => {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProcessedFiles();
  }, []);

  const fetchProcessedFiles = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/processed-files`);
      setFiles(response.data.files || []);
    } catch (err) {
      console.error("Error fetching processed files:", err);
      alert("Error fetching files. Please try again.");
    }
  };

  const toggleFileSelection = (file) => {
    if (selectedFiles.includes(file)) {
      setSelectedFiles(selectedFiles.filter((f) => f !== file));
    } else if (selectedFiles.length < 2) {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const compareFiles = async () => {
    if (selectedFiles.length !== 2) {
      alert("Please select exactly two files to compare.");
      return;
    }

    setLoading(true); // Start loading indicator
    try {
      const response = await axios.post(`${SERVER_URL}/compare`, {
        file1: selectedFiles[0].name,
        file2: selectedFiles[1].name,
      });
      navigation.navigate("ComparisonResults", {
        comparison: response.data,
      });
    } catch (err) {
      console.error("Error comparing files:", err);
      alert("Error comparing files. Please try again.");
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  const renderFileItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.fileItem,
        selectedFiles.includes(item) && styles.selectedFileItem,
      ]}
      onPress={() => toggleFileSelection(item)}
    >
      <Text style={styles.fileName}>{item.name}</Text>
      {item.date && <Text style={styles.fileDate}>Date: {item.date}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {files.length > 0 ? (
        <FlatList
          data={files}
          keyExtractor={(item) => item.name}
          renderItem={renderFileItem}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.emptyText}>No files available for comparison.</Text>
      )}
      <View style={styles.buttonContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#6200ee" />
        ) : (
          <Button title="Compare Selected Files" onPress={compareFiles} />
        )}
      </View>
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
  fileItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    elevation: 2,
  },
  selectedFileItem: {
    backgroundColor: "#cce5ff",
  },
  fileName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  fileDate: {
    fontSize: 14,
    color: "#555555",
  },
  buttonContainer: {
    marginTop: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#999999",
    marginTop: 20,
  },
});

export default CompareFilesScreen;

