# Usa a imagem oficial do Nginx
FROM nginx:alpine
# Remove a configuração padrão para evitar conflitos
RUN rm /etc/nginx/conf.d/default.conf
# Copia nosso arquivo de configuração personalizado para o local correto
COPY nginx.conf /etc/nginx/conf.d