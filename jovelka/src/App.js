import React, { Component } from 'react';
import * as firebase from 'firebase';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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
      list: [],
      
      // TODO: Other values.
      // debtor: "",
      // creditor: "",
      // amount: "",
    };
  }

  // Actions to be done after the component mounted.
  componentDidMount() {

    // Set Firebase reference.
    // Reference is used by the update functions below.
    const listRef = firebase.database().ref().child('list');

    // Update list from Firebase when child added.
    listRef.on('child_added', snap => {
      
      // Get current list of debts from the state.
      const listOfDebts = this.state.list;
      // Add the new debt.
      listOfDebts.push({key: snap.key, value: snap.val().newline, creditor: snap.val().creditor, amount: snap.val().amount});
      // Update the state with new debt list
      this.setState({
        list: listOfDebts
      });
    });

    // Authorization.
    // Get elements.
    const btnFacebookLogin = this.refs.btnFacebookLogin;
    const btnLogout = this.refs.btnLogout;

    // Handle Facebook log-in.
    btnFacebookLogin.addEventListener('click', e => {

      // Facebook log-in provider.
      var provider = new firebase.auth.FacebookAuthProvider();

      // Sing-up / Log-in functionality.
      firebase.auth().signInWithPopup(provider).then(function(result) {

        // Variables we get from logging in.
        // Facebook Access Token. Can be used to access the Facebook API.
        // var token = result.credential.accessToken;

        // The signed-in user info.
        var userName = result.user.displayName;

        // If a new user, add the user to the users table in Firebase.
        if(result.additionalUserInfo.isNewUser) {
          firebase.database().ref().child('users').push().set({
            userName
        });
      }

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

    // Modify the list of debts from state to a table form.
    const tableItems = this.state.list.map((debt) => 
      <tr key={debt.key}><td>{debt.person}</td><td>{debt.amount}</td></tr>
    );

    // Return the page layout.
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
            <button className="btn btn-outline-light" ref="btnLogout" hidden={!this.state.loggedIn}>
              Kirjaudu ulos
            </button>
          </div>
        </div>

        <div className="App-body">
          <div className="deptList" hidden={!this.state.loggedIn}>
            <table className="table table-striped table-hover table-condensed">
              <thead>
                <tr className="info">
                  <th>Henkilö</th>
                  <th>Määrä</th>
                </tr>
              </thead>
              <tbody>
                {tableItems}
              </tbody>
            </table>
            <br/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
