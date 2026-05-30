import network
import time
import json
from machine import Pin
from umqtt.simple import MQTTClient

# --- CARREGAR CONFIGURAÇÕES DO JSON ---
# O arquivo config.json precisa estar salvo na memória do ESP32
try:
    with open('config.json', 'r') as arquivo:
        config = json.load(arquivo)
        
    WIFI_SSID = config.get("wifi_ssid")
    WIFI_PASS = config.get("wifi_pass")
    MQTT_BROKER = config.get("broker_ip")
    MQTT_PORT = config.get("broker_port")
    
    print("Configurações carregadas com sucesso!")
except Exception as e:
    print("Erro ao carregar config.json. Verifique se o arquivo existe e o formato está correto.")
    print("Erro detalhado:", e)
    # Interrompe a execução se não houver configuração
    raise SystemExit 

# --- CONFIGURAÇÃO DOS 4 LEDS ---
led_vermelho = Pin(25, Pin.OUT)
led_amarelo  = Pin(14, Pin.OUT)
led_verde    = Pin(26, Pin.OUT)
led_azul     = Pin(27, Pin.OUT)

# Garante que todos começam desligados
led_vermelho.value(0)
led_amarelo.value(0)
led_verde.value(0)
led_azul.value(0)

# --- CONFIGURAÇÃO DO WI-FI (CLIENTE) ---
wifi = network.WLAN(network.STA_IF)
wifi.active(True)

print(f'Conectando à rede {WIFI_SSID}...')
wifi.connect(WIFI_SSID, WIFI_PASS)

# Aguarda a conexão ser estabelecida
tentativas = 0
while not wifi.isconnected() and tentativas < 20:
    print('.', end='')
    time.sleep(1)
    tentativas += 1

if wifi.isconnected():
    print('\nConectado com sucesso!')
    print('Endereço IP do ESP32:', wifi.ifconfig()[0])
else:
    print('\nFalha ao conectar. Verifique o roteador.')

# --- CONFIGURAÇÃO DO MQTT ---
CLIENT_ID = 'esp32_toca_hobbit'
TOPICO_BASE = b'toca/led/' 

def mqtt_callback(topic, msg):
    topic_str = topic.decode('utf-8')
    msg_str = msg.decode('utf-8').lower()
    
    print(f"Recebido -> Tópico: {topic_str} | Comando: {msg_str}")
    
    # 1 para LIGAR, 0 para DESLIGAR
    estado = 1 if msg_str in ['on', '1', 'ligar'] else 0

    # Direciona o comando
    if 'vermelho' in topic_str:
        led_vermelho.value(estado)
    elif 'amarelo' in topic_str:
        led_amarelo.value(estado)
    elif 'verde' in topic_str:
        led_verde.value(estado)
    elif 'azul' in topic_str:
        led_azul.value(estado)

if wifi.isconnected():
    print(f'Conectando ao broker MQTT {MQTT_BROKER} na porta {MQTT_PORT}...')
    try:
        # Passando também a porta obtida do JSON
        client = MQTTClient(CLIENT_ID, MQTT_BROKER, port=MQTT_PORT)
        client.set_callback(mqtt_callback)
        client.connect()
        
        client.subscribe(TOPICO_BASE + b'#') 
        print('Inscrito no tópico:', (TOPICO_BASE + b'#').decode('utf-8'))
    except Exception as e:
        print('Falha ao configurar o MQTT:', e)

# --- LOOP PRINCIPAL ---
print("Aguardando mensagens MQTT...")
while True:
    try:
        if wifi.isconnected():
            client.wait_msg() 
        else:
            print("WiFi desconectado. Tentando reconectar...")
            time.sleep(5)
    except Exception as e:
        print('Erro no loop MQTT:', e)
        time.sleep(2)