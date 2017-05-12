var color = require('cli-color');
var firebase = require('firebase');
var appConfig = require('../conf.app.js');

// Get the config from the Firebase Console for your project.
// Just go to Overview > and click on 'Add Firebase to your web app'.
module.exports = function(config, connectionCB){
  if( !config ) throw new Error('No config provided for database.');

  if( !firebase.apps.length ) firebase.initializeApp(config);

  var db = firebase.database;
  var auth = firebase.auth;
  var connectedRef = db().ref('.info/connected');

  connectedRef.on('value', function(snap){
    if( snap.val() === true ){
      console.log( `${color.green.bold('[ CONNECTED ]')} to ${color.blue.bold(config.projectId)}` );

      connectedRef.off();

      connectionCB({
        auth: auth,
        db: db
      });
    }else{
      console.log(`${color.yellow.bold('[ WAITING ]')} on connection to ${color.blue.bold(config.projectId)}`);
    }
  });
};