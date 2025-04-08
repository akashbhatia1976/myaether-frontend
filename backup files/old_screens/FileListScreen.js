import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";

const FileListScreen = ({ navigation }) => {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch files from the backend
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/api/files");
      console.log("Files fetched from backend:", response.data); // Debug log
      setFiles(response.data); // Updated to handle response structure
    } catch (err) {
      console.error("Error fetching files:", err);
      Alert.alert("Error", "Failed to fetch files. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a file
  const deleteFile = async (filename) => {
    try {
      console.log(`Attempting to delete file: ${filename}`);
      const response = await axios.delete(
        `http://localhost:3000/api/files/${encodeURIComponent(filename)}`
      );
      console.log("Delete response:", response.data);
      Alert.alert("Success", `File '${filename}' deleted successfully.`);
      fetchFiles(); // Refresh the file list after deletion
    } catch (err) {
      console.error("Error deleting file:", err);
      Alert.alert("Error", "Failed to delete file. Please check the logs.");
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFiles((prev) =>
      prev.some((f) => f.filename === file.filename)
        ? prev.filter((f) => f.filename !== file.filename)
        : [...prev, file]
    );
  };

  const compareFiles = () => {
    if (selectedFiles.length !== 2) {
      Alert.alert("Selection Error", "Please select exactly two files to compare.");
      return;
    }
    navigation.navigate("Comparison", { files: selectedFiles });
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const renderFile = ({ item }) => (
    <View style={styles.fileItemContainer}>
      <TouchableOpacity
        style={[
          styles.fileItem,
          selectedFiles.some((file) => file.filename === item.filename) &&
            styles.selectedFileItem,
        ]}
        onPress={() => handleFileSelect(item)}
      >
        <Text style={styles.fileName}>{item.originalName}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteFile(item.filename)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : files.length > 0 ? (
        <>
          <FlatList
            data={files}
            keyExtractor={(item, index) => `${item.filename}-${index}`}
            renderItem={renderFile}
            contentContainerStyle={styles.list}
          />

          <View style={styles.buttonContainer}>
            <Button title="Compare Selected Files" onPress={compareFiles} color="#007BFF" />
          </View>
        </>
      ) : (
        <Text style={styles.emptyText}>No files available. Please upload new files.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 10,
  },
  list: {
    paddingBottom: 20,
  },
  fileItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  fileItem: {
    flex: 1,
  },
  selectedFileItem: {
    backgroundColor: "#d0f0c0",
  },
  fileName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  deleteButton: {
    backgroundColor: "#FF4500",
    padding: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "#999999",
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default FileListScreen;

