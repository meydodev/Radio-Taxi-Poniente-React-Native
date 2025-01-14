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
import { useNavigation } from '@react-navigation/native';
import { validateEmail, validatePassword } from '../utils/inputValidation';
import { registerService } from '../services/registerService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Importa la biblioteca de iconos

const licenses = Array.from({ length: 47 }, (_, i) => ({ key: i + 1, label: `Licencia ${i + 1}` }));

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [surnames, setSurnames] = useState('');
  const [license, setLicense] = useState('');
  const [email, setEmail] = useState('');
  const [keyAccess, setKeyAccess] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para alternar visibilidad de la contraseña
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Estado para alternar visibilidad de la confirmación
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const handleRegister = async () => {
    setError('');

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
      await registerService(name, surnames, license, email, keyAccess, password);
      navigation.navigate('Login');
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'No se pudo completar el registro';
      setError(errorMessage);
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
            <ModalSelector
              data={licenses}
              initValue="Seleccione su licencia"
              onChange={(option) => setLicense(option.key)} // Usa 'key' para obtener el valor real
              style={styles.modalSelector}
              initValueTextStyle={styles.inputText}
              selectTextStyle={styles.inputText}
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
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputWithButton}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#ccc"
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
                placeholderTextColor="#ccc"
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
    justifyContent: 'center',
    alignItems: 'center',
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
