import axios from "axios";

const API_URL = "http://localhost:5000/"

// Cambia la URL base a la de tu servidor Flask
const api = axios.create({
  baseURL: API_URL, // Asegúrate de que esta URL coincida con la de tu 
  withCredentials: true,
});

export default api;

// Preview de texto
// Feedback psicólogo para interfaz