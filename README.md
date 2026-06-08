# Genius IoT

Projeto acadêmico de controle remoto de dispositivos embarcados. Interface web para jogar Genius contra um ESP32 via MQTT.

## Como Funciona

O projeto permite controlar remotamente um dispositivo ESP32 que executa o jogo Genius (Simon Says). O jogador interage pela interface web, que envia comandos via MQTT para o hardware físico.

## Início Rápido

### Pré-requisitos

- Docker e Docker Compose instalados
- Rede Wi-Fi disponível

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/gabriel0derrel/controle-embarcados
cd controle-embarcados

# Criar arquivo de ambiente
cp .env.example .env

# Iniciar os serviços
docker compose up --build -d
```

### Aplicar migrações do banco (Prisma)

Após o banco estar disponível você precisa gerar o client Prisma e aplicar a migração inicial. O Prisma precisa da variável `DATABASE_URL` do `.env` raiz. Execute um dos comandos abaixo:

**Opção 1: no host (padrão para desenvolvimento):**

```bash
# Copiar o .env da raiz para o backend (Prisma vai ler)
cp .env backend/.env

# Instalar dependências e aplicar migração
cd backend
npm install
npx prisma migrate dev --name init
```

**Opção 2: dentro do container (ambiente Docker):**

```bash
docker compose exec backend sh -c "cp ../.env .env && npm install && npx prisma migrate dev --name init"
```

> **Observação**: `npm install` executa `prisma generate` via `postinstall`, garantindo que o client Prisma seja gerado. O Prisma procura por `.env` na pasta raiz do projeto ou onde o comando é executado.


### Acessando

| Serviço | URL |
|---------|-----|
| Aplicação | http://localhost:8080 |
| PGAdmin | http://localhost:5550 |

### Configurando o ESP32

1. Conectar na rede Wi-Fi `ESP32_Setup` (senha: `12345678`)
2. Acessar `192.168.4.1` no navegador
3. Preencher SSID, senha da rede, IP e porta do broker MQTT
4. Salvar e aguardar o reboot

## Comandos Docker

```bash
# Iniciar
docker compose up --build -d

# Ver logs
docker compose logs -f [serviço]

# Parar
docker compose down

# Status
docker compose ps
```

## Estrutura

```
controle-embarcados/
├── frontend/        # Interface web (React)
├── backend/         # API (NestJS)
├── broker-mqtt/     # Mosquitto
├── nginx/           # Proxy reverso
├── embarcado/       # Código do ESP32
└── docs/            # Documentação técnica
```

## Documentação Técnica

- [Arquitetura e Fluxo](docs/arquitetura.md)
- [Backend](docs/backend.md)
- [Frontend](docs/frontend.md)
- [Endpoints da API](docs/api.md)
- [Tópicos MQTT](docs/mqtt.md)
