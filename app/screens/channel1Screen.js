import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, FlatList, Alert } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import io from 'socket.io-client';
import { API_URL } from '../constants/config';
import * as SecureStore from 'expo-secure-store';

export default function Channel1Screen() {
  const [recording, setRecording] = useState();
  const [isPlaying, setIsPlaying] = useState(false); // Control de reproducción
  const [connectedUsers, setConnectedUsers] = useState([]);
  const socket = io(API_URL);

  useEffect(() => {
    const fetchConnectedUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/channel1/getUsers`);
        console.log('Usuarios obtenidos:', response.data);
        const users = response.data?.data || [];

        // Filtrar duplicados basados en `id_user`
        const uniqueUsers = Array.from(new Set(users.map((u) => u.id_user))).map((id) =>
          users.find((u) => u.id_user === id)
        );

        setConnectedUsers(uniqueUsers);
      } catch (error) {
        console.error('Error al cargar usuarios conectados:', error);
        Alert.alert('Error', 'No se pudo cargar la lista de usuarios conectados.');
      }
    };

    fetchConnectedUsers();

    // Escuchar eventos de Socket.IO
    socket.on('new-user-channel1', (newUser) => {
      console.log('Nuevo usuario:', newUser);
      setConnectedUsers((prevUsers) => {
        const userExists = prevUsers.some((user) => user.id_user === newUser.id_user);
        if (userExists) {
          return prevUsers; // Si ya existe, no lo agregamos
        }
        return [...prevUsers, newUser]; // Si no existe, lo agregamos
      });
    });

    socket.on('user-exit-channel1', (data) => {
      console.log('Usuario salió:', data);
      setConnectedUsers((prevUsers) =>
        prevUsers.filter((user) => user.id_user !== data.id_user)
      );
    });

    socket.on('audio-uploaded-channel1', async (data) => {
      console.log('Audio recibido:', data);
    
      // Evitar reproducir el audio del cliente que lo subió
      const userId = await SecureStore.getItemAsync('token'); // Reemplaza con tu lógica para obtener el ID del usuario
      if (data.userId === userId) {
        console.log('Este audio pertenece al usuario actual. No se reproducirá.');
        return;
      }
    
      setIsPlaying(true);
      // Código para reproducir audio
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
        });
    
        const { sound } = await Audio.Sound.createAsync({ uri: data.audioUrl });
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
            sound.unloadAsync();
          }
        });
        await sound.playAsync();
      } catch (error) {
        console.error('Error al reproducir el audio:', error);
        setIsPlaying(false);
      }
    });

    // Eliminar usuario al desmontar
    return () => {
      socket.disconnect();
      deleteUserFromChannel();
    };
  }, []);

  const deleteUserFromChannel = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        console.error('Error: No se encontró el token. No se puede eliminar al usuario.');
        return;
      }

      const response = await axios.delete(`${API_URL}/channel1/deleteUser/${token}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Usuario eliminado del canal:', response.data);
    } catch (error) {
      console.error('Error al eliminar usuario del canal:', error);
    }
  };

  const uploadAudio = async (audioUri) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert('Error', 'No se encontró el token. Por favor, inicia sesión.');
        return;
      }

      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'audio.m4a',
      });
      formData.append('id_user', token); 

      const response = await axios.post(`${API_URL}/channel1/upload-audio`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      //console.log('Audio subido con éxito:', response.data);
    } catch (error) {
      console.error('Error al subir el audio:', error);
      Alert.alert('Error', 'No se pudo subir el audio.');
    }
  };

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
      }
    } catch (err) {
      console.error('Error starting recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;

    setRecording(undefined);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Audio grabado en:', uri);

      // Subir audio al servidor
      uploadAudio(uri);
    } catch (err) {
      console.error('Error stopping recording', err);
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/img/background-home.webp')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={recording || isPlaying ? styles.buttonDisabled : styles.button}
          onPressIn={!isPlaying ? startRecording : null}
          onPressOut={!isPlaying ? stopRecording : null}
          disabled={isPlaying} // Deshabilitar el botón si hay audio en reproducción
        >
          <Text style={styles.buttonText}>
            {recording ? 'Grabando...' : isPlaying ? 'Reproduciendo...' : 'Hablar'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>Usuarios Conectados:</Text>
        <FlatList
          data={connectedUsers}
          keyExtractor={(item) => `${item.id_user}`}
          renderItem={({ item, index }) => {
            console.log('Renderizando usuario:', item);
            return (
              <View style={styles.userRow}>
                <Text style={styles.userText}>
                  {index + 1}. {item.name} (Licencia: {item.license})
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay usuarios conectados.</Text>
          }
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    width: 250,
    height: 250,
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#A9A9A9',
    width: 250,
    height: 250,
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#fff',
  },
  userRow: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    backgroundColor: '#fff',
    width: '100%',
  },
  userText: {
    fontSize: 16,
    color: '#000',
  },
  emptyText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
  },
});
