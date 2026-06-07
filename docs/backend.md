# Backend

API NestJS para controlar o jogo Genius, publicar comandos MQTT, repassar eventos em tempo real por Socket.IO e persistir dados no PostgreSQL.

## Estrutura

```
src/
├── main.ts                 # Bootstrap HTTP + microserviço MQTT
├── app.module.ts           # Módulos principais da aplicação
├── app.controller.ts       # Health/debug e status do embarcado
├── app.service.ts
├── mqtt.controller.ts      # Escuta tópicos MQTT vindos do ESP32
├── embarcado/
│   ├── embarcado.module.ts # Módulo de domínio do ESP32
│   └── embarcado.service.ts # Normalização e persistência do embarcado
├── prisma/
│   ├── prisma.module.ts    # PrismaService global
│   └── prisma.service.ts   # Acesso ao PostgreSQL e criação das tabelas
├── jogo/
│   ├── jogo.module.ts
│   ├── jogo.controller.ts  # Endpoints de controle do jogo
│   ├── jogo.service.ts     # Publicação MQTT
│   └── jogo.gateway.ts     # Socket.IO para o frontend
└── ranking/
    ├── ranking.module.ts
    ├── ranking.controller.ts
    └── ranking.service.ts  # Validação e persistência do ranking
```

## Comandos

```bash
# Desenvolvimento
npm run start:dev

# Build
npm run build

# Produção
npm run start:prod

# Testes
npm run test

# Lint
npm run lint
```

## Variáveis de Ambiente

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/app-database
MQTT_URL=mqtt://mosquitto:1883
PORT=3000
```

No Docker, `DATABASE_URL` e `MQTT_URL` são injetadas pelo `docker-compose.yml`. Fora do Docker, o backend usa `mqtt://localhost:1883` como fallback para o broker, mas exige `DATABASE_URL` para iniciar a persistência.

## Inicialização

O arquivo `main.ts` cria a aplicação HTTP, aplica o prefixo global `/api` e conecta um microserviço MQTT no mesmo processo.

```typescript
app.setGlobalPrefix('api');
app.connectMicroservice({
  transport: Transport.MQTT,
  options: { url: process.env.MQTT_URL || 'mqtt://localhost:1883' },
});
```

A API HTTP sobe sem bloquear caso o broker MQTT demore a responder. O listener MQTT é iniciado em paralelo e registra erro no log se a conexão falhar.

## Endpoints HTTP

| Método | Rota | Função |
|--------|------|--------|
| `GET` | `/api` | Retorna mensagem simples de saúde |
| `GET` | `/api/embarcado/status` | Retorna o status conhecido do ESP32 |
| `GET` | `/api/debug/ping` | Retorna diagnóstico básico do backend |
| `POST` | `/api/jogo/led` | Envia uma cor para o ESP32 |
| `POST` | `/api/jogo/iniciar` | Inicia uma partida |
| `POST` | `/api/jogo/reiniciar` | Reinicia a partida |
| `POST` | `/api/jogo/confirmar` | Confirma a sequência digitada |
| `POST` | `/api/ranking` | Salva uma pontuação |
| `GET` | `/api/ranking` | Lista o ranking |

## Módulo Jogo

O `JogoController` valida as requisições HTTP e delega a publicação MQTT para o `JogoService`.

### Enviar LED

```http
POST /api/jogo/led
Content-Type: application/json

{
  "cor": "verde"
}
```

Cores aceitas: `verde`, `vermelho`, `amarelo`, `azul`.

Payload MQTT publicado em `esp32_genius/led`:

```json
{
  "cor": "verde",
  "acao": "on"
}
```

### Comandos do Jogo

```http
POST /api/jogo/iniciar
POST /api/jogo/reiniciar
POST /api/jogo/confirmar
```

Payload MQTT publicado em `esp32_genius/jogo`:

```json
{
  "acao": "iniciar"
}
```

As ações aceitas pelo backend são `iniciar`, `reiniciar` e `confirmar`.

## Módulo Embarcado

O `EmbarcadoModule` centraliza a lógica relacionada ao ESP32. Hoje ele expõe o `EmbarcadoService`, usado pelo `MqttController` quando chega uma mensagem no tópico `esp32_genius/status`.

Responsabilidades do `EmbarcadoService`:

| Responsabilidade | Descrição |
|------------------|-----------|
| Normalizar presença | Converte payloads booleanos, strings ou JSON em `online: true/false` |
| Extrair identificação | Lê `nome`, `marca`, `modelo` e `ip` quando existirem no payload |
| Persistir conexão | Faz `upsert` dos dados do ESP32 na tabela `embarcados` |

Payload esperado para persistência:

```json
{
  "online": true,
  "nome": "esp32_genius",
  "marca": "Espressif",
  "modelo": "ESP32",
  "ip": "192.168.1.10"
}
```

Se a persistência falhar, o status de presença ainda é normalizado e repassado ao frontend. Assim, uma falha temporária no banco não impede a interface de mostrar que o dispositivo foi visto no MQTT.

## WebSocket

O `JogoGateway` usa Socket.IO com CORS liberado e path `/socket.io`.

Eventos emitidos para o frontend:

| Evento | Payload | Origem |
|--------|---------|--------|
| `estado` | Estado atual do jogo | `esp32_genius/estado` |
| `embarcado-status` | `{ online, lastSeenAt }` | Conexão do cliente ou tópico de status |

Ao conectar, cada cliente recebe imediatamente um snapshot do status do embarcado:

```json
{
  "online": false,
  "lastSeenAt": null
}
```

## MQTT

O backend usa MQTT nestas responsabilidades:

| Classe | Função |
|--------|--------|
| `JogoService` | Publica comandos para o ESP32 |
| `MqttController` | Escuta telemetria, estado e presença do ESP32 |
| `EmbarcadoService` | Processa status e persiste dados do embarcado |

### Tópicos Publicados

| Tópico | Payload |
|--------|---------|
| `esp32_genius/led` | `{ "cor": "verde", "acao": "on" }` |
| `esp32_genius/jogo` | `{ "acao": "iniciar" }` |

### Tópicos Consumidos

| Tópico | Comportamento |
|--------|---------------|
| `esp32_genius/estado` | Marca o embarcado como online e emite `estado` por Socket.IO |
| `esp32_genius/led` | Registra telemetria no log |
| `esp32_genius/status` | Atualiza presença e salva dados do embarcado |

O tópico `esp32_genius/status` aceita payloads booleanos, strings (`online`, `true`, `1`) ou JSON com `online`/`status`. Mensagens retidas são ignoradas pelo `MqttController` para evitar status antigo. Payloads válidos são enviados ao `EmbarcadoService`.

## Ranking

O `RankingController` valida o formato do payload e o `RankingService` normaliza os dados antes de persistir.

```http
POST /api/ranking
Content-Type: application/json

{
  "apelido": "Jogador",
  "fase": 5
}
```

Regras aplicadas:

| Campo | Regra |
|-------|-------|
| `apelido` | String com 1 a 20 caracteres após `trim()` |
| `fase` | Número inteiro positivo |

O ranking é listado por `fase` decrescente e, em caso de empate, por `createdAt` decrescente.

## Persistência

O `PrismaService` mantém uma conexão PostgreSQL via `pg`, cria as tabelas necessárias na inicialização e expõe os métodos usados pelos serviços.

Tabelas criadas automaticamente:

| Tabela | Uso |
|--------|-----|
| `partida` | Ranking das partidas |
| `embarcados` | Último IP e dados de identificação do ESP32 |

### partida

```sql
CREATE TABLE IF NOT EXISTS partida (
  id SERIAL PRIMARY KEY,
  apelido VARCHAR(20) NOT NULL,
  fase INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### embarcados

```sql
CREATE TABLE IF NOT EXISTS embarcados (
  nome VARCHAR(100) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  ip VARCHAR(45) NOT NULL,
  data_conexao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (nome, marca, modelo)
);
```

Quando o ESP32 publica `nome`, `marca`, `modelo` e `ip` no tópico de status, o `EmbarcadoService` chama o `PrismaService`, faz `upsert` em `embarcados` e atualiza `data_conexao`.
