import Vue from '../bower_components/vue/dist/vue.js';
import template from './login.html!text';

import { dbRef, usersRef } from './db.js';
import { user } from './user.js';


const Login = Vue.extend({
  template: template,
  ready: function() {
    dbRef.onAuth(this.authCallback);
  },
  data: function() {
    return {
      user: user,
      visibleForm: null,
      error: null,
      email: "",
      username: "",
      password: ""
    };
  },
  methods: {
    showLogin: function() {
      this.visibleForm = "login";
    },

    showSignup: function() {
      this.visibleForm = "signup";
    },

    hideLogin: function() {
      this.visibleForm = null;
    },

    addUser: function(e) {
      e.preventDefault();

      dbRef.createUser({
        email: this.email,
        password: this.password
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
        } else {
          console.log("Successfully created user account with uid:", userData.uid);
          var username = this.username;
          // Adding user to users list in Firebase
          usersRef.child(userData.uid).set({
            "username": username,
            "uid": userData.uid
          });

          this.authenticateUser(e);
        }

      });
    },

    authenticateUser: function(e) {
      e.preventDefault();
      
      dbRef.authWithPassword({
        email    : this.email,
        password : this.password
      }, (err, res) => {
        if (err) {
          console.log("Login Failed!", err);
          this.error = err;
        }
      });
    },

    logoutUser: function(e) {
      dbRef.unauth();
    },

    authCallback: function(res) {
      if (res) {
        console.log("Authenticated successfully with payload:", res);
        this.error = null;
        this.hideLogin();
        this.user.ref = usersRef.child(res.uid);
        this.user.ref.on("value", (snap) => {
          this.user.data = snap.val();
        });
      } else {
        if (this.user.ref) this.user.ref.off("value");
        this.user.ref = null;
        this.user.data = null;
      }
    }
  }
});

export default Login;
