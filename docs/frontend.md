# Frontend

Interface web em React para o jogo Genius IoT.

## Estrutura

```
src/
├── App.tsx
├── App.css
├── index.css           # Variáveis CSS e estilos do Genius
├── main.tsx
├── components/
│   ├── GeniusPad.tsx   # Botões coloridos do jogo
│   ├── Navbar.tsx      # Barra de navegação
│   ├── Footer.tsx      # Rodapé
│   └── InicioScreen.tsx # Tela inicial
├── hooks/
│   └── useMqtt.ts      # Hook de conexão MQTT/Socket.IO
├── pages/
│   ├── InicioPage.tsx
│   ├── JogoPage.tsx
│   └── RankingPage.tsx
└── routes/
    └── index.tsx       # Configuração de rotas
```

## Comandos

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview do build
npm run preview
```

## Rotas

| Rota | Página |
|------|--------|
| `/` | Tela inicial |
| `/jogo` | Tela do jogo |
| `/ranking` | Tela de ranking / Game Over |

## Componentes Principais

### GeniusPad

Botões coloridos do jogo Genius. Emite feedback visual ao clicar.

```tsx
<GeniusPad
  onColorPress={(cor) => handleColorPress(cor)}
  disabled={false}
/>
```

### useMqtt

Hook para comunicação com o backend via Socket.IO e HTTP.

```tsx
const { connected, estado, enviarLed, enviarJogo } = useMqtt();

// Enviar cor
enviarLed('verde');

// Enviar comando
enviarJogo('iniciar');
```

## Variáveis CSS

```css
:root {
  --genius-green: #28a745;
  --genius-green-lit: #5eff82;
  --genius-red: #dc3545;
  --genius-red-lit: #ff6b7a;
  --genius-yellow: #ffc107;
  --genius-yellow-lit: #ffe066;
  --genius-blue: #007bff;
  --genius-blue-lit: #66b3ff;
}
```
