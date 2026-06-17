import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { initializeFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Só inicializa se estiver configurado (evita quebrar o app sem .env)
export const isConfigured = Boolean(config.apiKey && config.projectId)

let app, auth, db, storage
if (isConfigured) {
  app = initializeApp(config)
  auth = getAuth(app)
  // long-polling forçado evita os erros de CORS/WebChannel (WSL/extensões/proxy)
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
  })
  storage = getStorage(app)
}

export const projectId = config.projectId
export { app, auth, db, storage }
