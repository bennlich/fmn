<main-view>

  <bob-view room_ref={ roomRef } items={ items }></bob-view>

  this.roomRef = null;
  this.items = [];

  // our datastore
  var dbRef = new Firebase("https://bennlich.firebaseio.com/fmn");

  joinRoom(roomName) {
    console.log("Joining room", roomName);

    // remove old listeners
    if (this.roomRef) {
      this.roomRef.off();
    }

    this.roomRef = dbRef.child(roomName);

    // Update our model when the datastore changes
    console.log("Listening to room", this.roomRef.toString());
    this.roomRef.on("value", function(snap) {
      this.items = snap.child("items").val();
      // Force riot to re-render when the datastore changes.
      // Turns out this is only actually needed for the initial
      // render--subsequent renders are triggered automatically
      // by the event handlers. Try commenting out the line below.
      this.update();
    }.bind(this));
  }

  opts.room.on("change", this.joinRoom);

</main-view>
