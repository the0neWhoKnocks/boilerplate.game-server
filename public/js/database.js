// wrap database lib in an API so that it can be easily switched to another lib later if need be.
var databaseAPI = {
  initDefer: undefined,
  initPromise: undefined,

  init: function(opts){
    try{
      firebase.initializeApp(opts.config);
      this.initDefer.resolve();
    }catch(err){
      this.initDefer.reject(err);
    }
  }
};

(function(){
  databaseAPI.initPromise = new Promise(function(resolve, reject){
    databaseAPI.initDefer = {
      resolve: resolve,
      reject: reject
    };
  });
})();