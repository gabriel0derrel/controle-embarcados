import network
import time
import json
import random
import os
from machine import Pin
from umqtt.simple import MQTTClient

# --- CARREGAR CONFIGURAÇÕES DO JSON ---
try:
    with open('config.json', 'r') as arquivo:
        config = json.load(arquivo)

    WIFI_SSID   = config.get("wifi_ssid")
    WIFI_PASS   = config.get("wifi_pass")
    MQTT_BROKER = config.get("broker_ip")
    MQTT_PORT   = config.get("broker_port")
    NOME_EMBARCADO   = "esp32_genius"
    MARCA_EMBARCADO  = "Espressif"
    MODELO_EMBARCADO = "ESP32"

    print("Configurações carregadas com sucesso!")
except Exception as e:
    print("Erro ao carregar config.json. Verifique se o arquivo existe e o formato está correto.")
    print("Erro detalhado:", e)
    raise SystemExit

# --- LEDS ---
led_vermelho = Pin(25, Pin.OUT)
led_amarelo  = Pin(14, Pin.OUT)
led_verde    = Pin(26, Pin.OUT)
led_azul     = Pin(27, Pin.OUT)
led_vermelho.value(0)
led_amarelo.value(0)
led_verde.value(0)
led_azul.value(0)

LEDS            = {'vermelho': led_vermelho, 'amarelo': led_amarelo, 'verde': led_verde, 'azul': led_azul}
SEQUENCIA_CORES = ['vermelho', 'amarelo', 'verde', 'azul']

# Geração de seed aleatória
semente_hardware = int.from_bytes(os.urandom(4), 'big') # Gera 4 bytes aleatórios via hardware
random.seed(semente_hardware)

# --- CONFIGURAÇÃO DO WI-FI ---
wifi = network.WLAN(network.STA_IF)
wifi.active(True)
print(f'Conectando à rede {WIFI_SSID}...')
wifi.connect(WIFI_SSID, WIFI_PASS)

tentativas = 0
while not wifi.isconnected() and tentativas < 20:
    print('.', end='')
    time.sleep(1)
    tentativas += 1

if wifi.isconnected():
    print('\nConectado com sucesso!')
    print('Endereço IP do ESP32:', wifi.ifconfig()[0])
else:
    print('\nFalha ao conectar ao Wi-Fi. Verifique o roteador.')
    raise SystemExit

# --- TÓPICOS E ID DO CLIENTE MQTT ---
CLIENT_ID     = 'esp32_genius'
TOPICO_LED    = b'esp32_genius/led'
TOPICO_JOGO   = b'esp32_genius/jogo'
TOPICO_ESTADO = b'esp32_genius/estado'
TOPICO_STATUS = b'esp32_genius/status'

# --- ESTADO DO JOGO ---
estado = {
    'tela':      'inicio',
    'fase':      1,
    'sequencia': [],
    'entrada':   [],
}

fila_comandos = []

# -------------------------------------------------------------------
# FUNÇÕES DO JOGO
# -------------------------------------------------------------------

def pub_estado():
    """Serializa o estado atual e o publica no tópico MQTT de estado."""
    payload = json.dumps({
        'tela':    estado['tela'],
        'fase':    estado['fase'],
        'seq_len': len(estado['sequencia']),
        'entrada': estado['entrada'],
    })
    client.publish(TOPICO_ESTADO, payload.encode())

def pub_dados_conexao():
    """Publica os dados do embarcado quando ele se conecta ao broker MQTT."""
    payload = json.dumps({
        'online': True,
        'nome':   NOME_EMBARCADO,
        'marca':  MARCA_EMBARCADO,
        'modelo': MODELO_EMBARCADO,
        'ip':     wifi.ifconfig()[0],
    })
    client.publish(TOPICO_STATUS, payload.encode())

def piscar_sequencia():
    """Acende e apaga cada LED da sequência atual em ordem, com pausas entre eles."""
    for cor in estado['sequencia']:
        LEDS[cor].value(1)
        time.sleep(0.5)
        LEDS[cor].value(0)
        time.sleep(0.4)

def celebrar():
    """Pisca todos os LEDs simultaneamente 3 vezes como animação de acerto."""
    for _ in range(3):
        for led in LEDS.values():
            led.value(1)
        time.sleep(0.2)
        for led in LEDS.values():
            led.value(0)
        time.sleep(0.2)

def sinal_erro():
    """Pisca rapidamente o LED vermelho 4 vezes como sinal de erro."""
    for _ in range(4):
        led_vermelho.value(1)
        time.sleep(0.1)
        led_vermelho.value(0)
        time.sleep(0.1)

def limpar_fila_led():
    """Descarta comandos de LED acumulados enquanto as animações estavam rodando."""
    try:
        if client:
            client.check_msg()
    except Exception:
        pass

    i = 0
    while i < len(fila_comandos):
        if fila_comandos[i].get('_topico') == TOPICO_LED.decode('utf-8'):
            fila_comandos.pop(i)
        else:
            i += 1

# -------------------------------------------------------------------
# CALLBACK MQTT
# -------------------------------------------------------------------

def mqtt_callback(topic, msg):
    topic_str = topic.decode('utf-8')
    try:
        dados = json.loads(msg.decode('utf-8'))
        dados['_topico'] = topic_str
        print(f"Recebido -> Tópico: {topic_str} | Dados: {dados}")
        fila_comandos.append(dados)
    except ValueError:
        print(f"Erro: A mensagem recebida não é um JSON válido. Mensagem: {msg}")
    except Exception as e:
        print("Erro ao processar mensagem MQTT:", e)

# -------------------------------------------------------------------
# PROCESSADOR DE COMANDOS
# -------------------------------------------------------------------

def processar_comando(dados):
    """Executa a ação descrita em `dados` de acordo com o tópico de origem.

    Tópico /led:
        Registra a cor pressionada e valida em tempo real se o jogador acertou.
        Se errar, o jogo reseta na hora. Se completar a sequência, avança de fase.

    Tópico /jogo:
        iniciar  — sorteia a primeira cor e começa a primeira rodada.
        reiniciar — zera tudo e volta ao estado 'inicio'.
        cancelar  — remove a última cor digitada pelo jogador.
    """
    topico = dados.get('_topico', '')
    acao   = dados.get('acao', '').lower()

    # --- esp32_genius/led: jogador aperta uma cor ---
    if topico == TOPICO_LED.decode('utf-8'):
        if estado['tela'] != 'aguardando':
            return
        cor = dados.get('cor', '').lower()
        if cor not in LEDS:
            print(f"Cor '{cor}' desconhecida.")
            return
        if len(estado['entrada']) >= len(estado['sequencia']):
            return
        if acao not in ['on', '1', 'ligar']:
            return

        # Feedback físico: pisca o LED da cor pressionada
        LEDS[cor].value(1)
        time.sleep(0.15)
        LEDS[cor].value(0)
        estado['entrada'].append(cor)

        # 1. VALIDAÇÃO EM TEMPO REAL (FIM DE JOGO SE ERRAR)
        index_atual = len(estado['entrada']) - 1
        if estado['entrada'][index_atual] != estado['sequencia'][index_atual]:
            sinal_erro()
            estado['entrada'] = []
            estado['tela']    = 'errado'
            pub_estado()
            time.sleep(1.5)
            for led in LEDS.values():
                led.value(0)
            estado['fase']      = 1
            estado['sequencia'] = []
            estado['tela']      = 'inicio'
            fila_comandos.clear()
            pub_estado()
            limpar_fila_led()  # Evita cliques fantasmas feitos durante o game over
            return

        # 2. AVANÇO AUTOMÁTICO DE FASE
        if len(estado['entrada']) == len(estado['sequencia']):
            celebrar()
            estado['fase']      += 1
            estado['sequencia'] = estado['sequencia'] + [random.choice(SEQUENCIA_CORES)]
            estado['entrada']   = []
            estado['tela']      = 'certo'
            pub_estado()
            time.sleep(1.5)
            estado['tela'] = 'piscando'
            pub_estado()
            piscar_sequencia()
            estado['tela'] = 'aguardando'
            pub_estado()
            limpar_fila_led()  # Evita cliques fantasmas feitos enquanto os LEDs piscavam
            return

        # Se acertou o clique atual mas a sequência ainda não acabou
        pub_estado()

    # --- esp32_genius/jogo: controle do jogo ---
    elif topico == TOPICO_JOGO.decode('utf-8'):
        if acao == 'iniciar':
            if estado['tela'] == 'inicio':
                estado['fase']      = 1
                estado['sequencia'] = [random.choice(SEQUENCIA_CORES)]
                estado['entrada']   = []
                estado['tela']      = 'piscando'
                pub_estado()
                piscar_sequencia()
                estado['tela'] = 'aguardando'
                pub_estado()
                limpar_fila_led()
            else:
                print("Comando 'iniciar' ignorado: jogo já em andamento.")

        elif acao == 'reiniciar':
            for led in LEDS.values():
                led.value(0)
            estado['fase']      = 1
            estado['sequencia'] = []
            estado['entrada']   = []
            estado['tela']      = 'inicio'
            fila_comandos.clear()
            pub_estado()

        elif acao == 'cancelar':
            if estado['tela'] == 'aguardando' and estado['entrada']:
                estado['entrada'].pop()
                pub_estado()
        else:
            print(f"Ação '{acao}' desconhecida.")

# -------------------------------------------------------------------
# CONEXÃO MQTT
# -------------------------------------------------------------------
client = None

def conectar_mqtt():
    global client
    try:
        print(f'Conectando ao broker MQTT {MQTT_BROKER} na porta {MQTT_PORT}...')
        client = MQTTClient(CLIENT_ID, MQTT_BROKER, port=MQTT_PORT)
        client.set_callback(mqtt_callback)
        client.connect()
        client.subscribe(TOPICO_LED)
        client.subscribe(TOPICO_JOGO)
        print('Inscritos nos tópicos com sucesso.')
        pub_dados_conexao()
        pub_estado()
        return True
    except Exception as e:
        print('Falha ao conectar ao MQTT:', e)
        client = None
        return False

if not conectar_mqtt():
    raise SystemExit

# -------------------------------------------------------------------
# LOOP PRINCIPAL
# -------------------------------------------------------------------
print("Aguardando mensagens MQTT...")
while True:
    try:
        if wifi.isconnected():
            if client is None:
                print("Wi-Fi OK. Tentando restabelecer conexão com o broker...")
                conectar_mqtt()
                time.sleep(2)
                continue

            client.check_msg()

            while fila_comandos:
                dados = fila_comandos.pop(0)
                processar_comando(dados)

            time.sleep(0.05)
        else:
            print("WiFi desconectado. Tentando reconectar...")
            client = None
            wifi.connect(WIFI_SSID, WIFI_PASS)
            time.sleep(5)

    except OSError as e:
        print('Erro de socket MQTT (conexão caiu):', e)
        client = None
        time.sleep(2)
    except Exception as e:
        print('Erro inesperado no loop:', e)
        time.sleep(2)

