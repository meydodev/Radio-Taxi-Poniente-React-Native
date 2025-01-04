import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity,ImageBackground } from 'react-native';
import { Audio } from 'expo-av';

export default function Channel1Screen() {
  const [recording, setRecording] = React.useState();
  const [recordings, setRecordings] = React.useState([]);

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
    setRecording(undefined);

    try {
      await recording.stopAndUnloadAsync();
      const { sound, status } = await recording.createNewLoadedSoundAsync();

      // Reproducir automáticamente
      await sound.playAsync();

      const newRecording = {
        sound,
        duration: getDurationFormatted(status.durationMillis),
        file: recording.getURI(),
      };
      setRecordings([...recordings, newRecording]);
    } catch (err) {
      console.error('Error stopping recording', err);
    }
  }

  function getDurationFormatted(milliseconds) {
    const minutes = Math.floor(milliseconds / 1000 / 60);
    const seconds = Math.round((milliseconds / 1000) % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  function getRecordingLines() {
    return recordings.map((recordingLine, index) => (
      <View key={index} style={styles.row}>
        <Text style={styles.fill}>
          Grabación #{index + 1} | {recordingLine.duration}
        </Text>
        <TouchableOpacity
          onPress={() => recordingLine.sound.replayAsync()}
          style={styles.playButton}
        >
          <Text style={styles.buttonText}>Reproducir</Text>
        </TouchableOpacity>
      </View>
    ));
  }

  return (
    <ImageBackground source={require('../../assets/img/background-home.webp')} style={styles.container}
    resizeMode='cover'>
    <View style={styles.container}>
      <TouchableOpacity
        style={recording ? styles.buttonRecording : styles.button}
        onPressIn={startRecording}
        onPressOut={stopRecording}
      >
        <Text style={styles.buttonText}>
          {recording ? 'Grabando...' : 'Hablar'}
        </Text>
      </TouchableOpacity>
      <View style={styles.recordingList}>{getRecordingLines()}</View>
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
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    elevation: 5, // Sombras en Android
    shadowColor: '#000', // Sombras en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonRecording: {
    backgroundColor: '#FF4136',
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    width: '100%',
  },
  fill: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  playButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
  },
  recordingList: {
    width: '100%',
    marginTop: 20,
  },
});
