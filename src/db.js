var Firebase = window.Firebase;

// our datastore
export let rootRef = new Firebase("https://bennlich.firebaseio.com");
export let dbRef = rootRef.child("fmn");
export let usersRef = dbRef.child("users");