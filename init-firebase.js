// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD43JJNR2N3jpFVkhSJPIwX5LOYl9gvkJc",
  authDomain: "blog-db903.firebaseapp.com",
  databaseURL: "https://blog-db903-default-rtdb.firebaseio.com",
  projectId: "blog-db903",
  storageBucket: "blog-db903.appspot.com",
  messagingSenderId: "462047592288",
  appId: "1:462047592288:web:887b0e53070a0b32e92805",
  measurementId: "G-GMV4370K96"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore();


// db.collection('users')
//   .add({
//     first: 'Dez',
//     last: 'Chuang',
//     gender: 'male'
//   })
//   .then(function(docRef) {
//     console.log('Document written with ID: ', docRef.id)
//   })
//   .catch(function(error) {
//     console.error('Error adding document: ', error)
//   })

// Get a list of cities from your database
async function getUseres(db) {
  const usersCol = db.collection('users');
  const userSnapshot = await usersCol.get();
  const userList = userSnapshot.docs.map(doc => doc.data());
  return userList;
}

// Create a new user in your database 
async function createUser(db, user) {
  const usersCol = db.collection('users');
  const userRef = await usersCol.add(user);
  return userRef;
}


(async () => {
  const list = await getUseres(db);
  console.log(list);
})();
