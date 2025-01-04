import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { login } from '../services/authService';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // Para el fondo degradado
import { validateEmail, validatePassword } from '../utils/inputValidation';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError(''); // Limpia los errores previos

    try {
      // Validación del email
      if (!validateEmail(email)) {
        setError('Por favor, ingresa un email válido');
        return;
      }

      // Validación de la contraseña
      if (!validatePassword(password)) {
        setError('La contraseña debe tener al menos 8 caracteres');
        return;
      }

      // Llamada a la función de login
      const response = await login(email, password);

      if (response?.token) {
        // Guardar el token en almacenamiento seguro
        await SecureStore.setItemAsync('token', response.token);

        // Navegar a la pantalla principal
        navigation.navigate('Home');
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (error) {
      // Manejo de errores
      setError(error.message || 'No se pudo iniciar sesión');
    }
  };

  return (
    <LinearGradient
      colors={['#0022f5', '#fff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Image 
          source={require('../../assets/img/logo-radio-taxi-poniente.jpeg')} 
          style={styles.logo} 
        />
        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#ccc"
        />
        {/* Password Input */}
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#ccc"
        />
        <Text style={styles.error}>
          {error}
        </Text>
        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>
        {/* Signup Section */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>¿No tienes cuenta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupButtonText}>Registrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 200,
    height: 200,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  error: {
    color: 'red',
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#000',
  },
  loginButton: {
    width: '50%',
    backgroundColor: '#0022f5',
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
