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


# """ if __name__ == "__main__":
#     processor,transcriptor = load_transcriptor()
#     model,tokenizer = load_model()

#     user_test = input("Ingresa la ruta de un archivo .zip que contenga los datos de un usuario")

#     response = process_zip_user_data(user_test,"Testing",model,tokenizer,processor,transcriptor)
#     print(response) """