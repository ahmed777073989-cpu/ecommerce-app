import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function ActivationScreen({ navigation, route }: any) {
  const [phone, setPhone] = useState(route.params?.phone || '');
  const [password, setPassword] = useState(route.params?.password || '');
  const [accessCode, setAccessCode] = useState('');
  const { activate, isLoading } = useAuthStore();

  const handleActivate = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Phone and password are required');
      return;
    }

    if (!accessCode || accessCode.length !== 8) {
      Alert.alert('Error', 'Please enter a valid 8-character access code');
      return;
    }

    try {
      const result = await activate(phone, password, accessCode.toUpperCase());
      if (result.success) {
        Alert.alert(
          'Success',
          'Account activated successfully! You can now login.',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('Login'),
            },
          ]
        );
      }
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Activation failed. Please check your code.';
      Alert.alert('Activation Failed', message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activate Account</Text>
      <Text style={styles.subtitle}>Enter the access code provided by an administrator</Text>

      <TextInput
        style={styles.input}
        placeholder="Access Code (8 characters)"
        value={accessCode}
        onChangeText={(text) => setAccessCode(text.toUpperCase())}
        maxLength={8}
        autoCapitalize="characters"
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleActivate}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Activate</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.info}>
        Access codes are provided by administrators. If you don't have one, please contact support.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});
