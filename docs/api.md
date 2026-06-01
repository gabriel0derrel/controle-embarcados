# API Endpoints

## Jogo (`/jogo`)

Endpoints para comunicação com o ESP32 via MQTT.

### Enviar LED

```
POST /api/jogo/led
Content-Type: application/json

{
  "cor": "verde" | "vermelho" | "amarelo" | "azul"
}
```

**Resposta:**
```json
{ "ok": true }
```

### Iniciar Jogo

```
POST /api/jogo/iniciar
```

**Resposta:**
```json
{ "ok": true }
```

### Reiniciar Jogo

```
POST /api/jogo/reiniciar
```

**Resposta:**
```json
{ "ok": true }
```

### Confirmar Sequência

```
POST /api/jogo/confirmar
```

**Resposta:**
```json
{ "ok": true }
```

---

## Ranking (`/ranking`)

Endpoints para persistência do ranking (pendente implementação com PostgreSQL).

### Salvar Pontuação

```
POST /api/ranking
Content-Type: application/json

{
  "apelido": "AAA",
  "fase": 5
}
```

**Resposta:**
```json
{
  "id": 1,
  "apelido": "AAA",
  "fase": 5,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

### Listar Ranking

```
GET /api/ranking
```

**Resposta:**
```json
[
  { "id": 1, "apelido": "AAA", "fase": 12 },
  { "id": 2, "apelido": "BBB", "fase": 9 }
]
```

---

## WebSocket (Socket.IO)

Conexão no path `/socket.io`.

### Evento: `estado`

Recebe o estado atual do jogo enviado pelo ESP32.

```typescript
{
  tela: 'inicio' | 'piscando' | 'aguardando' | 'certo' | 'errado';
  fase: number;
  seq_len: number;
  entrada: string[];
}
```

**Exemplo de uso:**

```typescript
const socket = io('http://localhost:3000');

socket.on('estado', (data) => {
  console.log('Estado:', data.tela, 'Fase:', data.fase);
});
```
