import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { checkUserExists, createUser } from '../api/apiService';

const LoginRegistrationScreen = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    const trimmedUserId = userId.trim();

    if (!trimmedUserId || trimmedUserId.includes(' ')) {
      Alert.alert('Validation Error', 'User ID cannot be empty or contain spaces.');
      return;
    }

    setLoading(true);

    try {
      console.log("Checking if user exists:", trimmedUserId);
      const userExists = await checkUserExists(trimmedUserId);

      if (userExists) {
        console.log(`User ${trimmedUserId} exists. Navigating to Dashboard.`);
        navigation.navigate('DashboardScreen', { userId: trimmedUserId });
      } else {
        console.log(`User ${trimmedUserId} does not exist. Asking for registration.`);
        Alert.alert(
          'User Not Found',
          'No account found with this User ID. Would you like to register?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Register', onPress: () => handleRegister(trimmedUserId) }
          ]
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to check user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userIdToRegister) => {
    setLoading(true);
    try {
      console.log(`Creating user: ${userIdToRegister}`);
      const response = await createUser(userIdToRegister);
      Alert.alert('Success', response.message, [
        { text: 'OK', onPress: () => navigation.navigate('DashboardScreen', { userId: userIdToRegister }) }
      ]);
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login or Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter User ID"
        value={userId}
        onChangeText={setUserId}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
      ) : (
        <Button title="Continue" onPress={handleContinue} disabled={loading || !userId.trim()} />
      )}
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
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  loader: {
    marginVertical: 20,
  },
});

export default LoginRegistrationScreen;

