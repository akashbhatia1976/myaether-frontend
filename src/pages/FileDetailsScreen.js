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
import { getReportDetails } from '../api/apiService'; // Ensure API call is correct

const FileDetailsScreen = ({ route, navigation }) => {
  const { userId, reportId } = route.params;
  const [reportDetails, setReportDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

    const fetchReportDetails = async () => {
      setIsLoading(true);
      try {
        console.log(`🔍 Fetching report details for User: ${userId}, Report: ${reportId}`);
        const data = await getReportDetails(userId, reportId);

        if (!data || Object.keys(data).length === 0) {
          throw new Error('No report details found.');
        }

        // 🔹 Ensure we're correctly extracting the parameters from the response
        const extractedParameters = data.extractedParameters || data.parameters;

        if (!extractedParameters || Object.keys(extractedParameters).length === 0) {
          console.warn("⚠️ No extracted parameters found in the report.");
        }

        setReportDetails({
          userId: data.userId,
          reportId: data.reportId,
          date: data.date,
          fileName: data.fileName,
          parameters: extractedParameters,  // 🛠 Ensure extracted parameters are correctly assigned
        });

      } catch (error) {
        console.error('🚨 Error fetching report details:', error);
        Alert.alert('Error', 'Failed to fetch report details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };


  useEffect(() => {
    fetchReportDetails();
  }, [userId, reportId]);

    const renderData = (data) => {
      if (typeof data === 'object' && !Array.isArray(data)) {
        return Object.entries(data).map(([key, value], index) => (
          <View key={index} style={styles.nestedContainer}>
            <Text style={styles.parameterKey}>{key}:</Text>
            {typeof value === 'object' ? renderData(value) : (
              <Text style={styles.parameterValue}>{String(value)}</Text>
            )}
          </View>
        ));
      }
      return <Text style={styles.parameterValue}>{String(data)}</Text>;
    };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading Report Details...</Text>
      </View>
    );
  }

  if (!reportDetails) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No report details found.</Text>
        <TouchableOpacity style={styles.button} onPress={fetchReportDetails}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Report Details</Text>
      <Text style={styles.subHeader}>User ID: {userId}</Text>
      <Text style={styles.subHeader}>Report ID: {reportId}</Text>

          <View style={styles.parametersContainer}>
            {reportDetails.parameters && Object.entries(reportDetails.parameters).map(([category, values], index) => (
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
    color: '#6200ee',
  },
  subHeader: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  parametersContainer: {
    marginTop: 20,
  },
  parameterBlock: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
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
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default FileDetailsScreen;

