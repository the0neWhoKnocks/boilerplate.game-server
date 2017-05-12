var appConfig = require('./conf.app.js');

// http://riotjs.com/guide/compiler/#es6-config-file
module.exports = {
  from: appConfig.paths.SOURCE_TAGS,
  to: appConfig.paths.COMPILED_TAGS,
  // js parser
  type: 'es6',
  // css parser
  style: 'stylus'
};