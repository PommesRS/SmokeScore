// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
// Replace 10.13.2 with latest version of the Firebase JS SDK.
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyBzExQHOQ6dd31JWwaxOzvS99jLPIk0EIE",
    authDomain: "smokescore-a4408.firebaseapp.com",
    projectId: "smokescore-a4408",
    storageBucket: "smokescore-a4408.firebasestorage.app",
    messagingSenderId: "116690554206",
    appId: "1:116690554206:web:97bd984eb092511bb693cf",
    measurementId: "G-8P4RM0RN6N"
  });

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

messaging.onBackgroundMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
    );
    // Customize notification here


    if (payload.data.msgType == 'invite') {
        const notificationTitle = `${payload.data.senderName} hat dir eine Einladung geschickt!`;
        const notificationOptions = {
            body: payload.data.body,
            icon: './logo.png',
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    }else{
        const notificationTitle = payload.data.title;
        const notificationOptions = {
            body: payload.data.body,
            icon: './logo.png',
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientsArr => {
      for (const client of clientsArr) {
        // Prüfen ob ein Fenster oder PWA-Instanz schon offen ist
        if (client.url.startsWith(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Falls keine PWA offen, neues Fenster öffnen (öffnet evtl. Browser)
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

messaging.onMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received message ',
        payload
    );

    if (payload.data.msgType === 'invite') {
        self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
            clients.forEach(client => {
            client.postMessage({
                data: data
            });
            });
        })
    }

})