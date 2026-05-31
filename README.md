# controle-embarcados

# Conectar embarcado na rede Wi-Fi pela primeira vez
## 1 Passo
Se conectar na rede ESP32_Setup com a senha 12345678

## 2 Passo
Acessar 192.168.4.1

## 3 Passo
Incicar o SSID(Nome) e Senha da rede a ser conectada, e indicar o IP e a Porta do Broker

## 4 Passo
Salvar e esperar o reboot

# Docker Compose
## Construir os conteiners
```bash
sudo -E docker compose up --build -d
```
## Subir conteiners existentes
```bash
sudo -E docker compose up -d
```

## Listar conteiners
```bash
sudo docker-compose ps
```
## Remover conteiners
```bash
sudo docker-compose down
```
## Pausar conteiners
```bash
sudo docker-compose stop
```
### Recomeçar conteiners
```bash
sudo docker-compose start
```


# Endpoints
## Aplicação Completa (via Nginx)

http://localhost:8080 

Você deve ver a página inicial do React/Vite.

## PGAdmin: 

http://localhost:5550

Use o e-mail e senha do arquivo .env para fazer login. Você pode adicionar um novo servidor para se conectar ao banco de dados usando postgres como nome do host.

## API (via Nginx): 

http://localhost:8080/api/
.

## Frontend (direto):

http://localhost:5173 

Para interagir diretamente com o servidor de desenvolvimento do Vite.
