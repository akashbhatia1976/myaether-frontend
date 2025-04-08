import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkUserExists, createUser, loginUser, needsPasswordReset, resetPassword } from "../api/apiService";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons"; // Make sure this is installed

const LoginRegistrationScreen = () => {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleContinue = async () => {
    const trimmedUserId = userId.trim();
    if (!trimmedUserId || trimmedUserId.includes(" ")) {
      Alert.alert("Validation Error", "User ID cannot be empty or contain spaces.");
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      console.log("Checking if user exists:", trimmedUserId);
      const userExists = await checkUserExists(trimmedUserId);

      if (userExists) {
        console.log(`User ${trimmedUserId} exists. Checking verification status...`);
        const resetRequired = await needsPasswordReset(trimmedUserId);

        if (resetRequired) {
          console.log(`User ${trimmedUserId} needs a password reset.`);
          Alert.alert(
            "Password Reset Required",
            "Your password needs to be reset before logging in.",
            [{ text: "Reset Password", onPress: () => handlePasswordReset(trimmedUserId) }]
          );
          return;
        }

        console.log(`User ${trimmedUserId} exists. Attempting login.`);
        await handleLogin(trimmedUserId, password);
      } else {
        console.log(`User ${trimmedUserId} does not exist. Asking for registration.`);
        Alert.alert(
          "User Not Found",
          "No account found with this User ID. Would you like to register?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Register", onPress: () => handleRegister(trimmedUserId, email, phone, password) },
          ]
        );
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      Alert.alert("Error", "Failed to check user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userIdToLogin, userPassword) => {
    setLoading(true);
    try {
      console.log(`Logging in user: ${userIdToLogin}`);
      const response = await loginUser(userIdToLogin, userPassword);

      // ✅ Save the token and verify it was saved
      await AsyncStorage.setItem("token", response.token);
      await AsyncStorage.setItem("userId", response.userId);
      
      const savedToken = await AsyncStorage.getItem("token");
      console.log("🔒 Token saved and verified:", savedToken);

      if (!savedToken) {
        throw new Error("Token not saved properly");
      }

      Alert.alert("Success", "Login successful!", [
        {
          text: "OK",
          onPress: () => {
            console.log("🧭 Navigating to dashboard with:", response.userId);
            navigation.navigate("DashboardScreen", {
              userId: response.userId,
              healthId: response.healthId,
            });
          },
        },
      ]);
    } catch (error) {
      console.error("❌ Login error:", error);
      Alert.alert("Login Failed", error.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userIdToRegister, userEmail, userPhone, userPassword) => {
    if (!userEmail && !userPhone) {
      Alert.alert("Error", "Please provide either an email or a phone number for verification.");
      return;
    }

    setLoading(true);
    try {
      console.log(`Creating user: ${userIdToRegister}`);
      const response = await createUser(userIdToRegister, userEmail, userPhone, userPassword);

      Alert.alert("Success", response.message, [
        {
          text: "OK",
          onPress: () => navigation.navigate("VerifyScreen", {
            email: userEmail,
            phone: userPhone,
            healthId: response.healthId
          }),
        },
      ]);
    } catch (error) {
      console.error("❌ Registration error:", error);
      Alert.alert("Error", "Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (userIdToReset) => {
    // Note: Alert.prompt is iOS only. For a cross-platform solution,
    // you might want to create a custom modal
    if (Platform.OS === 'ios') {
      Alert.prompt(
        "Reset Password",
        "Enter your new password:",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Reset",
            onPress: async (newPassword) => {
              if (!newPassword || newPassword.length < 6) {
                Alert.alert("Error", "Password must be at least 6 characters long.");
                return;
              }

              resetPasswordAction(userIdToReset, newPassword);
            },
          },
        ],
        "secure-text"
      );
    } else {
      // For Android, you would typically show a custom dialog
      Alert.alert(
        "Reset Password",
        "Please use the 'Forgot Password' option to reset your password.",
        [{ text: "OK" }]
      );
    }
  };

  const resetPasswordAction = async (userId, newPassword) => {
    setLoading(true);
    try {
      console.log(`Resetting password for user: ${userId}`);
      await resetPassword(userId, newPassword);
      Alert.alert("Success", "Password reset successful. Please log in again.", [{ text: "OK" }]);
    } catch (error) {
      console.error("❌ Password reset error:", error);
      Alert.alert("Error", "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo and Header */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Ionicons name="flash" size={40} color="#fff" />
            </View>
            <Text style={styles.appName}>Aether Health</Text>
            <Text style={styles.appTagline}>Your personal health records manager</Text>
          </View>
          
          {/* Login/Registration Form */}
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Welcome Back</Text>
              <Text style={styles.formSubtitle}>Sign in to access your health records</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>User ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your unique ID"
                value={userId}
                onChangeText={setUserId}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TouchableOpacity onPress={() => handlePasswordReset(userId)}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            {loading ? (
              <ActivityIndicator size="large" color="#0D9488" style={styles.loader} />
            ) : (
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleContinue}
                disabled={loading || !userId.trim() || !password}
              >
                <Ionicons name="log-in-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.loginButtonText}>Continue</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.registerLinkContainer}>
              <Text style={styles.registerText}>
                New user? <Text style={styles.registerLink} onPress={() => handleRegister(userId, email, phone, password)}>Register here</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: "#0D9488",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    color: "#6B7280",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#0D9488",
  },
  loginButton: {
    backgroundColor: "#0D9488",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 10,
    shadowColor: "#0D9488",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  registerLinkContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  registerLink: {
    color: "#0D9488",
    fontWeight: "500",
  },
  loader: {
    marginVertical: 20,
  },
});

export default LoginRegistrationScreen;
