var path = require('path');

var conf = {
  CIPHER_KEY: 'c0wbOyBeeb0p',
  CIPHER_ALGORITHM: 'aes192',
  PORT: 8081,
  paths: {
    ROOT: path.resolve(__dirname, './')
  },
  roles: {
    ADMIN: 1337,
    DEFAULT: 1
  },
  SESSION_NAME: 'server_session',
  SESSION_SECRET: 'f@nseeP@ntzz',
  titles: {
    DEFAULT: 'Game Server'
  },
  urls: {
    PROFILE: '/profile'
  }
};
// root
conf.paths.CONFIGURED = `${conf.paths.ROOT}/.configured`;
conf.paths.DEV = `${conf.paths.ROOT}/dev`;
conf.paths.DB_CONFIG = `${conf.paths.ROOT}/sys.database.js`;
conf.paths.HTTPS_CERT = `${conf.paths.ROOT}/certs/server.crt`;
conf.paths.HTTPS_KEY = `${conf.paths.ROOT}/certs/server.key`;
conf.paths.PUBLIC = `${conf.paths.ROOT}/public`;
conf.paths.RIOT_CONFIG = `${conf.paths.ROOT}/conf.riot.js`;
// public
conf.paths.COMPILED_TAGS = `${conf.paths.PUBLIC}/js/tags`;
conf.paths.VIEWS = `${conf.paths.PUBLIC}/views`;
conf.paths.AVATARS = `${conf.paths.PUBLIC}/imgs/avatars`;
conf.paths.AVATARS_REL = conf.paths.AVATARS.replace(conf.paths.PUBLIC, '');
// dev
conf.paths.SOURCE_TAGS = `${conf.paths.DEV}/tags`;

module.exports = conf;