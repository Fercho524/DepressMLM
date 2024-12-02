import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import { useNavigate } from "react-router-dom";  // Para la navegación

const AddStudent = () => {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState({
    nombre: "",
    boleta: "",
    email_saes: "",
    prob_depresion: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();  // Navegación programática

  // Fetch user data (similar a Dashboard)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/user/id", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        console.error("Error al obtener información del usuario", err);
        alert("Error al obtener información del usuario. Inicia sesión nuevamente.");
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await api.post("/student", student, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Estudiante agregado exitosamente.");
      navigate("/students");  // Redirigir a la lista de estudiantes después de agregar
    } catch (err) {
      console.error("Error al agregar estudiante", err);
      alert("Error al agregar estudiante");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Cargando...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={user} />
      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Agregar Estudiante</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={student.nombre}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="boleta" className="block text-sm font-medium text-gray-700">
              Boleta
            </label>
            <input
              id="boleta"
              name="boleta"
              type="text"
              value={student.boleta}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email_saes" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email_saes"
              name="email_saes"
              type="email"
              value={student.email_saes}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="prob_depresion" className="block text-sm font-medium text-gray-700">
              Probabilidad de Depresión
            </label>
            <input
              id="prob_depresion"
              name="prob_depresion"
              type="number"
              value={student.prob_depresion}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="De 0 a 100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            {loading ? "Cargando..." : "Agregar Estudiante"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddStudent;
