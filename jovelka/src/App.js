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
      debtList: [],
      userList: [],
      debtor: "",
      creditor: "",
      amount: "",
      message: "",
    };

    this.handleDebtorSelectChange = this.handleDebtorSelectChange.bind(this);
    this.handleCreditorSelectChange = this.handleCreditorSelectChange.bind(this);
    this.handleAmountSelectChange = this.handleAmountSelectChange.bind(this);
    this.handleMessageSelectChange = this.handleMessageSelectChange.bind(this);
    
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // Actions to be done after the component mounted.
  componentDidMount() {

    // Debtlist.
    // Debtlist reference. Reference is used by the update functions below.
    const listRef = firebase.database().ref().child('list');

    // Update list from Firebase when child added.
    listRef.on('child_added', snap => {
      
      // Get current list of debts from the state.
      const listOfDebts = this.state.debtList;
      // Add the new debt.
      listOfDebts.push({key: snap.key, value: snap.val().newline, creditor: snap.val().creditor, amount: snap.val().amount});
      // Update the state with new debt list.
      this.setState({
        debtList: listOfDebts
      });
    });

    // User management.
    // User management reference.
    const userRef = firebase.database().ref().child('users');

    // Update list from Firebase when child added.
    userRef.on('child_added', snap => {
      
      // Get current list of users from the state.
      const listOfUsers = this.state.userList;
      // Add the new user.
      listOfUsers.push({key: snap.key, user: snap.val().userName});
      // Update the state with new userlist.
      this.setState({
        userList: listOfUsers,
        debtor: this.state.userList[0].user,
        creditor: this.state.userList[0].user,
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
        if(!result.additionalUserInfo.isNewUser) {
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

    // Set the first value to be the default value for the form.
    if( this.state.userList.length > 0 ){
      this.setState({debtor: this.state.userList[0].displayName}); 
      console.log("set first value: " + this.state.userList[0].displayName);
    }
  }

  // Debt form functionality.
  // Handle debtor option change.
  handleDebtorSelectChange(event){
    this.setState({debtor: event.target.value});
  };

  // Handle creditor option change.
  handleCreditorSelectChange(event){
    this.setState({creditor: event.target.value});
  };

  // Handle amount option change.
  handleAmountSelectChange(event){
    this.setState({amount: event.target.value});
  };

  // Handle amount option change.
  handleMessageSelectChange(event){
    this.setState({message: event.target.value});
  };

  handleSubmit(event) {
    alert(this.state.debtor + " on henkilölle " + this.state.creditor + " velkaa " + this.state.amount + " euroa viestillä " + this.state.message);
    event.preventDefault();
  }


  // Renderable content.
  render() {

    // Modify the list of debts from state to a table form.
    const Debts = this.state.debtList.map((debt) => 
      <tr key={debt.key}><td>{debt.person}</td><td>{debt.amount}</td></tr>
    );

    // Modify the list of users from state to a table form.
    const Users = this.state.userList.map((user) => 
       <option key={user.key} disabled={user.disabled} value={user.user}>{user.user}</option>
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
          <div className="Dept-list" hidden={!this.state.loggedIn}>
            <table className="table table-striped table-hover table-condensed">
              <thead>
                <tr className="info">
                  <th>Henkilö</th>
                  <th>Määrä</th>
                </tr>
              </thead>
              <tbody>
                {Debts}
              </tbody>
            </table>
            <br/>
          </div>

          <form onSubmit={this.handleSubmit}>
            <div className="form-group">
              <label className="control-label">Velallinen:</label>
              <select className="form-control" value={this.state.debtor} onChange={this.handleDebtorSelectChange} >
                {Users}
              </select>
              </div> 

            <div className="form-group">
              <label className="control-label">Velkoja:</label>
              <select className="form-control" value={this.state.creditor} onChange={this.handleCreditorSelectChange} >
                {Users}
              </select>
            </div>

            <div className="form-group">
              <label className="control-label">Määrä:</label>
              <input type="number" className="form-control" value={this.state.amount} onChange={this.handleAmountSelectChange} />
            </div>

            <div className="form-group">
              <label className="control-label">Viesti:</label>
              <input type="text" className="form-control" value={this.state.message} onChange={this.handleMessageSelectChange} />
            </div>

            <div className="form-group">
              <input className="btn btn-default" type="submit" value="Add" />
            </div> 
          </form>
        </div>
      </div>
    );
  }
}

export default App;
