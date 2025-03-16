import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { checkUserExists, createUser, loginUser, needsPasswordReset, resetPassword } from "../api/apiService";
import { useNavigation } from "@react-navigation/native";

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
      Alert.alert("Success", "Login successful!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("DashboardScreen", {
            userId: response.userId,
            healthId: response.healthId
          }),
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

            setLoading(true);
            try {
              console.log(`Resetting password for user: ${userIdToReset}`);
              await resetPassword(userIdToReset, newPassword);
              Alert.alert("Success", "Password reset successful. Please log in again.", [{ text: "OK" }]);
            } catch (error) {
              console.error("❌ Password reset error:", error);
              Alert.alert("Error", "Failed to reset password. Please try again.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      "secure-text"
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Aether Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter User ID"
        value={userId}
        onChangeText={setUserId}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Email (optional)"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Phone (optional)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
      ) : (
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleContinue}
          disabled={loading || !userId.trim() || !password}
        >
          <Text style={styles.loginButtonText}>Continue</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => handlePasswordReset(userId)}>
        <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleRegister(userId, email, phone, password)}>
        <Text style={styles.registerLink}>New user? Register here</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#6200ee" },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  loginButton: { backgroundColor: "#6200ee", padding: 12, borderRadius: 6, alignItems: "center", width: "100%" },
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  forgotPasswordLink: { marginTop: 15, color: "#6200ee", fontSize: 14, textDecorationLine: "underline" },
  registerLink: { marginTop: 15, color: "#6200ee", fontSize: 14 },
  loader: { marginVertical: 20 },
});

export default LoginRegistrationScreen;

