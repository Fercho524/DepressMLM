Incluye además algunos botones que hagan las siguientes funciones

- Eliminar estudiante : DELETE : http://127.0.0.1:5000/student/2021630210
    - Devuelve : {
    	"msg": "Estudiante eliminado con éxito"
    }

- Actualizar datos (envía a una pantalla para acutualizar los datos) http://127.0.0.1:5000/student
    - Requiere : {
	"boleta" : 2021630211,
	"nombre" : "Anne Boonchuy"
    } Otros datos también
    - Devuelve : {
    	"msg": "Estudiante actualizado con éxito"
    }


- Generar reporte : POST http://127.0.0.1:5000/report
    - Requiere:
    {
    "estudiante_id": 2021630215,
        "profile_link": "https://www.facebook.com/itziar.dom"
    }
    - Devuelve : {
	"data": "Texto",
	"msg": "Reporte añadido exitosamente"
    }

- View all reports : GET http://127.0.0.1:5000/report/history?boleta=2021630215
    - Devuelve
    [
	{
		"fecha_reporte": "Thu, 31 Oct 2024 00:00:00 GMT",
		"id": 30,
		"num_publicaciones": 0,
		"texto_reporte": "Texto"
	} ]

- Delte report : DELETE http://127.0.0.1:5000/report 
    - Requiere : {
	"boleta" : 2021630216
    }
    - Devuelve : {
	"msg": "Reportes del estudiante eliminados con éxito"
    }