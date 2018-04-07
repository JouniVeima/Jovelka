import React, { Component } from 'react';
import * as firebase from 'firebase';
import './App.css';

// Initialize Firebase.
var config = {
	apiKey: "AIzaSyAR5EhKXe4zxinNctTEu9Gt_W4t-dCK18M",
	authDomain: "jovelka-5ac6e.firebaseapp.com",
	databaseURL: "https://jovelka-5ac6e.firebaseio.com",
	storageBucket: "jovelka-5ac6e.appspot.com",
	messagingSenderId: "786186988906"
};
firebase.initializeApp(config);

// The main single page app.
class App extends Component {

  // Construct the app.
  constructor() {

    // Call the parent constructor.
    super();

    // Set starting state
    this.state = {
      loggedIn: false,
      user: "",
      userName: "",
      
      // TODO: Other values.
      // list: [],
      // debtor: "",
      // creditor: "",
      // amount: "",
    };
  }

  // Actions to be done after the component mounted.
  componentDidMount() {

    // Authorization.
    // Get elements.
    const btnFacebookLogin = this.refs.btnFacebookLogin;
    const btnLogout = this.refs.btnLogout;

    // Handle Facebook log-in.
    btnFacebookLogin.addEventListener('click', e => {

      // Facebook log-in provider.
      var provider = new firebase.auth.FacebookAuthProvider();

      // Sing-up.
      firebase.auth().signInWithPopup(provider).then(function(result) {

      // Variables we get from logging in.
      // Facebook Access Token. Can be used to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;

      // Error handling.
      }).catch(function(error) {
        
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log("Error " + errorCode + ": " + errorMessage );

      }) 
    });

    // Handle log-out.
    btnLogout.addEventListener('click', e => {

      // Log-out and reset the logged in state.
      firebase.auth().signOut();
      this.setState({
        loggedIn: false,
      })
    });

    // Real time auth listener. Reacts to log-in and log-out for example.
    firebase.auth().onAuthStateChanged(firebaseUser => {

      // If user is logged in.
      if(firebaseUser) {
        this.setState({
          loggedIn: true,
          user: firebaseUser.uid,
          userName: firebaseUser.displayName,
        })
      }
    });
  }

  // Renderable content.
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>Jovelka</h1>
          <p className="App-intro" hidden={this.state.loggedIn}>
            Tervetuloa! <br />Kirjaudu sisään käyttääksesi sovellusta.
          </p>
          <p className="App-intro" hidden={!this.state.loggedIn}>
            Tervetuloa {this.state.userName}!
          </p>

          <div className="Login" hidden={this.state.loggedIn} >
            <button ref="btnFacebookLogin" className="btn btn-primary" hidden={this.state.loggedIn}>
              Kirjaudu sisään Facebookilla
            </button>
          </div>

          <div className="Align-right">
            <button className="btn-link" ref="btnLogout" hidden={!this.state.loggedIn}>
              Kirjaudu ulos
            </button>
          </div>
        </div>

        <div className="App-body">

        </div>
      </div>
    );
  }
}

export default App;
