import requests


MODELSERVER_IP = "192.168.100.20"
    
def get_model_response( profile_link):
    url = f"http://{MODELSERVER_IP}:5100/inference"  # URL del servidor Flask

    # Crear el cuerpo de la solicitud
    payload = {
        "profile_link": profile_link
    }

    try:
        # Enviar la solicitud POST
        response = requests.post(url, json=payload)

        # Comprobar el estado de la respuesta
        if response.status_code == 200:
            return response.json()  # Retorna el contenido JSON de la respuesta
        else:
            return {"error": f"Error {response.status_code}: {response.text}"}
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}  # Retorna el error en caso de excepción

# Ejemplo de uso
if __name__ == "__main__":
    ip_address = "192.168.100.20"  # Cambia esto a la IP de tu servidor
    filename = "https://www.facebook.com/itziar.dom"  # Cambia esto al nombre del archivo ZIP que quieres subir

    response = get_model_response(filename)
    print(response)
