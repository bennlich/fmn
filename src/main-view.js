<main-view>

  <div class="header">
    <div class="login">

      <div if="{ !userRef }">
        <div class="login-button" if="{ !visibleForm }" onclick="{ showSignup }">Create account</div>
        <div class="login-button" if="{ !visibleForm }" onclick="{ showLogin }">Log in</div>
      </div>

      <div class="login-button" if="{ userRef }" onclick="{ logoutUser }">Logout</div>

      <form id="fmn-login" if="{ visibleForm == 'signup' }">
        <input type="text" name="email" value="" placeholder="email@email.com">
        <input type="text" name="username" value="" placeholder="Username">
        <input type="password" name="password" value="" placeholder="Password">
        <input type="submit" value="Create Account" onclick="{ addUser }">
      </form>
      <form id="fmn-login" if="{ visibleForm == 'login' }">
        <input type="text" name="email" value="" placeholder="email@email.com">
        <input type="password" name="password" value="" placeholder="Password">
        <input type="submit" value="Log In" onclick="{ authenticateUser }">
      </form>

      <div class="login-button" if="{ visibleForm }" onclick="{ hideLogin }">Back</div>
      <div class="error-message" if="{ error }">{ error }</div>
    </div>
  </div>

  <div class="submit-track-wrapper">
    <div class="submit-track" if="{ isParticipant() }">
      <input name="urlInput" type="text" placeholder="Enter URL" onkeypress="{ submitTrackOnEnter }" />
      <div class="submit-track-button" onclick="{ submitTrack }">Submit</div>
    </div>
  </div>

  <div class="track-list-wrapper">
    <div class="track-list">
      <div class="track" each={ tracks.slice().reverse() } onclick="{ setVideoUrl }">
        <img class="track-thumbnail" src="{ thumbnail.url }">
        <div class="track-title">
          <div if="{ title }">{ title }</div>
          <div if="{ !title }">{ url }</div>
        </div>
        <div class="track-color" style="background: { participants[userId].color }"></div>
      </div>
    </div>
  </div>

  <div class="video-and-chat-wrapper">
    <div class="video-and-chat">

      <div class="video">
        <div class="no-video" if="{ !videoSrc }">
          <div class="arrow">&#8592;</div>
          <div class="helper-text">click on a track in the list to play it</div>
        </div>
        <iframe id="video-player" if="{ videoSrc }" src="{ videoSrc }" type="text/html" width="640" height="390" frameborder="0"></iframe>
      </div>
      
      <div class="chat">
        <div class="participant" each={ id, player in participants }>
          <div class="player-color" style="background: { player.color }"></div>
          <div>{ player.name }</div>
        </div>
        <div class="button purple" if="{ userRef && !isParticipant() }" onclick="{ joinRoom }">Join Room!</div>

      </div>

      <div class="chat-conversation">
        <div class="message" each={ chats } >
          <div class="message-text">
            <div>{ chat }</div>
          </div>
          <div class="message-color" style="background: { participants[userId].color }"></div>
        </div>
      </div>

      <div class="submit-chat-wrapper">
        <div class="submit-chat" if="{ isParticipant() }">
          <input name="chatInput" type="text" onkeypress="{ submitChatOnEnter }" />
        </div>
      </div>
  

    </div>
  </div>

  <script>
    // for debug
    window.app = this;

    // make the dependency on other modules explicit at top of script
    var youtubeHelper = window.youtubeHelper;

    // model variables
    this.roomRef = null;
    this.userRef = null;
    this.user = null;
    this.tracks = {};
    this.participants = {};
    this.loginVisible = false;

    // our datastore
    var dbRef = this.dbRef = new Firebase("https://bennlich.firebaseio.com/fmn");
    var usersRef = dbRef.child("users");

    //  ----------
    //  track list
    //  ----------

    submitTrackOnEnter(event) {
      var enter_key = 13;
      if (event.which === enter_key) {
        this.submitTrack();
      }
      return true; // allows default behavior (typing in input field)
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

      youtubeHelper.getVideoDetailsForId(videoId, (res) => {
        trackRef.update({
          title: res.title,
          thumbnail: res.thumbnails.default,
          userId: this.user.uid
        });
      });
    }

    //  ------------
    //  chat window
    //  ------------

    submitChatOnEnter(event) {
      var enter_key = 13;
      if (event.which === enter_key) {
        this.submitChat();
      }
      return true; // allows default behavior (typing in input field)
    }

    submitChat() {
      var chat = this.chatInput.value;

      var chatRef = this.roomRef.child("chats").push({
        chat: chat,
      });
      this.chatInput.value = "";

    }


    //  ------------
    //  video player
    //  ------------

    setVideoUrl(event) {
      var track = event.item;
      this.videoSrc = "http://www.youtube.com/embed/"+track.videoId;
    };

    window.onYouTubeIframeAPIReady = function() {
      window.player = new YT.Player('video-player');
    };

    //  ------
    //  log in
    //  ------

    showLogin() {
      this.visibleForm = "login";
    }

    showSignup() {
      this.visibleForm = "signup";
    }

    hideLogin() {
      this.visibleForm = null;
    }

    addUser(e) {
      e.preventDefault();
      dbRef.createUser({
        email: this.email[0].value,
        password: this.password[0].value
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
          this.error = error;
          this.update();
        } else {
          console.log("Successfully created user account with uid:", userData.uid);
          var username = this.username.value;
          // Adding user to users list in Firebase
          usersRef.child(userData.uid).set({
            "username": username,
            "uid": userData.uid
          });

          this.authenticateUser(e);
        }

      });
    };

    authenticateUser(e) {
      e.preventDefault();
      var email = this.visibleForm === "signup" ? this.email[0].value : this.email[1].value;
      var password = this.visibleForm === "signup" ? this.password[0].value : this.password[1].value;
      // Or with an email/password combination
      dbRef.authWithPassword({
        email    : email,
        password : password
      }, (err, res) => {
        if (err) {
          console.log("Login Failed!", err);
          this.error = err;
          this.update();
        }
      });
    };

    logoutUser(e) {
      dbRef.unauth();
    }

    authCallback(res) {
      if (res) {
        console.log("Authenticated successfully with payload:", res);
        this.error = null;
        this.hideLogin();
        this.userRef = usersRef.child(res.uid);
        this.userRef.on("value", (snap) => {
          this.user = snap.val();
          this.update();
        });
      } else {
        this.userRef = null;
        this.user = null;
      }
      this.update();
    }

    //  ---------------
    //  room management
    //  ---------------

    isParticipant() {
      return this.user && (this.user.uid in this.participants);
    }

    joinRoom(e) {
      var color = randomColor();
      this.participantsRef.child(this.user.uid).set({
        name: this.user.username,
        color: color
      });
      this.userRef.child("rooms").push(this.roomName);
    }

    loadRoom(roomName) {
      console.log("Loading room", roomName);
      this.roomName = roomName;

      // remove old listeners
      if (this.roomRef) {
        this.roomRef.off();
      }
      
      this.roomRef = dbRef.child("rooms/"+roomName);
      this.participantsRef = this.roomRef.child("participants");

      // Test participants in Firebase
      this.participantsRef.update({
           "player_id1": { name: "caro" },
           "player_id2": { name: "benny" },
           "player_id3": { name: "ben" },
           "player_id4": { name: "tim" },
      });

      // Update our model when the datastore changes
      this.tracks = Firebase.getAsArray(this.roomRef.child("tracks"));
      this.chats = Firebase.getAsArray(this.roomRef.child("chats"));
      this.roomRef.on("value", function(snap) {
        this.participants = snap.child("participants").val();
        // Force riot to re-render when the datastore changes.
        // Turns out this is only actually needed for the initial
        // render--subsequent renders are triggered automatically
        // by the event handlers. Try commenting out the line below.
        this.update();
      }.bind(this));

      // TODO: It doesn't seem like authentication really belongs
      // in loadRoom(), but there's occasinally a rendering bug
      // when it's outside. wtf.
      dbRef.onAuth(this.authCallback);
    }

    // listen for room change events fired from
    // the parent element
    opts.roomEvents.on("change", this.loadRoom);
  </script>

</main-view>
