function loadProfile(userData){
  riot.mount('nox-top-nav', {
    absolutePos: true,
    userData: userData
  });

  riot.mount('nox-profile', {
    userData: userData
  });
}

function unLoadProfile(){
  window.profile.unload();
  window.topNav.hide();
}

riot.mount('nox-user-modal');

RiotControl.one(window.userAPI.events.USER_INITIALIZED, loadProfile);
RiotControl.on(window.userAPI.events.USER_SIGNED_IN, loadProfile);
RiotControl.on(window.userAPI.events.USER_SIGNED_OUT, unLoadProfile);
RiotControl.trigger(window.userAPI.events.USER_INIT);