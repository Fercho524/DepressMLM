import os
import json
import requests
import customtkinter as ctk
import tkinter as tk
from tkinter import messagebox

import logging

# Configuración del logger
logging.basicConfig(
    level=logging.DEBUG,  # Nivel de detalle de los logs
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),  # Guardar en archivo
        logging.StreamHandler()  # Mostrar en consola
    ]
)

# Ruta para almacenar el token
TOKEN_PATH = os.path.expanduser("/home/fercho/token.json")
FONT = ("Cantarell", 16)
user_data_global = None


# Crear directorio si no existe
os.makedirs(os.path.dirname(TOKEN_PATH), exist_ok=True)

# Función para verificar el token al iniciar la aplicación
def check_token():
    global user_data_global
    if os.path.exists(TOKEN_PATH):
        with open(TOKEN_PATH, "r") as f:
            data = json.load(f)
            token = data.get("access_token")

            if token:
                try:
                    logging.info("Intentando obtener detalles del usuario con el token.")
                    response = requests.get("http://127.0.0.1:5000/account/details", headers={"Authorization": f"Bearer {token}"})
                    if response.status_code == 200:
                        user_data_global = response.json()
                        logging.info("Detalles del usuario obtenidos exitosamente.")
                        show_dashboard(user_data_global)
                        return
                    else:
                        logging.warning(f"Token inválido o caducado: {response.status_code}. Mostrando pantalla de login.")
                except requests.exceptions.RequestException as e:
                    logging.error(f"Error al conectarse al servidor: {e}")
    logging.info("No se encontró un token válido. Mostrando pantalla de login.")
    show_login()



# Función para iniciar sesión
def login():
    email = email_entry.get()
    password = password_entry.get()

    if not email or not password:
        messagebox.showerror("Error", "Por favor ingresa todos los campos.")
        return

    url = "http://127.0.0.1:5000/login"
    data = {"email": email, "password": password}

    try:
        response = requests.post(url, json=data)

        if response.status_code == 200:
            response_data = response.json()
            token = response_data.get("access_token")

            if token:
                with open(TOKEN_PATH, "w") as f:
                    json.dump({"access_token": token}, f)

                messagebox.showinfo("Éxito", "Inicio de sesión exitoso.")
                
                response = requests.get("http://127.0.0.1:5000/account/details", headers={"Authorization": f"Bearer {token}"})
                if response.status_code == 200:
                    user_data = response.json()
                    show_dashboard(user_data)
                else:
                    messagebox.showerror("Error", "No se pudieron obtener los detalles del usuario.")
            else:
                messagebox.showerror("Error", "No se recibió un token.")
        else:
            messagebox.showerror("Error", "Credenciales incorrectas.")
    except requests.exceptions.RequestException as e:
        messagebox.showerror("Error de conexión", f"No se pudo conectar al servidor. Detalles: {e}")

# Función para mostrar el dashboard
def show_dashboard(user_data):
    # Limpiar la ventana principal
    for widget in root.winfo_children():
        widget.destroy()

    # Mostrar los detalles del usuario
    user_info = f"""
    Nombre: {user_data['nombre']}
    Correo Electrónico: {user_data['email']}
    ID: {user_data['id']}
    Rol: {user_data['rol']}
    Sexo: {user_data['sexo']}
    """
    ctk.CTkLabel(root, text=user_info, font=(FONT[0], 14), justify="left").pack(pady=20)

    # Botón para ver estudiantes
    students_button = ctk.CTkButton(root, text="Ver Estudiantes", command=show_students, width=200, height=40)
    students_button.pack(pady=10)

    logout_button = ctk.CTkButton(root, text="Cerrar sesión", command=logout, width=200, height=40)
    logout_button.pack(pady=20)


# Función para mostrar la lista de estudiantes




def show_student_details(student_id):
    global user_data_global

    # Obtener el token
    if not os.path.exists(TOKEN_PATH):
        logging.warning("No se encontró el archivo de token al intentar ver detalles de un estudiante.")
        messagebox.showerror("Error", "No se encontró un token válido.")
        show_dashboard(user_data_global)
        return

    with open(TOKEN_PATH, "r") as f:
        token = json.load(f).get("access_token")

    if not token:
        logging.error("El token está vacío o no es válido al intentar ver detalles de un estudiante.")
        messagebox.showerror("Error", "El token no es válido.")
        show_dashboard(user_data_global)
        return

    try:
        logging.info(f"Solicitando detalles del estudiante con ID {student_id}.")
        response = requests.get(f"http://127.0.0.1:5000/student/{student_id}", headers={"Authorization": f"Bearer {token}"})
        if response.status_code == 200:
            student_data = response.json()
            logging.info(f"Detalles del estudiante {student_id} obtenidos exitosamente.")

            # Limpiar la ventana principal
            for widget in root.winfo_children():
                widget.destroy()

            # Mostrar los detalles del estudiante
            ctk.CTkLabel(root, text=f"Detalles de {student_data['nombre']}", font=(FONT[0], 20)).pack(pady=20)

            details = f"""
            Nombre: {student_data['nombre']}
            Boleta: {student_data['boleta']}
            Email: {student_data['email_saes']}
            Facebook: {student_data['perfil_facebook_actual']}
            Probabilidad de Depresión: {student_data['prob_depresion'] * 100:.2f}%
            """
            ctk.CTkLabel(root, text=details, font=(FONT[0], 14), justify="left").pack(pady=10)

            # Botones de acción
            ctk.CTkButton(root, text="Eliminar Estudiante", command=lambda: delete_student(student_data["boleta"]), width=200, height=40).pack(pady=10)
            ctk.CTkButton(root, text="Actualizar Datos", command=lambda: update_student(student_data), width=200, height=40).pack(pady=10)
            ctk.CTkButton(root, text="Generar Reporte", command=lambda: generate_report(student_data), width=200, height=40).pack(pady=10)
            ctk.CTkButton(root, text="Ver Todos los Reportes", command=lambda: view_reports(student_data["boleta"]), width=200, height=40).pack(pady=10)
            ctk.CTkButton(root, text="Eliminar Reportes", command=lambda: delete_reports(student_data["boleta"]), width=200, height=40).pack(pady=10)

            # Botón para regresar a la lista de estudiantes
            ctk.CTkButton(root, text="Volver a Lista de Estudiantes", command=show_students, width=200, height=40).pack(pady=20)
        else:
            logging.error(f"Error al obtener los detalles del estudiante: {response.status_code}")
            messagebox.showerror("Error", "No se pudieron obtener los detalles del estudiante.")
            show_students()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error de conexión al obtener detalles del estudiante: {e}")
        messagebox.showerror("Error de conexión", f"No se pudo conectar al servidor. Detalles: {e}")
        show_students()




# Función para mostrar la pantalla de detalles de estudiante
def show_student_detail_screen(student_data):
    for widget in root.winfo_children():
        widget.destroy()

    student_info = f"""
    Nombre: {student_data['nombre']}
    Boleta: {student_data['boleta']}
    Email: {student_data['email_saes']}
    Perfil de Facebook: {student_data['perfil_facebook_actual']}
    Probabilidad de Depresión: {student_data['prob_depresion']}
    """

    ctk.CTkLabel(root, text=student_info, font=(FONT[0], 14), justify="left").pack(pady=20)

    delete_button = ctk.CTkButton(root, text="Eliminar Estudiante", command=lambda: delete_student(student_data['boleta']), width=200, height=40)
    delete_button.pack(pady=10)

    update_button = ctk.CTkButton(root, text="Actualizar Datos", command=lambda: show_update_student_screen(student_data), width=200, height=40)
    update_button.pack(pady=10)

    generate_report_button = ctk.CTkButton(root, text="Generar Reporte", command=lambda: generate_report(student_data['boleta'], student_data['perfil_facebook_actual']), width=200, height=40)
    generate_report_button.pack(pady=10)

    view_reports_button = ctk.CTkButton(root, text="Ver Reportes", command=lambda: view_reports(student_data['boleta']), width=200, height=40)
    view_reports_button.pack(pady=10)

    delete_reports_button = ctk.CTkButton(root, text="Eliminar Reportes", command=lambda: delete_reports(student_data['boleta']), width=200, height=40)
    delete_reports_button.pack(pady=10)

# Función para eliminar un estudiante
def delete_student(student_id):
    if not os.path.exists(TOKEN_PATH):
        logging.warning("No se encontró el archivo de token al intentar eliminar un estudiante.")
        messagebox.showerror("Error", "No se encontró un token válido.")
        return

    with open(TOKEN_PATH, "r") as f:
        token = json.load(f).get("access_token")

    if not token:
        logging.error("El token está vacío o no es válido al intentar eliminar un estudiante.")
        messagebox.showerror("Error", "El token no es válido.")
        return

    try:
        logging.info(f"Intentando eliminar al estudiante con ID {student_id}.")
        response = requests.delete(f"http://127.0.0.1:5000/student/{student_id}", headers={"Authorization": f"Bearer {token}"})
        if response.status_code == 200:
            logging.info("Estudiante eliminado con éxito.")
            messagebox.showinfo("Éxito", "Estudiante eliminado con éxito.")
            show_students()
        else:
            logging.error(f"Error al eliminar estudiante: {response.status_code}")
            messagebox.showerror("Error", "No se pudo eliminar al estudiante.")
    except requests.exceptions.RequestException as e:
        logging.error(f"Error de conexión al eliminar estudiante: {e}")
        messagebox.showerror("Error de conexión", f"No se pudo conectar al servidor. Detalles: {e}")



# Función para mostrar la pantalla de actualización de datos
def show_update_student_screen(student_data):
    for widget in root.winfo_children():
        widget.destroy()

    ctk.CTkLabel(root, text="Actualizar Datos del Estudiante", font=(FONT[0], 18)).pack(pady=20)

    # Entradas para actualizar datos
    new_name_entry = ctk.CTkEntry(root, placeholder_text="Nuevo nombre", width=300, height=40)
    new_name_entry.insert(0, student_data['nombre'])
    new_name_entry.pack(pady=10)

    new_boleta_entry = ctk.CTkEntry(root, placeholder_text="Nueva boleta", width=300, height=40)
    new_boleta_entry.insert(0, student_data['boleta'])
    new_boleta_entry.pack(pady=10)

    update_button = ctk.CTkButton(root, text="Actualizar", command=lambda: update_student(student_data['boleta'], new_boleta_entry.get(), new_name_entry.get()), width=200, height=40)
    update_button.pack(pady=20)

#
def update_student(student_data):
    # Limpiar ventana principal
    for widget in root.winfo_children():
        widget.destroy()

    ctk.CTkLabel(root, text="Actualizar Datos del Estudiante", font=(FONT[0], 20)).pack(pady=20)

    # Crear entradas para datos
    boleta_var = ctk.StringVar(value=str(student_data["boleta"]))
    name_var = ctk.StringVar(value=student_data["nombre"])

    ctk.CTkLabel(root, text="Boleta:", font=(FONT[0], 14)).pack(pady=5)
    boleta_entry = ctk.CTkEntry(root, textvariable=boleta_var, width=200)
    boleta_entry.pack(pady=5)

    ctk.CTkLabel(root, text="Nombre:", font=(FONT[0], 14)).pack(pady=5)
    name_entry = ctk.CTkEntry(root, textvariable=name_var, width=200)
    name_entry.pack(pady=5)

    def submit_update():
        new_data = {
            "boleta": boleta_var.get(),
            "nombre": name_var.get()
        }
        send_update_request(student_data["boleta"], new_data)

    ctk.CTkButton(root, text="Actualizar", command=submit_update, width=200, height=40).pack(pady=20)
    ctk.CTkButton(root, text="Cancelar", command=lambda: show_student_details(student_data["boleta"]), width=200, height=40).pack(pady=20)


def send_update_request(student_id, new_data):
    if not os.path.exists(TOKEN_PATH):
        logging.warning("No se encontró el archivo de token al intentar actualizar un estudiante.")
        messagebox.showerror("Error", "No se encontró un token válido.")
        return

    with open(TOKEN_PATH, "r") as f:
        token = json.load(f).get("access_token")

    if not token:
        logging.error("El token está vacío o no es válido al intentar actualizar un estudiante.")
        messagebox.showerror("Error", "El token no es válido.")
        return

    try:
        logging.info(f"Actualizando estudiante {student_id} con datos {new_data}.")
        response = requests.put("http://127.0.0.1:5000/student", headers={"Authorization": f"Bearer {token}"}, json=new_data)
        if response.status_code == 200:
            logging.info("Estudiante actualizado con éxito.")
            messagebox.showinfo("Éxito", "Estudiante actualizado con éxito.")
            show_student_details(student_id)
        else:
            logging.error(f"Error al actualizar estudiante: {response.status_code}")
            messagebox.showerror("Error", "No se pudo actualizar el estudiante.")
    except requests.exceptions.RequestException as e:
        logging.error(f"Error de conexión al actualizar estudiante: {e}")
        messagebox.showerror("Error de conexión", f"No se pudo conectar al servidor. Detalles: {e}")


# Función para generar un reporte
def generate_report(student_data):
    if not os.path.exists(TOKEN_PATH):
        logging.warning("No se encontró el archivo de token al intentar generar un reporte.")
        messagebox.showerror("Error", "No se encontró un token válido.")
        return

    with open(TOKEN_PATH, "r") as f:
        token = json.load(f).get("access_token")

    if not token:
        logging.error("El token está vacío o no es válido al intentar generar un reporte.")
        messagebox.showerror("Error", "El token no es válido.")
        return

    report_data = {
        "estudiante_id": student_data["boleta"],
        "profile_link": student_data["perfil_facebook_actual"]
    }

    try:
        logging.info(f"Generando reporte para el estudiante con ID {student_data['boleta']}.")
        response = requests.post("http://127.0.0.1:5000/report", headers={"Authorization": f"Bearer {token}"}, json=report_data)
        if response.status_code == 200:
            logging.info("Reporte generado exitosamente.")
            messagebox.showinfo("Éxito", "Reporte generado exitosamente.")
        else:
            logging.error(f"Error al generar reporte: {response.status_code}")
            messagebox.showerror("Error", "No se pudo generar el reporte.")
    except requests.exceptions.RequestException as e:
        logging.error(f"Error de conexión al generar reporte: {e}")
        messagebox.showerror("Error de conexión", f"No se pudo conectar al servidor. Detalles: {e}")



def view_reports(student_id):
    if not os.path.exists(TOKEN_PATH):
        logging.warning("No se encontró el archivo de token al intentar ver reportes.")
        messagebox.showerror("Error", "No se encontró un token válido.")
        return

    with open(TOKEN_PATH, "r") as f:
        token = json.load(f).get("access_token")

    if not token:
        logging.error("El token está vacío o no es válido al intentar ver reportes.")
        messagebox.showerror("Error", "El token no es válido.")
        return

    try:
        logging.info(f"Solicitando reportes para el estudiante con ID {student_id}.")
        response = requests.get(f"http://127.0.0.1:5000/report/history?boleta={student_id}", headers={"Authorization": f"Bearer {token}"})
        if response.status_code == 200:
            reports = response.json()
            logging.info(f"Reportes del estudiante {student_id} obtenidos exitosamente.")
            
            # Limpiar la ventana principal
            for widget in root.winfo_children():
                widget.destroy()

            # Crear una nueva vista con scroll
            ctk.CTkLabel(root, text=f"Reportes del Estudiante {student_id}", font=(FONT[0], 20)).pack(pady=10)
            
            scroll_frame = ctk.CTkScrollableFrame(root, width=400, height=300)
            scroll_frame.pack(pady=10, padx=20, fill="both", expand=True)

            for report in reports:
                report_text = f"""
                Fecha: {report['fecha_reporte']}
                ID: {report['id']}
                Publicaciones: {report['num_publicaciones']}
                Texto: {report['texto_reporte']}
                """
                ctk.CTkLabel(scroll_frame, text=report_text, font=(FONT[0], 12), justify="left", anchor="w").pack(pady=5, padx=10, anchor="w")

            # Botones de navegación
            ctk.CTkButton(root, text="Volver a Detalles del Estudiante", command=lambda: show_student_details(student_id), width=200, height=40).pack(pady=10)
            ctk.CTkButton(root, text="Eliminar Todos los Reportes", command=lambda: delete_reports(student_id), width=200, height=40).pack(pady=10)
        else:
            logging.error(f"Error al obtener reportes: {response.status_code}")
            messagebox.showerror("Error", "No se pudieron obtener los reportes del estudiante.")
    except requests.exceptions.RequestException as e:
        logging.error(f"Error de conexión al obtener reportes: {e}")
        messagebox.showerror("Error de conexión", f"No se pudo conectar al servidor. Detalles: {e}")


# Función para mostrar los reportes
def show_reports_screen(reports):
    for widget in root.winfo_children():
        widget.destroy()

    ctk.CTkLabel(root, text="Historial de Reportes", font=(FONT[0], 18)).pack(pady=20)

    for report in reports:
        report_info = f"""
        Fecha: {report['fecha_reporte']}
        Texto: {report['texto_reporte']}
        Publicaciones: {report['num_publicaciones']}
        """
        ctk.CTkLabel(root, text=report_info, font=(FONT[0], 12), justify="left").pack(pady=10)

# Función para eliminar los reportes
def delete_reports(student_id):
    if not os.path.exists(TOKEN_PATH):
        logging.warning("No se encontró el archivo de token al intentar eliminar reportes.")
        messagebox.showerror("Error", "No se encontró un token válido.")
        return

    with open(TOKEN_PATH, "r") as f:
        token = json.load(f).get("access_token")

    if not token:
        logging.error("El token está vacío o no es válido al intentar eliminar reportes.")
        messagebox.showerror("Error", "El token no es válido.")
        return

    try:
        logging.info(f"Eliminando todos los reportes del estudiante con ID {student_id}.")
        response = requests.delete("http://127.0.0.1:5000/report", headers={"Authorization": f"Bearer {token}"}, json={"boleta": student_id})
        if response.status_code == 200:
            logging.info("Reportes eliminados exitosamente.")
            messagebox.showinfo("Éxito", "Todos los reportes del estudiante han sido eliminados.")
            view_reports(student_id)
        else:
            logging.error(f"Error al eliminar reportes: {response.status_code}")
            messagebox.showerror("Error", "No se pudieron eliminar los reportes.")
    except requests.exceptions.RequestException as e:
        logging.error(f"Error de conexión al eliminar reportes: {e}")
        messagebox.showerror("Error de conexión", f"No se pudo conectar al servidor. Detalles: {e}")







# Función para mostrar la lista de estudiantes
def show_students():
    global user_data_global

    # Obtener el token
    if not os.path.exists(TOKEN_PATH):
        logging.warning("No se encontró el archivo de token. Redirigiendo al dashboard.")
        messagebox.showerror("Error", "No se encontró un token válido.")
        show_dashboard(user_data_global)
        return

    with open(TOKEN_PATH, "r") as f:
        token = json.load(f).get("access_token")

    if not token:
        logging.error("El token está vacío o no es válido.")
        messagebox.showerror("Error", "El token no es válido.")
        show_dashboard(user_data_global)
        return

    # Limpiar la ventana principal
    for widget in root.winfo_children():
        widget.destroy()

    ctk.CTkLabel(root, text="Lista de Estudiantes", font=(FONT[0], 18)).pack(pady=20)

    try:
        logging.info("Solicitando lista de estudiantes al servidor.")
        response = requests.get("http://127.0.0.1:5000/student/all", headers={"Authorization": f"Bearer {token}"})
        if response.status_code == 200:
            students = response.json()
            logging.info("Lista de estudiantes obtenida exitosamente.")
            if not students:
                logging.warning("La lista de estudiantes está vacía.")
                ctk.CTkLabel(root, text="No hay estudiantes disponibles.", font=(FONT[0], 14)).pack(pady=10)
            else:
                for student in students:
                    student_button = ctk.CTkButton(
                        root,
                        text=student["nombre"],
                        command=lambda student_id=student["boleta"]: show_student_details(student_id),
                        width=300,
                        height=40
                    )
                    student_button.pack(pady=10)
        else:
            logging.error(f"Error al obtener la lista de estudiantes: {response.status_code}")
            messagebox.showerror("Error", "No se pudieron obtener los estudiantes.")
    except requests.exceptions.RequestException as e:
        logging.error(f"Error de conexión al obtener la lista de estudiantes: {e}")
        messagebox.showerror("Error de conexión", f"No se pudo conectar al servidor. Detalles: {e}")

    # Botón para regresar al dashboard
    ctk.CTkButton(root, text="Regresar al Dashboard", command=lambda: show_dashboard(user_data_global), width=200, height=40).pack(pady=20)




# Función para cerrar sesión
def logout():
    if os.path.exists(TOKEN_PATH):
        os.remove(TOKEN_PATH)
    messagebox.showinfo("Cerrar sesión", "Se cerró la sesión correctamente.")
    show_login()

# Función para mostrar la pantalla de login
def show_login():
    # Limpiar la ventana principal
    for widget in root.winfo_children():
        widget.destroy()

    # Crear un marco para centrar el contenido
    frame = ctk.CTkFrame(root)
    frame.place(relx=0.5, rely=0.5, anchor="center", relwidth=0.4, relheight=0.4)

    # Título
    title_label = ctk.CTkLabel(frame, text="Iniciar Sesión", font=(FONT[0], 24))
    title_label.grid(row=0, column=0, columnspan=2, pady=20)

    # Etiquetas y entradas
    global email_entry, password_entry

    email_label = ctk.CTkLabel(frame, text="Correo Electrónico:", font=FONT)
    email_label.grid(row=1, column=0, pady=10, sticky="w")

    email_entry = ctk.CTkEntry(frame, width=400, font=FONT, height=40)
    email_entry.grid(row=1, column=1, pady=10)

    password_label = ctk.CTkLabel(frame, text="Contraseña:", font=FONT)
    password_label.grid(row=2, column=0, pady=10, sticky="w")

    password_entry = ctk.CTkEntry(frame, width=400, font=FONT, show="*", height=40)
    password_entry.grid(row=2, column=1, pady=10)

    # Botón de inicio de sesión
    login_button = ctk.CTkButton(frame, text="Iniciar Sesión", command=login, width=200, height=40)
    login_button.grid(row=3, column=0, columnspan=2, pady=20)

# Crear la ventana principal
root = ctk.CTk()
root.title("Aplicación con Redirección")
root.geometry(f"{root.winfo_screenwidth()}x{root.winfo_screenheight()}")

# Revisar si existe un token al iniciar
check_token()

# Ejecutar la aplicación
root.mainloop()
