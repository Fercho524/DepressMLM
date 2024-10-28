from flask import Flask, request, jsonify
import os
import zipfile
import tempfile
from dataprocessor import process_zip_user_data
from modelInference import *
from datetime import datetime

# Inicializar Flask
app = Flask(__name__)

# Variables para el modelo y el transcriptor, cargados una sola vez
model_context = {
    'processor': None,
    'transcriptor': None,
    'model': None,
    'tokenizer': None
}

# Función para cargar los modelos (solo se ejecuta una vez)
def load_models_once():
    if model_context['processor'] is None or model_context['transcriptor'] is None:
        print("Cargando modelos y transcriptores...")
        model_context['processor'], model_context['transcriptor'] = load_transcriptor()
        model_context['model'], model_context['tokenizer'] = load_model()
        print("Modelos y transcriptores cargados")

# Ejecutar esta función al inicio para asegurar la carga
load_models_once()

ZIP_FOLDER = '../Usuarios'
WORK_ZIP_FOLDER = 'Working'


os.makedirs(WORK_ZIP_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_zip():
    # Obtener el nombre del archivo desde el cuerpo de la solicitud
    filename = request.json.get("filename")

    if not filename:
        return jsonify({"error": "No filename provided"}), 400

    # Construir la ruta completa del archivo ZIP
    zip_path = os.path.join(ZIP_FOLDER, filename)

    # Verificar que el archivo exista y sea un ZIP
    if not os.path.isfile(zip_path) or not filename.endswith('.zip'):
        return jsonify({"error": "Archivo no encontrado o no es un ZIP"}), 400

    # Crear una subcarpeta en WORK_ZIP_FOLDER para extraer el contenido del ZIP
    extraction_folder = os.path.join(WORK_ZIP_FOLDER, os.path.splitext(filename)[0])
    os.makedirs(extraction_folder, exist_ok=True)

    # Intentar extraer el archivo ZIP en la subcarpeta
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extraction_folder)
    except zipfile.BadZipFile:
        return jsonify({"error": "Archivo ZIP inválido"}), 400

    # Procesar los datos con el modelo de IA
    try:
        response = process_zip_user_data(
            zip_path,
            extraction_folder,
            model_context['model'],
            model_context['tokenizer'],
            model_context['processor'],
            model_context['transcriptor']
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"response": response}), 200


# Ruta de prueba
@app.route('/')
def index():
    return "API for processing user data with AI is running"

if __name__ == '__main__':
    app.run(debug=False,host="0.0.0.0", port=5000)
