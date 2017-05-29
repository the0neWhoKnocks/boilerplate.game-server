<nox-vertical-nav>
  <nav if={ navItems.length }>
    <virtual each={ navItem in navItems }>
      <button
        if={ navItem.type === 'button' }
        type="button"
        class="nav-item"
        data-id="{ navItem.id }"
        onclick={ handleClick.bind(this, navItem.action) }
      >{ navItem.label }</button>
      <a
        if={ navItem.type === 'link' }
        class="nav-item"
        href={ navItem.href }
        data-id="{ navItem.id }"
        onclick={ handleClick.bind(this, navItem.action) }
      >{ navItem.label }</a>
    </virtual>
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
      height: 100%;
      background: #ccc;
      display: inline-block;
    }

    nav {
      display: flex;
      flex-direction: column;
    }

    .nav-item {
      color: #333;
      padding: 0.25em 0.5em;
      border: solid 1px;
      background: #ccc;
      display: block;
      cursor: pointer;

      &[disabled] {
        cursor: default;
        filter: invert(100%);
      }
    }
  </style>
  
  <script>
    const _self = this;
    let currSelection = undefined;
    this.navItems = opts.navItems || [];
    this.disableOnSelect = ( opts.disableOnSelect != undefined ) ? opts.disableOnSelect : false;

    this.handleClick = function(callback, ev){
      if( _self.disableOnSelect ){
        if( currSelection ) currSelection.disabled = false;
        currSelection = ev.target;
        currSelection.disabled = true;
      }

      callback();
    };

    function handleMount(){}
    
    this.on('mount', this.handleMount);
  </script>
</nox-vertical-nav>