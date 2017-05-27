<nox-top-nav>
  <nav
    if={ isVisible }
    class="top-nav"
    style="{ navStyles }"
  >
    <div class="left-column">
      <a class="home-url" href="{ homeUrl }">{ homeCopy }</a>
    </div>
    <div class="right-column">
      <nox-user-nav
        ref="userNav"
        user-data={ userData }
      ></nox-user-nav>
    </div>
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
      display: flex;
      position: relative;
      z-index: 10;
    }

    .left-column {
      margin-right: auto;
    }

    .right-column {
      text-align: right;
    }

    .home-url {
      color: #333;
      font-weight: bold;
      font-style: italic;
      letter-spacing: -0.1em;
      text-decoration: none;
      text-transform: uppercase;
      padding: 0.25em;
      display: inline-block;
    }
  </style>
  
  <script>
    const _self = this;

    this.homeUrl = opts.homeUrl || '/';
    this.homeCopy = opts.homeCopy || window.appData.title;
    this.absolutePos = opts.absolutePos;
    this.userData = opts.userData || null;
    this.isVisible = true;

    if( this.absolutePos ){
      this.navStyles = 'position:absolute; left:0; right:0';
    }

    this.hide = function(){
      _self.isVisible = false;
      _self.update();
    };

    this.show = function(){
      _self.isVisible = true;
      _self.update();
    };

    function handleMount(){
      window.topNav = _self;
    }
    
    this.on('mount', handleMount);
  </script>
</nox-top-nav>