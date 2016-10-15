// bullshit utilities

// http://stackoverflow.com/questions/27908312/can-you-get-the-timestamp-from-a-firebase-array-key
var PUSH_CHARS = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
function firebaseKeyToTimestamp(id) {
  id = id.substring(0,8);
  var timestamp = 0;
  for (var i=0; i < id.length; i++) {
    var c = id.charAt(i);
    timestamp = timestamp * 64 + PUSH_CHARS.indexOf(c);
  }
  return timestamp;
}

export {firebaseKeyToTimestamp};
