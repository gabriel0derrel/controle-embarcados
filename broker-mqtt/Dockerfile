FROM eclipse-mosquitto:2.0.18

# O primeiro caminho 'config/mosquitto.conf' procura a partir da pasta 'broker-mqtt' do seu PC.
# O segundo caminho '/mosquitto/config/mosquitto.conf' é o local de destino correto DENTRO do container.
COPY config/mosquitto.conf /mosquitto/config/mosquitto.conf

# Garante que o Mosquitto vai rodar apontando para o arquivo no local correto do container
CMD ["/usr/sbin/mosquitto", "-c", "/mosquitto/config/mosquitto.conf"]

EXPOSE 1883 9001
