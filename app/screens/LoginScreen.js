import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ImageBackground,
} from 'react-native';
import { login } from '../services/authService';
import { useNavigation } from '@react-navigation/native';

import { validateEmail, validatePassword } from '../utils/inputValidation';
import * as SecureStore from 'expo-secure-store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Importa la biblioteca de iconos

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para alternar visibilidad de la contraseña
  const navigation = useNavigation();
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    try {
      if (!validateEmail(email)) {
        setError('Por favor, ingresa un email válido');
        return;
      }

      if (!validatePassword(password)) {
        setError('La contraseña debe tener al menos 8 caracteres');
        return;
      }

      const response = await login(email, password);

      if (response?.token) {
        await SecureStore.setItemAsync('token', response.token);
        navigation.navigate('Tabs');
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (error) {
      setError(error.message || 'No se pudo iniciar sesión');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/img/micro.webp')}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.innerContainer}>
            <Image
              source={require('../../assets/img/logo-radio-taxi-poniente.jpeg')}
              style={styles.logo}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#ccc"
            />
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputWithButton}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword} // Alterna la visibilidad
                placeholderTextColor="#ccc"
              />
              <TouchableOpacity
                style={styles.buttonInsideInput}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon
                  name={showPassword ? 'eye-off' : 'eye'} // Cambia entre "ojo" y "ojo tachado"
                  size={15}
                  color="#000"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.error}>{error}</Text>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Entrar</Text>
            </TouchableOpacity>
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>¿No tienes cuenta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signupButtonText}>Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  innerContainer: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  loginButton: {
    width: '70%',
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
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
