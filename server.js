var fs = require('fs');
var path = require('path');
var compression = require('compression');
var express = require('express');
var io = require('socket.io');
var color = require('cli-color');
var browserSync = require('browser-sync');
var opn = require('opn');
var portscanner = require('portscanner');
var flags = require('minimist')(process.argv.slice(2));
var bodyParser = require('body-parser');
var helmet = require('helmet');
var session = require('express-session');

var appConfig = require('./conf.app.js');
var database = require('./dev/database.js');
var utils = require('./dev/utils.js');
var chokidar = require('chokidar');
var watcher;

// =============================================================================

for(var key in flags){
  var val = flags[key];
  
  switch(key){
    case 'd' :
    case 'dev' :
      flags.dev = true;
      break;
  }
}

// =============================================================================

var OS = function(){
  var platform = process.platform;
  
  if( /^win/.test(platform) ) return 'WINDOWS';
  else if( /^darwin/.test(platform) ) return 'OSX';
  else if( /^linux/.test(platform) ) return 'LINUX';
  else return platform;
}();
var CHROME = function(){
  switch(OS){
    case 'WINDOWS': return 'chrome';
    case 'OSX': return 'google chrome';
    case 'LINUX': return 'google-chrome';
  }
}();
var httpsOpts = {
  cert: fs.readFileSync(appConfig.paths.HTTPS_CERT),
  key: fs.readFileSync(appConfig.paths.HTTPS_KEY)
};

var app = {
  _socket: {
    players: {},
    socketList: {}
  },

  init: function(){
    this.expressInst = express();
    this.server = require('https').createServer(httpsOpts, this.expressInst);
    // setup socket so external requests show up in the client
    io = io(this.server);
    // add some protection
    this.expressInst.use(helmet());
    // enable gzip
    this.expressInst.use(compression());
    // add session support for users
    this.expressInst.set('trust proxy', 1);
    this.expressInst.use(session({
      cookie: {
        httpOnly: true,
        secureProxy: true,
        secure: true
      },
      name: appConfig.SESSION_NAME,
      resave: true,
      saveUninitialized: true,
      secret: appConfig.SESSION_SECRET
    }));
    // doc root is `public`
    this.expressInst.use(express.static(appConfig.paths.PUBLIC));
    // allows for reading POST data
    this.expressInst.use(bodyParser.json());   // to support JSON-encoded bodies
    this.expressInst.use(bodyParser.urlencoded({ // to support URL-encoded bodies
      extended: true
    }));

    // bind server routes
    require('./dev/routes.js')({
      _socket: this._socket,
      config: appConfig,
      flags: flags,
      server: this.expressInst
    });
    this.addServerListeners();
  },
  
  addServerListeners: function(){
    var _self = this;
    
    // Dynamically sets an open port, if the default is in use.
    portscanner.checkPortStatus(appConfig.PORT, '127.0.0.1', function(error, status){
      // Status is 'open' if currently in use or 'closed' if available
      switch(status){
        case 'open' : // port isn't available, so find one that is
          portscanner.findAPortNotInUse(appConfig.PORT, appConfig.PORT+20, '127.0.0.1', function(error, openPort){
            console.log(`${color.yellow.bold('[PORT]')} ${appConfig.PORT} in use, using ${openPort}`);

            appConfig.PORT = openPort;
            
            _self.startServer();
          });
          break;
        
        default :
          _self.startServer();
      }
    });
  },
  
  clearOldRoutes: function(){
    var stack = this.expressInst._router.stack;
    
    for(var i=stack.length-1; i>=0; i--){
      var currRoute = stack[i];
      
      if( currRoute.name === 'bound dispatch' ){
        //console.log(currRoute.regexp);
        this.expressInst._router.stack.splice(i, 1);
      };
    }
  },
  
  setupSystemReload: function(){
    var _self = this;
    
    watcher = chokidar.watch(
      [
        '*.js',
        'localization.json',
        'dev/**/*.js',
        'public/views/**/*.js'
      ],
      {
        ignored: [
          /(^|[\/\\])\../,
          'server.js',
          '**/(.bin|node_modules|tags)/**'
        ],
        ignoreInitial: true,
        persistent: true
      }
    );

    // allows for reloading of most files without having to restart server
    watcher.on('ready', function(){
      watcher.on('all', function(ev, reqPath){
        // only care about non-node_module caches
        var cacheKeys = Object.keys(require.cache).filter(function(key){
          if( key.indexOf('node_modules') < 0 ) return key;
        });
        
        cacheKeys.forEach(function(id){
          if( id.indexOf(reqPath) > -1 ){
            console.log(`${color.green.bold('[ CLEARED ]')} '${ id.replace(appConfig.paths.ROOT, '') }' from module cache`);
            delete require.cache[id];

            if( reqPath.indexOf('routes.js') > -1 ){
              _self.clearOldRoutes();
              
              require('./dev/routes.js')({
                config: appConfig,
                flags: flags,
                server: _self.expressInst
              });
              
              console.log(`${color.green.bold('[ RELOADED ]')} routes.js`);
            }
          }
        })
      });
      
      //console.log('watching ', watcher.getWatched());
    });
  },
  
  openBrowser: function(data){
    // let the user know the server is up and ready
    var msg = `${color.green.bold('[ SERVER ]')} Running at ${color.blue.bold(data.url)}`;
    
    if( flags.dev ){
      msg += `\n${color.green.bold('[ WATCHING ]')} For changes`;
      this.setupSystemReload();
    }
    
    console.log(`${msg}`);
    
    opn(data.url, {
      app: [CHROME],
      wait: false // no need to wait for app to close
    });
  },

  setupSocketListeners: function(){
    var _self = this;

    io.on('connection', function(socket){
      //console.log('[ SOCKET ] connected: ', socket.id);

      function dispatchPlayerDisconnect(uid){
        delete _self._socket.players[uid];
        io.sockets.emit('server.playerDisconnected', uid);
      }

      socket.on('client.playerJoined', function(data){
        _self._socket.players[data.uid] = data;
        _self._socket.socketList[socket.id] = data.uid;

        io.sockets.emit('server.playerJoined', _self._socket.players);
      });

      socket.on('client.playerUpdate', function(data){
        utils.combine(_self._socket.players[data.uid], data);
        // tell all users except the one who updated
        socket.broadcast.emit('server.playerUpdate', data);
      });

      socket.on('disconnect', function(){
        var uid = _self._socket.socketList[socket.id];
        dispatchPlayerDisconnect(uid);
        delete _self._socket.socketList[socket.id];
      });
      socket.on('client.playerDisconnected', function(uid){
        socket.disconnect();
        dispatchPlayerDisconnect(uid);
      });
    });
  },

  startServer: function(){
    var _self = this;
    
    this.server.listen(appConfig.PORT, function(){  
      var url = 'https://localhost:'+ appConfig.PORT +'/';
      var firstRunComplete = false;
      
      utils.compileRiotTags(function(err){
        if( err ) throw err;
        
        if( !firstRunComplete ){
          browserSync.init({
            browser: CHROME,
            ghostMode: false, // disable mirroring of actions to browsers
            https: {
              cert: appConfig.paths.HTTPS_CERT,
              key: appConfig.paths.HTTPS_KEY
            },
            files: [ // watch these files
              appConfig.paths.PUBLIC
            ],
            logLevel: 'silent', // prevent snippet message
            notify: false, // don't show the BS message in the browser
            port: appConfig.PORT,
            url: url
          }, _self.openBrowser.bind(_self, {
            url: url
          }));
          
          firstRunComplete = true;

          _self.setupSocketListeners();
        }        
      }, flags.dev);
    });
  }
};

module.exports = app;
var args = process.argv;
if( 
  // CLI won't have parent
  !module.parent
  // First arg is node executable, second arg is the .js file, the rest are user args
  && args.length >= 3
){
  if( app[args[2]] ) app[args[2]]();
}