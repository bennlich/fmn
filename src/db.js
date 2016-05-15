var Firebase = window.Firebase;

// our datastore
export let dbRef = new Firebase("https://bennlich.firebaseio.com/fmn");
export let usersRef = dbRef.child("users");