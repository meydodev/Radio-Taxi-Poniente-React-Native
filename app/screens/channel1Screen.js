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
        const users = response.data?.data || [];
        setConnectedUsers(users);
      } catch (error) {
        console.error('Error al cargar usuarios conectados:', error);
        Alert.alert('Error', 'No se pudo cargar la lista de usuarios conectados.');
      }
    };

    fetchConnectedUsers();

    // Escuchar eventos de Socket.IO
    socket.on('new-user-channel1', (newUser) => {
      setConnectedUsers((prevUsers) => [...prevUsers, newUser]);
    });

    socket.on('user-exit-channel1', (data) => {
      setConnectedUsers((prevUsers) => prevUsers.filter((user) => user.id_user !== data.id_user));
    });

    socket.on('audio-uploaded-channel1', async (data) => {
      setIsPlaying(true);
      try {
        const { sound } = await Audio.Sound.createAsync({ uri: data.audioUrl });
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isPlaying) {
            setIsPlaying(false); // Habilitar el botón al terminar
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
      formData.append('userId', 'USER_ID'); // Reemplazar con el ID real del usuario

      const response = await axios.post(`${API_URL}/channel1/upload-audio`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Audio subido con éxito:', response.data);
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
          keyExtractor={(item, index) => `${item.id_user}-${index}`}
          renderItem={({ item, index }) => (
            <View style={styles.userRow}>
              <Text style={styles.userText}>
                {index + 1}. {item.name} (Licencia: {item.license})
              </Text>
            </View>
          )}
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
