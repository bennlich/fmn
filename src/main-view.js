<main-view>

  <div class="header">
    <div class="login">
      <form id="fmn-login">

        <input type="text" name="email" value="" placeholder="email@email.com">
        <input type="text" name="username" value="" placeholder="Username">
        <input type="password" name="password" value="" placeholder="Password">
        <input type="submit" value="Sign Up" onclick="{ addUser }">
      </form>
    </div>
  </div>

  <div class="main-container">
    <div class="participants">
      <div class="participant" each={ id, name in participants }>
        { name }
      </div>
    </div>
    
    <div class="track-list-and-submit">
      <div class="track-list">
        <div class="track" each={ key, track in tracks } onclick="{ setVideoUrl }">
          <img class="track-thumbnail" src="{ track.thumbnail.url }">
          <div class="track-title">
            <div if="{ track.title }">{ track.title }</div>
            <div if="{ !track.title }">{ track.url }</div>
          </div>
        </div>
      </div>

      <div class="submit-track">
        <input name="urlInput" type="text" placeholder="Enter URL" onkeypress="{ submitTrackOnEnter }" />
        <div class="submit-track-button" onclick="{ submitTrack }">Submit</div>
      </div>

      <div class="video-container">
        <iframe id="video-player" src="{ videoSrc }" type="text/html" width="640" height="390" frameborder="0"></iframe>
      </div>
    </div>
  </div>

  <script>
    // for debug
    window.mainView = this;

    // make the dependency on other modules explicit at top of script
    var youtubeHelper = window.youtubeHelper;

    // model variables
    this.roomRef = null;
    this.tracks = [];
    this.participants = [];

    // our datastore
    var dbRef = this.dbRef = new Firebase("https://bennlich.firebaseio.com/fmn");
    var usersRef = dbRef.child("users");

    //  ----------
    //  track list
    //  ----------

    submitTrackOnEnter(e) {
      var enter_key = 13;
      if (e.which === enter_key) {
        this.submitTrack();
      }
      return true;
    }

    submitTrack() {
      var url = this.urlInput.value;

      // look for the video id in the pasted url
      var videoIdRegex = /v=([^&]*)&?/;
      var parsedUrl = videoIdRegex.exec(url);
      
      if (parsedUrl == null || parsedUrl.length <= 1) {
        console.warn("Could not parse video URL!", url);
        return;
      }

      var videoId = parsedUrl[1];

      var trackRef = this.roomRef.child("tracks").push({
        url: url,
        videoId: videoId
      });
      this.urlInput.value = "";

      youtubeHelper.getVideoDetailsForId(videoId, function(res) {
        trackRef.update({
          title: res.title,
          thumbnail: res.thumbnails.default
        });
      });
    }

    setVideoUrl(event) {
      var track = event.item.track;
      this.videoSrc = "http://www.youtube.com/embed/"+track.videoId;
    }

    window.onYouTubeIframeAPIReady = function() {
      window.player = new YT.Player('video-player');
    };

    //  ------
    //  log in
    //  ------

    addUser(e) {
      e.preventDefault();
      dbRef.createUser({
        email: this.email.value,
        password: this.password.value
      }, (error, userData) => {
        if (error) {
          switch (error.code) {
            case "EMAIL_TAKEN":
              console.log("The new user account cannot be created because the email is already in use.");
              break;
            case "INVALID_EMAIL":
              console.log("The specified email is not a valid email.");
              break;
            default:
              console.log("Error creating user:", error);
          }
        } else {
          console.log("Successfully created user account with uid:", userData.uid);
          var username = this.username.value;
          // Adding user to users list in Firebase
          usersRef.child(userData.uid).set({ "username": username });
        }

      });
    };

    //  ---------------
    //  room management
    //  ---------------

    loadRoom(roomName) {
      console.log("Loading room", roomName);

      // remove old listeners
      if (this.roomRef) {
        this.roomRef.off();
      }
      
      this.roomRef = dbRef.child("rooms/"+roomName);
      this.participantsRef = this.roomRef.child("participants");

      // Test participants in Firebase
      this.participantsRef.set({
           "player_id1": "caro",
           "player_id2": "benny",
           "player_id3": "ben",
           "player_id4": "tim" ,
      });

      // Update our model when the datastore changes
      console.log("Listening to room", this.roomRef.toString());
      this.roomRef.on("value", function(snap) {
        this.tracks = snap.child("tracks").val();
        this.participants = snap.child("participants").val();
        // Force riot to re-render when the datastore changes.
        // Turns out this is only actually needed for the initial
        // render--subsequent renders are triggered automatically
        // by the event handlers. Try commenting out the line below.
        this.update();
      }.bind(this));
    }

    // listen for room change events fired from
    // the parent element
    opts.roomEvents.on("change", this.loadRoom);
  </script>

</main-view>
