import React, { useEffect, useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NotificationContext } from '../context/NotificationsProvider';
import { fetchUserDetailsByHealthID } from '../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';  // ✅ Added for logout session clearing

const DashboardScreen = ({ navigation, route }) => {
  const userId = route?.params?.userId;
  const healthId = route?.params?.healthId;
  const { notifications } = useContext(NotificationContext);
  const [userHealthId, setUserHealthId] = useState(healthId);
  const [loading, setLoading] = useState(!healthId);

  // Redirect to Login if no userId is found
  useEffect(() => {
    if (!userId) {
      navigation.replace('LoginRegistrationScreen');
    } else if (!healthId) {
      fetchHealthId(userId);
    }
  }, [userId]);

  const fetchHealthId = async (userId) => {
    setLoading(true);
    try {
      const userDetails = await fetchUserDetailsByHealthID(userId);
      if (userDetails && userDetails.healthId) {
        setUserHealthId(userDetails.healthId);
      }
    } catch (error) {
      console.error("❌ Error fetching Health ID:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (screen) => {
    navigation.navigate(screen, { userId, healthId: userHealthId });
  };

  // ✅ Logout Functionality
  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem("loggedInUserId"); // ✅ Clears session (if used)
          navigation.replace("LoginRegistrationScreen"); // ✅ Redirects to Login
        },
      },
    ]);
  };

  const MenuButton = ({ iconName, label, targetScreen }) => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => handleNavigation(targetScreen)}
      accessibilityLabel={`Navigate to ${label}`}
    >
      <Ionicons name={iconName} size={24} color="#fff" style={styles.icon} />
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {userId}!</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : (
        <Text style={styles.subHeader}>Health ID: {userHealthId}</Text>
      )}

      <Text style={styles.subHeader}>Manage and analyze your health reports</Text>

      <MenuButton iconName="cloud-upload-outline" label="Upload New Report" targetScreen="UploadScreen" />
      <MenuButton iconName="document-text-outline" label="View Uploaded Reports" targetScreen="ReportDetailsScreen" />
      <MenuButton iconName="eye-outline" label="View Shared Reports" targetScreen="ShareScreen" />
      <MenuButton iconName="trending-up-outline" label="View Health Trends" targetScreen="TrendsScreen" />

      {/* ✅ Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Display Notifications */}
      {notifications.length > 0 ? (
        <>
          <Text style={styles.notificationHeader}>Notifications</Text>
          <FlatList
            data={notifications}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={[styles.notification, item.type === 'shared' ? styles.shared : styles.revoked]}>
                <Text style={styles.notificationText}>{item.message}</Text>
              </View>
            )}
          />
        </>
      ) : (
        <Text style={styles.noNotifications}>No notifications available</Text>
      )}
    </View>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#6200ee' },
  subHeader: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#666' },
  button: { backgroundColor: '#6200ee', padding: 15, borderRadius: 8, marginVertical: 10, flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  logoutButton: { backgroundColor: 'red', padding: 15, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  logoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  notificationHeader: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, textAlign: 'center' },
  notification: { padding: 10, marginVertical: 5, borderRadius: 5 },
  shared: { backgroundColor: '#D4EDDA' },
  revoked: { backgroundColor: '#F8D7DA' },
  notificationText: { fontSize: 16 },
  noNotifications: { textAlign: 'center', marginTop: 10, color: '#999', fontSize: 16 },
});

export default DashboardScreen;

