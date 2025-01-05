import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

export default function HomeScreen() {
  const navigation = useNavigation();

  async function handleChannelJoin() {
    try {
      // Recuperar el token del almacenamiento seguro
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert('Error', 'No se encontró el token. Por favor, inicia sesión.');
        return;
      }

      const payload = { id_user: token, channelId: 1, muted: false };

      // Enviar solicitud al backend
      const response = await axios.post('http://192.168.68.102:3000/home/addUserChannel1', payload);

      if (response.status === 201) {
        Alert.alert('Canal 1', 'Te has unido al canal 1 correctamente.');
        navigation.navigate('Channel1'); // Navega al canal si la solicitud es exitosa
      } else {
        Alert.alert('Error', 'No se pudo unir al canal. Inténtalo nuevamente.');
      }
    } catch (error) {
      console.error('Error al unirse al canal:', error);
      Alert.alert('Error', 'Hubo un problema al unirse al canal.');
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/img/background-home.webp')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={handleChannelJoin}>
          <Text style={styles.buttonText}>Canal 1</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
