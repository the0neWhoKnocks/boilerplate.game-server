function loadGame(user){
  //alert('boot game');
}

window.topNav = riot.mount('nox-top-nav', {
  loginRequired: true,
  userAPI: window.userAPI,
  dbPromise: window.databaseAPI.initPromise,
  onSignIn: loadGame
})[0];

window.databaseAPI.init({
  config: window.appData.dbConfig
});