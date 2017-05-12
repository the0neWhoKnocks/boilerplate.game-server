<nox-top-nav>
  <nav class="top-nav" style={ navStyles }>
    <div>Logo</div>
    <nox-user-nav
      ref="userNav"
      if={ userNavOpts }
    ></nox-user-nav>
  </nav>
  
  <style scoped>
    :scope,
    input,
    button, 
    *::after, 
    *::before {
      font: 20px Helvetica, Arial, sans-serif;
    }
    
    :scope {

    }

    .top-nav {
      background: #ccc;
      position: relative;
      z-index: 10;
    }

    nox-user-nav {
      position: absolute;
      top: 0;
      right: 0;
    }
  </style>
  
  <script>
    const _self = this;

    this.absolutePos = opts.absolutePos;
    this.userNavOpts = opts.userNavOpts || null;
    this.loginRequired = opts.loginRequired || false;
    this.userAPI = opts.userAPI || null;
    this.dbPromise = opts.dbPromise || null;
    this.onSignIn = opts.onSignIn || null;
    this.onSignOut = opts.onSignOut || null;

    if( this.absolutePos ){
      this.navStyles = 'position:absolute; left:0; right:0';
    }

    function handleMount(){
      if( this.loginRequired ){
        if( this.userAPI && this.dbPromise ){
          this.dbPromise.then(function(){
            _self.userAPI.init();
            _self.userAPI.userPromise.then(function(userData){
              _self.userModal = createUserModal();

              if( !userData ){
                _self.userModal.open();
              }else{
                handleUserData(userData);
              }
            });
          });
        }else{
          alert('When `loginRequired`, `userAPI` & `dbPromise` needs to be set.');
        }
      }
    }

    function handleUpdated(){
      if( this.userNavOpts ){
        this.refs.userNav.update(this.userNavOpts);
      }
    }

    function handleSignOut(){
      if( _self.onSignOut ) _self.onSignOut();
      _self.userModal.open();
    }

    function handleUserData(userData){
      if( userData ){
        _self.update({
          userNavOpts: {
            user: userData,
            profileURL: window.appData.urls.PROFILE,
            userAPI: window.userAPI,
            onSignOut: handleSignOut
          }
        });
        if( _self.onSignIn ) _self.onSignIn(userData);
      }else{
        alert('You need to verify your email');
      }
    }

    function handleUserError(data){
      alert(data.msg);
    }

    function createUserModal(){
      // if you use `innerHTML +=` it'll break `update`
      var modal = document.createElement('nox-user-modal');
      document.body.appendChild(modal);

      return riot.mount('nox-user-modal', {
        actions: {
          create: window.appData.endpoints.v1.USER_ADD,
          signIn: window.appData.endpoints.v1.USER_SIGN_IN
        },
        userAPI: window.userAPI,
        onSignIn: handleUserData,
        onError: handleUserError
      })[0];
    }
    
    this.on('mount', handleMount);
    this.on('updated', handleUpdated);
  </script>
</nox-top-nav>