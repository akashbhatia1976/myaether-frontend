import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Corrected Import

const DashboardScreen = ({ navigation, route }) => {
  const userId = route?.params?.userId || 'Niki002'; // Dynamically retrieve or fallback

  const handleNavigation = (screen) => {
    if (!userId) {
      Alert.alert('User ID Missing', 'Please register or provide a valid User ID.');
      return;
    }
    navigation.navigate(screen, { userId });
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
      <Text style={styles.header}>Welcome to Your Dashboard</Text>
      <Text style={styles.subHeader}>Manage and analyze your health reports</Text>

      <MenuButton iconName="cloud-upload-outline" label="Upload New Report" targetScreen="UploadScreen" />
      <MenuButton iconName="document-text-outline" label="View Uploaded Reports" targetScreen="ReportDetailsScreen" />
      <MenuButton iconName="trending-up-outline" label="View Health Trends" targetScreen="TrendsScreen" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#6200ee',
  },
  subHeader: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;

