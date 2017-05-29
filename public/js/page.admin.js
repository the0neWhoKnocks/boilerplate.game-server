if( !window.appData.admin ){
  function loadAdmin(userData){
    location.reload();
  }

  riot.mount('nox-user-modal', {
    hasCreate: false
  });

  RiotControl.on(window.userAPI.events.USER_SIGNED_IN, loadAdmin);
  RiotControl.trigger(window.userAPI.events.USER_INIT);
}else{
  riot.mount('nox-admin', {
    userData: window.appData.admin.user
  });
}