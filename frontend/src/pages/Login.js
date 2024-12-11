import React, { useState } from "react";
import api from "../api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/login", { email, password });
      const token = response.data.access_token;

      if (token) {
        localStorage.setItem("token", token); // Guardar token en localStorage
        alert("Inicio de sesión exitoso");
        window.location.href = "/dashboard"; // Redirigir al dashboard
      } else {
        throw new Error("No se recibió un token válido");
      }
    } catch (err) {
      console.error("Error al iniciar sesión", err);
      const errorMessage = err.response?.data?.msg || "Error inesperado";
      alert("Error al iniciar sesión: " + errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          Iniciar Sesión
        </h1>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 mt-2 text-gray-700 bg-gray-200 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-gray-400"
              placeholder="Ingresa tu email"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-2 text-gray-700 bg-gray-200 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-gray-400"
              placeholder="Ingresa tu contraseña"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-pink-400 rounded-lg hover:bg-pink-500 focus:outline-none focus:ring focus:ring-pink-300"
          >
            Ingresar
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="text-pink-400 hover:underline">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
