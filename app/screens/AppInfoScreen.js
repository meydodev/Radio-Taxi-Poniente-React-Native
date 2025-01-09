import React from 'react';
import { View, Text, StyleSheet,ImageBackground   } from 'react-native';


export default function AppInfoScreen() {
  return (
    <View style={styles.container}>
       
      <Text style={styles.title}>Información de la App</Text>
      <Text style={styles.text}>Esta es una app desarrollada por Radio Taxi Poniente sin fines lucrativos y de uso exclusivo usuarios de la central 
        Taxi Poniente.
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
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#fff',
  },
});