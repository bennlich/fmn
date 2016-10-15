import Vue from '../bower_components/vue/dist/vue.js';
import template from './room-view.html!text';

import { firebaseKeyToTimestamp } from './bs-util.js';
import { dbRef, rootRef } from './db.js';
import { user } from './user.js';
import { playerInfo } from './player-info.js';
import { youtubeHelper } from './youtube-helper.js';

import Login from './login.js';
Vue.component('login', Login);

import { ScrollActivitiesDir } from './scroll-activities-dir.js';
Vue.directive('scrollActivities', ScrollActivitiesDir);

var Firebase = window.Firebase;

const RoomView = Vue.extend({
  template: template,
  ready: function() {
    // setup youtube player
    window.onYouTubeIframeAPIReady = function() {
      window.player = new YT.Player('video-player');
    }

    // whenever the route changes, load the new room
    this.$router.afterEach(() => {
      this.loadRoom(this.$route.params['roomName']);
    });

    // also load the new room on first load
    this.loadRoom(this.$route.params['roomName']);

    // store the difference between client time and firebase server time
    rootRef.child(".info/serverTimeOffset").on("value", (snap) => {
      this.serverTimeOffset = snap.val();
    });
  },
  mixins: [ playerInfo ],
  data: function() {
    return {
      user: user,
      roomName: null,
      roomRef: null,
      videoSrc: null,
      serverTimeOffset: null,
      userInput: "",
      activities: []
    };
  },
  computed: {
    tracks: function() {
      return this.activities.filter((activity) => activity.type === "track");
    },
    placeholderText: function() {
      var prefix = "";
      if (this.userIsNextPlayer())
        prefix = "It's your turn; ";
      else
        prefix = "It's "+this.getNextPlayerName()+"'s turn; ";
      var postfix = "submit a message or youtube url here";
      return prefix + postfix;
    }
  },
  methods: {
    isTrack: function(activity) {
      return activity.type === "track";
    },

    isChat: function(activity) {
      return activity.type === "chat";
    },

    joinRoom: function(e) {
      var color = randomColor();
      this.participants.ref.push({
        userId: this.user.data.uid,
        name: this.user.data.username,
        color: color
      });
      this.user.ref.child("rooms").push(this.roomName);
    },

    assignNewRandomColor: function() {
      var user = this.participants.data
        .find((participant) => participant.userId === this.user.data.uid);
      this.participants.ref.child(user.$id+"/color").set(randomColor());
    },

    loadRoom: function(roomName) {
      console.log("Loading room", roomName);
      this.roomName = roomName;

      // remove old listeners
      if (this.roomRef) {
        this.roomRef.off();
      }
      
      this.roomRef = dbRef.child("rooms/"+roomName);
      this.participants.ref = this.roomRef.child("participants");

      // Update our model when the datastore changes
      this.participants.data = Firebase.getAsArray(this.participants.ref);
      this.activities = Firebase.getAsArray(this.roomRef.child("activities"));
    },

    getNextPlayer: function() {
      if (this.activities.length === 0)
        return null;

      if (typeof this.serverTimeOffset === 'undefined')
        return null;

      var latestTrack = this.tracks[this.tracks.length - 1],
          latestPlayerTurnOrder = this.getPlayerTurnOrder(latestTrack.userId);

      var now = new Date().getTime() + this.serverTimeOffset,
          latestTrackDate = latestTrack.date ? latestTrack.date : this.getDateFromOldTrack(latestTrack),
          daysSinceLastPlay = (now - latestTrackDate) / 1000 / 60 / 60 / 24; // days

      // skip one player every two days
      var numPlayersToSkip = Math.floor(daysSinceLastPlay / 2),
          nextPlayerTurnOrder = (latestPlayerTurnOrder + numPlayersToSkip + 1) % this.participants.data.length,
          nextPlayer = this.participants.data[nextPlayerTurnOrder];

      return nextPlayer;
    },

    getDateFromOldTrack: function(track) {
      var key = track.$id;
      return firebaseKeyToTimestamp(key);
    },

    getNextPlayerName: function() {
      var nextPlayer = this.getNextPlayer();
      if (nextPlayer) return nextPlayer.name;
    },

    userIsNextPlayer: function() {
      var nextPlayer = this.getNextPlayer();
      return nextPlayer && this.user.data &&
        (nextPlayer.userId === this.user.data.uid);
    },

    setVideoUrl: function(track) {
      this.videoSrc = "http://www.youtube.com/embed/"+track.videoId;
    },

    showAuthorName: function(activityIndex) {
      if (activityIndex === 0)
        return true;

      var curActivity = this.activities[activityIndex],
          prevActivity = this.activities[activityIndex - 1];

      if (this.isTrack(prevActivity))
        return true;

      if (curActivity.userId !== prevActivity.userId)
        return true;
    },

    submitSomething: function() {
      var textOrURL = this.userInput;

      var youtubeRegex = /^(\S)*watch\?v=(\S)+$/;
      if (youtubeRegex.test(textOrURL)) {
        // it's a url
        this.submitTrack(textOrURL);
      } else {
        this.submitChat(textOrURL);
      }

      this.userInput = "";
    },

    submitTrack: function(url) {
      // look for the video id in the pasted url
      var videoIdRegex = /v=([^&]*)&?/;
      var parsedUrl = videoIdRegex.exec(url);
      
      if (parsedUrl == null || parsedUrl.length <= 1) {
        console.warn("Could not parse video URL!", url);
        return;
      }

      var videoId = parsedUrl[1];

      // save the track to the database
      // gotcha: we have to include empty fields for data yet-
      // to-come in order for Vue.js to watch them for changes
      var activitiesRef = this.roomRef.child("activities");
      var trackRef = activitiesRef.push({
        url: url,
        type: "track",
        videoId: videoId,
        title: "",
        thumbnail: "",
        userId: "",
        date: Firebase.ServerValue.TIMESTAMP
      });

      // get additional info about the video with the youtube API
      youtubeHelper.getVideoDetailsForId(videoId, (res) => {
        trackRef.update({
          title: res.title,
          thumbnail: res.thumbnails.default,
          userId: this.user.data.uid
        });
      });
    },

    submitChat: function(chat) {
      var activitiesRef = this.roomRef.child("activities");
      activitiesRef.push({
        chat: chat,
        type: "chat",
        userId: this.getPlayerId(),
        date: Firebase.ServerValue.TIMESTAMP
      });
    }
  }
});

export default RoomView;
