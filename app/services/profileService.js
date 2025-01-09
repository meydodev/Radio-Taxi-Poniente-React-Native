import axios from 'axios';
import { API_URL } from '../constants/config';


export const updateUserProfile = async (updatedData) => {
  try {
    console.log('Llamando a updateUserProfile...');
    const response = await axios.put(`${API_URL}/profile/update-profile`, updatedData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    throw error.response?.data || { message: 'Error al actualizar el perfil' };
  }
};


