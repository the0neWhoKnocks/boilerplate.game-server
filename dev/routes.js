const fs = require('fs');
const color = require('cli-color');
const endpoints = require('./endpoints.js');
const utils = require('./utils.js');
const userAPI = require('./user.js');

const LANG_LOCALE = '/:langLocale?';

module.exports = function(opts){
  // only expose admin endpoints within the admin
  var filteredEndpoints = utils.clone(endpoints);
  for(var version in filteredEndpoints){
    delete filteredEndpoints[version].admin;
  }

  var shellTemplate = require(`${opts.config.paths.VIEWS}/_Shell.js`);
  var baseModel = {
    appData: {
      endpoints: filteredEndpoints,
      langLocale: opts.config.DEFAULT_LANG_LOCALE,
      title: opts.config.titles.DEFAULT,
      urls: opts.config.urls
    },
    dev: opts.flags.dev,
    langLocale: opts.config.DEFAULT_LANG_LOCALE,
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

  const langLocaleMiddleware = (req, res, next) => {
    if(
      // is set
      req.params.langLocale
      // matches the expected `lang-locale` format
      && /[a-z]{2}-[a-z]{2}/i.test(req.params.langLocale)
    ){
      const urlLangLocale = req.params.langLocale.split('-');

      baseModel.langLocale = urlLangLocale[0].toLowerCase();
      if(urlLangLocale[1]) baseModel.langLocale += `-${ urlLangLocale[1].toUpperCase() }`;
      baseModel.appData.langLocale = baseModel.langLocale;
    }
    // due to the socket nature of this server, some data will persist so we have
    // to always set data to it's default state
    else {
      baseModel.langLocale =
      baseModel.appData.langLocale = opts.config.DEFAULT_LANG_LOCALE;
    }

    next();
  };

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
    var lMtime = (new Date( fs.statSync(opts.config.paths.LOCALIZATION).mtime )).getTime();
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

      if( lMtime > newestMTime ) newestMTime = lMtime;

      res.set('ETag', newestMTime);
    }

    res.set('Content-Type', 'application/javascript');
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

  opts.server.post(endpoints.v1.USER_CREATE, function(req, res){
    var body = req.body;

    if(
      body
      && body.email
      && body.password
    ){
      userAPI.create({
        email: body.email,
        pass: body.password,
        res: res,
        role: ( !_CONFIGURED ) ? userAPI.roles.ADMIN : userAPI.roles.DEFAULT
      });
    }else{
      utils.handleRespError(res, 'All required user data was not provided');
    }
  });

  opts.server.get(endpoints.v1.USER_CHECK, function(req, res){
    userAPI.check({
      req: req,
      res: res
    });
  });

  opts.server.get(endpoints.v1.USER_PROPS, function(req, res){
    if( req.query && req.query.uid ){
      userAPI.getProps({
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
      userAPI.update({
        data: body.data,
        req: req,
        res: res
      });
    }else{
      utils.handleRespError(res, 'No user data was not provided');
    }
  });

  opts.server.post(endpoints.v1.USER_SIGN_IN, function(req, res){
    var signInData = req.body;

    if(
      signInData
      && signInData.email
      && signInData.password
    ){
      userAPI.signIn({
        email: signInData.email,
        pass: signInData.password
      })
      .then(function(signInData){
        userAPI.signOut()
        .then(function(){
          if( signInData.user.emailVerified ){
            req.session.user = signInData.user;
            res.json({
              msg: `Signed in: '${ signInData.user.email }'`,
              user: signInData.user
            });
          }else{
            utils.handleRespError(res, `You haven't verified your email yet.`);
          }
        })
        .catch(function(err){
          utils.handleRespError(res, `Problem during disconnect: ${ err.message }`);
        });
      })
      .catch(function(err){
        utils.handleRespError(res, `Problem during sign-in: ${ err.message }`);
      });
    }else{
      utils.handleRespError(res, 'All required sign-in data was not provided');
    }
  });

  opts.server.get(endpoints.v1.USER_SIGN_OUT, function(req, res){
    req.session.destroy();
    res.json({
      msg: 'Signed out'
    });
  });

  // ===========================================================================

  opts.server.get(endpoints.v1.admin.LOCALIZATION, function(req, res){
    if(
      req.session
      && req.session.user
      && req.session.user.role === opts.config.roles.ADMIN
    ){
      try{
        var localization = fs.readFileSync(opts.config.paths.LOCALIZATION, 'utf8');
        res.json({
          msg: 'Success',
          localization: JSON.parse(localization)
        });
      }catch(err){
        utils.handleRespError(res, err.message);
      }
    }else{
      utils.handleRespError(res, "Access Denied");
    }
  });

  opts.server.get(endpoints.v1.admin.USERS, function(req, res){
    if(
      req.session
      && req.session.user
      && req.session.user.role === opts.config.roles.ADMIN
    ){
      var user = req.session.user;

      userAPI.signIn({
        email: user.email,
        pass: user.password
      })
      .then(function(signInData){
        var usersRef = signInData.dbAPI.db().ref('/users');

        usersRef.once('value', function(snap){
          var userData = snap.val();

          userAPI.signOut()
          .then(function(){
            for(var uid in userData){
              var unorderedData = userData[uid];
              var orderedData = {
                status: ( opts._socket && opts._socket.players[uid] ) ? 'connected' : 'disconnected',
                verified: unorderedData.verified || false,
                email: unorderedData.email,
                role: unorderedData.role
              };

              userData[uid] = orderedData;
            }

            res.json({
              users: userData
            });
          });
        });
      })
      .catch(function(err){
        utils.handleRespError(res, err.message);
      });
    }else{
      utils.handleRespError(res, "Access Denied");
    }
  });

  // ===========================================================================

  opts.server.get(opts.config.urls.PROFILE, function(req, res){
    const profileTemplate = require(`${opts.config.paths.VIEWS}/Profile.js`);

    res.send(shellTemplate(utils.combine({}, baseModel, {
      body: profileTemplate(),
      scripts: {
        body: [
          '/js/user.js',
          '/js/utils.js',
          '/js/page.profile.js'
        ]
      },
      viewName: 'profile'
    })));
  });

  opts.server.get(
    `${ LANG_LOCALE }${ opts.config.urls.ADMIN }/:page?`,
    langLocaleMiddleware,
    (req, res) => {
      const page = req.params.page;
      const adminTemplate = require(`${opts.config.paths.VIEWS}/Admin.js`);
      const adminModel = {
        scripts: {
          body: [
            '/js/vendor/socket.io.slim.js',
            '/js/user.js',
            '/js/utils.js',
            '/js/page.admin.js'
          ]
        },
        viewName: 'admin'
      };
      let templateModel = {};

      // ensure the admin page is only reachable if an admin is logged in
      if( req.session.user ){
        if( req.session.user.role === opts.config.roles.ADMIN ){
          templateModel.user = req.session.user;
          adminModel.appData = {
            admin: {
              user: templateModel.user
            },
            endpoints: endpoints,
            roles: opts.config.roles
          };

          if( page ) adminModel.appData.page = page;
        }else{
          templateModel.user = 'not allowed';
        }
      }

      adminModel.body = adminTemplate(templateModel);

      res.send(shellTemplate(utils.combine({}, baseModel, adminModel)));
    }
  );

  opts.server.get(
    `${ LANG_LOCALE }/`,
    langLocaleMiddleware,
    (req, res) => {
      const gameTemplate = require(`${opts.config.paths.VIEWS}/Game.js`);

      res.send(shellTemplate(utils.combine({}, baseModel, {
        body: gameTemplate(),
        scripts: {
          body: [
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
    }
  );

};
