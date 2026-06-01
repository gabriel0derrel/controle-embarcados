# Tópicos MQTT

## Tópicos Utilizados

| Tópico | Direção | Descrição |
|--------|---------|-----------|
| `esp32_genius/led` | Frontend → ESP32 | Cor pressionada pelo jogador |
| `esp32_genius/jogo` | Frontend → ESP32 | Comandos de controle |
| `esp32_genius/estado` | ESP32 → Frontend | Estado atual do jogo |

---

## esp32_genius/led

**Publicado por:** Backend (via frontend)

**Payload:**
```json
{
  "cor": "verde",
  "acao": "on"
}
```

**Cores válidas:** `verde`, `vermelho`, `amarelo`, `azul`

---

## esp32_genius/jogo

**Publicado por:** Backend (via frontend)

**Payload:**
```json
{
  "acao": "iniciar" | "reiniciar" | "confirmar"
}
```

| Ação | Descrição |
|------|-----------|
| `iniciar` | Inicia uma nova partida |
| `reiniciar` | Reseta o jogo para o estado inicial |
| `confirmar` | Confirma a sequência digitada pelo jogador |

---

## esp32_genius/estado

**Publicado por:** ESP32

**Payload:**
```json
{
  "tela": "aguardando",
  "fase": 3,
  "seq_len": 3,
  "entrada": ["verde", "vermelho"]
}
```

### Estados da tela

| Estado | Descrição |
|--------|-----------|
| `inicio` | Aguardando comando para iniciar |
| `piscando` | Sequência sendo exibida nos LEDs |
| `aguardando` | Vez do jogador |
| `certo` | Jogador acertou, avançando de fase |
| `errado` | Jogador errou |

### Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `tela` | string | Estado atual da máquina de estados |
| `fase` | number | Número da rodada atual |
| `seq_len` | number | Tamanho da sequência atual |
| `entrada` | string[] | Cores digitadas pelo jogador nesta rodada |

---

## Configuração do Broker

**Arquivo:** `broker-mqtt/config/mosquitto.conf`

```
allow_anonymous true
listener 1883 0.0.0.0
protocol mqtt

listener 9001 0.0.0.0
protocol websockets
```

- Porta `1883`: MQTT (ESP32 e Backend)
- Porta `9001`: WebSockets (Frontend, se necessário)
