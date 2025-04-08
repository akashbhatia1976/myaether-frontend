import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem("userProfile");
      if (data) {
        const parsedData = JSON.parse(data);
        setUserData(parsedData);
        setFullName(parsedData.fullName);
        setPhoneNumber(parsedData.phoneNumber);
        setEmail(parsedData.email);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load user details.");
    }
  };

  const saveUserData = async () => {
    if (!fullName || !phoneNumber || !email) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    const updatedData = { fullName, phoneNumber, email };

    try {
      await AsyncStorage.setItem("userProfile", JSON.stringify(updatedData));
      setUserData(updatedData);
      setEditMode(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving user data:", error);
      Alert.alert("Error", "Failed to save user details.");
    }
  };

  return (
    <View style={styles.container}>
      {userData ? (
        <>
          <Text style={styles.title}>User Profile</Text>
          {editMode ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <Button title="Save Changes" onPress={saveUserData} />
            </>
          ) : (
            <>
              <Text style={styles.label}>Full Name: {userData.fullName}</Text>
              <Text style={styles.label}>Phone: {userData.phoneNumber}</Text>
              <Text style={styles.label}>Email: {userData.email}</Text>
              <Button
                title="Edit Profile"
                onPress={() => setEditMode(true)}
              />
            </>
          )}
        </>
      ) : (
        <Text style={styles.loadingText}>Loading user data...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default ProfileScreen;
