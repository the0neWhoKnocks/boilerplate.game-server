<nox-user-nav>
  <div
    if={ user }
    class="user-nav"
  >
    <button
      type="button"
      onclick={ toggleMenu }
    >
      <img
        if={ user.photoURL }
        class="avatar"
        src={ user.photoURL }
      >
      { displayName }
    </button>
    <ul if={ showMenu }>
      <li>
        <a
          href={ profileUrl }
        >Profile</a>
      </li>
      <li>
        <button
          type="button"
          onclick={ handleSignOutClick }
        >Sign Out</button>
      </li>
    </ul>
  </div>
  
  <style scoped>
    $avatarSize = 2em;

    :scope,
    input,
    button, 
    *::after, 
    *::before {
      font: 20px Helvetica, Arial, sans-serif;
    }
    
    :scope {

    }

    .user-nav {
      white-space: nowrap;
      position: relative;

      > button {
        padding: 0.25em 0.5em 0.25em ($avatarSize + 0.25em);
        background: transparent;
        border: none;
      }
    }

    ul {
      min-width: 8em;
      padding: 0.25em 0 0;
      margin: 0;
      list-style-type: none;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;

      > li {
        margin: 0;

        > a,
        > button {
          width: 100%;
          color: currentColor;
          text-align: left;
          text-decoration: none;
          padding: 0.25em 0.5em;
          border: solid 1px #666;
          background: #ccc;
          display: block;

          &:focus,
          &:hover {
            filter: invert(100%);
          }
        }
      }
    }
    
    a,
    button {
      cursor: pointer;
    }

    .avatar {
      height: $avatarSize;
      display: inline-block;
      vertical-align: top;
      border-radius: 100%;
      border: solid 3px rgba(255,255,255,0.5);
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }

    .user-nav {
      text-align: right;
    }
  </style>
  
  <script>
    const _self = this;

    this.profileUrl = opts.profileUrl || window.appData.urls.PROFILE;
    this.user = opts.userData || null;
    this.showMenu = false;
    setDisplayName();

    this.handleMount = function(){
      RiotControl.on(window.userAPI.events.USER_UPDATED, _self.handleUserUpdate);
      RiotControl.on(window.userAPI.events.USER_SIGNED_OUT, _self.handleSignOut);
    };

    this.handleUserUpdate = function(data){
      if( data ){
        _self.user = data;
        setDisplayName();
        _self.update();
      }
    };

    this.handleSignOut = function(){
      if( _self.isMounted ){
        _self.user = null;
        _self.update();
      }else{
        RiotControl.off(window.userAPI.events.USER_UPDATED, _self.handleUserUpdate);
        RiotControl.off(window.userAPI.events.USER_SIGNED_OUT, _self.handleSignOut);
      }
    };

    this.handleMouseLeave = function(ev){
      _self.root.removeEventListener('mouseleave', _self.handleMouseLeave);
      _self.toggleMenu();
    };

    function setDisplayName(){
      _self.displayName = ( _self.user ) ? _self.user.displayName || _self.user.email.split('@')[0] : '';
    }

    this.toggleMenu = function(ev){
      _self.showMenu = !_self.showMenu;
      _self.update();

      if( _self.showMenu ){
        _self.root.addEventListener('mouseleave', _self.handleMouseLeave);
      }
    };

    this.handleSignOutClick = function(ev){
      _self.toggleMenu();

      RiotControl.trigger(window.userAPI.events.USER_SIGN_OUT);
    };
    
    this.on('mount', this.handleMount);
  </script>
</nox-user-nav>