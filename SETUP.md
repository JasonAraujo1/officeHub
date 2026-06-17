# controllerHub — Setup funcional (Firebase + Cloud Functions + IA)

Arquitetura (backend = Firebase Cloud Functions):

```
PWA (React)
  ├─ login (Firebase Auth / Google)
  ├─ cria doc "processing" no Firestore
  └─ grava/anexa áudio → Firebase Storage
                              │ (gatilho onObjectFinalized)
                              ▼
                     Cloud Function "processAudio"
                       ├─ AssemblyAI (transcrição + diarização)
                       ├─ OpenAI GPT-4o-mini (relatório completo + resumo)
                       └─ grava resultado no Firestore (Admin SDK)
PWA escuta o Firestore em tempo real e mostra o relatório.
```

As chaves de **AssemblyAI** e **OpenAI** ficam como **secrets** no Firebase (lado servidor). O PWA usa só a config pública do Firebase.

> O backend via **n8n** (pasta `n8n/`) virou alternativa/legado — não é necessário usando Cloud Functions.

---

## 1. Dependências do PWA

No WSL:

```bash
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd ~/programacaoLinux/officeHub
npm install            # já inclui o firebase
```

## 2. Firebase

1. Crie um projeto em https://console.firebase.google.com
2. **Authentication** → ative o provedor **E-mail/senha**.
3. **Firestore Database** → criar banco (modo produção).
4. **Storage** → ativar.
5. Em **Project settings → seus apps → Web app**, copie a config.
6. Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
# VITE_N8N_WEBHOOK_URL não é usado no backend via Cloud Functions
```

### Regras de segurança

As regras já foram publicadas pelo console (Storage → Regras e Firestore → Regras).
Se preferir pelo CLI, os arquivos `firestore.rules` e `storage.rules` estão no projeto:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,storage:rules
```

## 3. Chaves de IA

- **AssemblyAI:** crie conta em https://www.assemblyai.com e pegue a API Key.
- **OpenAI:** https://platform.openai.com/api-keys (modelo usado: `gpt-4o-mini`).

## 4. Cloud Functions (backend)

Tudo já está em `functions/` (`index.js` + `package.json`), e o `firebase.json`/`.firebaserc` já apontam para o projeto `controllerhub-d40d5`.

```bash
# instalar a CLI (se ainda não tiver) e logar
npm install -g firebase-tools
firebase login

# instalar deps da function
cd ~/programacaoLinux/officeHub/functions
npm install
cd ~/programacaoLinux/officeHub

# guardar as chaves como secrets (vai pedir o valor de cada uma)
firebase functions:secrets:set ASSEMBLYAI_API_KEY
firebase functions:secrets:set OPENAI_API_KEY

# fazer o deploy da função
firebase deploy --only functions
```

A função `processAudio` dispara automaticamente quando um áudio é enviado para
`users/{uid}/audios/...` no Storage — não precisa de webhook nem Service Account.

> Logs/erros: `firebase functions:log` ou no console em **Functions**.

## 5. Rodar o app

```bash
npm run dev
```

Faça login, grave um áudio e acompanhe em **Relatórios** — o card fica "Processando…"
e vira "Pronto" quando a função termina (segundos a ~1 min para áudios curtos).

---

## Modelo de dados (Firestore)

`users/{uid}/reports/{reportId}`:

| campo        | tipo    | descrição                                         |
|--------------|---------|---------------------------------------------------|
| title        | string  | título do relatório                               |
| status       | string  | `processing` \| `done` \| `error`                 |
| durationSec  | number  | duração do áudio                                   |
| audioUrl     | string  | URL do áudio no Storage                            |
| fullReport   | string  | relatório completo de audiodescrição              |
| summary      | map     | `{ abstract, topics[], actions[] }`               |
| transcript   | array   | `[{ speaker, text, start }]` (por interlocutor)   |
| speakers     | number  | nº de interlocutores                              |
| createdAt    | timestamp |                                                 |

## Observações

- O workflow faz *polling* no AssemblyAI a cada 15s. Para áudios longos, pode trocar pelo *webhook* do AssemblyAI depois.
- Se um áudio falhar, o doc fica em `processing`; dá pra adicionar um ramo de erro no IF para gravar `status: error`.
