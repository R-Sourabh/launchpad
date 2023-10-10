// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize a default click_action URL
let clickActionURL = 'https://launchpad.hotwax.io/home';
let iconURL = '/img/icons/msapplication-icon-144x144.png';

// Define a function to set the click_action URL
function setClickActionAndIcon(clickAction, icon) {
  clickActionURL = clickAction;
  iconURL = icon;
}

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
}

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {    
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  // Customize notification here
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: iconURL,
    data: {
      click_action: clickActionURL
    }
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
  
  //broadcast background message on FB_BG_MESSAGES so that app can receive that message 
  const broadcast = new BroadcastChannel('FB_BG_MESSAGES');
  broadcast.postMessage(payload);
});

self.addEventListener('notificationclick', event => {
  event.notification.close(); 
  const deepLink = event.notification.data.click_action; 
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if the app window is already open
      for (let client of windowClients) {
        if (client.url === deepLink && 'focus' in client) {
          return client.focus();
        }
      }
        
      // If the app window is not open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(deepLink);
      }
    })
  );
});