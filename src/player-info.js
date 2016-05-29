import { participants } from './participants.js';
import { user } from './user.js';

let playerInfo = {
  data: function() {
    return {
      participants: participants
    };
  },
  methods: {
    userIsParticipant: function() {
      if (!user.data) return false;
      return !!this.getPlayer(user.data.uid);
    },

    getPlayer: function(userId) {
      if (typeof userId === 'undefined') return null;
      return this.participants.data.find((player) => userId == player.userId);
    },

    getPlayerTurnOrder: function(userId) {
      return this.participants.data.findIndex((player) => userId == player.userId);
    },

    getPlayerColor: function(userId) {
      var player = this.getPlayer(userId);
      return player && player.color;
    },

    getPlayerId: function() {
      var playerId = user.data.uid;
      return playerId;
    }
  }
};

export { playerInfo };
