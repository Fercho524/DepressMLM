import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom"; // Cambio aquí, usamos useNavigate en lugar de useHistory

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [sexo, setSexo] = useState("");
  const [rol_id, setRolId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate(); // Usamos useNavigate para redirigir

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/register", {
        email,
        password,
        nombre,
        sexo,
        rol_id
      });
      
      alert(response.data.msg);
      navigate("/"); // Usamos navigate para redirigir al login después del registro exitoso
    } catch (err) {
      console.error("Error al registrar", err);
      const errorMessage = err.response?.data?.msg || "Error inesperado";
      setErrorMessage(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-center text-gray-800">Registrarse</h1>
        
        {errorMessage && (
          <div className="bg-red-100 text-red-500 p-4 mb-4 rounded-lg">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre:
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-4 py-2 mt-2 text-gray-700 bg-gray-200 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-gray-400"
              placeholder="Ingresa tu nombre"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
          <div className="mb-4">
            <label htmlFor="sexo" className="block text-sm font-medium text-gray-700">
              Sexo:
            </label>
            <select
              id="sexo"
              value={sexo}
              onChange={(e) => setSexo(e.target.value)}
              required
              className="w-full px-4 py-2 mt-2 text-gray-700 bg-gray-200 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-gray-400"
            >
              <option value="">Selecciona tu sexo</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="-">Otro</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="rol_id" className="block text-sm font-medium text-gray-700">
              Rol:
            </label>
            <select
              id="rol_id"
              value={rol_id}
              onChange={(e) => setRolId(e.target.value)}
              required
              className="w-full px-4 py-2 mt-2 text-gray-700 bg-gray-200 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-gray-400"
            >
              <option value="">Selecciona un rol</option>
              <option value="1">Administrador</option>
              <option value="2">Psicólogo</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-pink-400 rounded-lg hover:bg-pink-500 focus:outline-none focus:ring focus:ring-pink-300"
          >
            Registrar
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <a href="/" className="text-pink-400 hover:underline">
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
