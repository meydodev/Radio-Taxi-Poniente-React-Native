import React, { useEffect, useState, useRef } from 'react';
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
import { useNavigation } from '@react-navigation/native';

export default function Channel1Screen() {
  const [recording, setRecording] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const socket = io(API_URL);
  const startTimeRef = useRef(null); // Maneja el tiempo de inicio
  let pressTimer;
  const navigation = useNavigation();
  useKeepAwake();

  useEffect(() => {
    const fetchConnectedUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/channel1/getUsers`);
        const users = response.data?.data || [];
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

    socket.on('recording-started', () => {
      setIsRecording(true);
    });

    socket.on('recording-stopped', () => {
      setIsRecording(false);
    });

    socket.on('audio-uploaded-channel1', async ({ userId, audioUrl }) => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (!token) return;

        if (userId === token) {
          setIsBroadcasting(true);
          setTimeout(() => setIsBroadcasting(false), 3000);
          return;
        }

        setIsPlaying(true);

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
        });

        const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
            sound.unloadAsync();
          }
        });

        await sound.playAsync();
      } catch (error) {
        console.error('Error al intentar reproducir el audio:', error);
        setIsPlaying(false);
      }
    });

    socket.on('new-user-channel1', (newUser) => {
      setConnectedUsers((prevUsers) => {
        const userExists = prevUsers.some((user) => user.id_user === newUser.id_user);
        if (!userExists) return [...prevUsers, newUser];
        return prevUsers;
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
      if (!token) return;

      await axios.delete(`${API_URL}/channel1/deleteUser/${token}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error al eliminar usuario del canal:', error);
    }
  };

  const uploadAudio = async (audioUri, duration) => {
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
      formData.append('duration', duration);

      const response = await axios.post(`${API_URL}/channel1/upload-audio`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Audio subido con éxito:', response.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo subir el audio.');
      console.error('Error al subir el audio:', error);
    }
  };

  const startRecording = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert('Error', 'No se pudo obtener el token de usuario.');
        return;
      }

      startTimeRef.current = Date.now();
      console.log(`Grabación iniciada. Tiempo de inicio registrado: ${startTimeRef.current}`);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      setRecording(recording);
      socket.emit('start-recording', { token });
    } catch (err) {
      console.error('Error al iniciar la grabación:', err);
      Alert.alert('Error', 'No se pudo iniciar la grabación.');
      startTimeRef.current = null;
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert('Error', 'No se pudo obtener el token de usuario.');
        return;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (!startTimeRef.current) {
        console.error('Error: Tiempo de inicio no registrado.');
        Alert.alert('Error', 'Tiempo de inicio no registrado. Intente grabar nuevamente.');
        return;
      }

      const endTime = Date.now();
      const duration = (endTime - startTimeRef.current) / 1000;
      startTimeRef.current = null;

      console.log(`Duración del audio: ${duration} segundos`);

      if (!duration || duration <= 0) {
        console.error('Duración inválida:', duration);
        Alert.alert('Error', 'No se pudo calcular la duración del audio.');
        return;
      }

      await uploadAudio(uri, duration);
      socket.emit('stop-recording', { token });
    } catch (err) {
      console.error('Error al detener la grabación:', err);
    }
  };

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
            if (recording) {
              stopRecording();
            } else {
              Alert.alert('Mantén el botón presionado para grabar.');
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
    backgroundColor: '#32CD32',
    width: 250,
    height: 250,
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 5,
  },
  buttonPlaying: {
    backgroundColor: '#FFA500',
    width: 250,
    height: 250,
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 5,
  },
  buttonRecording: {
    backgroundColor: '#FFD700',
    width: 250,
    height: 250,
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 5,
  },
  buttonOtherUserRecording: {
    backgroundColor: '#FF4500',
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
