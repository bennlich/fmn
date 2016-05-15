import { participants } from './participants.js';

let playerInfo = {
  data: function() {
    return {
      participants: participants
    };
  },
  methods: {
    isParticipant: function(userId) {
      return !!this.getPlayer(userId);
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
    }
  }
};

export { playerInfo };
