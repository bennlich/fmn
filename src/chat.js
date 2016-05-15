import Vue from '../bower_components/vue/dist/vue.js';
import template from './chat.html!text';

import { user } from './user.js';
import { playerInfo } from './player-info.js';

var Firebase = window.Firebase;

const Chat = Vue.extend({
  template: template,
  mixins: [ playerInfo ],
  props: ['roomRef'],
  watch: {
    'roomRef': function(roomRef) {
      if (!roomRef) return;
      this.chats = Firebase.getAsArray(roomRef.child("chats"));
    }
  },
  data: function() {
    return {
      user: user,
      chatText: "",
      chats: []
    };
  },
  methods: {
    submitChat: function() {
      var chat = this.chatText;
      var chatRef = this.roomRef.child("chats").push({
        chat: chat,
      });
      this.chatText = "";
    }
  }
});

export default Chat;