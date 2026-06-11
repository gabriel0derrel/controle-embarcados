# Backend para apresentação

## O que o backend faz

O backend é feito em NestJS e tem três funções principais:

1. Receber comandos do frontend (tela do jogo).
2. Trocar mensagens com o ESP32 usando MQTT (criando tópicos para enviar pro ESP32).
3. Guardar informações no PostgreSQL, como ranking e dados do embarcado (Através do prisma).

## Fluxo geral

O arquivo [main.ts](../backend/src/main.ts) inicia a aplicação HTTP convencional na porta 3000 e também conecta o microserviço MQTT.
Isso significa que o backend trabalha em dois caminhos ao mesmo tempo:

- HTTP: atende as rotas que o frontend chama.
- MQTT: escuta mensagens que vêm do ESP32 e envia comandos para ele.

## Comandos mais importantes

Os comandos mais usados no backend são simples de explicar:

- `POST /api/jogo/led`: pede para acender uma cor no ESP32.
- `POST /api/jogo/iniciar`: começa uma partida.
- `POST /api/jogo/reiniciar`: reinicia a partida.
- `POST /api/jogo/confirmar`: confirma a jogada.
- `POST /api/ranking`: salva a pontuação do jogador.
- `GET /api/ranking`: lista o ranking.

Também existem tópicos MQTT importantes:

- `esp32_genius/led`: recebe o comando da cor.
- `esp32_genius/jogo`: recebe comandos da partida.
- `esp32_genius/estado`: envia o estado atual do ESP32.
- `esp32_genius/status`: informa se o embarcado está online.

## Organização por módulos

O backend foi separado em módulos para ficar mais fácil de entender:

- [AppModule](../backend/src/app.module.ts): junta os módulos principais.
- [JogoModule](../backend/src/jogo/jogo.module.ts): controla as ações do jogo.
- [RankingModule](../backend/src/ranking/ranking.module.ts): salva e lista o ranking.
- [EmbarcadoModule](../backend/src/embarcado/embarcado.module.ts): trata os dados do ESP32.
- [PrismaModule](../backend/src/prisma/prisma.module.ts): dá acesso ao banco.

## Parte do jogo

O módulo de jogo é o mais visível para o usuário.

### Rotas HTTP

O [JogoController](../backend/src/jogo/jogo.controller.ts) recebe os pedidos do frontend:

- `POST /api/jogo/led`
- `POST /api/jogo/iniciar`
- `POST /api/jogo/reiniciar`
- `POST /api/jogo/confirmar`

Explicação simples:

- `led`: controla a luz escolhida no jogo.
- `iniciar`: começa uma nova rodada.
- `reiniciar`: limpa o estado e começa de novo.
- `confirmar`: confirma a sequência jogada.

### O que acontece depois

O [JogoService](../backend/src/jogo/jogo.service.ts) transforma esses pedidos em mensagens MQTT.

Exemplo simples:

- o frontend pede para acender uma cor;
- o backend publica isso no tópico `esp32_genius/led`;
- o ESP32 recebe e executa.

Em outras palavras, ele faz a ponte entre a tela e a placa.

### WebSocket

O [JogoGateway](../backend/src/jogo/jogo.gateway.ts) envia atualizações em tempo real para o frontend.

Ele é usado para:

- mandar o estado atual do jogo;
- informar se o embarcado está online;
- avisar quando um cliente conecta.

## Parte MQTT

O [MqttController](../backend/src/mqtt.controller.ts) escuta mensagens que chegam do ESP32.

Os tópicos mais importantes são:

- `esp32_genius/estado`: atualiza o estado do jogo;
- `esp32_genius/status`: atualiza a presença do ESP32;
- `esp32_genius/led`: registra cores recebidas.

Esses tópicos servem para o backend saber o que o ESP32 está fazendo e repassar isso para o restante do sistema.

Quando chega um status do ESP32, o backend:

1. identifica se ele está online ou offline;
2. salva os dados de conexão, se existirem;
3. repassa essa informação para o frontend.

## Parte do embarcado

O [EmbarcadoService](../backend/src/embarcado/embarcado.service.ts) faz a leitura do status do ESP32.

Ele tenta entender mensagens simples como:

- `online`
- `true`
- `1`
- JSON com campo `online`

Se vierem dados como nome, marca, modelo e IP, ele também salva isso no banco.

Na prática, ele pega uma mensagem do MQTT e transforma em um status mais fácil de usar.

## Ranking

O [RankingController](../backend/src/ranking/ranking.controller.ts) recebe os dados do jogador.

O [RankingService](../backend/src/ranking/ranking.service.ts) valida e salva:

- `apelido` entre 1 e 20 caracteres;
- `fase` como número inteiro positivo.

Depois, a lista é retornada com a maior fase primeiro.

Comandos mais relevantes:

- `POST /api/ranking`: envia o nome e a fase para salvar.
- `GET /api/ranking`: busca os melhores resultados.

## Banco de dados

O [PrismaService](../backend/src/prisma/prisma.service.ts) é a porta de entrada para o banco de dados.
Explicando de forma simples: ele converte tudo que o backend precisa fazer no PostgreSQL em forma de código para evitar o uso de SQL, automaticamente formando as tabelas e vinculos necessarios.

Ajuda a:

- organizar o acesso ao banco em um único lugar;
- gera as tabelas sem precisar faze-lo manualmente, e gera classes/metodos de acesso a elas automaticamente.
- criar independencia do SQL server. (pode ser mudado eventualmente sem problema)

No projeto, ele é aplicado como um serviço do NestJS que os outros módulos usam quando precisam salvar ou consultar algo.

Ele cria duas tabelas principais:

- `partida`: guarda o ranking das partidas;
- `embarcado`: guarda os dados do ESP32 que apareceu no MQTT.

O arquivo [schema.prisma](../backend/prisma/schema.prisma) mostra o formato dessas tabelas.

Na prática, o schema serve como o desenho do banco: ele mostra quais campos existem e como os dados são organizados.

## Resumo

> O backend é o centro de comunicação do projeto. Ele recebe ações do frontend, envia comandos para o ESP32 via MQTT, escuta respostas do ESP32 em tempo real e salva ranking e dados do dispositivo no banco de dados.

## Roteiro de 1 minuto

1. O `main.ts` sobe a API HTTP e o MQTT juntos.
2. O módulo de jogo manda comandos para o ESP32.
3. O MQTT recebe o estado e a presença do embarcado.
4. O ranking é salvo no PostgreSQL.
5. O WebSocket atualiza o frontend em tempo real.