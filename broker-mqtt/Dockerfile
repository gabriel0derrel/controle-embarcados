FROM eclipse-mosquitto:2.0.18

# Copia o arquivo de configuração personalizado para o container
COPY config/mosquitto.conf /broker-mqtt/config/mosquitto.conf

# Expõe as portas: 1883 (ESP32) e 9001 (WebSockets/Frontend)
EXPOSE 1883 9001
