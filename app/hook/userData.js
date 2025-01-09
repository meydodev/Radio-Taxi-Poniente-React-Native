import { useState, useEffect } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

export const useUserData = () => {
  const [userData, setUserData] = useState({
    name: '',
    surnames: '',
    license: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const id_user = await SecureStore.getItemAsync('token');
        if (!id_user) {
          console.log('No se encontró el token');
          return;
        }

        const response = await axios.get(`${API_URL}/profile/getDataUser`, {
          params: { id_user },
        });

        console.log('Datos cargados del backend:', response.data.user);

        // Fusionar los datos cargados con el estado actual
        setUserData((prevState) => ({
          ...prevState,
          ...response.data.user, // Solo sobrescribe las claves cargadas del backend
        }));
      } catch (err) {
        console.error('Error cargando los datos del usuario:', err);
        setError(err);
      }
    };

    loadUserData();
  }, []);

  return { userData, setUserData, error };
};
