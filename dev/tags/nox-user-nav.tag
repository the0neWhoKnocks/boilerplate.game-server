<nox-user-nav>
  <div
    if={ user }
    class="user-nav"
  >
    <button
      type="button"
      onclick={ toggleMenu }
    >[] { displayName }</button>
    <ul if={ showMenu }>
      <li>
        <a
          href={ profileURL }
        >Profile</a>
      </li>
      <li>
        <button
          type="button"
          onclick={ handleSignOut }
        >Sign Out</button>
      </li>
    </ul>
  </div>
  
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

    ul {
      padding: 0;
      margin: 0.25em 0 0;
      list-style-type: none;

      > li {
        margin: 0;

        > a,
        > button {
          width: 100%;
          text-align: left;
          padding: 0.25em;
          border: solid 1px #666;
          background: #ccc;
          display: block;
        }
      }
    }
    
    a,
    button {
      cursor: pointer;
    }

    .user-nav {
      text-align: right;
    }
  </style>
  
  <script>
    const _self = this;

    this.profileURL = opts.profileURL || '';
    this.user = opts.user || null;
    this.userAPI = opts.userAPI || {};
    this.onSignOut = opts.onSignOut || null;
    this.showMenu = false;
    setDisplayName();

    this.handleMount = function(){};
    this.handleUpdate = function(data){
      setDisplayName();
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

    this.handleSignOut = function(ev){
      _self.toggleMenu();

      _self.userAPI.signOut()
      .then(function(){
        _self.user = null;
        _self.update();
        if( _self.onSignOut ) _self.onSignOut();
      });
    };
    
    this.on('mount', this.handleMount);
    this.on('update', this.handleUpdate);
  </script>
</nox-user-nav>