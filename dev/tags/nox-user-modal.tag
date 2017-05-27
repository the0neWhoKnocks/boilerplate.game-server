<nox-user-modal>
  <nox-modal ref="modal" close-disabled="true">
    <form
      if={ !parent.showVerificationMessage }
      ref="userForm"
      action=""
      method="POST"
      onsubmit={ parent.handleSubmit }
    >
      <label class="is--required">
        Email
        <input
          type="email"
          name="email"
          value={ parent.emailVal }
          oninput={ parent.handleInput }
          required
          autofocus
        >
      </label>
      <label class="is--required">
        Password
        <input
          type="password"
          name="password"
          value={ parent.passwordVal }
          oninput={ parent.handleInput }
          required
        >
      </label>
      <label>
        <input
          ref="rememberMe"
          type="checkbox"
          name="rememberMe"
          value="true"
          checked={ parent.rememberMeChecked }
        > Remember me.
      </label>
      <button
        type="submit"
        value="signin"
        class="sign-in-btn"
        onclick={ parent.handleSignIn }
        disabled={ parent.submitDisabled }
      >
        Sign In
        <nox-spinner ref="signInSpinner"></nox-spinner>
      </button>
      <div class="separator-title" data-text="Or">Or</div>
      <button
        type="button"
        value="create"
        onclick={ parent.handleCreate }
        disabled={ parent.submitDisabled }
      >
        Create an Account
        <nox-spinner ref="createSpinner"></nox-spinner>
      </button>
    </form>
    <div if={ parent.showVerificationMessage }>
      A verification email was sent to the email address you provided. Once validated, you'll be able to sign in.
      <button
        onclick={ parent.closeVerification }
      >Sign In</button>
    </div>
  </nox-modal>
  
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
    
    label {
      margin-top: 0.5em;
      display: block;

      > input {
        margin-top: 0.5em;
      }

      &.is--required::before {
        content: '*';
        color: #ffa500;
      }
    }
    
    input[type="email"],
    input[type="password"] {
      width: 100%;
      padding: 0.25em;
      border: solid 1px #ccc;
    }
    
    .modal {
      width: 18em;

      &__body button {
        width: 100%;
        padding: 0.5em 1em;
        border: solid 1px #808080;
        border-radius: 0.25em;;
        margin-top: 1em;
        background: #eee;
        transition: 0.25s opacity;

        &[disabled]{
          opacity: 0.5;
          cursor: default;
        }
      }
    }

    .separator-title {
      font-size: 0;
      text-align: center;
      position: relative;
      
      &::before {
        content: '';
        height: 0.1em;
        background: #ccc;
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        z-index: -1;
      }
      
      &::after {
        content: attr(data-text);
        padding: 0 0.5em;
        background: #fff;
        display: inline-block;
      }
    }

    .sign-in-btn {
      margin-bottom: 1em;
    }

    button {
      position: relative;
    }
  </style>
  
  <script>
    const _self = this;
    const REMEMBER_KEY = 'remembered';

    this.submitDisabled = true;
    this.processing = false;
    this.processingTypes = {
      SIGN_IN: 'signIn',
      CREATE: 'create'
    };
    this.showVerificationMessage = false;
    this.emailVal = '';
    this.passwordVal = '';
    this.rememberMeChecked = false;

    this.handleMount = function(ev){
      window.userModal = _self;

      RiotControl.on(window.userAPI.events.USER_REQUIRED, _self.open);
      RiotControl.on(window.userAPI.events.USER_SIGNED_OUT, _self.open);
    };

    this.open = function(){
      var remembered = window.localStorage.getItem(REMEMBER_KEY);
      if( remembered ){
        remembered = JSON.parse(remembered);
        _self.emailVal = remembered.email;
        _self.passwordVal = remembered.password;
        _self.rememberMeChecked = true;
        _self.submitDisabled = false;
      }else{
        _self.emailVal = '';
        _self.passwordVal = '';
        _self.rememberMeChecked = false;
        _self.submitDisabled = true;
      }

      _self.refs.modal.openModal();
    };

    this.close = function(userData){
      // User modal should be open only if user info is required. If close is
      // called with no data, ensure it stays open.
      if( userData && userData.emailVerified ){
        _self.refs.modal.closeModal();
      }else{
        alert('You need to verify your email');
      }
    };

    this.closeVerification = function(){
      _self.showVerificationMessage = false;
      _self.refs.modal.update();
    };

    this.handleFormSuccess = function(data){
      if( _self.processing === _self.processingTypes.CREATE ){
        _self.showVerificationMessage = true;
        _self.refs.modal.refs.createSpinner.hide();
      }

      if( _self.processing === _self.processingTypes.SIGN_IN ){
        _self.refs.modal.refs.signInSpinner.hide();

        if( _self.refs.modal.refs.rememberMe.checked ){
          // don't save everything in case the user has updated profile data elsewhere.
          window.localStorage.setItem(REMEMBER_KEY, JSON.stringify({
            email: data.email,
            password: data.password
          }));
        }else{
          // check if data was previously saved and remove it.
          if( window.localStorage.getItem(REMEMBER_KEY) ){
            window.localStorage.removeItem(REMEMBER_KEY);
          }
        }
      }

      // if the user hasn't been verified, the data will be null
      _self.submitDisabled = !(!data && _self.processing === _self.processingTypes.SIGN_IN);
      _self.processing = false;
      _self.refs.modal.refs.rememberMe.checked = false;
      _self.refs.modal.update();

      if( data && !_self.showVerificationMessage ) _self.refs.modal.closeModal();
    };

    this.handleFormError = function(err){
      console.error(err);

      if( _self.processing === _self.processingTypes.CREATE ){
        _self.refs.modal.refs.createSpinner.hide();
      }

      if( _self.processing === _self.processingTypes.SIGN_IN ){
        _self.refs.modal.refs.signInSpinner.hide();
      }

      _self.submitDisabled = false;
      _self.processing = false;
      _self.refs.modal.update();
    };

    this.handleInput = function(ev){
      var input = ev.currentTarget;
      var form = input.form;
      var requiredInputs = form.querySelectorAll('[required]');
      var allFilled = true;

      for(var i=0; i<requiredInputs.length; i++){
        var curr = requiredInputs[i];

        if( curr.value === '' ){
          allFilled = false;
          break;
        }
      }

      if( _self.submitDisabled && allFilled ){
        _self.submitDisabled = false;
        _self.refs.modal.update();
      }else if( !_self.submitDisabled && !allFilled ){
        _self.submitDisabled = true;
        _self.refs.modal.update();
      }

      return true; // needed so user can perform normal text actions
    };

    // handles if a user hits Enter
    this.handleSubmit = function(ev){
      ev.preventDefault();
      _self.handleSignIn(ev);
    };

    this.handleSignIn = function(ev){
      ev.preventDefault();
      _self.submitDisabled = true;
      _self.processing = _self.processingTypes.SIGN_IN;
      _self.refs.modal.refs.signInSpinner.show();
      _self.refs.modal.update();

      var form = _self.refs.modal.refs.userForm;

      RiotControl.one(window.userAPI.events.USER_SIGNED_IN, _self.handleFormSuccess);
      RiotControl.one(window.userAPI.events.USER_SIGN_IN_ERROR, _self.handleFormError);
      RiotControl.trigger(window.userAPI.events.USER_SIGN_IN, window.utils.formToJSON(form));
    };

    this.handleCreate = function(ev){
      _self.submitDisabled = true;
      _self.processing = _self.processingTypes.CREATE;
      _self.refs.modal.refs.createSpinner.show();
      _self.refs.modal.update();

      var form = _self.refs.modal.refs.userForm;

      RiotControl.one(window.userAPI.events.USER_CREATED, _self.handleFormSuccess);
      RiotControl.one(window.userAPI.events.USER_CREATION_ERROR, _self.handleFormError);
      RiotControl.trigger(window.userAPI.events.USER_CREATE, window.utils.formToJSON(form));
    };
    
    this.on('mount', this.handleMount);
  </script>
</nox-user-modal>