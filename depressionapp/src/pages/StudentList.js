import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // Importar el Sidebar

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);  // Estado para almacenar el usuario
  const navigate = useNavigate(); // Para la navegación programática

  // Obtener los estudiantes desde la API
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/student/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data)
      setStudents(response.data);
    } catch (err) {
      alert("Error al obtener estudiantes");
    }
  };

  // Obtener los datos del usuario
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

  // Eliminar estudiante
  const handleDelete = async (boleta) => {
    if (window.confirm("¿Estás seguro de eliminar este estudiante?")) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/student/${boleta}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Estudiante eliminado");
        fetchStudents(); // Refrescar la lista
      } catch (err) {
        alert("Error al eliminar estudiante");
      }
    }
  };

  // Obtener los datos cuando el componente se monta
  useEffect(() => {
    fetchUser();  // Llamar a la función para obtener los datos del usuario
    fetchStudents();  // Obtener los estudiantes
  }, []);

  // Filtrar estudiantes según la búsqueda
  const filteredStudents = students.filter((student) =>
    student.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar, pasamos el usuario como prop */}
      <Sidebar user={user} />

      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Lista de Estudiantes</h1>

        {/* Barra de búsqueda y botón en una fila */}
        <div className="flex items-center justify-between mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => navigate("/students/add")}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
          >
            Agregar Estudiante
          </button>
        </div>

        {/* Tabla de estudiantes */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-300">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">Boleta</th>
                <th className="py-3 px-4">Probabilidad de Depresión</th>
                <th className="py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.boleta} className="hover:bg-gray-100">
                    <td className="py-3 px-4">{student.nombre}</td>
                    <td className="py-3 px-4">{student.boleta}</td>
                    <td className="py-3 px-4">{student?.prob_depresion  || 0}</td>
                    <td className="py-3 px-4 flex space-x-2">
                      <button
                        onClick={() => navigate(`/students/${student.boleta}`)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => handleDelete(student.boleta)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                      <a href={`mailto:${student.email_saes}`}>
                        <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                          Contactar
                        </button>
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-3 px-4 text-center text-gray-500">
                    No se encontraron estudiantes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default StudentsList;
