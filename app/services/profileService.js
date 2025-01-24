import axios from 'axios';
import { API_URL } from '../constants/config';
import * as SecureStore from 'expo-secure-store';

export const updateUserProfile = async (updatedData) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (!token) {
      throw { message: 'No se encontró el token de autenticación' };
    }

    
    const response = await axios.put(
      `${API_URL}/profile/update-profile`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data; // Devuelve los datos del servidor
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    throw error.response?.data || { message: 'Error al actualizar el perfil' };
  }
};


export const getDataUser = async (id_user) => {
  try {
    const response = await axios.get(`${API_URL}/profile/getDataUser`, {
      params: { id_user },
    });
    return response.data.user;
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error);
    throw error.response?.data || { message: 'Error al obtener los datos del usuario' }
  }
};


export const deleteUser = async (token) => {
  try {
    const response = await axios.delete(`${API_URL}/profile/deleteUser`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response; // Devuelve el objeto completo para usar response.status
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    throw error.response?.data || { message: 'Error al eliminar el usuario' };
  }
};



