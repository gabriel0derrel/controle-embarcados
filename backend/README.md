# Backend - Genius IoT

API NestJS para controle do jogo Genius via MQTT e persistência de dados.

## Estrutura

```
src/
├── app.module.ts         # Módulo raiz
├── app.controller.ts     # Controller padrão
├── app.service.ts        # Service padrão
├── mqtt.controller.ts    # Escuta tópicos MQTT do ESP32
├── jogo/                 # Módulo do jogo
│   ├── jogo.module.ts
│   ├── jogo.controller.ts  # Endpoints REST
│   ├── jogo.service.ts     # Publica mensagens MQTT
│   └── jogo.gateway.ts     # WebSocket para tempo real
└── ranking/              # Módulo do ranking (placeholder)
    ├── ranking.module.ts
    ├── ranking.controller.ts
    └── ranking.service.ts
```

## Endpoints

### Jogo (`/jogo`)

| Método | Rota | Body | Descrição |
|--------|------|------|-----------|
| POST | `/jogo/led` | `{ "cor": "verde" }` | Envia cor pressionada |
| POST | `/jogo/iniciar` | - | Inicia o jogo |
| POST | `/jogo/reiniciar` | - | Reinicia o jogo |
| POST | `/jogo/confirmar` | - | Confirma sequência |
| POST | `/jogo/cancelar` | - | Remove última cor |

### Ranking (`/ranking`)

| Método | Rota | Body | Descrição |
|--------|------|------|-----------|
| POST | `/ranking` | `{ "apelido": "AAA", "fase": 5 }` | Salva pontuação |
| GET | `/ranking` | - | Lista top 10 |

### WebSocket

Conexão via Socket.IO no path `/socket.io`.

**Evento emitido:** `estado` - Estado atual do jogo recebido do ESP32.

```typescript
interface EstadoJogo {
  tela: 'inicio' | 'piscando' | 'aguardando' | 'certo' | 'errado';
  fase: number;
  seq_len: number;
  entrada: string[];
}
```

## Tarefas Pendentes

### 1. Configurar Prisma (ORM)

```bash
npm install prisma @prisma/client
npx prisma init
```

Criar `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Partida {
  id        Int      @id @default(autoincrement())
  apelido   String   @db.VarChar(3)
  fase      Int
  createdAt DateTime @default(now())

  @@index([fase])
}

model Device {
  id        Int      @id @default(autoincrement())
  nome      String
  ip        String
  ativo     Boolean  @default(true)
  createdAt DateTime @default(now())
}
```

```bash
npx prisma migrate dev --init
```

### 2. Criar PrismaService

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

### 3. Atualizar RankingService

```typescript
// src/ranking/ranking.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

### 4. (Opcional) DeviceService

```typescript
// src/device/device.service.ts
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
npm run test:e2e
```

## Variáveis de Ambiente

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/app-database
MQTT_URL=mqtt://mosquitto:1883
PORT=3000
```
