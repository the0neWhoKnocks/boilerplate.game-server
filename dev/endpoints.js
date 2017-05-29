var V1 = '/api/v1';

module.exports = {
  v1: {
    _base: V1,
    admin: {
      USERS: `${ V1 }/admin/users`
    },
    CONCAT_TAGS: `${ V1 }/concat/tags`,
    DB_CONFIG_ADD: `${ V1 }/dbconfig/add`,
    EMAIL_CONFIG_ADD: `${ V1 }/emailconfig/add`,
    USER_CREATE: `${ V1 }/user/create`,
    USER_CHECK: `${ V1 }/user/check`,
    USER_PROPS: `${ V1 }/user/props`,
    USER_UPDATE: `${ V1 }/user/update`,
    USER_SIGN_IN: `${ V1 }/user/signin`,
    USER_SIGN_OUT: `${ V1 }/user/signout`
  }
};