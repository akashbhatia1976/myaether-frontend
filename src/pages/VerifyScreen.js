import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from "react-native";
import { verifyPhone } from "../api/apiService";
import { useNavigation, useRoute } from "@react-navigation/native";

const VerifyScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, phone } = route.params || {};
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (email) {
      Alert.alert("Email Verification", "Please check your email to verify your account.");
    }
  }, [email]);

  const handleVerifyPhone = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP.");
      return;
    }

    setLoading(true);
    try {
      await verifyPhone(phone, otp);
      Alert.alert("Success", "Phone verified! You can now log in.");
      navigation.navigate("LoginRegistrationScreen");
    } catch (error) {
      Alert.alert("Error", "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Verify Your Account</Text>

      {phone && (
        <>
          <Text style={styles.instructions}>Enter the OTP sent to:</Text>
          <Text style={styles.phoneNumber}>{phone}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          {loading ? (
            <ActivityIndicator size="large" color="#6200ee" />
          ) : (
            <Button title="Verify Phone" onPress={handleVerifyPhone} />
          )}
        </>
      )}

      {email && <Text style={styles.instructions}>📧 Check your email for the verification link.</Text>}

      <Button title="Go to Login" onPress={() => navigation.navigate("LoginRegistrationScreen")} />
    </View>
  );
};

// ✅ Styles
const styles = {
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#6200ee" },
  instructions: { fontSize: 16, marginBottom: 10, textAlign: "center" },
  phoneNumber: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#333" },
  input: {
    width: "80%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
};

export default VerifyScreen;

