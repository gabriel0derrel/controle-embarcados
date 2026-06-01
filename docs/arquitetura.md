# Arquitetura

## Visão Geral

```mermaid
graph LR
    Frontend[Frontend<br/>React + Vite] -->|HTTP| Nginx[Nginx<br/>Proxy Reverso]
    Nginx -->|/api| Backend[Backend<br/>NestJS]
    Nginx -->|WebSocket| Backend
    Backend -->|MQTT| Mosquitto[Mosquitto<br/>Broker]
    Mosquitto -->|MQTT| ESP32[ESP32<br/>Genius HW]
    Backend -->|PostgreSQL| DB[(PostgreSQL)]
```

## Componentes

| Componente | Tecnologia | Função |
|------------|------------|--------|
| Frontend | React 19 + Vite + Bootstrap 5 | Interface do usuário |
| Backend | NestJS + Socket.IO | API e comunicação em tempo real |
| PostgreSQL | Alpine | Armazenamento de dados |
| Mosquitto | Eclipse Mosquitto | Broker MQTT |
| Nginx | Alpine | Proxy reverso |
| ESP32 | MicroPython | Hardware do jogo Genius |

## Fluxo do Jogo

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant B as Backend
    participant E as ESP32

    U->>F: Clica "Iniciar"
    F->>B: POST /jogo/iniciar
    B->>E: MQTT esp32_genius/jogo
    
    E->>B: MQTT esp32_genius/estado (piscando)
    B->>F: WebSocket estado
    
    Note over E: Pisca sequência de cores
    
    E->>B: MQTT esp32_genius/estado (aguardando)
    B->>F: WebSocket estado
    
    U->>F: Clica nas cores
    F->>B: POST /jogo/led
    B->>E: MQTT esp32_genius/led
    
    E->>B: MQTT esp32_genius/estado (certo/errado)
    B->>F: WebSocket estado
```

## Redes Docker

Todos os serviços rodam na mesma rede Docker (`app_network`) e se comunicam pelo nome do serviço.
