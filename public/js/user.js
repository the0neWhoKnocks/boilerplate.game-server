function UserStore(){
  riot.observable(this);

  var _self = this;

  _self.events = {
    USER_CREATE: 'user.create',
    USER_CREATED: 'user.created',
    USER_CREATION_ERROR: 'user.creationError',
    USER_INIT: 'user.init',
    USER_INITIALIZED: 'user.initialized',
    USER_REQUIRED: 'user.required',
    USER_SET_DATA: 'user.setData',
    USER_SIGN_IN: 'user.signIn',
    USER_SIGN_IN_ERROR: 'user.signInError',
    USER_SIGN_OUT: 'user.signOut',
    USER_SIGNED_IN: 'user.signedIn',
    USER_SIGNED_OUT: 'user.signedOut',
    USER_UPDATE: 'user.update',
    USER_UPDATE_ERROR: 'user.updateError',
    USER_UPDATED: 'user.updated'
  };
  _self.userData = undefined;

  _self.on(_self.events.USER_CREATE, function(createData){
    window.userAPI
    .create(createData)
    .then(function(data){
      _self.trigger(_self.events.USER_CREATED, data);
    })
    .catch(function(err){
      _self.trigger(_self.events.USER_CREATION_ERROR, err);
    });
  });

  _self.on(_self.events.USER_INIT, function(){
    window.userAPI.init();
  });

  _self.on(_self.events.USER_SET_DATA, function(data){
    _self.userData = data;
    _self.trigger(_self.events.USER_UPDATED, _self.userData);
  });

  _self.on(_self.events.USER_SIGN_IN, function(signInData){
    window.userAPI
    .signIn(signInData)
    .then(function(data){
      _self.trigger(_self.events.USER_SIGNED_IN, _self.userData);
    })
    .catch(function(err){
      _self.trigger(_self.events.USER_SIGN_IN_ERROR, err);
    });
  });

  _self.on(_self.events.USER_SIGN_OUT, function(data){
    window.userAPI.signOut()
    .then(function(){
      _self.userData = undefined;
      _self.trigger(_self.events.USER_SIGNED_OUT);
    });
  });

  _self.on(_self.events.USER_UPDATE, function(newData){
    window.userAPI
    .update(newData)
    .then(function(resp){
      for(var key in resp.data){
        _self.userData[key] = resp.data[key];
      }

      console.log(resp.msg);
      _self.trigger(_self.events.USER_UPDATED, _self.userData);
    })
    .catch(function(err){
      console.error('Update Error: '+ err);
      _self.trigger(_self.events.USER_UPDATE_ERROR, err);
    });
  });
}
var userStore = new UserStore();
RiotControl.addStore( userStore );

// =============================================================================

var userAPI = {
  events: userStore.events,
  userPromise: undefined,
  userData: undefined,

  init: function(){
    var _self = this;

    this.userPromise = new Promise(function(resolve, reject){
      window.utils.request({
        url: window.appData.endpoints.v1.USER_CHECK
      })
      .then(window.utils.transformResp)
      .then(function(data){
        if( data && data.user ){
          _self.userData = data.user;

          RiotControl.trigger(_self.events.USER_SET_DATA, _self.userData);
          RiotControl.trigger(_self.events.USER_INITIALIZED, _self.userData);

          resolve({
            user: data.user
          });
        }else{
          RiotControl.trigger(_self.events.USER_REQUIRED);
          resolve(null);
        }
      })
      .catch(function(err){
        console.error(err);
        RiotControl.trigger(_self.events.USER_REQUIRED);
        resolve(null);
      });
    });
  },

  create: function(opts){
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
        url: window.appData.endpoints.v1.USER_SIGN_IN,
        method: 'post',
        data: opts
      })
      .then(window.utils.transformResp)
      .then(function(resp){
        _self.userData = resp.user;

        RiotControl.trigger(_self.events.USER_SET_DATA, _self.userData);

        resolve(resp);
      })
      .catch(function(err){
        reject(err);
      });
    });
  },

  signOut: function(){
    var _self = this;

    return new Promise(function(resolve, reject){
      window.utils.request({
        url: window.appData.endpoints.v1.USER_SIGN_OUT
      })
      .then(window.utils.transformResp)
      .then(function(data){
        _self.userData = undefined;

        RiotControl.trigger(_self.events.USER_SIGNED_OUT);

        resolve(data);
      })
      .catch(function(err){
        reject(err);
      });
    });
  },

  update: function(opts){
    var _self = this;

    return new Promise(function(resolve, reject){
      window.utils.request({
        url: window.appData.endpoints.v1.USER_UPDATE,
        method: 'put',
        data: {
          creds: opts.creds,
          data: opts.data
        }
      })
      .then(window.utils.transformResp)
      .then(function(resp){
        for(var key in resp.data){
          if( resp.data.hasOwnProperty(key) ){
            _self.userData[key] = resp.data[key];
          }
        }

        RiotControl.trigger(_self.events.USER_SET_DATA, _self.userData);

        resolve(resp);
      })
      .catch(function(err){
        reject("Couldn't update custom props: "+err.message);
      });
    });
  }
};
