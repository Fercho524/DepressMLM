import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import { useNavigate } from "react-router-dom";

const EditAccount = () => {
  const [user, setUser] = useState({
    nombre: "",
    email: "",
    sexo: "",
    password: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/account/details", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({
          nombre: response.data.nombre,
          email: response.data.email,
          sexo: response.data.sexo,
        });
      } catch (err) {
        alert("Error al obtener los detalles de la cuenta");
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    };

    fetchUserDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.put("/account/update", user, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Cuenta actualizada exitosamente");
      navigate("/account");
    } catch (err) {
      alert("Error al actualizar la cuenta");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Actualizar Cuenta</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 space-y-6"
        >
          <div>
            <label className="block text-gray-700 font-medium mb-2">Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={user.nombre}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email:</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Sexo:</label>
            <select
              name="sexo"
              value={user.sexo}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Contraseña (opcional):
            </label>
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/account")}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditAccount;
