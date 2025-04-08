import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from "react-native";
import DocumentPicker from "react-native-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkUserExists, uploadReport } from "../api/apiService";
import Ionicons from "react-native-vector-icons/Ionicons"; // Make sure this is installed

const UploadScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [filePath, setFilePath] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [reportName, setReportName] = useState("");

  const handleFilePicker = async () => {
    try {
      const pickedFile = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      });
      setFilePath(pickedFile[0]);
      setMessage(`✅ File selected: ${pickedFile[0].name}`);
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

      const response = await uploadReport(userId, reportDate, filePath, autoCreateUser, reportName);

      console.log("Upload Response:", response);

      if (response && response.reportId) {
        setMessage("✅ Report uploaded successfully!");
        setFilePath(null);
        setReportDate("");
        setReportName("");

        // ✅ Ensure token is available with retry logic
        let token = await AsyncStorage.getItem("token");
        let attempts = 0;
        while (!token && attempts < 3) {
          await new Promise(res => setTimeout(res, 500));
          token = await AsyncStorage.getItem("token");
          attempts++;
        }

        if (!token) {
          console.warn("🚫 Token not available after retries.");
          Alert.alert("Error", "You are not logged in. Please log in again.");
          return;
        }

        navigation.navigate("FileDetailsScreen", {
          userId,
          reportId: response.reportId,
        });
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Report</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.userInfoContainer}>
          <View style={styles.userInfoCard}>
            <Ionicons name="person-circle-outline" size={24} color="#0D9488" />
            <Text style={styles.userIdText}>User ID: {userId}</Text>
          </View>
        </View>
        
        {/* Upload Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Report Date</Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={reportDate}
                onChangeText={setReportDate}
                keyboardType="numbers-and-punctuation"
              />
              <Ionicons name="calendar-outline" size={20} color="#0D9488" style={styles.calendarIcon} />
            </View>
            <Text style={styles.dateHelpText}>Format: YYYY-MM-DD (e.g., 2025-03-30)</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Report Name (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Give this report a name"
              value={reportName}
              onChangeText={setReportName}
            />
          </View>
          
          {filePath && (
            <View style={styles.fileInfoContainer}>
              <View style={styles.fileInfoCard}>
                <Ionicons name="document-text" size={20} color="#0D9488" style={styles.fileIcon} />
                <Text style={styles.fileInfoText} numberOfLines={1} ellipsizeMode="middle">
                  {filePath.name}
                </Text>
              </View>
            </View>
          )}
          
          {message !== "" && (
            <View style={[
              styles.messageContainer,
              message.includes("✅") ? styles.successMessage : styles.errorMessage
            ]}>
              <Ionicons
                name={message.includes("✅") ? "checkmark-circle" : "alert-circle"}
                size={20}
                color={message.includes("✅") ? "#0D9488" : "#EF4444"}
                style={styles.messageIcon}
              />
              <Text style={[
                styles.messageText,
                { color: message.includes("✅") ? "#0D9488" : "#EF4444" }
              ]}>
                {message}
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleFilePicker}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" style={styles.uploadIcon} />
                <Text style={styles.uploadButtonText}>Select File & Upload</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Upload Instructions</Text>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>Enter the date when this report was created</Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>Optionally, give this report a descriptive name</Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>Tap the "Select File & Upload" button to choose a PDF or image file</Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>4</Text>
            </View>
            <Text style={styles.instructionText}>After selection, your file will be automatically uploaded</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  headerRight: {
    width: 32,
  },
  userInfoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F7F5",
    padding: 12,
    borderRadius: 10,
  },
  userIdText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  formContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#374151",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  dateInputContainer: {
    position: 'relative',
  },
  calendarIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  dateHelpText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  fileInfoContainer: {
    marginBottom: 16,
  },
  fileInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3FAFB",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  fileIcon: {
    marginRight: 8,
  },
  fileInfoText: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  successMessage: {
    backgroundColor: "#D1FAE5",
  },
  errorMessage: {
    backgroundColor: "#FEE2E2",
  },
  messageIcon: {
    marginRight: 8,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
  },
  uploadButton: {
    backgroundColor: "#0D9488",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: "#0D9488",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  uploadIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  instructionsContainer: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E6F7F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0D9488",
  },
  instructionText: {
    fontSize: 14,
    flex: 1,
    color: "#4B5563",
  },
});

export default UploadScreen;
