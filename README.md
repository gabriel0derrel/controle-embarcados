# docker-lab

# Docker Compose
## Subir os conteiners
```bash
sudo -E docker compose up --build -d
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

Você deve ver amensagem "Hello World!" do NestJS.

## Frontend (direto):

http://localhost:5173 

Para interagir diretamente com o servidor de desenvolvimento do Vite (com hot-reload).
