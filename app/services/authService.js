import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/config";

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login/verify/`, { email, password });


    if (!response.data.token) {
      throw new Error("Token no recibido");
    }

    // Guarda el token en AsyncStorage
    await AsyncStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    console.error("Error en la solicitud de login:", error.message);
    throw new Error(error.response?.data?.message || "Error de autenticación");
  }
};
