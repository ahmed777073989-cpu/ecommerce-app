import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function SplashScreen({ navigation }: any) {
  const { loadStoredAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      await loadStoredAuth();
      
      setTimeout(() => {
        if (isAuthenticated && user?.active) {
          navigation.replace('Home');
        } else if (isAuthenticated && !user?.active) {
          navigation.replace('Activation');
        } else {
          navigation.replace('Login');
        }
      }, 2000);
    };

    initAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EcommerceApp</Text>
      <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
});
