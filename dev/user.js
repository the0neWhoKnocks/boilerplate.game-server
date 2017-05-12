var fs = require('fs');
var path = require('path');
var color = require('cli-color');
var crypto = require('crypto');
var appConfig = require('../conf.app.js');
var dbConfig = require(appConfig.paths.DB_CONFIG);
var utils = require('./utils.js');

var _DB;

function _db(){
  if( !_DB ){
    _DB = require(`${appConfig.paths.DEV}/database.js`);
  }

  return _DB;
}

function signIn(opts){
  var email = opts.email.trim();
  var pass = utils.encrypt( opts.pass.trim() );
  var res = opts.res;
  var msg, respData;

  return new Promise(function(resolve, reject){
    _db()(dbConfig, function(dbAPI){
      dbAPI.auth()
      .signInWithEmailAndPassword(email, pass)
      .then(function(user){
        if( res ){
          msg = `Signed in: ${ email }`;
          respData = {
            msg: msg,
            user: user
          };

          console.log( `${color.green.bold('[ SUCCESS ]')} ${msg}` );

          res.json(respData);
        }else{
          resolve({
            dbAPI: dbAPI,
            user: user
          });
        }
      })
      .catch(function(err){
        utils.handleRespError(res, `Couldn't sign in: "${ err }"`);
      });
    });
  });
}

function signOut(opts){
  var res = (opts) ? opts.res : null;
  var msg, respData;

  return new Promise(function(resolve, reject){
    _db()(dbConfig, function(dbAPI){
      dbAPI.auth()
      .signOut()
      .then(function(){
        if( res ){
          msg = `User signed out`;
          respData = {
            msg: msg
          };

          console.log( `${color.green.bold('[ SUCCESS ]')} ${msg}` );

          res.json(respData);
        }else{
          resolve();
        }
      })
      .catch(function(err){
        utils.handleRespError(res, `Couldn't sign out: "${ err }"`);
      });
    });
  });
}

module.exports = {
  roles: appConfig.roles,

  check: function(opts){
    var res = opts.res;
    var msg, respData;

    _db()(dbConfig, function(dbAPI){
      dbAPI.auth().onAuthStateChanged(function(user){
        if( user ){
          msg = 'User is signed in';
          respData = {
            msg: msg,
            user: user
          };

          console.log( `${color.green.bold('[ SUCCESS ]')} ${msg}` );
        }else{
          msg = 'User not signed in';
          respData = {
            msg: msg
          };
          res.status(204);

          console.log( `${color.yellow.bold('[ WARN ]')} ${msg}` );
        }

        res.json(respData);
      });
    });
  },

  create: function(opts){
    var email = opts.email.trim();
    var pass = utils.encrypt( opts.pass.trim() );
    var res = opts.res;
    var msg, respData;

    _db()(dbConfig, function(dbAPI){
      dbAPI.auth().createUserWithEmailAndPassword(email, pass)
      .then(function(user){
        var usersRef = dbAPI.db().ref(`/users/${ user.uid }`);
        var userObj = {
          password: pass,
          role: opts.role
        };

        usersRef.update(userObj).then(function(data){
          user.sendEmailVerification()
          .then(function(){
            msg = `Saved user: ${ email }`;
            respData = {
              msg: msg
            };

            console.log( `${color.green.bold('[ SUCCESS ]')} ${msg}` );

            res.json(respData);
          })
          .catch(function(err){
            utils.handleRespError(res, `Email Verification not sent: "${ err.message }"`);
          });
        })
        .catch(function(err){
          utils.handleRespError(res, `Couldn't set up user properties: "${ err.message }"`);
        });
      })
      .catch(function(err){
        utils.handleRespError(res, `User not created: "${ err.message }"`);
      });
    });
  },

  getProps: function(opts){
    _db()(dbConfig, function(dbAPI){
      var propsRef = dbAPI.db().ref(`/users/${ opts.uid }`);

      propsRef.once('value', function(data){
        var props = data.val();
        props.password = utils.decrypt(props.password);

        opts.res.json(props);
      });
    });
  },

  update: function(opts){
    var newData = opts.data;
    var creds = opts.creds;
    var res = opts.res;

    signIn({
      email: creds.email,
      pass: creds.password
    })
    .then(function(signInData){
      var usersRef = signInData.dbAPI.db().ref(`/users/${ opts.uid }`);
      var respData;

      usersRef.update(newData)
      .then(function(data){
        msg = `Updated user data with: ${ JSON.stringify(newData, null, 2) }`;
        respData = {
          msg: msg,
          data: data
        };

        console.log( `${color.green.bold('[ SUCCESS ]')} ${msg}` );

        signOut()
        .then(function(){
          res.json(respData);
        });
      })
      .catch(function(err){
        utils.handleRespError(res, `Couldn't update user: "${ err.message }"`);
      });
    })
    .catch(function(err){
      console.log(err);
    });

    //_db()(dbConfig, function(dbAPI){
    //  var usersRef = dbAPI.db().ref(`/users/${ opts.uid }`);
    //  var respData;
    //
    //  usersRef.update(newData)
    //  .then(function(data){
    //    msg = `Updated user data with: ${ JSON.stringify(newData, null, 2) }`;
    //    respData = {
    //      msg: msg,
    //      data: data
    //    };
    //
    //    console.log( `${color.green.bold('[ SUCCESS ]')} ${msg}` );
    //
    //    res.json(respData);
    //  })
    //  .catch(function(err){
    //    utils.handleRespError(res, `Couldn't update user: "${ err.message }"`);
    //  });
    //});
  }
};