var userAPI = {
  userPromise: undefined,
  userKey: 'user',

  init: function(){
    var _self = this;

    this.userPromise = new Promise(function(resolve, reject){
      firebase.auth().onAuthStateChanged(function(user){
        if( window.localStorage[_self.userKey] ){
          var userChoice = JSON.parse(window.localStorage[_self.userKey]);

          if( !userChoice.alwaysIn && !window.sessionStorage[_self.userKey] ){
            window.localStorage.removeItem(_self.userKey);

            _self.signOut()
            .then(function(){
              resolve(null);
            });
          }else{
            resolve(user);
          }
        }else{
          resolve(user);
        }
      });
    });
  },

  create: function(opts){
    var _self = this;

    return new Promise(function(resolve, reject){
      window.utils.request({
        url: window.appData.endpoints.v1.USER_CREATE,
        method: 'post',
        data: {
          email: opts.email,
          password: opts.password
        }
      })
      .then(window.utils.transformResp)
      .then(function(data){
        resolve(data);
      })
      .catch(function(err){
        reject(err);
      });
    });
  },

  signIn: function(opts){
    var _self = this;

    return new Promise(function(resolve, reject){
      window.utils.request({
        url: window.appData.endpoints.v1.USER_ENCRYPT,
        method: 'post',
        data: {
          password: opts.password
        }
      })
      .then(window.utils.transformResp)
      .then(function(data){
        firebase.auth()
        .signInWithEmailAndPassword(opts.email, data.pass)
        .then(function(userData){
          if( !opts.alwaysIn ){
            var localUserData = JSON.stringify({
              alwaysIn: false
            });
            window.localStorage.setItem(_self.userKey, localUserData);
            window.sessionStorage.setItem(_self.userKey, localUserData);
          }

          if( userData.emailVerified ){
            resolve(userData);
          }else{
            _self.signOut()
            .then(function(){
              resolve(null);
            });
          }
        })
        .catch(function(err){
          switch( err.code ){
            case 'auth/user-not-found' :
              reject({
                msg: err.message
              });
              break;

            case 'auth/wrong-password' :
              reject({
                msg: `Couldn't sign in, the wrong credentials were provided.`
              });
              break;

            default :
              reject(err);
          }
        });
      });
    });
  },

  signOut: function(){
    return firebase.auth()
    .signOut();
  },

  update: function(opts){
    var currUser = firebase.auth().currentUser;

    if( currUser ){
      var promises = [];

      // https://firebase.google.com/docs/auth/web/manage-users
      if( opts.data.displayName ){
        var displayName = opts.data.displayName;
        var namePromise = new Promise(function(resolve, reject){
          currUser.updateProfile({
            displayName: displayName
          })
          .then(function(){
            resolve("Updated display name with: "+ displayName);
          })
          .catch(function(err){
            reject("Couldn't update display name: "+ err.message);
          });
        });

        delete opts.data.displayName;
        promises.push(namePromise);
      }

      // the remaining props will be custom
      if( Object.keys(opts.data).length ){
        var propsPromise = new Promise(function(resolve, reject){
          window.utils.request({
            url: window.appData.endpoints.v1.USER_UPDATE,
            method: 'put',
            data: {
              creds: opts.creds,
              newData: opts.data,
              uid: currUser.uid
            }
          })
          .then(window.utils.transformResp)
          .then(function(data){
            resolve(data.msg);
          })
          .catch(function(err){
            reject("Couldn't update custom props: "+err.message);
          });
        });

        promises.push(propsPromise);
      }

      return Promise.all(promises);
    }else{
      return Promise.reject("Can't update user data because user's not logged in.");
    }
  }
};