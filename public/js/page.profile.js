function handleUpdate(data){
  window.topNav.update();
}

function loadProfile(userData){
  window.utils.request({
    url: window.appData.endpoints.v1.USER_PROPS,
    data: {
      uid: userData.uid
    }
  })
  .then(window.utils.transformResp)
  .then(function(props){
    for(var key in props){
      userData[key] = props[key];
    }

    window.profile = riot.mount('nox-profile', {
      userAPI: window.userAPI,
      userData: userData,
      onUpdate: handleUpdate
    })[0];
  })
  .catch(function(err){
    console.error(err);
  });
}

function unLoadProfile(){
  window.profile.unload();
}

window.topNav = riot.mount('nox-top-nav', {
  absolutePos: true,
  loginRequired: true,
  userAPI: window.userAPI,
  dbPromise: window.databaseAPI.initPromise,
  onSignIn: loadProfile,
  onSignOut: unLoadProfile
})[0];

window.databaseAPI.init({
  config: window.appData.dbConfig
});