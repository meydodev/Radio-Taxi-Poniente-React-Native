import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';




export default function AppInfoScreen() {
 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Información de la App</Text>
      <Text style={styles.text}>
        Esta es una app desarrollada por Radio Taxi Poniente sin fines lucrativos y de uso exclusivo
        usuarios de la central Taxi Poniente.
      </Text>
      <Text style={styles.text}>Versión: 1.0.0</Text>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
  },
  buttonDelete: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 20,
  },
});
