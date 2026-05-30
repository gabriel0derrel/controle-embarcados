import network
import time
import json
import machine
import os

# Configurações do Access Point do ESP32
AP_SSID = "ESP32_Setup"
AP_PASS = "12345678"  # Mínimo 8 caracteres

CONFIG_FILE = "config.json"

def arquivo_existe(nome_arquivo):
    try:
        os.stat(nome_arquivo)
        return True
    except OSError:
        return False

def ler_configuracao():
    with open(CONFIG_FILE, "r") as f:
        return json.load(f)

def salvar_configuracao(data):
    with open(CONFIG_FILE, "w") as f:
        json.dump(data, f)

def conectar_wifi(ssid, password):
    sta_if = network.WLAN(network.STA_IF)
    sta_if.active(True)
    print(f"Tentando conectar ao Wi-Fi: {ssid}...")
    sta_if.connect(ssid, password)
    
    # Tenta conectar por até 15 segundos (timeout)
    tentativas = 0
    while not sta_if.isconnected() and tentativas < 15:
        time.sleep(1)
        tentativas += 1
        print(".", end="")
    print("")
    
    return sta_if.isconnected()

def iniciar_access_point():
    ap_if = network.WLAN(network.AP_IF)
    ap_if.active(True)
    ap_if.config(essid=AP_SSID, password=AP_PASS, authmode=network.AUTH_WPA_WPA2_PSK)
    
    print(f"Modo Access Point Ativo!")
    print(f"Conecte na rede: {AP_SSID}")
    print(f"Acesse no navegador: http://192.168.4.1")
    
    # Configura e inicia o Servidor Web Socket simples
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('192.168.4.1', 80))
    s.listen(1)
    
    
    # Página HTML do formulário
    html = """<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Configuração Genius IoT</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4; }
            .container { max-width: 400px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1); }
            h2 { color: #333; text-align: center; }
            label { display: block; margin-top: 10px; font-weight: bold; }
            input { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
            button { width: 100%; padding: 10px; margin-top: 20px; background-color: #007BFF; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
            button:hover { background-color: #0056b3; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Configurações do Genius</h2>
            <form action="/save" method="POST">
                <label>SSID do Wi-Fi:</label>
                <input type="text" name="ssid" required>
                
                <label>Senha do Wi-Fi:</label>
                <input type="password" name="password" required>
                
                <label>IP do Broker MQTT:</label>
                <input type="text" name="broker" placeholder="ex: 192.168.1.50" required>
                
                <label>Porta do Broker:</label>
                <input type="number" name="port" value="1883" required>
                
                <button type="submit">Salvar e Reiniciar</button>
            </form>
        </div>
    </body>
    </html>
    """

    while True:
        conn, addr = s.accept()
        request = conn.recv(1024).decode('utf-8')
        
        # Se for a requisição para salvar os dados (POST)
        if "POST /save" in request:
            # Separa o corpo da requisição (onde ficam os dados do formulário)
            try:
                body = request.split("\r\n\r\n")[1]
            except IndexError:
                body = request.split("\n\n")[1]
            
            # Parse manual dos dados enviados pelo formulário (URL-encoded)
            dados = {}
            pares = body.split("&")
            for par in pares:
                chave, valor = par.split("=")
                # Decodifica caracteres especiais simples da URL (ex: %20 para espaço)
                valor = valor.replace("%20", " ").replace("%3A", ":").replace("%2F", "/")
                dados[chave] = valor
            
            # Monta a estrutura para o JSON
            config_data = {
                "wifi_ssid": dados.get("ssid"),
                "wifi_pass": dados.get("password"),
                "broker_ip": dados.get("broker"),
                "broker_port": int(dados.get("port", 1883))
            }
            
            # Salva o arquivo na Flash do ESP32
            salvar_configuracao(config_data)
            
            # Resposta visual para o navegador antes de cair
            resposta = "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\n\r\n"
            resposta += "<h3>Configuracoes salvas com sucesso! O ESP32 esta reiniciando...</h3>"
            conn.send(resposta)
            conn.close()
            
            print("Configurações salvas. Reiniciando em 2 segundos...")
            time.sleep(2)
            machine.reset() # Dá o Reboot automático
            
        else:
            # Se for apenas acessando a página, envia o formulário HTML
            resposta = "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n" + html
            conn.send(resposta)
            conn.close()

# --- FLUXO PRINCIPAL DE BOOT ---

if not arquivo_existe(CONFIG_FILE):
    print("Arquivo de configuração não encontrado.")
    iniciar_access_point()
else:
    try:
        config = ler_configuracao()
        # Tenta conectar usando os dados do JSON
        conectado = conectar_wifi(config["wifi_ssid"], config["wifi_pass"])
        
        if conectado:
            print("Wi-Fi conectado com sucesso!")
            print("Dados da rede:", network.WLAN(network.STA_IF).ifconfig())
            print("Pronto para iniciar o jogo...")
            # O boot.py termina aqui com sucesso, o MicroPython vai chamar o main.py
        else:
            print("Falha ao conectar no Wi-Fi com as configurações salvas.")
            # Se falhar o Wi-Fi (ex: roteador desligado ou senha mudou), entra em modo AP como Fallback
            iniciar_access_point()
            
    except Exception as e:
        print("Erro ao ler JSON ou corrompido:", e)
        iniciar_access_point()