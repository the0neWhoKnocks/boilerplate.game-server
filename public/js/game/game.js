"use strict";

class TileBase {
  constructor(opts){
    this.color = opts.color || '#cccccc';
    this.blocking = opts.blocking || true;
    this.height = opts.height || 5;
    this.width = opts.width || 5;
  }
}

class GroundTile extends TileBase {
  constructor(opts){
    opts.color = '#ff0000';
    opts.blocking = false;
    super(opts);
  }
}

class WallTile extends TileBase {
  constructor(opts){
    opts.color = '#00ff00';
    super(opts);
  }
}

class UserTile extends TileBase {
  constructor(opts){
    super(opts);

    this.avatar = opts.avatar;
    this.canvas = document.createElement('canvas');
    this.canvas.width = opts.width;
    this.canvas.height = opts.height;
    this.ctx = this.canvas.getContext('2d');
  }

  render(){
    const _self = this;

    return new Promise(function(resolve, reject){
      const img = document.createElement('img');

      if( !_self.avatar ){
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = _self.width;
        tmpCanvas.height = _self.height;
        const tmpCtx = tmpCanvas.getContext('2d');

        tmpCtx.fillStyle = _self.color;
        tmpCtx.fillRect(0, 0, _self.width, _self.height);
        _self.avatar = tmpCanvas.toDataURL('image/jpeg');
      }

      img.addEventListener('load', function(){
        const full = _self.canvas.width;
        const half = full/2;

        _self.ctx.save();
        _self.ctx.beginPath();
        _self.ctx.arc(half, half, half, 0, Math.PI * 2, true);
        _self.ctx.closePath();
        _self.ctx.clip();

        _self.ctx.drawImage(img, 0, 0, full, full);

        _self.ctx.beginPath();
        _self.ctx.arc(0, 0, half, 0, Math.PI * 2, true);
        _self.ctx.clip();
        _self.ctx.closePath();
        _self.ctx.restore();

        resolve();
      });

      img.src = _self.avatar;
    });
  }
}

class Map {
  constructor(opts){
    this.level = opts.level || [];
    this.size = opts.size || {
      width: 100,
      height: 100
    };
    this.tiles = opts.tiles || {};
    this.tileWidth = Math.floor(this.size.width / this.level[0].length);
    this.tileHeight = Math.floor(this.size.height / this.level.length);
    this.setCtx(opts.canvas);
  }

  setCtx(canvas){
    if( !canvas ) this.canvas = document.createElement('canvas');
    this.renderedCanvas = document.createElement('canvas');

    this.canvas.width = this.renderedCanvas.width = this.size.width;
    this.canvas.height = this.renderedCanvas.height = this.size.height;
    this.ctx = this.canvas.getContext('2d');
    this.renderedCtx = this.renderedCanvas.getContext('2d');
  }

  render(){
    if( this.level.length ){
      for( let i=0; i<this.level.length; i++ ){
        const row = this.level[i];

        for( let j=0; j<row.length; j++ ){
          const columnVal = row[j];
          const tileType = this.tiles[columnVal];
          const tile = new tileType({
            width: this.tileWidth,
            height: this.tileHeight
          });
          const xPos = j * tile.width;
          const yPos = i * tile.height;

          this.ctx.fillStyle = tile.color;
          this.ctx.fillRect(xPos, yPos, this.tileWidth, this.tileHeight);
        }
      }

      // create a copy of the map so that sections can be re-rendered after user input
      this.renderedCtx.drawImage(this.canvas, 0, 0);
    }
  }
}

class Player {
  constructor(opts){
    this.tile = new UserTile({
      avatar: opts.avatar,
      width: opts.width,
      height: opts.height
    });
    this.name = opts.name || '';
    this.uid = opts.uid;
    this.xPos = opts.xPos || 0;
    this.yPos = opts.yPos || 0;
  }
}

class Game {
  constructor(opts={}){
    this._map = undefined;
    this.player = undefined;
    this.players = {};
    this.deps = [
      '/js/vendor/socket.io.slim.js'
    ];
    this.keys = {};
    this.renderEnabled = false;

    if(opts.deps) this.deps = this.deps.concat(opts.deps);
  }

  get keyMap(){
    return {
      UP: 38,
      DOWN: 40,
      LEFT: 37,
      RIGHT: 39,
      W: 87,
      S: 83,
      A: 65,
      D: 68
    };
  }

  get map(){
    return this._map;
  }

  set map(opts){
    this._map = new Map(opts);
  }

  addPlayer(opts){
    const _self = this;

    opts.width = this.map.tileWidth;
    opts.height = this.map.tileHeight;
    const player = new Player(opts);

    this.players[player.uid] = player;

    return new Promise(function(resolve, reject){
      player.tile.render()
      .then(function(){
        resolve(player);
      });
    });
  }

  addToClient(parentEl){
    if( parentEl ){
      parentEl.appendChild(this.map.canvas);
    }else{
      document.body.appendChild(this.map.canvas);
    }
  }

  load(parentEl){
    const _self = this;

    if( this.deps.length ){
      let deps = [];

      for(let i=0; i<this.deps.length; i++){
        const req = window.utils.request({
          url: this.deps[i]
        });
        deps.push(req);
      }

      return Promise.all(deps)
      .then(function(){
        _self.addToClient(parentEl);
      });
    }else{
      _self.addToClient(parentEl);
      return Promise.resolve();
    }
  }

  setupControls(){
    const _self = this;

    function handleKey(ev){
      _self.keys[ev.keyCode] = ev.type === 'keydown';
    }

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
  }

  renderPlayers(localPlayer, players){
    const speed = this.map.tileWidth;
    const friction = speed / 14;
    let velY = 0;
    let velX = 0;
    let keyDown = false;

    // track multiple keys for multi-directional movement
    if( (this.keys[this.keyMap.UP] || this.keys[this.keyMap.W]) && velY > -speed ){ velY--; keyDown = true; }
    if( (this.keys[this.keyMap.DOWN] || this.keys[this.keyMap.S]) && velY < speed ){ velY++; keyDown = true; }
    if( (this.keys[this.keyMap.LEFT] || this.keys[this.keyMap.A]) && velX > -speed ){ velX--; keyDown = true; }
    if( (this.keys[this.keyMap.RIGHT] || this.keys[this.keyMap.D]) && velX < speed ){ velX++; keyDown = true; }

    velX *= friction;
    localPlayer.xPos += velX;
    velY *= friction;
    localPlayer.yPos += velY;

    if( localPlayer.xPos >= (this.map.size.width - localPlayer.tile.width) ){
      localPlayer.xPos = this.map.size.width - localPlayer.tile.width;
    }else if( localPlayer.xPos <= 0 ){
      localPlayer.xPos = 0;
    }

    if( localPlayer.yPos > (this.map.size.height - localPlayer.tile.height) ){
      localPlayer.yPos = this.map.size.height - localPlayer.tile.height;
    }else if( localPlayer.yPos <= 0 ){
      localPlayer.yPos = 0;
    }

    if( keyDown ){
      this.socket.emit('client.playerUpdate', {
        avatar: localPlayer.avatar,
        uid: localPlayer.uid,
        xPos: localPlayer.xPos,
        yPos: localPlayer.yPos
      });
    }

    // paint map
    this.map.ctx.clearRect(0, 0, this.map.ctx.canvas.width, this.map.ctx.canvas.height);
    this.map.ctx.drawImage(this.map.renderedCtx.canvas, 0, 0);
    // then players
    for(let uid in players){
      const player = players[uid];
      this.map.ctx.drawImage(player.tile.canvas, player.xPos, player.yPos);
    }
    // ensure the local user is always on top
    this.map.ctx.drawImage(localPlayer.tile.canvas, localPlayer.xPos, localPlayer.yPos);
  }

  renderLayers(){
    if( this.renderEnabled ){
      this.renderPlayers(this.player, this.players);
      requestAnimationFrame(this.renderLayers.bind(this));
    }
  }

  setupMultiPlayer(opts){
    var _self = this;
    _self.socket = io.connect();

    _self.socket.once('connect', function(){
      console.log('[ SOCKET ] Connected');

      _self.setupMultiPlayerListeners();

      _self.addPlayer({
        avatar: opts.avatar,
        name: opts.name,
        uid: opts.uid
      })
      .then(function(player){
        window.game.setupControls(player);

        _self.player = player;
        _self.renderEnabled = true;
        _self.renderLayers();
        _self.socket.emit('client.playerJoined', {
          avatar: player.tile.avatar,
          name: player.name,
          uid: player.uid,
          xPos: player.xPos,
          yPos: player.yPos
        });
      });
    });
  }

  setupMultiPlayerListeners(){
    const _self = this;

    _self.socket.on('server.playerJoined', function(currentPlayers){
      let players = [];

      // add only new players
      for(let uid in currentPlayers){
        if( !_self.players[uid] ){
          const newPlayer = currentPlayers[uid];
          players.push( _self.addPlayer(newPlayer) );
        }
      }

      Promise.all(players)
      .then(function(){
        console.log('new player(s) joined');
      });
    });

    _self.socket.on('server.playerUpdate', function(data){
      window.utils.combine(_self.players[data.uid], data);
    });

    _self.socket.on('server.playerDisconnected', function(uid){
      console.log('player disconnected');
      delete _self.players[uid];
    });
  }

  unload(){
    this.renderEnabled = false;
    this.socket.emit('client.playerDisconnected', this.player.uid);
    delete this.players[this.player.uid];
    delete this.player;
    this.map.canvas.parentNode.removeChild(this.map.canvas);
  }

  render(){
    this.map.render();
  }
}