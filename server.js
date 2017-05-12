var fs = require('fs');
var path = require('path');
var compression = require('compression');
var express = require('express');
var color = require('cli-color');
var browserSync = require('browser-sync');
var opn = require('opn');
var portscanner = require('portscanner');
var flags = require('minimist')(process.argv.slice(2));
var bodyParser = require('body-parser');

var appConfig = require('./conf.app.js');
var database = require('./dev/database.js');
var utils = require('./dev/utils.js');
var chokidar = require('chokidar');
var watcher, shellTemplate;

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

var app = {
  init: function(){
    this.expressInst = express();
    this.server = require('http').createServer(this.expressInst);
    // enable gzip
    this.expressInst.use(compression());
    // doc root is `public`
    this.expressInst.use(express.static(appConfig.paths.PUBLIC));
    // allows for reading POST data
    this.expressInst.use(bodyParser.json());   // to support JSON-encoded bodies
    this.expressInst.use(bodyParser.urlencoded({ // to support URL-encoded bodies
      extended: true
    })); 
    // bind server routes
    require('./dev/routes.js')({
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
      //app: [CHROME, '--incognito'],
      wait: false // no need to wait for app to close
    });
  },
  
  startServer: function(){
    var _self = this;
    
    this.server.listen(appConfig.PORT, function(){  
      var url = 'http://localhost:'+ appConfig.PORT +'/';
      var firstRunComplete = false;
      
      utils.compileRiotTags(function(err){
        if( err ) throw err;
        
        if( !firstRunComplete ){
          browserSync.init({
            browser: CHROME,
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