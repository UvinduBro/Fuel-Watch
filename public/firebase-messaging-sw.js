importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDuYc-dqyWqSfy5YRTUuarn9JwQ095DEpQ",
  authDomain: "fuel-watch-18be9.firebaseapp.com",
  projectId: "fuel-watch-18be9",
  storageBucket: "fuel-watch-18be9.firebasestorage.app",
  messagingSenderId: "522171215763",
  appId: "1:522171215763:web:ebb8a10aedd3738a280266",
  measurementId: "G-ET9G35SEYW",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
