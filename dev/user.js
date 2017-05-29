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

module.exports = {
  roles: appConfig.roles,

  check: function(opts){
    var req = opts.req;
    var res = opts.res;
    var respData;

    if( req.session.user ){
      respData = {
        msg: 'User is signed in',
        user: req.session.user
      };
    }else{
      respData = {
        msg: 'User not signed in'
      };
      res.status(204);
    }

    res.json(respData);
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
          email: email,
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

  signIn: function(opts){
    var _self = this;
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
            var propsRef = dbAPI.db().ref(`/users/${ user.uid }`);

            propsRef.once('value', function(data){
              var props = data.val();

              // normalize the user data
              var normalizedData = {
                // FB props
                email: user.email,
                emailVerified: user.emailVerified,
                displayName: user.displayName,
                photoURL: user.photoURL,
                uid: user.uid
              };

              // appends custom data to FB user Object
              for(var key in props){
                if( props.hasOwnProperty(key) ){
                  var val = props[key];

                  switch( key ){
                    case 'password' :
                      normalizedData.encryptedPassword = val;
                      val = utils.decrypt(val);
                      break;
                    case 'role' :
                      // only add role data if admin
                      if( val !== _self.roles.ADMIN ) continue;
                      break;
                  }

                  normalizedData[key] = val;
                }
              }

              // if the user's email was verified, store it since FB doesn't expose that easily
              if( normalizedData.emailVerified && !props.emailVerified ){
                propsRef.update({
                  verified: true
                })
                .then(function(){
                  resolve({
                    dbAPI: dbAPI,
                    user: normalizedData
                  });
                })
                .catch(function(err){
                  reject(`Couldn't update user after sign in: "${ err.message }"`);
                });
              }else{
                resolve({
                  dbAPI: dbAPI,
                  user: normalizedData
                });
              }
            });
          }
        })
        .catch(function(err){
          switch( err.code ){
            case 'auth/user-not-found' :
              reject({
                message: `Couldn't sign in: No user found with those credentials.`
              });
              break;

            case 'auth/wrong-password' :
              reject({
                message: `Couldn't sign in: The wrong credentials were provided.`
              });
              break;

            default :
              reject({
                message: `Couldn't sign in: "${ err.message }"`
              });
          }
        });
      });
    });
  },

  signOut: function(opts){
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
  },

  update: function(opts){
    var _self = this;
    var newData = opts.data;
    var req = opts.req;
    var res = opts.res;
    var creds = {};

    if( !req.session || !req.session.user ){
      utils.handleRespError(res, "Unauthorized");
    }else{
      creds = req.session.user;
    }

    _self.signIn({
      email: creds.email,
      pass: creds.password
    })
    .then(function(signInData){
      // middleware to handle profile image.
      return new Promise(function(resolve, reject){
        if(
          newData.avatar
          && newData.avatar.indexOf('data:') === 0
        ){
          if( !fs.existsSync(appConfig.paths.AVATARS) ){
            fs.mkdirSync(appConfig.paths.AVATARS);
          }

          var currUser = signInData.dbAPI.auth().currentUser;
          // encrypt the uid so other users can't get insight into other users' info.
          var imgName = `${ utils.encrypt(currUser.uid) }.jpg`;
          var avatar = newData.avatar.replace(/^data:image\/(jpeg|png);base64,/, "");

          fs.writeFileSync(`${ appConfig.paths.AVATARS }/${ imgName }`, avatar, 'base64');

          newData.avatar = imgName;
          newData.photoURL = `${ appConfig.paths.AVATARS_REL }/${ imgName }?t=${ Date.now() }`;

          resolve(signInData);
        }else{
          resolve(signInData);
        }
      });
    })
    .then(function(signInData){
      var currUser = signInData.dbAPI.auth().currentUser;
      var promises = [];
      var updatedViaAdmin = false;

      // https://firebase.google.com/docs/auth/web/manage-users
      if(
        newData.displayName
        || newData.photoURL
      ){
        var namePromise = new Promise(function(resolve, reject){
          var updateData = {};
          var updatedProps = [];

          for(var prop in newData){
            if( newData.hasOwnProperty(prop) ){
              switch(prop){
                case 'displayName' :
                case 'photoURL' :
                  updateData[prop] = newData[prop];
                  updatedProps.push(prop);
                  delete newData[prop];
                  break;
              }
            }
          }

          currUser.updateProfile(updateData)
          .then(function(){
            resolve({
              msg: `Updated: ${ updatedProps.join(', ') }`,
              data: updateData
            });
          })
          .catch(function(err){
            reject(`Couldn't update ${ updatedProps.join(', ') }: ${ err.message }`);
          });
        });

        promises.push(namePromise);
      }

      // the remaining props will be custom
      if( Object.keys(newData).length ){
        var propsPromise = new Promise(function(resolve, reject){
          var usersRef = signInData.dbAPI.db().ref(`/users/${ currUser.uid }`);

          // to account for admin updates, get the current user's role
          usersRef.once('value', function(data){
            var props = data.val();

            // allow only admin to update props for other users
            if( newData.uid && props.role === _self.roles.ADMIN ){
              usersRef = signInData.dbAPI.db().ref(`/users/${ newData.uid }`);
              updatedViaAdmin = true;
            }

            usersRef.update(newData)
            .then(function(){
              resolve({
                msg: `Updated custom props with: ${ JSON.stringify(newData, null, 2) }`,
                data: newData
              });
            })
            .catch(function(err){
              reject(`Couldn't update user: "${ err.message }"`);
            });
          });
        });

        promises.push(propsPromise);
      }

      Promise.all(promises)
      .then(function(dataArr){
        var finalMsg = '';
        var respData = {
          data: {}
        };

        // combine all data and messages into one response
        for(var i=0; i<dataArr.length; i++){
          var curr = dataArr[i];

          if( curr.msg ) finalMsg += `${ curr.msg }\n`;

          if( curr.data ){
            for(var key in curr.data){
              if( curr.data.hasOwnProperty(key) ){
                var currVal = curr.data[key];

                respData.data[key] = currVal;

                // only update user session data if not updating another user via admin
                if( !updatedViaAdmin ){
                  // update session data otherwise it'll be stale on refresh
                  req.session.user[key] = currVal;
                }
              }
            }
          }
        }

        console.log( `${color.green.bold('[ SUCCESS ]')} ${finalMsg}` );
        respData.msg = finalMsg;

        _self.signOut()
        .then(function(){
          res.json(respData);
        });
      })
      .catch(function(err){
        _self.signOut()
        .then(function(){
          utils.handleRespError(res, `Problem updating data: "${ err }"`);
        });
      });
    })
    .catch(function(err){
      console.log(err);
      utils.handleRespError(res, `Problem updating data: "${ err }"`);
    });
  }
};