# Backend

API NestJS para controle do jogo Genius via MQTT e persistência de dados.

## Estrutura

```
src/
├── app.module.ts
├── app.controller.ts
├── app.service.ts
├── mqtt.controller.ts    # Escuta tópicos MQTT do ESP32
├── jogo/
│   ├── jogo.module.ts
│   ├── jogo.controller.ts
│   ├── jogo.service.ts
│   └── jogo.gateway.ts   # WebSocket (Socket.IO)
└── ranking/
    ├── ranking.module.ts
    ├── ranking.controller.ts
    └── ranking.service.ts
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
```

## Variáveis de Ambiente

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/app-database
MQTT_URL=mqtt://mosquitto:1883
PORT=3000
```

## Tarefas Pendentes

### 1. Configurar Prisma (ORM)

```bash
npm install prisma @prisma/client
npx prisma init
```

Schema sugerido:

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
