import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const DashboardScreen = ({ navigation }) => {
  const userId = 'Niki002'; // Example userId; Replace with the actual userId from your context/state

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to Your Dashboard</Text>
      <Text style={styles.subHeader}>Manage and analyze your health reports</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('UploadScreen', { userId })}
      >
        <Text style={styles.buttonText}>Upload a New Report</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ReportDetailsScreen', { userId })}
      >
        <Text style={styles.buttonText}>View Uploaded Reports</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('TrendsScreen', { userId })}
      >
        <Text style={styles.buttonText}>View Health Trends</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;

