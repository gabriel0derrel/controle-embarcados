import network
import time
import json
import random
from machine import Pin
from umqtt.simple import MQTTClient

# --- CARREGAR CONFIGURAÇÕES DO JSON ---
try:
    with open('config.json', 'r') as arquivo:
        config = json.load(arquivo)

    WIFI_SSID   = config.get("wifi_ssid")
    WIFI_PASS   = config.get("wifi_pass")
    MQTT_BROKER = config.get("broker_ip")
    MQTT_PORT   = int(config.get("broker_port", 1883)) # O valor 1883 serve de fallback caso a chave não exista.

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
#
# esp32_genius/led    (assina) — jogador aperta uma cor
#                     Payload: {"cor": "vermelho", "acao": "on"}
#
# esp32_genius/jogo   (assina) — comandos de controle do jogo
#                     Payload: {"acao": "iniciar"} / {"acao": "reiniciar"} /
#                              {"acao": "confirmar"} / {"acao": "cancelar"}
#
# esp32_genius/estado (publica) — estado atual do jogo, enviado após cada mudança
CLIENT_ID     = 'esp32_genius'
TOPICO_LED    = b'esp32_genius/led'
TOPICO_JOGO   = b'esp32_genius/jogo'
TOPICO_ESTADO = b'esp32_genius/estado'

# -------------------------------------------------------------------
# ESTADO DO JOGO
#
#   tela      — fase da máquina de estados:
#                 'inicio'     -> aguardando o comando iniciar
#                 'piscando'   -> sequência sendo exibida nos LEDs
#                 'aguardando' -> aguardando o jogador digitar a sequência
#                 'certo'      -> jogador acertou, avançando de fase
#                 'errado'     -> jogador errou, jogo encerrado
#   fase      — número da rodada atual (começa em 1)
#   sequencia — lista de cores que o jogador deve reproduzir
#   entrada   — lista de cores que o jogador já digitou nesta rodada
# -------------------------------------------------------------------
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
    # Serializa o estado atual e o publica no tópico MQTT de estado.
    payload = json.dumps({
        'tela':    estado['tela'],
        'fase':    estado['fase'],
        'seq_len': len(estado['sequencia']),
        'entrada': estado['entrada'],
    })
    client.publish(TOPICO_ESTADO, payload.encode())

def piscar_sequencia():
    # Acende e apaga cada LED da sequência atual em ordem, com pausas entre eles.
    for i, cor in enumerate(estado['sequencia']):
        LEDS[cor].value(1)
        time.sleep(0.5)
        LEDS[cor].value(0)
        time.sleep(0.4)

        # Ping a cada 5 LEDs para manter o keep-alive com o broker
        if i % 5 == 0 and client:
            try:
                client.ping()
            except Exception:
                pass

def celebrar():
    # Pisca todos os LEDs simultaneamente 3 vezes como animação de acerto.
    for _ in range(3):
        for led in LEDS.values():
            led.value(1)
        time.sleep(0.2)
        for led in LEDS.values():
            led.value(0)
        time.sleep(0.2)

def sinal_erro():
    # Pisca rapidamente o LED vermelho 4 vezes como sinal de erro.
    for _ in range(4):
        led_vermelho.value(1)
        time.sleep(0.1)
        led_vermelho.value(0)
        time.sleep(0.1)

# -------------------------------------------------------------------
# CALLBACK MQTT
# -------------------------------------------------------------------

def mqtt_callback(topic, msg):
    # Chamado pela biblioteca MQTT sempre que uma mensagem chega em um tópico assinado.
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
        Registra a cor pressionada e valida IMEDIATAMENTE contra a posição
        correspondente na sequência.
        - Cor errada: dispara sinal_erro(), zera o estado e volta para 'inicio'.
          O jogo é encerrado — o jogador deve iniciar uma nova partida.
        - Cor certa: feedback físico e aguarda a próxima cor ou o confirmar.

    Tópico /jogo:
        iniciar  — sorteia a primeira cor e começa a primeira rodada.
        reiniciar — zera tudo e volta ao estado 'inicio'.
        confirmar — como erros já são capturados no /led, aqui a sequência
                    sempre está correta. Avança de fase, adiciona uma cor
                    nova e exibe a sequência atualizada.
        cancelar  — remove a última cor digitada pelo jogador (backspace).
    """
    topico = dados.get('_topico', '')
    acao = str(dados.get('acao', '')).lower()

    # --- esp32_genius/led: jogador aperta uma cor ---
    if topico == TOPICO_LED.decode('utf-8'):
        if estado['tela'] != 'aguardando':
            return
        cor = str(dados.get('cor', '')).lower()
        if cor not in LEDS:
            print(f"Cor '{cor}' desconhecida.")
            return
        if len(estado['entrada']) >= len(estado['sequencia']):
            print("Entrada já completa. Aguardando confirmação.")
            return
        if acao not in ['on', '1', 'ligar']:
            return

        # Feedback físico: pisca o LED da cor pressionada
        LEDS[cor].value(1)
        time.sleep(0.15)
        LEDS[cor].value(0)

        # --- VALIDAÇÃO IMEDIATA ---
        # Compara a cor recém-pressionada com a posição esperada na sequência.
        # Se errar, encerra o jogo na hora — sem mostrar a sequência novamente.
        posicao_atual = len(estado['entrada'])
        if cor != estado['sequencia'][posicao_atual]:
            # Cor errada: sinaliza erro e encerra o jogo
            sinal_erro()
            estado['tela']      = 'errado'
            estado['sequencia'] = []
            estado['entrada']   = []
            pub_estado()
            # Descarta inputs digitados durante o sinal_erro()
            limpar_fila_led()
            # Volta para 'inicio' para que o jogador possa iniciar nova partida
            time.sleep(1.5)
            estado['tela'] = 'inicio'
            estado['fase'] = 1
            pub_estado()
            return

        # Cor certa: registra na entrada
        estado['entrada'].append(cor)
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

        elif acao == 'confirmar':
            if estado['tela'] != 'aguardando':
                return
            if len(estado['entrada']) != len(estado['sequencia']):
                print("Sequência incompleta, aguardando mais cores.")
                return
            # Como erros são capturados LED a LED, se chegou até aqui
            # a sequência está necessariamente correta. Apenas avança de fase.
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
    #Cria uma nova instância do MQTTClient, conecta ao broker e assina os tópicos.
    global client
    try:
        print(f'Conectando ao broker MQTT {MQTT_BROKER} na porta {MQTT_PORT}...')
        client = MQTTClient(CLIENT_ID, MQTT_BROKER, port=MQTT_PORT)
        client.set_callback(mqtt_callback)
        client.connect()
        client.subscribe(TOPICO_LED)
        client.subscribe(TOPICO_JOGO)
        print('Inscrito no tópico:', TOPICO_LED.decode('utf-8'))
        print('Inscrito no tópico:', TOPICO_JOGO.decode('utf-8'))
        pub_estado()
        return True
    except Exception as e:
        print('Falha ao conectar ao MQTT:', e)
        client = None
        return False

if not conectar_mqtt():
    raise SystemExit

# -------------------------------------------------------------------
# LIMPEZA DE INPUTS ANTECIPADOS
# -------------------------------------------------------------------

def limpar_fila_led():
    # Drena completamente o buffer TCP e descarta todos os comandos de LED.
    if client and hasattr(client, 'sock') and client.sock:
        try:
            # Modo não-bloqueante: check_msg() retorna imediatamente se não houver dados, lançando OSError quando o buffer estiver vazio.
            client.sock.setblocking(False)
            while True:
                client.check_msg()
        except OSError:
            # OSError esperado: buffer de rede está vazio, podemos parar.
            pass
        finally:
            # Garante retorno ao modo bloqueante independente do que ocorrer.
            client.sock.setblocking(True)

    # Remove da fila interna todos os comandos de LED acumulados
    i = 0
    while i < len(fila_comandos):
        if fila_comandos[i].get('_topico') == TOPICO_LED.decode('utf-8'):
            fila_comandos.pop(i)
        else:
            i += 1

# -------------------------------------------------------------------
# WRAPPER DE processar_comando
# -------------------------------------------------------------------
_processar_comando_original = processar_comando

def processar_comando(dados): 
    topico = dados.get('_topico', '')
    acao   = str(dados.get('acao', '')).lower()

    if topico == TOPICO_JOGO.decode('utf-8') and acao in ('iniciar', 'confirmar'):
        _processar_comando_original(dados)
        limpar_fila_led()
    else:
        _processar_comando_original(dados)

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
