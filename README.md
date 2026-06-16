# AudioText

Progressive Web App (PWA) de gravação e transcrição de áudio com **Vite + React**.
Grava áudio, converte em texto e gera relatórios formatados. **Esta versão é só a interface** (dados fictícios, sem backend de transcrição ainda).

## Telas


Home (splash), Gravar, Transcrição (Texto/Resumo), Relatório, Anexos e Player de áudio — navegáveis entre si.

## Paleta

Base azul petróleo (`#0a2a30` → `#124c57`) nas superfícies escuras e CTAs, com acentos em **tríade de cor** (matiz ~188°/308°/68°): teal `#1aa6ba`, magenta `#c2418c` e verde-limão `#9aac2e`. Tokens em `src/index.css`.

## Pré-requisitos

- Node.js 18+ e npm

## Instalar dependências (criar o ambiente)

No terminal WSL, dentro da pasta do projeto:

```bash
npm install
```

Isso cria a pasta `node_modules/` com todas as dependências (Vite, React e o plugin PWA).

## Rodar em desenvolvimento

```bash
npm run dev
```

Abra o endereço mostrado (geralmente `http://localhost:5173`). O service worker já roda em dev (`devOptions.enabled`).

## Build de produção

```bash
npm run build
npm run preview
```

O `npm run build` gera a pasta `dist/` com o service worker e o manifest prontos para instalação como PWA.

## Estrutura

```
officeHub/
├── index.html
├── package.json
├── vite.config.js          # Vite + vite-plugin-pwa (manifest/SW)
├── public/
│   ├── favicon.svg
│   └── icons/icon.svg      # ícone do app (PWA)
└── src/
    ├── main.jsx
    ├── App.jsx             # navegação entre telas + bottom nav
    ├── index.css           # design system / tokens de cor
    ├── icons.jsx           # ícones SVG inline
    ├── data.js             # dados fictícios
    ├── components/
    │   └── Waveform.jsx
    └── screens/
        ├── Home.jsx
        ├── Record.jsx
        ├── Transcription.jsx
        ├── Report.jsx
        ├── Attachments.jsx
        └── Player.jsx
```

## Ícones

O manifest usa `public/icons/icon.svg`. Navegadores modernos aceitam ícones SVG.
Se quiser ícones PNG (192x192 e 512x512) para máxima compatibilidade, gere a partir do SVG, por exemplo:

```bash
npx -y @squoosh/cli --resize '{"width":512,"height":512}' public/icons/icon.svg
```

ou use qualquer conversor de SVG para PNG e ajuste o array `icons` em `vite.config.js`.
