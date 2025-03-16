import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedUserId = userId.trim();
    if (!trimmedUserId || trimmedUserId.includes(' ')) {
      Alert.alert('Validation Error', 'User ID cannot be empty or contain spaces.');
      return;
    }

    setLoading(true);

    try {
      // Mock login, replace with actual API call if needed
      setTimeout(() => {
        setLoading(false);
        navigation.replace('DashboardScreen', { userId: trimmedUserId });
      }, 1000);
    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter User ID"
        value={userId}
        onChangeText={setUserId}
        editable={!loading}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
      ) : (
        <Button title="Login" onPress={handleLogin} disabled={!userId.trim()} />
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

export default LoginScreen;
