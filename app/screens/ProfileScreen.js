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
} from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import axios from 'axios';
import { useUserData } from '../hook/userData';
import { validateEmail, validatePassword } from '../utils/inputValidation';
import { API_URL } from '../constants/config';
import * as SecureStore from 'expo-secure-store';

const licenses = Array.from({ length: 47 }, (_, i) => ({ key: i + 1, label: `Licencia ${i + 1}` }));

export default function ProfileScreen() {
  const { userData, setUserData, error: loadError } = useUserData();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [password, setPassword] = useState('');

  // Función para manejar la actualización del perfil
  const handleModifyProfile = async () => {
    console.log('Botón presionado: Actualizar');
    setError('');

    // Validación de entradas
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

    const errorMsg = validateInputs();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    try {
      // Obtener el token del almacenamiento seguro
      const token = await SecureStore.getItemAsync('token');
      //console.log('Token:', token);
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      // Crear el cuerpo de la solicitud
      const updatedData = {
        id_user: token,
        name: userData.name,
        surnames: userData.surnames,
        email: userData.email,
        license: userData.license,
      };
      //console.log('Datos actualizados:', updatedData);

      if (password) {
        updatedData.password = password;
      }

      //console.log('Datos enviados al backend:', updatedData);

      // Llamar al endpoint del backend
      const response = await axios.put(`${API_URL}/profile/update-profile`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      //console.log('Perfil actualizado correctamente:', response.data);
      setError('');
      setSuccess('Datos actualizados correctamente');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error al actualizar el perfil:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
    }
  };

  if (loadError) {
    return <Text>Error cargando los datos del usuario</Text>;
  }

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
              keyboardType="default"
            />

            <Text style={styles.label}>Apellidos</Text>
            <TextInput
              placeholder="Apellidos"
              style={styles.input}
              value={userData.surnames}
              onChangeText={(text) => setUserData({ ...userData, surnames: text })}
              keyboardType="default"
            />

            <Text style={styles.label}>Licencia</Text>
            <ModalSelector
              data={licenses}
              initValue="Seleccione su licencia"
              onChange={(option) => {
                if (option?.key) {
                  console.log('Licencia seleccionada:', option.key); // Verifica el valor seleccionado
                  setUserData((prev) => ({
                    ...prev,
                    license: option.key, 
                  }));
                } else {
                  console.warn('Selección de licencia inválida:', option);
                }
              }}
              style={styles.modalSelector}
              initValueTextStyle={styles.inputText}
              selectTextStyle={styles.inputText}
              selectedKey={userData.license || 0} // Muestra 0 si no hay licencia seleccionada
            />


            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#ccc"
            />

            <Text style={styles.label}>Modificar Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#ccc"
            />

            <Text style={styles.label}>Confirmar Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholderTextColor="#ccc"
            />

            <Text style={styles.error}>{error}</Text>
            <Text style={styles.success}>{success}</Text>

            <TouchableOpacity style={styles.registerButton} onPress={handleModifyProfile}>
              <Text style={styles.registerButtonText}>Actualizar</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
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
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  success: {
    color: 'green',
    marginBottom: 10,
  },
  registerButton: {
    width: '70%',
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
    color: '#000',
  },
  signupButtonText: {
    fontSize: 14,
    color: '#0022f5',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
