import Vue from '../bower_components/vue/dist/vue.js';

var ScrollActivitiesDir = {
  bind: function() {
    this.stickToBottom = true;

    // don't autoscroll the activities list if the
    // user scrolls away from the bottom
    this.el.addEventListener("scroll", () => {
      if (this.el.scrollTop == (this.el.scrollHeight - this.el.offsetHeight))
        this.stickToBottom = true;
      else
        this.stickToBottom = false;
    });
  },
  update: function(roomRef) {
    if (roomRef) {
      this.activitiesRef = roomRef.child("activities");
      this.activitiesCallback = this.activitiesRef.on("child_added", () => {
        // do autoscroll the activities list
        // if we're in stickToBottom mode
        if (this.stickToBottom) {
          Vue.nextTick(() => {
            this.el.scrollTop = this.el.scrollHeight;
          });
        }
      });
    } else if (this.activitiesRef) {
      this.activitiesRef.off("child_added", this.activitiesCallback);
      this.activitiesRef = null;
      this.activitiesCallback = null;
    }
  }
};

export {ScrollActivitiesDir};
