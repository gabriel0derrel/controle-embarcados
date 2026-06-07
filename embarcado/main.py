import network
import time
import json
import random
from machine import Pin
from umqtt.simple import MQTTClient

# --- CARREGAR CONFIGURAÇÕES DO JSON ---
# Lê o arquivo config.json e extrai as credenciais de Wi-Fi e MQTT.
# Se o arquivo não existir ou estiver malformado, encerra o programa.
try:
    with open('config.json', 'r') as arquivo:
        config = json.load(arquivo)

    WIFI_SSID   = config.get("wifi_ssid")
    WIFI_PASS   = config.get("wifi_pass")
    MQTT_BROKER = config.get("broker_ip")
    MQTT_PORT   = config.get("broker_port")

    print("Configurações carregadas com sucesso!")
except Exception as e:
    print("Erro ao carregar config.json. Verifique se o arquivo existe e o formato está correto.")
    print("Erro detalhado:", e)
    raise SystemExit

# --- LEDS ---
# Cada cor mapeia para um pino GPIO de saída.
# Todos são inicializados em LOW (apagados).
led_vermelho = Pin(25, Pin.OUT)
led_amarelo  = Pin(14, Pin.OUT)
led_verde    = Pin(26, Pin.OUT)
led_azul     = Pin(27, Pin.OUT)
led_vermelho.value(0)
led_amarelo.value(0)
led_verde.value(0)
led_azul.value(0)

# Dicionário para acesso ao objeto Pin pelo nome da cor.
LEDS            = {'vermelho': led_vermelho, 'amarelo': led_amarelo, 'verde': led_verde, 'azul': led_azul}
# Ordem canônica das cores — usada para sortear a sequência do jogo.
SEQUENCIA_CORES = ['vermelho', 'amarelo', 'verde', 'azul']

# --- CONFIGURAÇÃO DO WI-FI (CLIENTE) ---
# Ativa o modo estação (STA) e tenta conectar à rede por até 20 segundos.
# Se não conseguir, encerra o programa — sem Wi-Fi não há MQTT.
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
# Dicionário central que representa o momento atual da partida:
#   tela      — fase da máquina de estados:
#                 'inicio'     -> aguardando o comando iniciar
#                 'piscando'   -> sequência sendo exibida nos LEDs
#                 'aguardando' -> aguardando o jogador digitar a sequência
#                 'certo'      -> jogador acertou, avançando de fase
#                 'errado'     -> jogador errou, repetindo a sequência
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

# Fila FIFO de comandos MQTT recebidos aguardando processamento.
# Como o MicroPython é de thread única e time.sleep() bloqueia o loop,
# mensagens que chegam durante animações não são processadas imediatamente.
# O callback as empilha aqui; o loop principal as consome na ordem de chegada.
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

# -------------------------------------------------------------------
# CALLBACK MQTT
# -------------------------------------------------------------------

def mqtt_callback(topic, msg):
    """Chamado pela biblioteca MQTT sempre que uma mensagem chega em um tópico assinado.

    Decodifica o payload JSON, anexa o nome do tópico como campo '_topico'
    e empurra o dicionário resultante na fila para processamento posterior.
    Mensagens com JSON inválido são descartadas com log de erro.
    """
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
        Registra a cor pressionada pelo jogador se o jogo estiver em
        estado 'aguardando' e a entrada ainda não estiver completa.
        Acende brevemente o LED correspondente como feedback físico.

    Tópico /jogo:
        iniciar  — sorteia a primeira cor e começa a primeira rodada.
        reiniciar — zera tudo e volta ao estado 'inicio'.
        confirmar — verifica se a entrada do jogador bate com a sequência;
                    avança de fase em caso de acerto ou repete em caso de erro.
        cancelar  — remove a última cor digitada pelo jogador (backspace).
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
            print("Entrada já completa. Aguardando confirmação.")
            return
        if acao not in ['on', '1', 'ligar']:
            return
        # Feedback físico: pisca o LED da cor pressionada
        LEDS[cor].value(1)
        time.sleep(0.15)
        LEDS[cor].value(0)
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
            # Apaga todos os LEDs, zera o estado e descarta qualquer
            # comando enfileirado da rodada anterior.
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
            if estado['entrada'] == estado['sequencia']:
                # Acerto: celebra, incrementa a fase, adiciona uma cor nova
                # à sequência e exibe a sequência atualizada.
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
            else:
                # Erro: sinaliza, limpa a entrada e repete a mesma sequência.
                sinal_erro()
                estado['entrada'] = []
                estado['tela']    = 'errado'
                pub_estado()
                estado['tela'] = 'aguardando'
                pub_estado()

        elif acao == 'cancelar':
            # Remove a última cor digitada, desde que o jogo esteja aguardando
            # e haja pelo menos uma cor registrada na entrada.
            if estado['tela'] == 'aguardando' and estado['entrada']:
                estado['entrada'].pop()
                pub_estado()

        else:
            print(f"Ação '{acao}' desconhecida.")

# -------------------------------------------------------------------
# CONEXÃO MQTT
# -------------------------------------------------------------------
# `client` começa como None. A função conectar_mqtt() cria (ou recria)
# a instância sempre que necessário — na inicialização e após quedas de rede.
client = None

def conectar_mqtt():
    """Cria uma nova instância do MQTTClient, conecta ao broker e assina os tópicos.

    Retorna True em caso de sucesso ou False em caso de falha.
    Em caso de falha, garante que `client` seja None para que o loop
    principal identifique que a reconexão ainda é necessária.
    """
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

# Conexão inicial — sem MQTT o jogo não pode funcionar.
if not conectar_mqtt():
    raise SystemExit

# -------------------------------------------------------------------
# LIMPEZA DE INPUTS ANTECIPADOS
# -------------------------------------------------------------------

def limpar_fila_led():
    """Descarta comandos de LED acumulados enquanto as animações estavam rodando.

    Durante piscar_sequencia(), celebrar() e sinal_erro(), o loop principal
    fica bloqueado pelos time.sleep(). Nesse intervalo, o broker continua
    entregando mensagens no buffer TCP do chip. Essas mensagens ainda não
    chegaram à fila Python — elas só entrariam na próxima chamada a
    check_msg(), quando o estado já seria 'aguardando', fazendo o jogo
    aceitar inputs digitados antes da hora como jogadas válidas.

    Para evitar isso, check_msg() é chamado aqui primeiro, forçando o
    MicroPython a mover tudo do buffer TCP para a fila. Em seguida,
    todos os itens de LED são removidos da fila de uma só vez.
    Comandos do tópico /jogo (ex: reiniciar) são preservados.
    """
    # Passo 1: drena o buffer TCP para a fila Python
    try:
        if client:
            client.check_msg()
    except Exception:
        pass  # Erros de socket serão tratados pelo loop principal

    # Passo 2: remove da fila todos os comandos de LED
    i = 0
    while i < len(fila_comandos):
        if fila_comandos[i].get('_topico') == TOPICO_LED.decode('utf-8'):
            fila_comandos.pop(i)
        else:
            i += 1

# -------------------------------------------------------------------
# WRAPPER DE processar_comando
# -------------------------------------------------------------------
# As ações 'iniciar' e 'confirmar' terminam com piscar_sequencia(),
# que bloqueia o loop por vários segundos. Ao retornar, qualquer input
# digitado pelo jogador durante a animação deve ser descartado.
# Este wrapper chama limpar_fila_led() logo após essas ações,
# sem precisar duplicar a lógica interna de processar_comando.
_processar_comando_original = processar_comando

def processar_comando(dados):  # noqa: F811
    topico = dados.get('_topico', '')
    acao   = dados.get('acao', '').lower()

    if topico == TOPICO_JOGO.decode('utf-8') and acao in ('iniciar', 'confirmar'):
        _processar_comando_original(dados)
        limpar_fila_led()
    else:
        _processar_comando_original(dados)

# -------------------------------------------------------------------
# LOOP PRINCIPAL
# -------------------------------------------------------------------
# A cada iteração:
#   1. Verifica se o Wi-Fi ainda está ativo.
#   2. Se o client MQTT for None (conexão caiu), tenta reconectar.
#   3. Chama check_msg() para mover mensagens do buffer TCP para a fila.
#   4. Processa todos os comandos enfileirados.
#
# OSError indica queda do socket MQTT (broker inacessível ou rede oscilou).
# Nesse caso, client é zerado e a reconexão ocorre na próxima iteração.
# Outros erros inesperados são logados e o loop continua após uma pausa.
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




