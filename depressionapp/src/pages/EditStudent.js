import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar"; // Importamos el Sidebar

const EditStudent = () => {
  const { boleta } = useParams(); // Obtener boleta de la URL
  const navigate = useNavigate(); // Para redirigir a otra página
  const [student, setStudent] = useState({
    nombre: "",
    email_saes: "",
    perfil_facebook_actual: "",
    prob_depresion: "",
  });
  const [user, setUser] = useState(null);  // Para almacenar el usuario

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/student/${boleta}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(response.data);
      } catch (err) {
        alert("Error al obtener los datos del estudiante");
      }
    };

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/user/id", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);  // Guardar el usuario
      } catch (err) {
        console.error("Error al obtener información del usuario", err);
        alert("Error al obtener información del usuario. Inicia sesión nuevamente.");
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    };

    fetchStudent();
    fetchUser();
  }, [boleta]);

  // Manejar el cambio en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Enviar los cambios al servidor
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.put(`/student`, student, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Estudiante actualizado con éxito");
      navigate(`/students/${boleta}`); // Redirigir a los detalles del estudiante
    } catch (err) {
      alert("Error al actualizar los datos del estudiante");
    }
  };

  if (!student || !user) return <p>Cargando...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar, pasamos el usuario como prop */}
      <Sidebar user={user} />

      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Editar Estudiante</h1>

        {/* Formulario de edición de estudiante */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-lg font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={student.nombre}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label htmlFor="email_saes" className="block text-lg font-medium text-gray-700">Email SAES</label>
                <input
                  type="email"
                  id="email_saes"
                  name="email_saes"
                  value={student.email_saes}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label htmlFor="perfil_facebook_actual" className="block text-lg font-medium text-gray-700">Perfil de Facebook</label>
                <input
                  type="text"
                  id="perfil_facebook_actual"
                  name="perfil_facebook_actual"
                  value={student.perfil_facebook_actual}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label htmlFor="prob_depresion" className="block text-lg font-medium text-gray-700">Probabilidad de Depresión</label>
                <input
                  type="text"
                  id="prob_depresion"
                  name="prob_depresion"
                  value={student.prob_depresion}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/students/${boleta}`)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditStudent;
