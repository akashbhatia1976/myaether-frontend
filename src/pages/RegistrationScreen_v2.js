import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { createUser } from '../api/apiService';

const RegistrationScreen = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const trimmedUserId = userId.trim();

    if (!trimmedUserId || trimmedUserId.includes(' ')) {
      Alert.alert('Validation Error', 'User ID cannot be empty or contain spaces.');
      return;
    }

    setLoading(true);

    try {
      const response = await createUser(trimmedUserId);
      Alert.alert('Success', response.message, [
        { text: 'OK', onPress: () => navigation.navigate('DashboardScreen') }
      ]);
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Register User</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter User ID"
        value={userId}
          onChangeText={(text) => {
              console.log('Typed:', text);
              setUserId(text);
            }}
        editable={!loading}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
      ) : (
        <Button title="Register" onPress={handleRegister} disabled={loading || !userId.trim()} />
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

export default RegistrationScreen;

