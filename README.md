# Genius IoT

Projeto acadêmico de controle remoto de dispositivos embarcados. Interface web para jogar Genius contra um ESP32 via MQTT.

## Arquitetura

```mermaid
graph LR
    Frontend[Frontend<br/>React + Vite] -->|HTTP| Nginx[Nginx<br/>Proxy Reverso]
    Nginx -->|/api| Backend[Backend<br/>NestJS]
    Nginx -->|WebSocket| Backend
    Backend -->|MQTT| Mosquitto[Mosquitto<br/>Broker]
    Mosquitto -->|MQTT| ESP32[ESP32<br/>Genius HW]
    Backend -->|PostgreSQL| DB[(PostgreSQL)]
```

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

## Stack

| Componente | Tecnologia |
|------------|------------|
| Frontend | React 19 + Vite + Bootstrap 5 |
| Backend | NestJS + Socket.IO |
| Banco de Dados | PostgreSQL |
| Broker MQTT | Mosquitto |
| Proxy | Nginx |
| Embarcado | MicroPython (ESP32) |

## Primeiro Acesso ao ESP32

1. Conectar na rede Wi-Fi `ESP32_Setup` (senha: `12345678`)
2. Acessar `192.168.4.1` no navegador
3. Preencher SSID, senha da rede, IP e porta do broker MQTT
4. Salvar e aguardar o reboot

## Docker Comando

```bash
# Build e iniciar
sudo docker compose up --build -d

# Iniciar containers existentes
sudo docker compose up -d

# Ver logs
sudo docker compose logs -f [serviço]

# Parar
sudo docker compose down

# Status
sudo docker compose ps
```

## URLs

| Serviço | URL |
|---------|-----|
| Aplicação | http://localhost:8080 |
| Frontend (Vite) | http://localhost:5173 |
| API | http://localhost:8080/api |
| PGAdmin | http://localhost:5550 |

## Estrutura do Projeto

```
controle-embarcados/
├── frontend/           # React + Vite
│   └── src/
│       ├── components/ # Componentes reutilizáveis
│       ├── hooks/      # Hooks customizados (useMqtt)
│       ├── pages/      # Páginas (Inicio, Jogo, Ranking)
│       └── routes/     # Configuração de rotas
├── backend/            # NestJS
│   └── src/
│       ├── jogo/       # Módulo do jogo (controller, service, gateway)
│       └── ranking/    # Módulo do ranking (controller, service)
├── broker-mqtt/        # Configuração do Mosquitto
├── nginx/              # Configuração do proxy reverso
└── embarcado/          # Código MicroPython do ESP32
```

---

## Documentação do Backend

### Módulos Existentes

#### JogoModule (`/jogo`)

Endpoints para comunicação com o ESP32:

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/jogo/led` | Envia cor pressionada pelo jogador |
| POST | `/jogo/iniciar` | Inicia o jogo |
| POST | `/jogo/reiniciar` | Reinicia o jogo |
| POST | `/jogo/confirmar` | Confirma sequência do jogador |

**WebSocket (Socket.IO):**
- Evento `estado` - Broadcast do estado do jogo para todos os clientes conectados

#### RankingModule (`/ranking`)

Endpoints para ranking (placeholder - precisa ser implementado):

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/ranking` | Salva apelido + fase do jogador |
| GET | `/ranking` | Lista top 10 do ranking |

### Tarefas Pendentes no Backend

#### 1. Conectar PostgreSQL

O serviço do PostgreSQL já está rodando via Docker. Precisa:

- [ ] Instalar Prisma ou TypeORM
- [ ] Configurar conexão com `DATABASE_URL` do `.env`
- [ ] Criar schema/models

**Schema sugerido (Prisma):**

```prisma
model Device {
  id        Int      @id @default(autoincrement())
  nome      String
  ip        String
  ativo     Boolean  @default(true)
  createdAt DateTime @default(now())
}

model Partida {
  id        Int      @id @default(autoincrement())
  apelido   String   @db.VarChar(3)
  fase      Int
  deviceId  Int?
  device    Device?  @relation(fields: [deviceId], references: [id])
  createdAt DateTime @default(now())
}

model Device {
  id        Int       @id @default(autoincrement())
  nome      String
  ip        String
  ativo     Boolean   @default(true)
  partidas  Partida[]
  createdAt DateTime  @default(now())
}
```

#### 2. Implementar RankingService

Substituir o placeholder por queries reais:

```typescript
// ranking.service.ts
@Injectable()
export class RankingService {
  constructor(private prisma: PrismaService) {}

  async salvar(apelido: string, fase: number) {
    return this.prisma.partida.create({
      data: {
        apelido: apelido.toUpperCase().slice(0, 3),
        fase,
      },
    });
  }

  async listar() {
    return this.prisma.partida.findMany({
      orderBy: { fase: 'desc' },
      take: 10,
    });
  }
}
```

#### 3. Implementar DeviceService

CRUD básico para devices (caso o professor peça):

```typescript
// device.service.ts
@Injectable()
export class DeviceService {
  constructor(private prisma: PrismaService) {}

  async listar() {
    return this.prisma.device.findMany({ where: { ativo: true } });
  }

  async criar(data: { nome: string; ip: string }) {
    return this.prisma.device.create({ data });
  }
}
```

#### 4. Salvar Partidas Automaticamente

Quando o jogador erra, salvar a partida automaticamente:

- O frontend envia o apelido + fase via POST `/ranking`
- O backend salva no PostgreSQL

### Variáveis de Ambiente

Configuradas no `.env`:

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=app-database
POSTGRES_PORT=5532

# Backend
BACKEND_PORT=3000
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/app-database
MQTT_URL=mqtt://mosquitto:1883

# Frontend
FRONTEND_PORT=5173
NGINX_PORT=8080
```

### Tópicos MQTT

| Tópico | Direção | Descrição |
|--------|---------|-----------|
| `esp32_genius/led` | Frontend → ESP32 | Cor pressionada pelo jogador |
| `esp32_genius/jogo` | Frontend → ESP32 | Comandos de controle (iniciar, reiniciar, etc) |
| `esp32_genius/estado` | ESP32 → Frontend | Estado atual do jogo |

**Payload do estado:**
```json
{
  "tela": "aguardando",
  "fase": 3,
  "seq_len": 3,
  "entrada": ["verde", "vermelho"]
}
```
