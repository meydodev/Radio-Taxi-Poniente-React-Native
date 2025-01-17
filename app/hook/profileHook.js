import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getDataUser } from '../services/profileService';


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

        // Llama al servicio para obtener los datos del usuario
        const user = await getDataUser(id_user);

        // Actualiza el estado con los datos obtenidos
        setUserData((prevState) => ({
          ...prevState,
          ...user,
        }));
      } catch (err) {
        console.error('Error cargando los datos del usuario:', err);
        setError(err.message || 'Error inesperado');
      }
    };

    loadUserData();
  }, []);

  return { userData, setUserData, error };
};
