var firebase = require('firebase');
var config = {
  apiKey: "AIzaSyCdIMh9RojUAO-rZdV7VhLd8ecWwzPQRP4",
  authDomain: "inventory-2e654.firebaseapp.com",
  databaseURL: "https://inventory-2e654.firebaseio.com",
  storageBucket: "inventory-2e654.appspot.com",
  messagingSenderId: "59369996865"
};

firebase.initializeApp(config),


module.exports = {
  dbRef: firebase.database(),
  auth: firebase.auth()
}