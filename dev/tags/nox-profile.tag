<nox-profile>
  <div class="bg { currentTheme }">
    <div if={ userData.email } class="wrapper">
      <nav class="theme-nav">
        <div class="theme-nav__btns {is--open:themeNavOpen}">
          <button class="theme-btn" data-theme="default" onclick={ setTheme }></button>
          <button class="theme-btn theme1" data-theme="theme1" onclick={ setTheme }></button>
          <button class="theme-btn theme2" data-theme="theme2" onclick={ setTheme }></button>
          <button class="theme-btn theme3" data-theme="theme3" onclick={ setTheme }></button>
          <button class="theme-btn theme4" data-theme="theme4" onclick={ setTheme }></button>
          <button class="theme-btn theme5" data-theme="theme5" onclick={ setTheme }></button>
        </div>
      </nav>
      <button class="palette" onclick={ toggleThemeNav } title="Click to select theme"></button>
      <nox-profile-avatar img-width="200" img-height="200"></nox-profile-avatar>
      <form
        ref="form"
        method="POST"
        onsubmit={ handleSubmit }
      >
        <div class="form-item">
          <label for="displayName">Display Name</label>
          <div class="input-wrapper">
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={ userData.displayName }
              autocomplete="off"
            >
          </div>
        </div>

        <div class="form-item">
          <label for="email">Email</label>
          <div class="input-wrapper">
            <input ref="email" type="email" id="email" name="email" value={ userData.email } readonly>
          </div>
        </div>

        <div class="form-item">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <input ref="password" type={ passwordInputType } class="password" id="password" name="password" value={ userData.password } readonly>
            <div class="password-toggle">
              <input type="checkbox" id="passwordToggle" onchange={ handlePasswordToggle }>
              <label for="passwordToggle">Show</label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={ submitDisabled }
        >Save</button>
      </form>
    </div>
  </div>

  <style scoped>
    $defaultTheme = #3fb1bd;

    :scope,
    input,
    button,
    *::after,
    *::before {
      font: 20px Helvetica, Arial, sans-serif;
    }

    :scope * {
      box-sizing: border-box;
    }

    :scope {
      width: 100%;
      height: 100%;
      display: table;
    }

    nox-top-nav {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }

    .bg {
      text-align: center;
      padding: 1em;
      vertical-align: middle;
      background: $defaultTheme;
      display: table-cell;
    }

    .theme {

      &-nav {
        padding-top: 0.5em;
        position: absolute;
        overflow: hidden;
        bottom: 100%;
        left: 0;
        right: 0;

        &__btns {
          transform: translateY(110%);
          transition: transform 0.25s;

          &.is--open {
            transform: translateY(0%);
          }
        }
      }

      &-btn {
        width: 3em;
        height: 3em;
        border-radius: 100%;
        border: none;
        box-shadow: 0 0 0.5em;
        cursor: pointer;
        background: $defaultTheme;
      }
    }

    .palette {
      width: 2em;
      height: 2em;
      border: solid 0.25em rgba(255,255,255,0.75);
      border-radius: 100%;
      background:
      linear-gradient(cyan, transparent),
      linear-gradient(-45deg, magenta, transparent),
      linear-gradient(45deg, yellow, transparent);
      background-blend-mode: multiply;;
      position: absolute;
      right: 1em;
      top: -1em;
      cursor: pointer;
    }

    // patterns from http://bennettfeely.com/gradients/
    .theme1 {
      background:
      repeating-linear-gradient(50deg, #F7A37B, #F7A37B 1em, #FFDEA8 1em, #FFDEA8 2em, #D0E4B0 2em, #D0E4B0 3em, #7CC5D0 3em, #7CC5D0 4em, #00A2E1 4em, #00A2E1 5em, #0085C8 5em, #0085C8 6em),
      repeating-linear-gradient(-50deg, #F7A37B, #F7A37B 1em, #FFDEA8 1em, #FFDEA8 2em, #D0E4B0 2em, #D0E4B0 3em, #7CC5D0 3em, #7CC5D0 4em, #00A2E1 4em, #00A2E1 5em, #0085C8 5em, #0085C8 6em);
      background-blend-mode: multiply;
    }

    .theme2 {
      background:
      radial-gradient(circle at bottom left, transparent 0, transparent 2em, beige 2em, beige 4em, transparent 4em, transparent 6em, khaki 6em, khaki 8em, transparent 8em, transparent 10em),
      radial-gradient(circle at top right, transparent 0, transparent 2em, beige 2em, beige 4em, transparent 4em, transparent 6em, khaki 6em, khaki 8em, transparent 8em, transparent 10em),
      radial-gradient(circle at top left, transparent 0, transparent 2em, navajowhite 2em, navajowhite 4em, transparent 4em, transparent 6em, peachpuff 6em, peachpuff 8em, transparent 8em, transparent 10em),
      radial-gradient(circle at bottom right, transparent 0, transparent 2em, palegoldenrod 2em, palegoldenrod 4em, transparent 4em, transparent 6em, peachpuff 6em, peachpuff 8em, transparent 8em, transparent 10em),
      blanchedalmond;
      background-blend-mode: multiply;
      background-size: 10em 10em;
      background-position: 0 0, 0 0, 5em 5em, 5em 5em;
    }

    .theme3 {
      background:
      linear-gradient(cyan, transparent),
      linear-gradient(-45deg, magenta, transparent),
      linear-gradient(45deg, yellow, transparent);
      background-blend-mode: multiply;
    }

    .theme4 {
      background:
      radial-gradient(at bottom right, dodgerblue 0, dodgerblue 1em, lightskyblue 1em, lightskyblue 2em, deepskyblue 2em, deepskyblue 3em, gainsboro 3em, gainsboro 4em, lightsteelblue 4em, lightsteelblue 5em, deepskyblue 5em, deepskyblue 6em, lightskyblue 6em, lightskyblue 7em, transparent 7em, transparent 8em),
      radial-gradient(at top left, transparent 0, transparent 1em, lightskyblue 1em, lightskyblue 2em, deepskyblue 2em, deepskyblue 3em, lightsteelblue 3em, lightsteelblue 4em, gainsboro 4em, gainsboro 5em, deepskyblue 5em, deepskyblue 6em, skyblue 6em, skyblue 7em, dodgerblue 7em, dodgerblue 8em, transparent 8em, transparent 20em),
      radial-gradient(circle at center bottom, coral, darkslateblue);
      background-blend-mode: overlay;
      background-size: 8em 8em, 8em 8em, cover;
    }

    .theme5 {
      background:
      linear-gradient(limegreen, transparent),
      linear-gradient(90deg, skyblue, transparent),
      linear-gradient(-90deg, coral, transparent);
      background-blend-mode: screen;
    }

    .wrapper {
      padding: 0.75em;
      border: solid 1px #ccc;
      border-radius: 0.25em;
      box-shadow: 0 0.3em 2em rgba(0,0,0,0.75);
      display: inline-block;
      background: rgba(255,255,255,0.75);
      position: relative;
    }

    nox-profile-avatar,
    form {
      display: inline-block;
      vertical-align: middle;
    }

    form {
      width: 500px;
      text-align: left;
      margin-left: 0.75em;
    }

    button[type="submit"] {
      width: 100%;
      height: 0em;
      text-transform: uppercase;
      border-width: 0;
      padding: 0;
      transition: all 0.25s;
      overflow: hidden;

      &:not([disabled]) {
        height: 2em;
        border-width: 0.1em;
        padding: 0.4em;
        margin-top: 0.5em;
        cursor: pointer;
      }
    }

    .form-item {
      width: 100%;
      display: table;

      &:not(:first-of-type) {
        padding-top: 0.5em;
        margin-top: 0.5em;
        border-top: solid 1px rgba(0,0,0,0.25);
      }

      > label,
      > .input-wrapper {
        display: table-cell;
      }

      > label {
        width: 30%;
      }

      > .input-wrapper {
        width: 70%;
      }
    }

    .input-wrapper {
      position: relative;

      > input:not([type="checkbox"]) {
        width: 100%;
        padding: 0.25em;
      }

      > input.password {
        padding-right: 4.5em;
      }
    }

    .password-toggle {
      cursor: pointer;
      position: absolute;
      top: 0.4em;
      right: 0.4em;

      > * {
        cursor: pointer;
      }

      label {
        user-select: none;
      }

      [type="checkbox"] {
        width: 0.9em;
        height: 0.9em;
        vertical-align: text-top;
      }
    }

    [readonly] {
      color: #ccc;
    }
  </style>

  <script>
    const _self = this;
    let originalData = {};
    this.userData = opts.userData || {};
    this.submitDisabled = true;
    this.passwordInputType = 'password';
    this.userAPI = opts.userAPI || {};
    this.updatedData = {};
    this.onUpdate = opts.onUpdate;
    this.themeNavOpen = false;
    this.currentTheme = this.userData.theme || '';

    function handleMount(ev){
      setupDiffs();
    }

    this.handleSubmit = function(ev){
      ev.preventDefault();

      _self.submitDisabled = true;
      _self.update();

      _self.userAPI.update({
        creds: {
          email: _self.refs.email.value,
          password: _self.refs.password.value
        },
        data: _self.updatedData
      })
      .then(function(resp){
        if( _self.onUpdate ) _self.onUpdate(resp);

        for(var key in _self.updatedData){
          originalData[key] = _self.updatedData[key];
        }

        _self.updatedData = {};
        document.activeElement.blur();
        _self.update();
        alert(resp);
      })
      .catch(function(err){
        _self.submitDisabled = false;
        _self.update();
        alert('Update Error: '+ err.message);
      });
    };

    this.handlePasswordToggle = function(ev){
      _self.passwordInputType = (ev.target.checked) ? 'text' : 'password';
    };

    this.toggleThemeNav = function(ev){
      _self.themeNavOpen = !_self.themeNavOpen;
    };

    this.setTheme = function(ev){
      _self.currentTheme = ev.currentTarget.dataset.theme || '';

      if( _self.currentTheme != originalData.theme ){
        _self.updatedData.theme = _self.currentTheme;
        _self.submitDisabled = false;
      }else{
        delete _self.updatedData.theme;
        _self.submitDisabled = !Object.keys(_self.updatedData).length;
      }

      _self.update();
    };

    function handleInput(ev){
      clearTimeout(_self.inputDebounce);
      _self.inputDebounce = setTimeout(function(){
        const els = _self.refs.form.querySelectorAll('[name]');

        for(let i=0; i<els.length; i++){
          const el = els[i];

          // reset on change in case the value was set back to the original
          if( _self.updatedData[el.name] ) delete _self.updatedData[el.name];

          // check for updates
          if( el.value !== originalData[el.name] ){
            if( !_self.updatedData ) _self.updatedData = {};
            _self.updatedData[el.name] = el.value;
          }
        }

        // if there are updated items, it shouldn't be disabled
        _self.submitDisabled = !Object.keys(_self.updatedData.length);
        _self.update();
      }, 200);
    }

    function setupDiffs(){
      if( _self.currentTheme ) originalData.theme = _self.currentTheme;

      _self.refs.form.querySelectorAll('[name]').forEach(function(el){
        originalData[el.name] = el.value;
        el.oninput = handleInput;
      });
    }

    this.unload = function(){
      _self.userData = {};
      _self.update();
    };

    this.on('mount', handleMount);
  </script>


</nox-profile>