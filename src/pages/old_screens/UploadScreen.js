import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DocumentPicker from 'react-native-document-picker';
import { addReport } from '../api/apiService';

const UploadScreen = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [reportId, setReportId] = useState('');
  const [filePath, setFilePath] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/categories');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setMessage('Failed to fetch categories.');
        setMessageType('error');
      }
    };
    fetchCategories();
  }, []);

  const createCategory = async () => {
    if (!newCategory.trim()) {
      Alert.alert('Validation Error', 'Please enter a category name.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      if (res.ok) {
        const newCat = await res.json();
        setCategories((prev) => [...prev, newCat]);
        setMessage('Category created successfully.');
        setMessageType('success');
        setNewCategory('');
        setSelectedCategory(newCat.name);
      } else {
        const data = await res.json();
        setMessage(data.message || 'Failed to create category.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setMessage('Failed to create category.');
      setMessageType('error');
    }
  };

  const handleFilePicker = async () => {
    try {
      const pickedFile = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      setFilePath(pickedFile[0]);
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('File selection canceled');
      } else {
        console.error('Error picking file:', error);
      }
    }
  };

  const handleUpload = async () => {
    if (!userId.trim() || !reportId.trim() || !filePath) {
      Alert.alert('Validation Error', 'Please enter all required fields and select a file.');
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

      console.log("FormData Content:", {
        userId,
        reportId,
        fileName: filePath.name,
      });

      setIsLoading(true);
      setMessage('');

      const response = await fetch('http://localhost:3000/api/files/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        setMessage('Report uploaded successfully.');
        setMessageType('success');
        setFilePath(null);
        navigation.navigate('FileDetailsScreen', { userId, reportId });
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to upload report.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error uploading report:', error);
      setMessage('Failed to upload report.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upload Diagnostic Report</Text>
      {message && (
        <Text style={[styles.message, { color: messageType === 'success' ? 'green' : 'red' }]}>
          {message}
        </Text>
      )}
      <TextInput
        placeholder="Enter User ID"
        value={userId}
        onChangeText={setUserId}
        style={styles.input}
      />
      <TextInput
        placeholder="Enter Report ID"
        value={reportId}
        onChangeText={setReportId}
        style={styles.input}
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
    color: '#6200ee',
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
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
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UploadScreen;

