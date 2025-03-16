import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const FileDetailsScreen = ({ route, navigation }) => {
  const { userId, reportId } = route.params; // Passed from navigation
  const [reportDetails, setReportDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        console.log(`Fetching report for User ID: ${userId}, Report ID: ${reportId}`);

        const response = await fetch(
          `http://localhost:3000/api/reports/${userId}/${reportId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch report details.');
        }

        const data = await response.json();
        console.log('Fetched Report Details:', data);

        if (!data || Object.keys(data).length === 0) {
          throw new Error('No report details found.');
        }

        setReportDetails(data);
      } catch (error) {
        console.error('Error fetching report details:', error);
        Alert.alert(
          'Error',
          'Failed to fetch report details. Please check your connection or try again later.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportDetails();
  }, [userId, reportId]);

  const renderData = (data) => {
    if (typeof data === 'object' && !Array.isArray(data)) {
      return Object.entries(data).map(([key, value], index) => (
        <View key={index} style={styles.nestedContainer}>
          <Text style={styles.parameterKey}>{key}</Text>
          {renderData(value)}
        </View>
      ));
    } else if (Array.isArray(data)) {
      return data.map((item, index) => (
        <View key={index} style={styles.nestedContainer}>
          {renderData(item)}
        </View>
      ));
    } else {
      return <Text style={styles.parameterValue}>{String(data)}</Text>;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!reportDetails) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          No report details available. Please check your connection or try again later.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Report Details</Text>
      <Text style={styles.subHeader}>User ID: {userId}</Text>
      <Text style={styles.subHeader}>Report ID: {reportId}</Text>
      <View style={styles.parametersContainer}>
        {Object.entries(reportDetails.parameters || {}).map(([category, values], index) => (
          <View key={index} style={styles.parameterBlock}>
            <Text style={styles.category}>{category}</Text>
            {renderData(values)}
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('DashboardScreen')}
      >
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 10,
  },
  parametersContainer: {
    marginTop: 20,
  },
  parameterBlock: {
    marginBottom: 15,
  },
  category: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 5,
  },
  nestedContainer: {
    marginLeft: 10,
    marginBottom: 5,
  },
  parameterKey: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  parameterValue: {
    fontSize: 16,
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    marginHorizontal: 20,
  },
});

export default FileDetailsScreen;

