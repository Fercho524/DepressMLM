import os
import json
import pyperclip

BASE_PROMPT="""
Con base al historial de publicaciones de un usuario, que contiene textos y descripciones de imágenes, ¿puedes inferir si el usuario posee signos tempranos de depresión?, define únicamente, de 0 a 1 la probabilidad de que el usuario tenga depresión.
"""

def user_files(directorio):
    archivos_json = []
    for root, dirs, files in os.walk(directorio):
        for archivo in files:
            if archivo.endswith('.json'):
                archivos_json.append(os.path.join(root, archivo))
    return archivos_json

def get_last():
    progress_file=open("PROGRESS","r")
    last=progress_file.read()
    progress_file.close()
    return last

def set_last(content):
    progress_file=open("PROGRESS","w")
    last=progress_file.write(content)
    progress_file.close()
    print("OK")
    
def get_user(file):
    user_file=open(file,"r")
    user=json.loads(user_file.read())
    return user

def set_user(file,user):
    user_file=open(file,"w")
    user_file.write(json.dumps(user,ensure_ascii=False))
    user_file.close()
    print("OK")
    
    
# Ejemplo de uso:
directorio = 'Users'
archivos_json = user_files(directorio)
last_file=int(get_last())

# De forma dinámica vamos escribiendo las respuestas.
for i in range(last_file,len(archivos_json)):
    user_file=archivos_json[i]
    print(user_file)
    set_last(str(i))
    
    # Lee el archivo y sus publicaciones
    user = get_user(user_file)

    # Guarda las publicaciones en el portapapeles
    base=""

    for i,post in enumerate(user["posts"]):
        print(f"Post {i}")
        base+=f"Publicación {i} -----\n"
        base+=f"Texto : {post["text"]}\n"
        base+=f"Descripción Imagen : {post["image_description"]}\n\n"
        
    pyperclip.copy(base)

    # Vas a chatgpt y le pones el prompt
    response=input()

    # Ingresa la respuesta al sistema
    user["response"]=response

    # Escribe el archivo
    set_user(user_file,user)
    