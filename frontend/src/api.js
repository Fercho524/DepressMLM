import axios from "axios";

const API_URL = "http://192.168.100.20:5000/"

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default api;