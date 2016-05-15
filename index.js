import Vue from 'bower_components/vue/dist/vue.js';
import VueRouter from 'bower_components/vue-router/dist/vue-router.js';

Vue.use(VueRouter);

import RoomView from './src/room-view.js';

var router = new VueRouter();

router.map({
  '/:roomName': {
    component: RoomView
  }
});

var App = Vue.extend({});

router.start(App, '#app');
