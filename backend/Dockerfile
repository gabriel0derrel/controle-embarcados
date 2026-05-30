# Etapa 1: Define a imagem base do Node.js
FROM node:lts-alpine
# Etapa 2: Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app
# Etapa 3: Copia os arquivos de definição de dependências
COPY package*.json ./
# Etapa 4: Instala as dependências da aplicação
RUN npm install
# Etapa 5: Copia todo o restante do código-fonte
COPY . .
# Etapa 6: Expõe a porta que a API usará
EXPOSE 3000
# Etapa 7: Comando para iniciar a aplicação em modo de desenvolvimento
CMD ["npm", "run", "start:dev"]