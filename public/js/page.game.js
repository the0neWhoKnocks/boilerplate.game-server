function handleUser(userData){
  riot.mount('nox-top-nav', {
    userData: userData
  });

  if( !window.game ){
    window.utils.request({
      url: '/js/game/game.js'
    })
    .then(loadGame);
  }else{
    loadGame();
  }
}

function loadGame(){
  var parentEl = document.getElementById('gameContainer');

  window.game = new Game();
  window.game.map = {
    level: [
      [1,1,1,1,1,1],
      [1,0,0,0,0,1],
      [1,0,0,0,0,1],
      [1,0,0,0,0,1],
      [1,0,0,0,0,1],
      [1,1,1,1,1,1]
    ],
    size: {
      width: 500,
      height: 500
    },
    tiles: {
      '0': GroundTile,
      '1': WallTile
    }
  };
  window.game
  .load(parentEl)
  .then(function(){
    window.game.render();

    var gameType = 'multiplayer';

    switch(gameType){
      case 'multiplayer' :
        window.game.setupMultiPlayer({
          avatar: window.userAPI.userData.photoURL,
          name: window.userAPI.userData.displayName,
          uid: window.userAPI.userData.uid
        });
        break;
    }
  });

  RiotControl.one(window.userAPI.events.USER_SIGNED_OUT, unLoadGame);
}

function unLoadGame(){
  window.topNav.hide();
  window.game.unload();
}

riot.mount('nox-user-modal');

RiotControl.one(window.userAPI.events.USER_INITIALIZED, handleUser);
RiotControl.on(window.userAPI.events.USER_SIGNED_IN, handleUser);
RiotControl.trigger(window.userAPI.events.USER_INIT);