import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ImageBackground,
  Alert,
} from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import axios from 'axios';
import { useUserData } from '../hook/userData';
import { validateEmail, validatePassword } from '../utils/inputValidation';
import { API_URL } from '../constants/config';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const licenses = Array.from({ length: 47 }, (_, i) => ({ key: i + 1, label: `Licencia ${i + 1}` }));


export default function ProfileScreen() {
  const { userData, setUserData, error: loadError } = useUserData();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const validateInputs = () => {
    if (!userData.name) return 'Por favor, ingrese su nombre';
    if (!userData.surnames) return 'Por favor, ingrese sus apellidos';
    if (!userData.license) return 'Por favor, seleccione su licencia';
    if (!validateEmail(userData.email)) return 'Por favor, ingresa un email válido';

    if (password || confirmPassword) {
      if (!validatePassword(password)) return 'La contraseña debe tener al menos 8 caracteres';
      if (password !== confirmPassword) return 'Las contraseñas no coinciden';
    }

    return null;
  };

  const handleModifyProfile = async () => {
    setError('');

    const errorMsg = validateInputs();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      const updatedData = {
        id_user: token,
        name: userData.name,
        surnames: userData.surnames,
        email: userData.email,
        license: userData.license,
      };

      if (password) {
        updatedData.password = password;
      }

      const response = await axios.put(`${API_URL}/profile/update-profile`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setSuccess('Datos actualizados correctamente');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
    }
  };

  const handleDeleteProfile = async () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar tu perfil?',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Eliminación cancelada'),
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              // Obtén el token del almacenamiento seguro
              const token = await SecureStore.getItemAsync('token');
              if (!token) {
                Alert.alert('Error', 'No se encontró el token. Por favor, inicia sesión.');
                return;
              }

              const response = await axios.delete(`${API_URL}/profile/deleteUser`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.status === 200) {
                Alert.alert('Perfil eliminado', 'Tu perfil ha sido eliminado con éxito.');
                await SecureStore.deleteItemAsync('token');
                navigation.navigate('Login');

              } else {
                Alert.alert('Error', 'No se pudo eliminar el perfil. Inténtalo nuevamente.');
              }
            } catch (error) {
              Alert.alert('Error', 'Ocurrió un error al intentar eliminar el perfil.');
              console.error(error);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };


  return (
    <ImageBackground source={require('../../assets/img/micro.webp')} style={styles.container} resizeMode="cover">
      <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.innerContainer}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              placeholder="Nombre"
              style={styles.input}
              value={userData.name}
              onChangeText={(text) => setUserData({ ...userData, name: text })}
            />

            <Text style={styles.label}>Apellidos</Text>
            <TextInput
              placeholder="Apellidos"
              style={styles.input}
              value={userData.surnames}
              onChangeText={(text) => setUserData({ ...userData, surnames: text })}
            />

            <Text style={styles.label}>Licencia</Text>
            <ModalSelector
              data={licenses}
              initValue="Seleccione su licencia"
              onChange={(option) => setUserData((prev) => ({ ...prev, license: option.key }))}
              style={styles.modalSelector}
              initValueTextStyle={styles.inputText}
              selectTextStyle={styles.inputText}
              selectedKey={userData.license || 0}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Modificar Contraseña</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputWithButton}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.buttonInsideInput}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={15}
                  color="#000"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirmar Contraseña</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputWithButton}
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.buttonInsideInput}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
               <Icon
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={15}
                  color="#000"
                />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? <Text style={styles.success}>{success}</Text> : null}

            <TouchableOpacity style={styles.updateButton} onPress={handleModifyProfile}>
              <Text style={styles.updateButtonText}>Actualizar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonDelete} onPress={handleDeleteProfile}>
              <Text style={styles.deleteButtonText}>Eliminar Mi Perfil</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  inputWithButton: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    color: '#000',
  },

  buttonInsideInput: {
    paddingHorizontal: 10,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#000',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    color: '#000',
  },
  modalSelector: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  success: {
    color: 'green',
    marginBottom: 10,
  },
  updateButton: {
    width: '70%',
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDelete: {
    width: '70%',
    backgroundColor: 'crimson',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
