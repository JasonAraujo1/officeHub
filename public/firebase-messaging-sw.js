/* Service worker do Firebase Cloud Messaging (push em segundo plano).
   Servido em /firebase-messaging-sw.js. Usa a config web pública do Firebase. */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js")

firebase.initializeApp({
  apiKey: "AIzaSyCI6R9w3n5xsOziAbEi3E-KHWE9S_6tOlA",
  authDomain: "controllerhub-d40d5.firebaseapp.com",
  projectId: "controllerhub-d40d5",
  storageBucket: "controllerhub-d40d5.firebasestorage.app",
  messagingSenderId: "834676786587",
  appId: "1:834676786587:web:ecb3e854fdf36b9e0f0d3e",
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const n = payload.notification || {}
  self.registration.showNotification(n.title || "Controlaí", {
    body: n.body || "",
    icon: "/icons/icon.svg",
    badge: "/icons/icon.svg",
    data: payload.data || {},
  })
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ("focus" in c) return c.focus() }
      if (clients.openWindow) return clients.openWindow("/")
    })
  )
})
