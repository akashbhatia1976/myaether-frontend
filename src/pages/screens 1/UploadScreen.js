import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import DocumentPicker from 'react-native-document-picker';

const UploadScreen = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [reportId, setReportId] = useState('');
  const [filePath, setFilePath] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleFilePicker = async () => {
    try {
      const pickedFile = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      setFilePath(pickedFile[0]);
      setMessage('File selected successfully.');
      setMessageType('success');
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        setMessage('File selection canceled.');
        setMessageType('info');
      } else {
        console.error('Error picking file:', error);
        setMessage('Error selecting file.');
        setMessageType('error');
      }
    }
  };

  const handleUpload = async () => {
    if (!userId.trim() || !reportId.trim() || !filePath) {
      Alert.alert('Validation Error', 'Please fill in all fields and select a file.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: filePath.uri,
        type: filePath.type,
        name: filePath.name,
      });
      formData.append('userId', userId);
      formData.append('reportId', reportId);

      setIsLoading(true);
      setMessage('');

      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Report uploaded successfully.');
        setMessageType('success');
        console.log('Backend Response:', data);
        setFilePath(null);
        navigation.navigate('FileDetailsScreen', { userId, reportId: reportId });

      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to upload report.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error uploading report:', error);
      setMessage('An error occurred while uploading the report.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upload Report</Text>

      {message && (
        <Text style={[styles.message, { color: messageType === 'success' ? 'green' : 'red' }]}>
          {message}
        </Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Enter User ID"
        value={userId}
        onChangeText={setUserId}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Report ID"
        value={reportId}
        onChangeText={setReportId}
      />

      <TouchableOpacity style={styles.button} onPress={handleFilePicker}>
        <Text style={styles.buttonText}>Pick a File</Text>
      </TouchableOpacity>
      {filePath && <Text>Selected File: {filePath.name}</Text>}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleUpload}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Uploading...' : 'Upload Report'}</Text>
      </TouchableOpacity>

      {isLoading && <ActivityIndicator size="large" color="#6200ee" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default UploadScreen;

