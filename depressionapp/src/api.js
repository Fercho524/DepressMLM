import axios from "axios";

// Cambia la URL base a la de tu servidor Flask
const api = axios.create({
  baseURL: "http://192.168.100.10:5000/", // Asegúrate de que esta URL coincida con la de tu 
  withCredentials: true,
});

export default api;
