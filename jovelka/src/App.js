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

// Add a new debt to the database.
function addDebt(debtor, creditor, amount, message) {
  // Push new value into the debtlist.
  firebase.database().ref().child('debts').push().set({
    debtor,
    creditor,
    amount,
    message,
  });
}

// // Filter the debts and change value to negative if user ows money.
// function filterDebt(debt, userName)
// {
//   // If user is creditor, we just add the debt to the list.
//   if (debt.creditor === userName) {
//     return {key: debt.key, person: debt.debtor, amount: debt.amount, message: debt.message};
//   }
//   // If user is debtor, we change the amount to negative and add the debtto the list.
//   else if (debt.debtor === userName) {
//     return {key: debt.key, person: debt.creditor, amount: debt.amount * -1, message: debt.message};
//   }
//   // Someone elses debt. We ignore it.
// return null;
// }

// Modify the debt into the list for correct person.
function modifyDebtIn(debtList, key, debtor, creditor, amount, message, userName)
{
  // If user is creditor, we just add the debt to the list.
  if (creditor === userName) {
    return modifyDebt(debtList, amount, debtor, key, message);
  }
  // If user is debtor, we change the amount to negative and add the debt to the list.
  else if (debtor === userName) {
    return modifyDebt(debtList, amount * -1, creditor, key, message);
  }
  // Someone elses debt. We ignore it.
  return null;
}

// Modify the actual debt.
function modifyDebt(debtList, amount, userName, debtkey, debtmessage) {
  var newDebtList = debtList;
  // Loop through the debt list and find if we already have debts from that person.
  for(var i = 0; i < newDebtList.length; i++) {
    if(newDebtList[i].person === userName) {
      // Already have a debt amount for this person.
      // Modify the amount.
      var newAmount = parseFloat(newDebtList[i].amount) + parseFloat(amount);
      // Round down to two decimals.
      newAmount = newAmount.toFixed(2);
      newDebtList[i].amount = newAmount;
      // Change the message
      newDebtList[i].message = debtmessage;
      return newDebtList;
    }
  }
  // We didn't have debts for this person.
  // Add the new person and debt to the list.
  newDebtList.push({key: debtkey, person: userName, amount: amount, message: debtmessage});
  return newDebtList;
}

// The main single page app.
class App extends Component {
  // Construct the app.
  constructor() {
    // Call the parent constructor.
    super();
    // Set starting state
    this.state = {
      loggedIn: false,
      userUID: "",
      userName: "",
      debtList: [],
      userList: [],
      debtUser: "",
      amount: "",
      message: "",
    };

    this.handleDebtUserSelectChange = this.handleDebtUserSelectChange.bind(this);
    this.handleAmountSelectChange = this.handleAmountSelectChange.bind(this);
    this.handleMessageSelectChange = this.handleMessageSelectChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // Actions to be done after the component mounted.
  componentDidMount() {

    // Debtlist.
    // Debtlist reference. Reference is used by the update functions below.
    const listRef = firebase.database().ref().child('debts');

    // Update list from Firebase when child added.
    listRef.on('child_added', snap => {
      // Get current list of debts from the state.
      var listOfDebts = this.state.debtList;
      // Add in the data from the new debt.
      listOfDebts = modifyDebtIn(listOfDebts, snap.key, snap.val().debtor, snap.val().creditor, snap.val().amount, snap.val().message, this.state.userName);
      // Save the updated debt list.
      this.setState({
        debtList: listOfDebts,
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
      // Don't add the current user to the list.
      if(snap.val().userName !== this.state.userName)
      {
        listOfUsers.push({key: snap.key, user: snap.val().userName});
        // Update the state with new userlist.
        this.setState({
          userList: listOfUsers,
        });
      }
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
          userUID: firebaseUser.uid,
          userName: firebaseUser.displayName,
        })
      }
    });
  }

  // Debt form functionality.
  // Handle debt user option change.
  handleDebtUserSelectChange(event){
    this.setState({debtUser: event.target.value});
  };

  // Handle amount option change.
  handleAmountSelectChange(event){
    this.setState({amount: event.target.value});
  };

  // Handle message option change.
  handleMessageSelectChange(event){
    this.setState({message: event.target.value});
  };

  handleSubmit(event) {
    // Check if we have selected a debtUser.
    var tempDebtUser = this.state.debtUser;
    if(tempDebtUser === ""){
      // We haven't, so we use the first one on the user list (default value).
      tempDebtUser = this.state.userList[0].user;
    }
    // Check from amount are we debtor or creditor.
    if(this.state.amount < 0) {
      // We are debtor.
      addDebt(this.state.userName, tempDebtUser, this.state.amount * -1, this.state.message);
    }
    else {
      // We are creditor.
      addDebt(tempDebtUser, this.state.userName, this.state.amount, this.state.message);
    }
    event.preventDefault();
  }

  // Renderable content.
  render() {

    // Modify the list of debts from state to a table form.
    const Debts = this.state.debtList.map((debt) => 
      <tr key={debt.key}><td>{debt.person}</td><td>{debt.amount}</td><td>{debt.message}</td></tr>
    );

    // Modify the list of users from state to a table form.
    const Users = this.state.userList.map((user) => 
       <option key={user.key} value={user.user}>{user.user}</option>
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
                  <th>Viimeisin viesti</th>
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
              <label className="control-label">Henkilö:</label>
              <select className="form-control" value={this.state.debtUser} onChange={this.handleDebtUserSelectChange} >
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
