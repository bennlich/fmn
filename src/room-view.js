import Vue from '../bower_components/vue/dist/vue.js';
import template from './new-room-view.html!text';

import { dbRef } from './db.js';
import { user } from './user.js';
import { playerInfo } from './player-info.js';
import { youtubeHelper } from './youtube-helper.js';

import Login from './login.js';
Vue.component('login', Login);

import Chat from './chat.js';
Vue.component('chat', Chat);

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
  },
  mixins: [ playerInfo ],
  data: function() {
    return {
      user: user,
      roomName: null,
      roomRef: null,
      videoSrc: null,
      urlInput: "",
      tracks: []
    };
  },
  computed: {
    sortedTracks: function() {
      return this.tracks.slice().reverse();
    }
  },
  methods: {
    joinRoom: function(e) {
      var color = randomColor();
      this.participants.ref.push({
        userId: this.user.data.uid,
        name: this.user.data.username,
        color: color
      });
      this.user.ref.child("rooms").push(this.roomName);
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
      this.tracks = Firebase.getAsArray(this.roomRef.child("tracks"));
      this.participants.data = Firebase.getAsArray(this.participants.ref);
    },

    getNextPlayer: function() {
      if (this.tracks.length === 0)
        return null;

      var mostRecentTrack = this.tracks[this.tracks.length - 1],
          mostRecentPlayerId = mostRecentTrack.userId,
          mostRecentPlayerTurnOrder = this.getPlayerTurnOrder(mostRecentPlayerId),
          nextPlayerTurnOrder = (mostRecentPlayerTurnOrder + 1) % this.participants.data.length,
          nextPlayer = this.participants.data[nextPlayerTurnOrder];
      return nextPlayer;
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

    submitTrack: function() {
      var url = this.urlInput;

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
      var trackRef = this.roomRef.child("tracks").push({
        url: url,
        videoId: videoId,
        title: "",
        thumbnail: "",
        userId: ""
      });

      // clear the url input field
      this.urlInput = "";

      // get additional info about the video with the youtube API
      youtubeHelper.getVideoDetailsForId(videoId, (res) => {
        trackRef.update({
          title: res.title,
          thumbnail: res.thumbnails.default,
          userId: this.user.data.uid
        });
      });
    }
  }
});

export default RoomView;
