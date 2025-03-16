import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import DocumentPicker from "react-native-document-picker";
import { checkUserExists, uploadReport } from "../api/apiService";

const UploadScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [filePath, setFilePath] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [reportDate, setReportDate] = useState("");

  const handleFilePicker = async () => {
    try {
      const pickedFile = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      });
      setFilePath(pickedFile[0]);
      setMessage(`✅ File selected: ${pickedFile[0].name}`);

      // Automatically attempt upload after selecting file
      handleUpload(false);
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        setMessage("⚠️ File selection canceled.");
      } else {
        console.error("Error picking file:", error);
        setMessage("❌ Error selecting file.");
      }
    }
  };

  const handleUpload = async (autoCreateUser) => {
    if (!filePath || !reportDate.trim()) {
      Alert.alert("Validation Error", "Please enter a Report Date and select a file.");
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");

      // Step 1: Check if user exists
      const userExists = await checkUserExists(userId);
      if (!userExists && !autoCreateUser) {
        Alert.alert(
          "User Not Found",
          "This user does not exist. Would you like to create an account automatically?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Yes", onPress: () => handleUpload(true) },
          ]
        );
        return;
      }

      // Step 2: Upload File
      const response = await uploadReport(userId, reportDate, filePath, autoCreateUser);

      console.log("Upload Response:", response);

      // Ensure response contains expected fields
      if (response && response.reportId) {
        setMessage("✅ Report uploaded successfully!");
        setFilePath(null);
        setReportDate("");

        // Navigate to File Details screen
        navigation.navigate("FileDetailsScreen", { userId, reportId: response.reportId });
      } else {
        throw new Error(response.message || "Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(`❌ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upload Report</Text>
      <Text style={styles.subHeader}>User ID: {userId}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Report Date (YYYY-MM-DD)"
        value={reportDate}
        onChangeText={setReportDate}
        autoCapitalize="none"
      />

      {filePath && <Text style={styles.fileInfo}>Selected File: {filePath.name}</Text>}

      {isLoading && <ActivityIndicator size="large" color="#6200ee" style={{ marginTop: 10 }} />}

      <Text style={styles.pickFile} onPress={handleFilePicker}>
        📂 Pick a File (Auto-Upload)
      </Text>

      {message !== "" && (
        <Text style={[styles.message, { color: message.includes("✅") ? "green" : "red" }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#6200ee",
  },
  subHeader: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  pickFile: {
    color: "#6200ee",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    textDecorationLine: "underline",
  },
  fileInfo: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
    color: "#333",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
});

export default UploadScreen;

