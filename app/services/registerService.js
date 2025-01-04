import axios from 'axios';
import { API_URL } from '../constants/config';

export const registerService = async (name, surnames, license, email, keyAccess, password) => {
  try {
    const response = await axios.post(`${API_URL}/register/new-user`, {
      name,
      surnames,
      license,
      email,
      keyAccess,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud de registro:', error.message);
    throw new Error(error.response?.data?.message || 'Error en el registro');
  }
};
