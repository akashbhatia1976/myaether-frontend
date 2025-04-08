import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { createUser } from '../api/apiService';

const RegistrationScreen = ({ navigation }) => {
  const [userId, setUserId] = useState('');

  const handleRegister = async () => {
    if (!userId.trim() || userId.includes(' ')) {
      Alert.alert('Validation Error', 'User ID cannot be empty or contain spaces.');
      return;
    }

    try {
      const response = await createUser(userId);
      Alert.alert('Success', response.message);
      navigation.navigate('DashboardScreen');
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Failed to create user. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Register User</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter User ID"
        value={userId}
        onChangeText={setUserId}
      />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
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
    marginBottom: 20,
  },
});

export default RegistrationScreen;

