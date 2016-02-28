<main-view>
<div class="header">
    <div class="login">
        <form id="fmn-login">

        <input type="text" name="login" value="" placeholder="Username">
        <input type="password" name="password" value="" placeholder="Password">
        <input type="submit" value="Login">
        </form>
    </div>
</div>

    <div class="main-container">


    <div class="participants">
      <div class="participant" each={ person in participants }>
        { person.name }
      </div>
    </div>
    
    <div class="track-list-and-submit">
      <div class="track-list">
        <div class="track" each={ key, track in tracks }>
          { track.url }
        </div>
      </div>

      <div class="submit-track">
        <input name="urlInput" type="text" placeholder="Enter URL" onkeypress="{ catchEnterKey }" />
        <div class="submit-track-button" onclick="{ submitTrack }">Submit</div>
      </div>
    </div>
  </div>

    <script>

FMN = function() {
   this.firebase = new Firebase("https://bennlich.firebaseio.com/fmn");
}

    this.roomRef = null;
    this.tracks = [];
    this.participants = [
      { name: "caro" },
      { name: "benny" },
      { name: "ben" },
      { name: "tim" },
      { name: "j_blongza_XxX" }
    ];

    catchEnterKey(e) {
      var enter_key = 13;
      if (e.which === enter_key) {
        this.submitTrack();
      }
      return true;
    }

    submitTrack() {
      this.roomRef.child("tracks").push({
        url: this.urlInput.value
      });
      this.urlInput.value = "";
    }

    // our datastore
    var dbRef = new Firebase("https://bennlich.firebaseio.com/fmn");

    joinRoom(roomName) {
      console.log("Joining room", roomName);

      // remove old listeners
      if (this.roomRef) {
        this.roomRef.off();
      }

      this.roomRef = dbRef.child("rooms/"+roomName);

      // Update our model when the datastore changes
      console.log("Listening to room", this.roomRef.toString());
      this.roomRef.on("value", function(snap) {
        this.tracks = snap.child("tracks").val();
        // Force riot to re-render when the datastore changes.
        // Turns out this is only actually needed for the initial
        // render--subsequent renders are triggered automatically
        // by the event handlers. Try commenting out the line below.
        this.update();
      }.bind(this));
    }

    // listen for room change events fired from
    // the parent element
    opts.roomEvents.on("change", this.joinRoom);
  </script>

</main-view>
