import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import io from 'socket.io-client';
import { API_URL } from '../constants/config';
import * as SecureStore from 'expo-secure-store';
import { useKeepAwake } from 'expo-keep-awake';

export default function Channel1Screen() {
  const [recording, setRecording] = useState();
  const [isPlaying, setIsPlaying] = useState(false); // Control de reproducción
  const [isRecording, setIsRecording] = useState(false); // Estado global de grabación
  const [isBroadcasting, setIsBroadcasting] = useState(false); // Estado de emisión
  const [connectedUsers, setConnectedUsers] = useState([]);
  const socket = io(API_URL);
  let pressTimer;

  useKeepAwake();

  useEffect(() => {
    const fetchConnectedUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/channel1/getUsers`);
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
    socket.on('recording-started', ({ recorder }) => {
      setIsRecording(true); // Deshabilitar botón para todos
    });

    socket.on('recording-stopped', () => {
      setIsRecording(false); // Habilitar botón para todos
    });

    socket.on('audio-uploaded-channel1', async ({ userId, audioUrl }) => {
      try {
        const token = await SecureStore.getItemAsync('token'); // Obtener el token del usuario actual
        if (!token) {
          console.error('Error: No se pudo obtener el token del usuario.');
          return;
        }

        if (userId === token) {
          //console.log('Audio enviado por el usuario actual. No se reproduce.');
          setIsBroadcasting(true); // Cambiar a estado de emisión
          setTimeout(() => {
            setIsBroadcasting(false); // Restablecer estado después de un tiempo
          }, 3000); // Duración estimada de emisión (puedes ajustar este valor)
          return; // No reproducir el audio enviado por el usuario actual
        }

        //console.log(`Audio recibido de usuario ${userId}: ${audioUrl}`);
        setIsPlaying(true); // Cambiar estado a reproduciendo

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
        });

        const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            //console.log('Reproducción finalizada.');
            setIsPlaying(false); // Restablecer estado
            sound.unloadAsync(); // Liberar recursos
          }
        });

        //console.log('Iniciando reproducción...');
        await sound.playAsync(); // Reproducir audio
      } catch (error) {
        console.error('Error al intentar reproducir el audio:', error);
        setIsPlaying(false); // Asegurar que el estado se restablezca en caso de error
      }
    });

    socket.on('new-user-channel1', (newUser) => {
      setConnectedUsers((prevUsers) => {
        const userExists = prevUsers.some((user) => user.id_user === newUser.id_user);
        if (userExists) {
          return prevUsers; // Si ya existe, no lo agregamos
        }
        return [...prevUsers, newUser]; // Si no existe, lo agregamos
      });
    });

    socket.on('user-exit-channel1', (data) => {
      setConnectedUsers((prevUsers) =>
        prevUsers.filter((user) => user.id_user !== data.id_user)
      );
    });

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

      await axios.delete(`${API_URL}/channel1/deleteUser/${token}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error al eliminar usuario del canal:', error);
    }
  };

  const uploadAudio = async (audioUri) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert('Error', 'Por favor, inicia sesión de nuevo.');
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
      Alert.alert('Error', 'No se pudo subir el audio.');
      console.error('Error al subir el audio:', error);
    }
  };

  async function startRecording() {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert('Error', 'No se pudo obtener el token de usuario.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      setRecording(recording); // Marca el estado como grabando
      socket.emit('start-recording', { token }); // Enviar token al servidor
    } catch (err) {
      console.error('Error al iniciar la grabación:', err);
      Alert.alert('Error', 'No se pudo iniciar la grabación.');
    }
  }

  async function stopRecording() {
    if (!recording) return;

    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert('Error', 'No se pudo obtener el token de usuario.');
        return;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null); // Limpia el estado local
      socket.emit('stop-recording', { token }); // Enviar token al servidor
      uploadAudio(uri); // Sube el audio
    } catch (err) {
      console.error('Error al detener la grabación:', err);
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/img/micro-channel.webp')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <TouchableOpacity
           style={[
            recording
              ? styles.buttonRecording
              : isBroadcasting
              ? styles.buttonBroadcasting
              : isPlaying
              ? styles.buttonPlaying
              : isRecording
              ? styles.buttonOtherUserRecording
              : styles.button,
          ]}
          onPressIn={() => {
            pressTimer = setTimeout(() => {
              if (!isPlaying && !recording && !isRecording) {
                startRecording();
              }
            }, 200);
          }}
          onPressOut={() => {
            clearTimeout(pressTimer);
            if (!recording) {
              Alert.alert('Mantenga el botón presionado para grabar');
            }
            if (recording) {
              stopRecording();
            }
          }}
          disabled={isRecording || isPlaying || isBroadcasting}
        >
          <Text style={styles.buttonText}>
            {recording
              ? 'Grabando...'
              : isRecording
              ? 'Otro usuario grabando'
              : isBroadcasting
              ? 'Emitiendo...'
              : isPlaying
              ? 'Reproduciendo...'
              : 'Hablar'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>Usuarios Conectados:</Text>
        <FlatList
          data={connectedUsers}
          keyExtractor={(item) => `${item.id_user}`}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <View style={styles.greenDot}></View>
              <Text style={styles.userText}>
                {item.name}, Taxi: {item.license}
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
  buttonBroadcasting: {
    backgroundColor: '#32CD32', // Verde cuando está emitiendo
    width: 250,
    height: 250,
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 5,
  },
  buttonPlaying: {
    backgroundColor: '#FFA500', // Naranja cuando está reproduciendo
    width: 250,
    height: 250,
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 5,
  },
  buttonRecording: {
    backgroundColor: '#FFD700', // Amarillo cuando está grabando
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
  buttonOtherUserRecording: {
    backgroundColor: '#FF4500', // Rojo cuando otro usuario está grabando
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    width: '100%',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'green',
    marginRight: 10,
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
