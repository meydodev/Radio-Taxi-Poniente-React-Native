import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SelectDropdown from 'react-native-select-dropdown';
import { useNavigation } from '@react-navigation/native';
import { validateEmail, validatePassword } from '../utils/inputValidation';
import { registerService } from '../services/registerService';

const licenses = Array.from({ length: 47 }, (_, i) => `Licencia ${i + 1}`);

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [surnames, setSurnames] = useState('');
  const [license, setLicense] = useState('');
  const [email, setEmail] = useState('');
  const [keyAccess, setKeyAccess] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const handleRegister = async () => {
    setError(''); // Limpia el error previo

    // Validaciones
    const validateInputs = () => {
      if (!name) return 'Por favor, ingrese su nombre';
      if (!surnames) return 'Por favor, ingrese sus apellidos';
      if (!license) return 'Por favor, seleccione su licencia';
      if (!keyAccess) return 'Por favor, ingresa la clave de acceso';
      if (!validateEmail(email)) return 'Por favor, ingresa un email válido';
      if (!validatePassword(password)) return 'La contraseña debe tener al menos 8 caracteres';
      if (password !== confirmPassword) return 'Las contraseñas no coinciden';
      return null;
    };

    const errorMsg = validateInputs();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    try {
      // Llamada al servicio de registro
      await registerService(name, surnames, license, email, keyAccess, password);
      navigation.navigate('Login');
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'No se pudo completar el registro';
      setError(errorMessage);
    }
  };

  return (
    <LinearGradient
      colors={['#0022f5', '#fff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <Text style={styles.title}>Regístrate</Text>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          placeholder="Nombre"
          style={styles.input}
          value={name}
          onChangeText={setName}
          keyboardType="default"
        />

        <Text style={styles.label}>Apellidos</Text>
        <TextInput
          placeholder="Apellidos"
          style={styles.input}
          value={surnames}
          onChangeText={setSurnames}
          keyboardType="default"
        />

        <Text style={styles.label}>Licencia</Text>
        <SelectDropdown
          data={licenses}
          onSelect={(selectedItem) => setLicense(selectedItem)}
          defaultButtonText="Seleccione su licencia"
          buttonStyle={styles.dropdownButtonStyle}
          buttonTextStyle={styles.dropdownButtonTxtStyle}
        />

        <Text style={styles.label}>Clave</Text>
        <TextInput
          placeholder="Clave"
          style={styles.input}
          value={keyAccess}
          onChangeText={setKeyAccess}
          keyboardType="default"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#ccc"
        />

        <Text style={styles.label}>Contraseña</Text>
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

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Registrarse</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signupButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Los estilos son los mismos que el original
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  innerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginHorizontal: 10,
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
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#000',
  },
  dropdownButtonStyle: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    height: 50,
    justifyContent: 'center',
    marginBottom: 20,
  },
  dropdownButtonTxtStyle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  registerButton: {
    width: '50%',
    backgroundColor: '#0022f5',
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
