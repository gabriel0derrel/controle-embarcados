# Etapa 1: Define a imagem base do Node.js
FROM node:lts-alpine
# Etapa 2: Define o diretório de trabalho
WORKDIR /usr/src/app
# Etapa 3: Copia os arquivos de definição de dependências
COPY package*.json ./
# Etapa 4: Instala as dependências
RUN npm install
# Etapa 5: Copia o restante do código da aplicação
COPY . .
# Etapa 6: Expõe a porta do servidor de desenvolvimento do Vite
EXPOSE 5173
# Etapa 7: Inicia o servidor do Vite, escutando em todas as interfaces de rede
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]