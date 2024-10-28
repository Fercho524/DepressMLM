Considerando el siguiente código, el programa progresivamente, con cada petición ocupa cada vez más vram de la gpu, lo cual no es algo muy bueno. ¿Existe alguna forma de evitar que el programa ocupe cada vez más vram?

app.py

```python
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

```

dataprocessor.py

```python
import os
import json
import zipfile

from modelInference import *


PROMPT = "Trata de averiguar si el usuario presenta algún síntoma de depresión según sus publicaciones\n"


def decompress_zip(zip_file_path, extract_to_directory):
    with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to_directory)
        print(f"Archivo '{zip_file_path}' descomprimido en '{extract_to_directory}'.")


def process_zip_user_data(user_zip_file_path,user_data_dir,model,tokenizer,processor,transcriptor):
    # Los datos del usuario los procesa en un .zip
    if not os.path.exists(user_data_dir):
        os.mkdir(user_data_dir)

    decompress_zip(user_zip_file_path, user_data_dir)

    with open(os.path.join(user_data_dir,"user.json"),"r") as user_file:
        content = user_file.read()
        user_data = json.loads(content)
        
        print(user_data["username"])

        # Se etiquetan las imágenes
        for i in range(len(user_data["posts"])):
            if user_data["posts"][i]["image_path"] != "None":
                image_path = os.path.join(user_data_dir,user_data["posts"][i]["image_path"])

                if os.path.exists(image_path):
                    user_data["posts"][i]["image_description"] = get_caption(image_path,processor,transcriptor)
                    print(user_data["posts"][i]["image_description"])

        # Se obtiene el prompt para el modelo
        prompt = ""
        prompt+=PROMPT

        for i in range(len(user_data["posts"])):
            prompt+=f"Publicación {i+1}\n"
            prompt+=f"Texto de la publicación : {user_data['posts'][i]['text']}\n"
            
            if user_data['posts'][i]["image_description"] != "None":
                prompt+=f"Contenido de la imagen : {user_data['posts'][i]['image_description']}\n"

            prompt+="\n"

    response = inference_model(prompt,model,tokenizer)
    return response
```

modelInference.py

```python
import torch

import bitsandbytes as bnb

from PIL import Image

# Blip 2
from transformers import AutoProcessor
from transformers import Blip2ForConditionalGeneration

# Llama + Lora
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel, PeftConfig


TORCH_DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


def load_transcriptor():
    config = dict(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True,
        bnb_4bit_compute_dtype=torch.bfloat16
    )
  
    processor = AutoProcessor.from_pretrained(
        "Salesforce/blip2-opt-2.7b"
    )
    model = Blip2ForConditionalGeneration.from_pretrained(
        "Salesforce/blip2-opt-2.7b",
        device_map="auto",
        quantization_config=config
    )

    return processor,model


def get_caption(file,processor,model):
    image= Image.open(file).convert('RGB')
    inputs = processor(images=image,return_tensors="pt").to(TORCH_DEVICE, torch.float16)
    generated_ids = model.generate(**inputs, max_new_tokens=30)
    generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0].strip()
    return generated_text


def load_model(adapter_model="depresslm"):
    # No toda la culpa es del mal entrenamiento, el modelo que elegí como base está medio chafa y no puede hablar bien en español
    base_model = "llama-2-7b-chat-hf"
    adapter_model="depresslm"

    bnb_config = dict(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True,
        bnb_4bit_compute_dtype=torch.bfloat16
    )

    model = AutoModelForCausalLM.from_pretrained(
        base_model, 
        quantization_config=bnb_config,
        local_files_only=True
    )

    model = PeftModel.from_pretrained(
        model, 
        adapter_model, 
        quantization_config=bnb_config
    )
    
    tokenizer = AutoTokenizer.from_pretrained(base_model)

    model = model.to("cuda")
    return model,tokenizer


def inference_model(input_text,model,tokenizer):
    inputs = tokenizer(input_text,return_tensors="pt")
    response_tokens = []

    with torch.no_grad():
        outputs = model.generate(
            input_ids=inputs["input_ids"].to("cuda"), 
            max_new_tokens=1024
        )
        response_tokens.append(
            tokenizer.batch_decode(
                outputs.detach().cpu().numpy(), 
                skip_special_tokens=True
            )[0]
        )

    return "".join(response_tokens)
```

models.py

```python
from modelInference import *

processor, transcriptor = load_transcriptor()
model, tokenizer = load_model()
```