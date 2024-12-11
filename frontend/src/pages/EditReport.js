import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar"; // Importamos la Sidebar
import "../App.css";

const EditReport = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [user, setUser] = useState(null); // Para el Sidebar
    const [formData, setFormData] = useState({
        id_usuario_psicologo: "",
        id_estudiante: "",
        texto_reporte: "",
        num_publicaciones: "",
        perfil_facebook: "",
        prob_depresion: "",
        fecha_reporte: "",
        nivel_severidad: "",
        hora_reporte: "",
        nota_psicologo: "",
    });

    const handleCancel = () => {
        // Redirige a la lista de reportes sin realizar ninguna acción de actualización
        console.log(formData)
        navigate(`/reports/${formData.id}`);
    };

    // Fetch del reporte
    const fetchReport = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get(`/report/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReport(response.data);
            setFormData(response.data); // Inicializamos el formulario con los datos actuales del reporte
        } catch (err) {
            console.error("Error al obtener el reporte:", err);
            alert("No se pudo cargar el reporte.");
        }
    };

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/user/id", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data);
        } catch (err) {
            console.error("Error al obtener información del usuario:", err);
            alert("Error al obtener información del usuario. Inicia sesión nuevamente.");
            localStorage.removeItem("token");
            window.location.href = "/";
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Validar el campo prob_depresion
        if (name === "prob_depresion") {
            const parsedValue = parseFloat(value);
            if (parsedValue < 0 || parsedValue > 100) {
                return; // Evita que se registre un valor fuera del rango
            }
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación para prob_depresion (asegurarse de que esté entre 0 y 100)
        if (formData.prob_depresion < 0 || formData.prob_depresion > 100) {
            alert("La probabilidad de depresión debe estar entre 0 y 100.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await api.put(`/report/${reportId}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Reporte actualizado con éxito.");
            // Redirige a la ruta correcta basada en `id_estudiante`
            navigate(`/reports/${formData.id}`);
        } catch (err) {
            console.error("Error al actualizar el reporte:", err);
            alert("No se pudo actualizar el reporte.");
        }
    };

    useEffect(() => {
        fetchReport();
        fetchUser();
    }, [reportId]);

    if (!report || !user) return <p>Cargando...</p>;

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="sticky top-0 h-screen">
                <Sidebar user={user} />
            </div>

            <main className="flex-1 p-8 overflow-y-auto">
                <h1 className="text-4xl font-bold text-gray-800 mb-6">Editar Reporte</h1>
                <form
                    className="bg-white rounded-lg shadow-md p-6 border border-gray-300"
                    onSubmit={handleSubmit}
                >
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {/* Perfil de Facebook */}
                        <div className="flex flex-col">
                            <label htmlFor="perfil_facebook" className="text-gray-700 font-medium mb-2">
                                Perfil de Facebook
                            </label>
                            <input
                                type="text"
                                id="perfil_facebook"
                                name="perfil_facebook"
                                value={formData.perfil_facebook || ""}
                                onChange={handleChange}
                                className="p-2 border rounded-md"
                            />
                        </div>

                        {/* Número de Publicaciones */}
                        <div className="flex flex-col">
                            <label htmlFor="num_publicaciones" className="text-gray-700 font-medium mb-2">
                                Número de Publicaciones
                            </label>
                            <input
                                type="number"
                                id="num_publicaciones"
                                name="num_publicaciones"
                                value={formData.num_publicaciones || ""}
                                onChange={handleChange}
                                className="p-2 border rounded-md"
                            />
                        </div>

                        {/* Probabilidad de Depresión */}
                        <div className="flex flex-col">
                            <label htmlFor="prob_depresion" className="text-gray-700 font-medium mb-2">
                                Probabilidad de Depresión
                            </label>
                            <input
                                type="number"
                                id="prob_depresion"
                                name="prob_depresion"
                                value={formData.prob_depresion || ""}
                                onChange={handleChange}
                                className="p-2 border rounded-md"
                                min="0"
                                max="100"
                                step="0.1"
                            />
                        </div>
                    </div>

                    {/* Nota del Psicólogo */}
                    <div className="flex flex-col mb-6">
                        <label htmlFor="nota_psicologo" className="text-gray-700 font-medium mb-2">
                            Nota del Psicólogo
                        </label>
                        <textarea
                            id="nota_psicologo"
                            name="nota_psicologo"
                            value={formData.nota_psicologo || ""}
                            onChange={handleChange}
                            className="p-2 border rounded-md"
                            rows="4"
                        />
                    </div>

                    <div className="mt-6 flex space-x-4">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Guardar Cambios
                        </button>
                        <button
                            type="button"  // Cambiar de 'submit' a 'button' para evitar que se dispare el submit
                            onClick={handleCancel}
                            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default EditReport;
