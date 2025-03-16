import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

const ReportDetailsScreen = ({ route, navigation }) => {
  const { userId } = route.params; // Ensure userId is passed from navigation
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        if (!userId) throw new Error('User ID is missing.');

        const response = await fetch(`http://localhost:3000/api/reports/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch reports');

        const data = await response.json();
        setReports(data.reports || []);
      } catch (error) {
        console.error('Error fetching reports:', error);
        Alert.alert('Error', 'Failed to fetch reports. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [userId]);

  const renderReport = ({ item }) => (
    <TouchableOpacity
      style={styles.reportItem}
      onPress={() => navigation.navigate('FileDetailsScreen', {
        userId,
        reportId: item.reportId,
      })}
    >
      <Text style={styles.reportText}>Report ID: {item.reportId}</Text>
      <Text style={styles.reportDate}>Date: {item.date}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!reports.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No reports available. Please upload a report.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Uploaded Reports</Text>
      <FlatList
        data={reports}
        renderItem={renderReport}
        keyExtractor={(item) => item.reportId}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#6200ee',
  },
  list: {
    marginTop: 10,
  },
  reportItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reportText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default ReportDetailsScreen;

