import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '../constants/config';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function HomeScreen() {
  const navigation = useNavigation();


  useEffect(() => {
    requestPermissions();
  }, []);


  
  async function requestPermissions() {
    try {
      // Solicitar permisos para grabar audio
      const { status } = await Audio.requestPermissionsAsync();

      if (status === 'granted') {
        //console.log('Permisos otorgados para grabar audio.');

        // Configuración de las opciones de audio
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

      } else {
        console.warn('Permisos denegados.');
        Alert.alert('Permiso denegado', 'No se otorgaron permisos para grabar audio.');
      }
    } catch (err) {
      console.error('Error al solicitar los permisos', err);
      Alert.alert('Error', 'Error al solicitar los permisos.');
    }
  }

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
      const response = await axios.post(`${API_URL}/home/addUserChannel1`, payload);

      if (response.status === 201) {
        navigation.navigate('Channel1'); // Navega al canal si la solicitud es exitosa
      } else {
        Alert.alert('Error', 'No se pudo unir al canal. Inténtalo nuevamente.');
      }
    } catch (error) {
      console.error('Error al unirse al canal:', error);
      Alert.alert('Error', 'Hubo un problema al unirse al canal.');
    }
  }

  async function handleLogout() {
    try {
      // Eliminar el token del almacenamiento seguro
      await SecureStore.deleteItemAsync('token');
      // Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.');

      // Redirigir al usuario a la pantalla de login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'Hubo un problema al cerrar sesión.');
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/img/micro.webp')} style={styles.backgroundImage} resizeMode="cover"
    >
      <View style={styles.container}>
        <Image
          source={require('../../assets/img/logo-radio-taxi-poniente.jpeg')}
          style={styles.logo}
        />
        <TouchableOpacity style={styles.button} onPress={handleChannelJoin}>
          <View style={styles.buttonContent}>
            <Icon name="bullhorn" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Canal 1</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonExit} onPress={handleLogout}>
          <View style={styles.buttonContent}>
            <Icon name="sign-out" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Salir</Text>
          </View>
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
    paddingHorizontal: 20,
    borderRadius: 50,
    width: 200,
    height: 70,
    justifyContent: 'center', // Centrar contenido verticalmente
    alignItems: 'center', // Centrar contenido horizontalmente
  },
  buttonContent: {
    flexDirection: 'row', // Colocar ícono y texto en línea
    alignItems: 'center', // Alinear verticalmente
  },
  icon: {
    marginRight: 10, // Espaciado entre el ícono y el texto
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonExit: {
    backgroundColor: 'gray',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginTop: 20,
  },
  logo: {
    position: 'absolute',
    top: '5%',
    alignSelf: 'center',
    width: 170,
    height: 170,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#000',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
