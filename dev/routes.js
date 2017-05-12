"use strict";

var fs = require('fs');
var color = require('cli-color');
var endpoints = require('./endpoints.js');
var utils = require('./utils.js');
var user = require('./user.js');


module.exports = function(opts){

  var shellTemplate = require(`${opts.config.paths.VIEWS}/_Shell.js`);
  var baseModel = {
    appData: {
      endpoints: endpoints,
      urls: opts.config.urls
    },
    dev: opts.flags.dev,
    scripts: {
      head: [],
      body: []
    },
    styles: [
      '/css/defaults.css'
    ],
    title: opts.config.titles.DEFAULT,
    viewName: 'default-view'
  };
  var _DB, _CONFIGURED;

  function db(){
    if( !_DB ){
      _DB = require(`${opts.config.paths.DEV}/database.js`);
    }

    return _DB;
  }

  function dbConfigured(){
    return new Promise(function(resolve, reject){
      fs.stat(opts.config.paths.DB_CONFIG, function(err, stat){
        if(err){
          console.log(`${color.yellow.bold('[ DB ]')} not configured`);
          reject({
            notConfigured: 'db'
          });
        }else{
          console.log(`${color.green.bold('[ DB ]')} configured`);
          resolve();
        }
      });
    });
  }
  
  function adminConfigured(){
    return new Promise(function(resolve, reject){
      var dbConfig = require(opts.config.paths.DB_CONFIG);
      dbConfig.admin = true;

      db()(dbConfig, function(dbAPI){
        var usersRef = dbAPI.db().ref('users');

        usersRef.once('value')
        .then(function(snapshot){
          if( snapshot.hasChildren() ){
            console.log(`${color.green.bold('[ ADMIN ]')} configured`);
            resolve();
          }else{
            console.log(`${color.yellow.bold('[ ADMIN ]')} not configured`);
            reject({
              notConfigured: 'admin'
            });
          } 
        })
        .catch(function(err){
          console.log(err);
        });
      });
    });
  }
  
  //function emailConfigured(){
  //  return new Promise(function(resolve, reject){
  //    fs.stat(opts.config.paths.EMAIL_CONFIG, function(err, stat){
  //      if(err){
  //        console.log('[ EMAIL ] not configured');
  //        reject({
  //          notConfigured: 'email'
  //        });
  //      }else{
  //        console.log('[ EMAIL ] configured');
  //        resolve(stat);
  //      }
  //    });
  //  });
  //}
  
  opts.server.get('*', function(req, res, next){
    try{
      _CONFIGURED = fs.statSync(opts.config.paths.CONFIGURED);
    }catch(err){}

    // pass api calls through
    if(
      _CONFIGURED
      || req.originalUrl.indexOf('/api') >= 0
      || /\.(jpg|png|css|ico)$/.test(req.originalUrl)
    ) return next();

    console.log('--------------------------------------------');
    console.log(req.originalUrl);
    console.log('--------------------------------------------');

    dbConfigured()
    .then(adminConfigured)
    //.then(emailConfigured)
    .then(function(){
      fs.closeSync(fs.openSync(opts.config.paths.CONFIGURED, 'w'));
      return next();
    })
    .catch(function(err){
      var setupModel = utils.combine({}, baseModel, {
        body: '<nox-steps></nox-steps>',
        scripts: {
          body: [
            '/js/utils.js',
            '/js/serverSetup.js'
          ]
        },
        styles: [
          '/css/serverSetup.css'
        ],
        title: 'Server Setup',
        viewName: 'setup'
      });
      
      switch(err.notConfigured){
        case 'db' : setupModel.appData.displayStep = 'db'; break;
        case 'admin' : setupModel.appData.displayStep = 'admin'; break;
        case 'email' : setupModel.appData.displayStep = 'email'; break;
      }
      
      res.send( shellTemplate(setupModel) );
    });
  });
  
  opts.server.get(endpoints.v1.CONCAT_TAGS, function(req, res){
    var tags = fs.readdirSync(opts.config.paths.COMPILED_TAGS);
    var concatenatedTags = '';

    if( tags.length ){
      var newestMTime = 0;
      
      tags.forEach(function(name){
        var filePath = `${ opts.config.paths.COMPILED_TAGS }/${ name }`;
        var file = fs.readFileSync(filePath);
        var stat = fs.statSync(filePath);
        var mTime = (new Date(stat.mtime)).getTime();
        
        concatenatedTags += `// ${ name } \n`;
        concatenatedTags += `${ file } \n\n`;
        
        if( mTime > newestMTime ) newestMTime = mTime;
      });
      
      res.set('ETag', newestMTime);
    }
    
    res.set('Content-Type', 'text/script');
    res.status(200);
    res.send(concatenatedTags);
  });
  
  opts.server.post(endpoints.v1.DB_CONFIG_ADD, function(req, res){
    var body = req.body;
    var msg, respData;
    
    if( body && body.config ){
      var conf = body.config.substring(
        body.config.indexOf('{'), 
        body.config.lastIndexOf('}')+1
      );
      var stringObj = JSON.stringify(
        eval('('+ conf.substring(conf.indexOf('{'), conf.lastIndexOf('}')+1) +')'),
        null, 2
      );
      var fileContents = `module.exports = ${ stringObj };`;
      
      try{
        fs.writeFileSync(opts.config.paths.DB_CONFIG, fileContents);
        
        msg = `Saved database config: \n${ fileContents }`;
        respData = { 
          msg: msg,
          status: 200
        };
        
        console.log( `${color.green.bold('[ SUCCESS ]')} ${msg}` );
        
        var dbConfig = require(opts.config.paths.DB_CONFIG);
        
        console.log( `${color.green.bold('[ TESTING ]')} connection to ${color.blue.bold(dbConfig.projectId)}` );
        
        db()(dbConfig, function(dbAPI){
          //dbAPI.db.goOffline();
        
          res.json(respData);
        });
      }catch(err){
        utils.handleRespError(res, `Couldn't save database config: ${ err }`);
      }
    }else{
      utils.handleRespError(res, 'No `config` Object provided');
    }
  });
  
  //opts.server.post(endpoints.v1.EMAIL_CONFIG_ADD, function(req, res){
  //  var body = req.body;
  //  var msg, respData;
  //
  //  if( body && body.email && body.pass ){
  //    var fileContents =
  //      "module.exports = {\n"+
  //      `  email: '${ body.email }',\n`+
  //      `  pass: '${ body.pass }'\n`+
  //      '};';
  //
  //    try{
  //      fs.writeFileSync(opts.config.paths.EMAIL_CONFIG, fileContents);
  //
  //      msg = `Saved email config: \n${ fileContents }`;
  //      respData = {
  //        msg: msg,
  //        status: 200
  //      };
  //
  //      console.log( `${color.green.bold('[ SUCCESS ]')} ${msg}` );
  //
  //      res.json(respData);
  //    }catch(err){
  //      utils.handleRespError(res, `Couldn't save email config: ${ err }`);
  //    }
  //  }else{
  //    utils.handleRespError(res, 'No data Object provided');
  //  }
  //});
  
  opts.server.post(endpoints.v1.USER_CREATE, function(req, res){
    var body = req.body;
    
    if(
      body
      && body.email
      && body.password
    ){
      user.create({
        email: body.email,
        pass: body.password,
        res: res,
        role: ( !_CONFIGURED ) ? user.roles.ADMIN : user.roles.DEFAULT
      });
    }else{
      utils.handleRespError(res, 'All required user data was not provided');
    }
  });

  //opts.server.get(endpoints.v1.USER_CHECK, function(req, res){
  //  user.check({
  //    res: res
  //  });
  //});

  opts.server.post(endpoints.v1.USER_ENCRYPT, function(req, res){
    var body = req.body;

    if( body && body.password ){
      res.json({
        pass: utils.encrypt( body.password.trim() )
      });
    }
  });

  opts.server.get(endpoints.v1.USER_PROPS, function(req, res){
    if( req.query && req.query.uid ){
      user.getProps({
        res: res,
        uid: req.query.uid
      });
    }else{
      utils.handleRespError(res, `No 'uid' was provided`);
    }
  });

  opts.server.put(endpoints.v1.USER_UPDATE, function(req, res){
    var body = req.body;

    if( body ){
      user.update({
        creds: body.creds,
        data: body.newData,
        uid: body.uid,
        res: res
      });
    }else{
      utils.handleRespError(res, 'No user data was not provided');
    }
  });

  //opts.server.post(endpoints.v1.USER_SIGN_IN, function(req, res){
  //  var body = req.body;
  //
  //  if(
  //    body
  //    && body.email
  //    && body.password
  //  ){
  //    user.signIn({
  //      email: body.email,
  //      pass: body.password,
  //      res: res,
  //    });
  //  }else{
  //    utils.handleRespError(res, 'All required sign-in data was not provided');
  //  }
  //});

  opts.server.get(opts.config.urls.PROFILE, function(req, res){
    const profileTemplate = require(`${opts.config.paths.VIEWS}/Profile.js`);
    baseModel.appData.dbConfig = require(opts.config.paths.DB_CONFIG);

    res.send(shellTemplate(utils.combine({}, baseModel, {
      body: profileTemplate(),
      scripts: {
        body: [
          '/js/vendor/firebase.js',
          '/js/database.js',
          '/js/user.js',
          '/js/utils.js',
          '/js/page.profile.js'
        ]
      },
      viewName: 'profile'
    })));
  });

  opts.server.get('/', function(req, res){
    const gameTemplate = require(`${opts.config.paths.VIEWS}/Game.js`);
    baseModel.appData.dbConfig = require(opts.config.paths.DB_CONFIG);

    res.send(shellTemplate(utils.combine({}, baseModel, {
      body: gameTemplate(),
      scripts: {
        body: [
          '/js/vendor/firebase.js',
          '/js/database.js',
          '/js/user.js',
          '/js/utils.js',
          '/js/page.game.js'
        ]
      },
      styles: [
        '/css/game.css'
      ],
      viewName: 'game'
    })));
  });
  
};