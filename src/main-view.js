<main-view>

  <div class="main-container">
    <div class="participants"></div>
    
    <div class="track-list-and-submit">
      <div class="track-list">
        <div class="track" each={ key, track in tracks }>
          { track.url }
        </div>
      </div>

      <div class="submit-track">
        <input name="urlInput" type="text" placeholder="Enter URL" onkeypress="{ handleKeyPress }" />
        <div class="submit-track-button" onclick="{ submitTrack }">Submit</div>
      </div>
    </div>
  </div>

  <script>
    this.roomRef = null;
    this.tracks = [];

    handleKeyPress(e) {
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

      this.roomRef = dbRef.child(roomName);

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
